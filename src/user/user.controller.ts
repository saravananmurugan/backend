import {
  Controller,
  Post,
  Body,
  Logger,
  UnauthorizedException,
  Response,
  ConflictException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { Response as ExpressResponse } from 'express'; // Importing the Response from Express

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async createUser(
    @Body() registerUserDto: RegisterUserDto,
    @Response() res: ExpressResponse,
  ) {
    this.logger.log('Registering a new user');
    const existingUser = await this.userService.findUserByEmail(
      registerUserDto.email,
    );
    if (existingUser) {
      // If the user already exists, throw a conflict exception
      throw new ConflictException('User with this email already exists');
    }
    const user = await this.userService.createUser(registerUserDto);

    const payload = { sub: user._id, username: user.email };

    const accessToken = await this.jwtService.signAsync(payload);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send cookies over HTTPS in production
      maxAge: 3600 * 1000,
      sameSite: 'strict',
    });

    return res.json({
      message: 'User created successfully',
      data: {
        access_token: accessToken,
      },
    });
  }

  @Post('login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Response() res: ExpressResponse,
  ) {
    this.logger.log(`Login attempt for email: ${loginUserDto.email}`);
    try {
      const user = await this.userService.loginUser(loginUserDto);

      this.logger.log(`Login successful for email: ${loginUserDto.email}`);
      const payload = { sub: user._id, username: user.email };

      const accessToken = await this.jwtService.signAsync(payload);

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600 * 1000,
        sameSite: 'strict',
      });

      return res.json({
        message: 'Login successful',
        data: {
          access_token: accessToken,
        },
      });
    } catch (error) {
      this.logger.warn(`Login failed for email: ${loginUserDto.email}`);
      throw new UnauthorizedException(error, 'Invalid credentials');
    }
  }
}
