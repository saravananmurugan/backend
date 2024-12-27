import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async createUser(user: RegisterUserDto) {
    const { name, email, password } = user;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async findUserByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // Find the user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
