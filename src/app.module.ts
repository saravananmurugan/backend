import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easy-generator',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
