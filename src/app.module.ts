import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { SettingModule } from './modules/setting/setting.module';
import { ScoreModule } from './modules/score/score.module';
import { ReactionModule } from './modules/reaction/reaction.module';
import { PostModule } from './modules/post/post.module';
import { InspirationModule } from './modules/inspiration/inspiration.module';
import { GradeModule } from './modules/grade/grade.module';
import { DiscussionSetModule } from './modules/discussion-set/discussion-set.module';
import { DiscussionModule } from './modules/discussion/discussion.module';
import { CalendarModule } from './modules/calendar/calendar.module';

@Module({
  imports: [
    UserModule,
    SettingModule,
    ScoreModule,
    ReactionModule,
    PostModule,
    InspirationModule,
    GradeModule,
    DiscussionSetModule,
    DiscussionModule,
    CalendarModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
