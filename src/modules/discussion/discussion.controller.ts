import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiBadRequestResponse, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CalendarCreateDTO } from 'src/entities/calendar/create-calendar';
import { Model, Types } from 'mongoose';
import { DiscussionCreateDTO } from 'src/entities/discussion/create-discussion';
import { Discussion, DiscussionDocument } from 'src/entities/discussion/discussion';
import { DiscussionEditDTO } from 'src/entities/discussion/edit-discussion';
import { DiscussionReadDTO } from 'src/entities/discussion/read-discussion';
import { Inspiration, InspirationDocument } from 'src/entities/inspiration/inspiration';
import { Score, ScoreDocument } from 'src/entities/score/score';
import { SettingsCreateDTO } from 'src/entities/setting/create-setting';
import { Setting, SettingDocument } from 'src/entities/setting/setting';
import { makeInsoId } from '../shared/generateInsoCode';
import { DiscussionPost } from 'src/entities/post/post';
import { User, UserDocument } from 'src/entities/user/user';
import { Calendar, CalendarDocument } from 'src/entities/calendar/calendar';

@Controller()
export class DiscussionController {
  constructor(@InjectModel(Discussion.name) private discussionModel: Model<DiscussionDocument>, 
              @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
              @InjectModel(Score.name) private scoreModel: Model<ScoreDocument>,
              @InjectModel(Inspiration.name) private post_inspirationModel: Model<InspirationDocument>,
              @InjectModel(User.name) private userModel: Model<UserDocument>,
              @InjectModel(Calendar.name) private calendarModel: Model<CalendarDocument>,
              @InjectModel(DiscussionPost.name) private postModel: Model<DiscussionPost>) {}
              
  @Post('discussion')
  @ApiOperation({description: 'Creates a discussion'})
  @ApiBody({description: '', type: DiscussionCreateDTO})
  @ApiOkResponse({ description: 'Discussion created!'})
  @ApiBadRequestResponse({ description: 'The discussion is missing a name, poster, or facilitators'})
  @ApiUnauthorizedResponse({ description: 'The user does not have permission to create a discussion'})
  @ApiNotFoundResponse({ description: 'The poster or one of the facilitators was not found'})
  @ApiTags('Discussion')
  async createDiscussion(@Body() discussion: DiscussionCreateDTO): Promise<Discussion> {
    // Check that user exists in DB
    const user = await this.userModel.findOne({_id: discussion.poster});
    if(!user) {
      throw new HttpException("User trying to create discussion does not exist", HttpStatus.BAD_REQUEST);
    }
    
    // Add the poster to the facilitators
    if(discussion.facilitators === undefined) {
      discussion.facilitators = [];
    }
    discussion.facilitators.push(discussion.poster);

    // Verify that all facilitators exist
    for await (const user of discussion.facilitators) {
      let found = await this.userModel.exists({_id: user});
      if(!found) {
        throw new HttpException("A user does not exist in the facilitators array", HttpStatus.NOT_FOUND);
      }
    }
    // Create Inso Code 
    const code = makeInsoId(5);
    // Check that the code is not active in the database
    let found = new this.discussionModel();
    while(found !== null) {
      found = await this.discussionModel.findOne({ insoCode: code });
      const createdDiscussion = new this.discussionModel({...discussion, insoCode: code});
      return await createdDiscussion.save();
    }
  }


  @Patch('discussion/:discussionId/metadata')
  @ApiOperation({description: 'Update the metadata for the discussion'})
  @ApiBody({description: '', type: DiscussionEditDTO})
  @ApiParam({name: '', description: ''})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: ''})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion')
  async updateDiscussionMetadata(@Param('discussionId') discussionId: string, @Body() discussion: DiscussionEditDTO): Promise<any> {
    // Check that the ids match
    if(discussionId !== discussion.id.toString()) {
      throw new HttpException("Discussion being updated is not discussion", HttpStatus.BAD_REQUEST)
    }
    // Check that discussion exists
    const found = await this.discussionModel.findOne({_id: discussionId});
    if(!found) {
      throw new HttpException("Discussion not found", HttpStatus.NOT_FOUND);
    }

    // If there are new facilitators verify they exist and push them into the existing array
    for await (const user of discussion.facilitators) {
      let found = await this.userModel.findOne({_id: user});
      if(!found) {
        throw new HttpException("A user does not exist in the facilitators array", HttpStatus.NOT_FOUND);
      }
    }
    discussion.facilitators = discussion.facilitators.concat(found.facilitators);
    // Update the discussion and return the new value
    return await this.discussionModel.findOneAndUpdate({_id: discussionId}, discussion, { new: true });
  }

  @Get('discussion/:discussionId')
  @ApiOperation({description: 'Update the metadata for the discussion'})
  @ApiBody({description: '', type: DiscussionEditDTO})
  @ApiParam({name: 'discussionId', description: 'The id of the discussion'})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: ''})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion')
  async getDiscussion(@Param('discussionId') discussionId: string): Promise<string> {
    return 'wowo';
  }

  @Get('discussions')
  @ApiOperation({description: 'Gets discussions for a user from the database'})
  @ApiOkResponse({ description: 'Discussions'})
  @ApiBadRequestResponse({ description: ''})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion')
  async getDiscussions(): Promise<Discussion[]> {
    return;
  }

  @Patch('discussion/:discussionId/settings')
  @ApiOperation({description: 'Update the discussion settings'})
  @ApiBody({description: '', type: DiscussionEditDTO})
  @ApiParam({name: '', description: ''})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: ''})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion')
  async updateDiscussionSettings(
    @Body() setting: SettingsCreateDTO,
    @Param('discussionId') discussionId: string): Promise<any> {

    //check discussionId is valid]
    if(!Types.ObjectId.isValid(discussionId)){
      throw new HttpException('DiscsussionId is invalid', HttpStatus.BAD_REQUEST)
    }

    const found = await this.discussionModel.findOne({_id: new Types.ObjectId(discussionId)})
    if (!found){
      throw new HttpException('Discussion Id does not exist', HttpStatus.NOT_FOUND);
    }
    
    const score = await this.scoreModel.findOne({_id: new Types.ObjectId(setting.score)});
    if (!score){
      throw new HttpException('Score Id does not exist', HttpStatus.NOT_FOUND);
    }

    const calendar = await this.calendarModel.findOne({_id: new Types.ObjectId(setting.calendar)});
    if (!calendar){
      throw new HttpException('Calendar Id does not exist', HttpStatus.NOT_FOUND);
    }

    //Loop through the setting.post_inspiration
    for await (const post_inspiration of setting.post_inspiration){
      let found = await this.post_inspirationModel.findOne({_id: [new Types.ObjectId(post_inspiration)]});
      if(!found){
        throw new HttpException('Post inspiration Id does not exist', HttpStatus.NOT_FOUND);
      }
    }
    return await this.settingModel.findOneAndUpdate({_id: new Types.ObjectId(found.settings)}, setting, {new: true, upsert: true});
  }

  @Patch('/users/:userId/discussions/:insoCode/join')
  @ApiOperation({description: 'Add the user to the participants array on the discussion'})
  @ApiBody({description: ''})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: ''})
  async joinDiscussion(
    @Param('userId') userId: string,
    @Param('insoCode') insoCode: string): Promise<any>{
    
    if(insoCode.length !== 5) {
      throw new HttpException('InsoCode not valid', HttpStatus.BAD_REQUEST);
    }
    if(!Types.ObjectId.isValid(userId)) {
      throw new HttpException('UserId is not valid', HttpStatus.BAD_REQUEST);
    }

    //check for user
    const findUser = await this.userModel.findOne({_id: new Types.ObjectId(userId)})
    if(!findUser){
      throw new HttpException('UserId not found in the discussion', HttpStatus.NOT_FOUND)
    }

    //check for discusionId 
    const found = await this.discussionModel.findOne({ insoCode: insoCode });
    if(!found) {
      throw new HttpException("Discussion is not found", HttpStatus.NOT_FOUND);
    }

    // Add the participants to the discussion
    const foundParticipant = await this.discussionModel.findOne({ insoCode: insoCode, "participants.user": userId  });
    if(foundParticipant) {
      throw new HttpException("User is already a participant", HttpStatus.CONFLICT);
    }

    const newParticipant = {
    user: new Types.ObjectId(userId),
    joined: new Date,
    muted: false,
    grade: null
    } 
    await this.discussionModel.findOneAndUpdate({insoCode: insoCode}, {$push: {participants: newParticipant}})

    
  }

  @Delete('discussion/:discussionId')
  @ApiOperation({description: 'Delete the discussion'})
  @ApiBody({description: '', type: DiscussionEditDTO})
  @ApiParam({name: '', description: ''})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: 'The discussion has already been answered. It cannot be deleted'})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion')
  async deleteDiscussion(@Param('discussionId') discussionId: string): Promise<void> {
    // Check if there are any posts before deleting
    let discussion = new Types.ObjectId(discussionId);
    const posts = await this.postModel.find({ discussionId: discussion });
    if(posts.length > 0) {
      throw new HttpException("Cannot delete a discussion that has posts", HttpStatus.CONFLICT);
    }
    await this.discussionModel.deleteOne({ _id: discussion });
    return;
  }
}