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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //===============
  // ADD NEW USER
  //===============
  @UseGuards(AuthGuard, AdminGuard)
  @Post()
  async create(@Body() userData: Partial<User>): Promise<User> {
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

  @Post('password-reset')
  async createPasswordResetToken(
    @Body('email') email: string,
  ): Promise<string> {
    return this.userService.createPasswordResetToken(email);
  }

  @Put('update-password/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ): Promise<void> {
    return this.userService.updatePassword(id, newPassword);
  }

  @Post('verify-account/:id')
  async createAccountVerificationOtp(@Param('id') id: string): Promise<string> {
    return this.userService.createAccountVerificationOtp(id);
  }

  @Put('verify-account/:id')
  async verifyUserAccount(@Param('id') id: string): Promise<void> {
    return this.userService.verifyUserAccount(id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.deleteUser(id);
  }
}
