import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SGService } from 'src/drivers/sendgrid';
import { User, UserSchema } from 'src/entities/user/user';
import { UserController } from './user.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [UserController],
    providers: [UserController, SGService],
    exports: [UserController]
})
export class UserModule {}
