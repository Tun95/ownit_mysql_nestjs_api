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
  async create(userData: Partial<User>): Promise<User> {
    const slug = slugify(`${userData.first_name} ${userData.last_name}`, {
      lower: true,
    });
    const dataWithSlug = { ...userData, slug };

    try {
      // Insert the user into the database
      const [user] = await db('users').insert(dataWithSlug).returning('*');

      // Handle duplicate slug generation
      await this.generateUniqueSlug(user.id, user.first_name, user.last_name);

      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
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
        isAccountVerified: true,
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
      return await db('users');
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

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await db('users').where({ email }).first();
    return user;
  }

  async findOne(query: object): Promise<User | undefined> {
    const user = await db('users').where(query).first();
    return user;
  }

  //===============
  // CREATE PASSWORD RESET TOKEN
  //===============
  async createPasswordResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    await db('users').where({ id: user.id }).update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expires,
    });

    return resetToken;
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db('users').where({ id }).update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
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

  async verifyUserAccount(id: string): Promise<void> {
    await db('users').where({ id }).update({
      isAccountVerified: true,
      accountVerificationOtp: null,
      accountVerificationOtpExpires: null,
    });
  }
}
