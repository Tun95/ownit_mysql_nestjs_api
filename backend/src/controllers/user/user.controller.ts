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
