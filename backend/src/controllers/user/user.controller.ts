import { Controller, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { User } from '../../interface/user/user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.create(userData);
  }

  @Post('signup')
  async signup(@Body() userData: Partial<User>): Promise<{ token: string }> {
    return this.userService.signup(userData);
  }

  @Post('signin')
  async signin(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ token: string }> {
    return this.userService.signin(email, password);
  }

  @Post('admin/signup')
  async adminSignup(
    @Body() adminData: Partial<User>,
  ): Promise<{ token: string }> {
    return this.userService.adminSignup(adminData);
  }

  @Post('admin/signin')
  async adminSignin(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ token: string }> {
    return this.userService.adminSignin(email, password);
  }

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

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.deleteUser(id);
  }
}
