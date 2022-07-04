import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscussionSet, DiscussionSetSchema } from 'src/entities/discussion-set/discussion-set';
import { Discussion, DiscussionSchema } from 'src/entities/discussion/discussion';
import { User, UserSchema } from 'src/entities/user/user';
import { DiscussionSetController } from './discussion-set.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: DiscussionSet.name, schema: DiscussionSetSchema }]),
        MongooseModule.forFeature([{ name: Discussion.name, schema: DiscussionSchema}]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
    ],
    controllers: [DiscussionSetController],
    providers: [],
})
export class DiscussionSetModule {}
