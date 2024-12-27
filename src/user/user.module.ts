import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      global: true,
      secret: process.env.SECRET || 'secret123',
      signOptions: { expiresIn: process.env.EXPIRE_TIME || '1hr' },
    }),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
