import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import db from '../../../db/knex';
import { User } from '../../interface/user/user.interface';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import slugify from 'slugify';
import { generateToken } from 'src/utils';
import * as nodemailer from 'nodemailer';
import {
  getEmailTemplate,
  getOtpEmailTemplate,
  getPasswordResetSuccessTemplate,
  resetPasswordTemplate,
} from 'src/template/template';

@Injectable()
export class UserService {
  //===============
  // GENERATE UNIQUE SLUG
  //===============
  async generateUniqueSlug(
    id: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    let baseSlug = slugify(`${firstName} ${lastName}`, { lower: true });

    const existingUser = await db('users').where({ slug: baseSlug }).first();
    if (existingUser) {
      let counter = 1;
      while (
        await db('users')
          .where({ slug: `${baseSlug}-${counter}` })
          .first()
      ) {
        counter++;
      }
      baseSlug = `${baseSlug}-${counter}`;
    }

    await db('users').where({ id }).update({ slug: baseSlug });
  }

  //===============
  // ADD NEW USER
  //===============
  async create(
    userData: Partial<User>,
  ): Promise<{ user: User; message: string }> {
    try {
      console.log('Received userData:', userData);

      // Check if the email already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new HttpException(
          'Email already exists. Please use a different email address.',
          HttpStatus.CONFLICT,
        );
      }

      // Store the original password
      const originalPassword = userData.password;

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Prepare data with slug
      const slug = slugify(`${userData.first_name} ${userData.last_name}`, {
        lower: true,
      });
      const dataWithSlug = { ...userData, password: hashedPassword, slug };
      console.log('Data with Slug:', dataWithSlug);

      // Insert the user into the database
      const [userId] = await db('users').insert(dataWithSlug);
      const user = await db('users').where({ id: userId }).first();
      console.log('Inserted User:', user);

      // Handle duplicate slug generation
      await this.generateUniqueSlug(user.id, user.first_name, user.last_name);

      // Send email to the user with the original password
      await this.sendWelcomeEmail(user, originalPassword);

      return {
        user,
        message: 'User created successfully. Verification email sent.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw known exceptions
      }
      console.error('Error creating user:', error.message);
      throw new HttpException(
        `Failed to create user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // SEND WELCOME EMAIL
  //===============
  async sendWelcomeEmail(user: User, originalPassword: string): Promise<void> {
    const facebook = process.env.FACEBOOK_PROFILE_LINK;
    const instagram = process.env.INSTAGRAM_PROFILE_LINK;
    const webName = process.env.WEB_NAME;

    try {
      // Generate OTP
      const verificationCode = await this.createAccountVerificationOtp(user.id);

      // Configure the email transporter
      const transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Get the email content from the template function
      const emailMessage = getEmailTemplate(
        user.first_name,
        verificationCode,
        originalPassword, // Pass the original password here
        facebook,
        instagram,
        webName,
      );

      const mailOptions = {
        to: user.email,
        from: `${process.env.WEB_NAME} <${process.env.EMAIL_ADDRESS}>`,
        subject: 'Welcome to Our Platform! Please Verify Your Account',
        html: emailMessage,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new HttpException(
        `Failed to send welcome email: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // USER SIGNUP
  //===============
  async signup(userData: Partial<User>): Promise<{ token: string; user: any }> {
    try {
      const existingUser = await db('users')
        .where({ email: userData.email })
        .first();
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const userRole = 'user';
      const isAdmin = 0;

      const newUser = {
        ...userData,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: hashedPassword,
        role: userRole,
        is_admin: isAdmin,
        is_blocked: false,
        isAccountVerified: false,
      };

      await db('users').insert(newUser);
      const user = await db('users').where({ email: userData.email }).first();

      // Generate a unique slug for the user
      await this.generateUniqueSlug(user.id, user.first_name, user.last_name);

      const token = generateToken(user);

      return {
        token,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          isAdmin: user.is_admin,
          isBlocked: user.is_blocked,
          isAccountVerified: user.isAccountVerified,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // USER SIGNIN
  //===============
  async signin(
    email: string,
    password: string,
  ): Promise<{ token: string; user: any }> {
    try {
      const user = await db('users').where({ email }).first();
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (user.is_blocked) {
        throw new HttpException(
          '😲 It appears this account has been blocked by Admin',
          HttpStatus.FORBIDDEN,
        );
      }

      if (!user.isAccountVerified) {
        throw new UnauthorizedException('Account not verified');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const token = generateToken(user);
      return {
        token,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          image: user.image,
          isAdmin: user.is_admin,
          role: user.role,
          isBlocked: user.is_blocked,
          isAccountVerified: user.isAccountVerified,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Error during user sign in: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // ADMIN SIGNUP
  //===============
  async adminSignup(
    adminData: Partial<User>,
  ): Promise<{ token: string; user: any }> {
    try {
      const existingUser = await db('users')
        .where({ email: adminData.email })
        .first();
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      const users = await db('users');
      const isFirstAdmin = users.length === 0;

      const newAdmin = {
        ...adminData,
        password: hashedPassword,
        role: 'admin',
        is_admin: isFirstAdmin ? true : false,
        is_blocked: false,
        isAccountVerified: false,
      };

      await db('users').insert(newAdmin);
      const admin = await db('users').where({ email: adminData.email }).first();

      // Generate a unique slug for the admin
      await this.generateUniqueSlug(
        admin.id,
        admin.first_name,
        admin.last_name,
      );

      const token = generateToken(admin);

      return {
        token,
        user: {
          id: admin.id,
          firstName: admin.first_name,
          lastName: admin.last_name,
          email: admin.email,
          image: admin.image,
          isAdmin: admin.is_admin,
          role: admin.role,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create admin: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // ADMIN SIGNIN
  //===============
  async adminSignin(
    email: string,
    password: string,
  ): Promise<{ token: string; user: any }> {
    try {
      const admin = await db('users').where({ email, is_admin: true }).first();
      if (!admin) {
        throw new UnauthorizedException('No admin found with this email');
      }

      if (admin.is_blocked) {
        throw new HttpException(
          '😲 It appears this account has been blocked by Admin',
          HttpStatus.FORBIDDEN,
        );
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const token = generateToken(admin);
      return {
        token,
        user: {
          id: admin.id,
          firstName: admin.first_name,
          lastName: admin.last_name,
          email: admin.email,
          image: admin.image,
          isAdmin: admin.is_admin,
          role: admin.role,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Error during admin sign in: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //=================================
  // Route to handle OTP generation and email verification for user registration and login
  //=================================
  async sendVerificationEmail(email: string, firstName: string, otp: string) {
    const facebook = process.env.FACEBOOK_PROFILE_LINK!;
    const instagram = process.env.INSTAGRAM_PROFILE_LINK!;
    const webName = process.env.WEB_NAME!;

    const emailMessage = getOtpEmailTemplate(
      firstName,
      otp,
      webName,
      facebook,
      instagram,
    );

    const transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE!,
      auth: {
        user: process.env.EMAIL_ADDRESS!,
        pass: process.env.EMAIL_PASS!,
      },
    });

    const mailOptions = {
      to: email,
      from: `${webName} <${process.env.EMAIL_ADDRESS}>`,
      subject: 'Verify your email address',
      html: emailMessage,
    };

    await transporter.sendMail(mailOptions);
  }

  //===============
  // FETCH USER PROFILE
  //===============
  async fetchUserProfile(userId: string): Promise<User> {
    try {
      const user = await db('users').where({ id: userId }).first();
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch user profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // FETCH ALL USERS
  //===============
  async findAll(): Promise<User[]> {
    try {
      // Fetch all users ordered by 'created_at' in descending order (latest first)
      return await db('users').orderBy('created_at', 'desc');
    } catch (error) {
      throw new HttpException(
        `Failed to fetch users: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // FETCH BY SLUG
  //===============
  async findBySlug(slug: string): Promise<User> {
    try {
      const user = await db('users').where({ slug }).first();
      if (!user)
        throw new HttpException(
          `User with slug "${slug}" not found`,
          HttpStatus.NOT_FOUND,
        );
      return user;
    } catch (error) {
      throw new HttpException(
        `Error fetching user by slug: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // FETCH BY ID
  //===============
  async findById(id: string): Promise<User> {
    try {
      const user = await db('users').where({ id }).first();
      if (!user)
        throw new HttpException(
          `User with ID "${id}" not found`,
          HttpStatus.NOT_FOUND,
        );
      return user;
    } catch (error) {
      throw new HttpException(
        `Error fetching user by ID: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // UPDATE USER
  //===============
  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    try {
      await db('users').where({ id }).update(updateData);
      return this.findById(id);
    } catch (error) {
      throw new HttpException(
        `Failed to update user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // BLOCK USER
  //===============
  async blockUser(id: string, currentUser: User): Promise<User> {
    try {
      // Check if the user exists
      const user = await db('users').where({ id }).first();
      if (!user) {
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
      }

      // Prevent users from blocking themselves
      if (user.id === currentUser.id) {
        throw new HttpException(
          'Cannot block yourself',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Prevent blocking of admin users unless the requester is a super admin
      if (user.is_admin && !currentUser.is_admin) {
        throw new HttpException(
          'Cannot block Admin User',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update the user's blocked status
      await db('users').where({ id }).update({ is_blocked: true });

      return await db('users').where({ id }).first();
    } catch (error) {
      console.error('Error blocking user:', error.message);
      throw new HttpException(
        `Failed to block user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // UNBLOCK USER
  //===============
  async unblockUser(id: string, currentUser: User): Promise<User> {
    try {
      // Check if the user exists
      const user = await db('users').where({ id }).first();
      if (!user) {
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
      }

      // Prevent users from unblocking themselves
      if (user.id === currentUser.id) {
        throw new HttpException(
          'Cannot unblock yourself',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Prevent unblocking of admin users unless the requester is a super admin
      if (user.is_admin && !currentUser.is_admin) {
        throw new HttpException(
          'Cannot unblock Admin User',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update the user's blocked status
      await db('users').where({ id }).update({ is_blocked: false });

      return await db('users').where({ id }).first();
    } catch (error) {
      console.error('Error unblocking user:', error.message);
      throw new HttpException(
        `Failed to unblock user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // DELETE USER
  //===============
  async deleteUser(id: string): Promise<{ message: string }> {
    try {
      const deletedCount = await db('users').where({ id }).del();
      if (deletedCount === 0) {
        throw new HttpException(
          `User with ID "${id}" not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException(
        `Error deleting user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // FIND BY EMAIL
  //===============
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await db('users').where({ email }).first();
    return user;
  }

  async findOne(query: object): Promise<User | undefined> {
    const user = await db('users').where(query).first();
    return user;
  }

  //===============
  // CREATE ACCOUNT VERIFICATION OTP
  //===============
  async createAccountVerificationOtp(id: string): Promise<string> {
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await db('users').where({ id }).update({
      accountVerificationOtp: verificationCode,
      accountVerificationOtpExpires: expirationTime,
    });

    return verificationCode;
  }

  //===============
  // FIND USER BY OTP AND CHECK EXPIRATION
  //===============
  async findUserByOtp(otp: string): Promise<any> {
    const user = await db('users')
      .where({ accountVerificationOtp: otp })
      .andWhere('accountVerificationOtpExpires', '>', new Date())
      .first();
    return user;
  }

  //===============
  //OTP Verification
  //===============
  async verifyUserAccount(id: string): Promise<void> {
    await db('users').where({ id }).update({
      isAccountVerified: true,
      accountVerificationOtp: null,
      accountVerificationOtpExpires: null,
    });
  }

  //===============
  // CREATE PASSWORD RESET TOKEN
  //===============
  async createPasswordResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiration (e.g., 1 hour from now)
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Save token and expiration in the database
    await db('users').where({ email }).update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expires,
    });

    return resetToken;
  }

  //===============
  // Send Password Reset Email
  //===============
  async sendPasswordResetEmail(
    email: string,
    user: User,
    token: string,
  ): Promise<void> {
    const facebook = process.env.FACEBOOK_PROFILE_LINK!;
    const instagram = process.env.INSTAGRAM_PROFILE_LINK!;
    const webName = process.env.WEB_NAME!;

    const htmlContent = resetPasswordTemplate(
      user,
      token,
      webName,
      facebook,
      instagram,
    );

    const smtpTransport = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      to: user.email,
      from: `${process.env.WEB_NAME} <${process.env.EMAIL_ADDRESS}>`,
      subject: 'Reset Password',
      html: htmlContent,
    };

    // Send the email
    await smtpTransport.sendMail(mailOptions);
  }

  //===============
  // UPDATE PASSWORD
  //===============
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db('users').where({ id }).update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  // Method to find user by reset token and check expiration
  async findUserByResetToken(hashedToken: string): Promise<User | undefined> {
    return await db('users')
      .where({ resetPasswordToken: hashedToken })
      .andWhere('resetPasswordExpires', '>', new Date())
      .first();
  }

  // Helper function to hash token (to avoid repeating code)
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Reset password service
  async resetPassword(token: string, password: string): Promise<void> {
    const hashedToken = this.hashToken(token);

    // Find user by reset token
    const user: User = await this.findUserByResetToken(hashedToken); // Removed `this.userService`
    if (!user) {
      throw new HttpException(
        'Invalid token or token expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the new password is the same as the old one
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      throw new HttpException(
        'New password cannot be the same as the old password',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash the new password and update
    const hashedNewPassword = await bcrypt.hash(password, 10);
    await this.updatePassword(user.id, hashedNewPassword); // Removed `this.userService`

    // Send email notification
    await this.sendPasswordResetSuccessEmail(user);
  }

  // Send Success Email (reuseable function)
  async sendPasswordResetSuccessEmail(user: User): Promise<void> {
    const facebook = process.env.FACEBOOK_PROFILE_LINK;
    const instagram = process.env.INSTAGRAM_PROFILE_LINK;
    const webName = process.env.WEB_NAME;
    const emailContent = getPasswordResetSuccessTemplate(
      user,
      facebook,
      instagram,
      webName,
    );

    const smtpTransport = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: `${webName} <${process.env.EMAIL_ADDRESS}>`,
      subject: 'Password Reset Successful',
      html: emailContent,
    };

    await smtpTransport.sendMail(mailOptions);
  }
}
