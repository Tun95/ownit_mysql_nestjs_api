import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import { UserService } from './services/user/user.service';

// Utility to generate JWT token
export const generateToken = (user: any): string => {
  const expiresIn = user.is_admin ? '2h' : '24h';

  return jwt.sign(
    {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      image: user.image,
      email: user.email,
      isAdmin: user.is_admin,
      role: user.role,
    },
    process.env.JWT_SECRET || 'somethingsecret',
    { expiresIn },
  );
};

// Function to validate token and return user
export const validateToken = async (
  token: string,
  jwtSecret: string,
  userService: UserService,
): Promise<any> => {
  try {
    const decoded = jwt.verify(token, jwtSecret || 'somethingsecret') as any;
    const user = await userService.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      image: user.image,
      isAdmin: user.is_admin,
      role: user.role,
      isBlocked: user.is_blocked,
      isAccountVerified: user.isAccountVerified,
    };
  } catch (error) {
    console.log(error);
    throw new UnauthorizedException('Invalid or expired token');
  }
};

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role?: string; // Add other user properties if needed
  };
}
