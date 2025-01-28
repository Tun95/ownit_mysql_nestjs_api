import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Get,
  UseGuards,
  HttpException,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { User } from '../../interface/user/user.interface';
import { AuthGuard } from 'src/common/authorization/auth.guard';
import { AdminGuard } from 'src/common/authorization/admin.guard';
import db from 'db/knex';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //===============
  // ADD NEW USER
  //===============
  @UseGuards(AuthGuard, AdminGuard)
  @Post('add-user')
  async create(
    @Body() userData: Partial<User>,
  ): Promise<{ user: User; message: string }> {
    return this.userService.create(userData);
  }

  //===============
  // USER SIGNUP
  //===============
  @Post('signup')
  async signup(@Body() userData: Partial<User>): Promise<{ token: string }> {
    return this.userService.signup(userData);
  }

  //===============
  // USER SIGNIN
  //===============
  @Post('signin')
  async signin(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ token: string }> {
    return this.userService.signin(email, password);
  }

  //===============
  // ADMIN SIGNUP
  //===============
  @Post('admin/signup')
  async adminSignup(
    @Body() adminData: Partial<User>,
  ): Promise<{ token: string }> {
    return this.userService.adminSignup(adminData);
  }

  //===============
  // ADMIN SIGNIN
  //===============
  @Post('admin/signin')
  async adminSignin(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ token: string }> {
    return this.userService.adminSignin(email, password);
  }

  //=================================
  // Route to handle OTP generation and email verification for user registration and login
  //=================================
  @Post('otp-verification')
  async sendOtpVerificationEmail(@Body() body: { email: string }) {
    const { email } = body;

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new HttpException(
        'The provided email address is not valid.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Find user by email
      const user = await db('users').where({ email }).first();

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Generate OTP and send email
      const otp = await this.userService.createAccountVerificationOtp(user.id);
      await this.userService.sendVerificationEmail(
        user.email,
        user.first_name,
        otp,
      );

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        `Failed to send verification email: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //=====================
  // OTP VERIFICATION
  //=====================
  @Put('verify-otp')
  async verifyOtp(@Body() body: { otp: string }) {
    const { otp } = body;

    // Validate OTP format
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      throw new HttpException(
        'Invalid OTP format. OTP must be a 6-digit number.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Find user by OTP and check if the entered OTP is valid
      const userFound = await this.userService.findUserByOtp(otp);

      if (!userFound) {
        throw new HttpException(
          'Invalid OTP or OTP expired. Please try again.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Mark the user as verified
      await this.userService.verifyUserAccount(userFound.id);

      return {
        message: 'OTP successfully verified.',
        isAccountVerified: true,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Internal Server Error: OTP verification failed.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // FETCH ALL
  //===============
  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  async fetchAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  //===============
  // FETCH USER PROFILE
  //===============
  @UseGuards(AuthGuard)
  @Get('profile')
  async fetchUserProfile(@Request() req): Promise<User> {
    try {
      const userId = req.user.id;
      return await this.userService.fetchUserProfile(userId);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch user profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // FETCH BY ID
  //===============
  @UseGuards(AuthGuard, AdminGuard)
  @Get(':id')
  async fetchById(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  //===============
  // FETCH BY SLUG
  //===============
  @UseGuards(AuthGuard)
  @Get('slug/:slug')
  async fetchBySlug(@Param('slug') slug: string): Promise<User> {
    return this.userService.findBySlug(slug);
  }

  //===============
  // UPDATE USER
  //===============
  @UseGuards(AuthGuard, AdminGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    return this.userService.updateUser(id, updateData);
  }

  //===============
  // PASSWORD RESET TOKEN
  //===============
  @Post('password-token')
  async createPasswordResetToken(@Body() body: { email: string }) {
    const { email } = body;

    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      // Generate reset token
      const token = await this.userService.createPasswordResetToken(email);

      // Send reset password email
      await this.userService.sendPasswordResetEmail(email, user, token);

      return {
        message: `A password reset email has been sent to ${email}. Reset it within 1 hour.`,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        `Failed to process password reset: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // PASSWORD UPDATE
  //===============
  @Put(':id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body('token') token: string,
    @Body('password') password: string,
  ): Promise<{ message: string }> {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await this.userService.findUserByResetToken(hashedToken);
      if (!user) {
        throw new HttpException(
          'Invalid token or token expired, please try again',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Step 3: Check if new password is same as old password
      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        throw new HttpException(
          'New password cannot be the same as the old password',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.userService.updatePassword(id, password);

      await this.userService.sendPasswordResetSuccessEmail(user);

      return { message: 'Password reset successful' };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===============
  // DELETE USER
  //===============
  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.deleteUser(id);
  }
}
