import { Injectable, UnauthorizedException } from '@nestjs/common';
import db from '../../../db/knex';
import { User } from '../../interface/user/user.interface';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import slugify from 'slugify';
import { generateToken } from 'src/utils';

@Injectable()
export class UserService {
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

  async signup(userData: Partial<User>): Promise<{ token: string; user: any }> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const newUser = { ...userData, password: hashedPassword };

    try {
      const [user] = await db('users').insert(newUser).returning('*');
      const token = generateToken(user);
      return {
        token,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          image: user.image,
          email: user.email,
          isAdmin: user.is_admin,
          role: user.role,
        },
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async signin(
    email: string,
    password: string,
  ): Promise<{ token: string; user: any }> {
    const user = await db('users').where({ email }).first();
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
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
        image: user.image,
        email: user.email,
        isAdmin: user.is_admin,
        role: user.role,
      },
    };
  }

  async adminSignup(
    adminData: Partial<User>,
  ): Promise<{ token: string; user: any }> {
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    const newAdmin = { ...adminData, password: hashedPassword, is_admin: true };

    try {
      const [admin] = await db('users').insert(newAdmin).returning('*');
      const token = generateToken(admin);
      return {
        token,
        user: {
          id: admin.id,
          firstName: admin.first_name,
          lastName: admin.last_name,
          image: admin.image,
          email: admin.email,
          isAdmin: admin.is_admin,
          role: admin.role,
        },
      };
    } catch (error) {
      throw new Error(`Failed to create admin: ${error.message}`);
    }
  }

  async adminSignin(
    email: string,
    password: string,
  ): Promise<{ token: string; user: any }> {
    const admin = await db('users').where({ email, is_admin: true }).first();
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
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
        image: admin.image,
        email: admin.email,
        isAdmin: admin.is_admin,
        role: admin.role,
      },
    };
  }

  async isPasswordMatch(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await db('users').where({ email }).first();
    return user;
  }

  async findOne(query: object): Promise<User | undefined> {
    const user = await db('users').where(query).first();
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await db('users').where({ id }).first();
    return user;
  }

  async findAll(): Promise<User[]> {
    return db('users');
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    await db('users').where({ id }).update(updateData);
    return this.findById(id);
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    await db('users').where({ id }).del();
    return { message: 'User deleted successfully' };
  }

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
