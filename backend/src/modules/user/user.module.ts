import { Module } from '@nestjs/common';
import { UserController } from '../../controllers/user/user.controller';
import { UserService } from '../../services/user/user.service';

@Module({
  imports: [],
  controllers: [UserController], // Register the controller
  providers: [UserService], // Register the service
  exports: [UserService], // Export the service for use in other modules
})
export class UserModule {}
