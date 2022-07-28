import { Module } from '@nestjs/common';
import { JwtStrategy } from './guards/jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { User, UserSchema } from 'src/entities/user/user';
import { UserController } from 'src/modules/user/user.controller';
import { UserModule } from 'src/modules/user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './guards/local.strategy';
import { jwtConstants } from './constants';
import { AuthController } from './auth.controller';
import { GoogleAuthController } from './googleAuth.controller';
import { Discussion, DiscussionSchema } from 'src/entities/discussion/discussion';
import { DiscussionPost, DiscussionPostSchema } from 'src/entities/post/post';
import { Score, ScoreSchema } from 'src/entities/score/score';
import { Calendar, CalendarSchema } from 'src/entities/calendar/calendar';
import { SGService } from 'src/drivers/sendgrid';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy, SGService],
  imports: [
    UserModule,
    SGService,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '86000s'}
     }),
     MongooseModule.forFeature([{ name: Discussion.name, schema: DiscussionSchema }]),
     MongooseModule.forFeature([{ name: DiscussionPost.name, schema: DiscussionPostSchema }]),
     MongooseModule.forFeature([{ name: Score.name, schema: ScoreSchema }]),
     MongooseModule.forFeature([{ name: Calendar.name, schema: CalendarSchema }]),
     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
    ], 
  controllers: [AuthController, GoogleAuthController],
  exports: [AuthService]
})
export class AuthModule {}
