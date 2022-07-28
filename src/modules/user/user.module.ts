import { Module, forwardRef } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { jwtConstants } from 'src/auth/constants';
import { JwtStrategy } from 'src/auth/guards/jwt.strategy';
import { SGService } from 'src/drivers/sendgrid';
import { User, UserSchema } from 'src/entities/user/user';
import { DiscussionModule } from '../discussion/discussion.module';
import { UserController } from './user.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), 
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '86000s'}
        })
        ],
    controllers: [
        UserController
    ],
    providers: [
        SGService, 
        JwtStrategy
    ],
    exports: []
})
export class UserModule {}
