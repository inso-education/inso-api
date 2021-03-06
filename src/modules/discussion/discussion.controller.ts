import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query, UsePipes, ValidationPipe, UseGuards, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiBadRequestResponse, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
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
import { DiscussionPost, DiscussionPostDocument } from 'src/entities/post/post';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User, UserDocument } from 'src/entities/user/user';
import { Calendar, CalendarDocument } from 'src/entities/calendar/calendar';
import { BulkReadDiscussionDTO } from 'src/entities/discussion/bulk-read-discussion';
import { IsCreatorGuard } from 'src/auth/guards/is-creator.guard';
import { IsDiscussionCreatorGuard } from 'src/auth/guards/userGuards/isDiscussionCreator.guard';
import { IsDiscussionFacilitatorGuard } from 'src/auth/guards/userGuards/isDiscussionFacilitator.guard';
import { IsDiscussionMemberGuard } from 'src/auth/guards/userGuards/isDiscussionMember.guard';
import { Reaction, ReactionDocument } from 'src/entities/reaction/reaction';

@Controller()
export class DiscussionController {
  constructor(
    @InjectModel(Discussion.name) private discussionModel: Model<DiscussionDocument>, 
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
    @InjectModel(Score.name) private scoreModel: Model<ScoreDocument>,
    @InjectModel(Inspiration.name) private post_inspirationModel: Model<InspirationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Calendar.name) private calendarModel: Model<CalendarDocument>,
    @InjectModel(DiscussionPost.name) private postModel: Model<DiscussionPostDocument>,
    @InjectModel(Reaction.name) private reactionModel: Model<ReactionDocument>
  ) {}
              
  @Post('discussion')
  @ApiOperation({description: 'Creates a discussion'})
  @ApiBody({description: '', type: DiscussionCreateDTO})
  @ApiOkResponse({ description: 'Discussion created!'})
  @ApiBadRequestResponse({ description: 'The discussion is missing a name, poster, or facilitators'})
  @ApiUnauthorizedResponse({ description: 'The user does not have permission to create a discussion'})
  @ApiNotFoundResponse({ description: 'The poster or one of the facilitators was not found'})
  @ApiTags('Discussion')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createDiscussion(@Body() discussion: DiscussionCreateDTO, @Request() req): Promise<Discussion> {

    // Check that user exists in DB
    const user = await this.userModel.findOne({_id: discussion.poster});
    if(!user) {
      throw new HttpException("User trying to create discussion does not exist", HttpStatus.BAD_REQUEST);
    }

    // Compare poster to user in request from JWT for authorization
    const auth = await this.userModel.findOne({username: req.user.username});
    if(auth._id.toString() !== discussion.poster.toString()){
      throw new HttpException('Discussion poster does not match authentication token user', HttpStatus.BAD_REQUEST);
    }
    
    // Add the poster to the facilitators
    if(discussion.facilitators === undefined) {
      discussion.facilitators = [];
    }
    discussion.facilitators.push(discussion.poster);
    // Filter out any duplicate Ids
    discussion.facilitators = discussion.facilitators.filter((c, index) => {
      return discussion.facilitators.indexOf(c) === index;
    });

    // Verify that all facilitators exist
    for await (const user of discussion.facilitators) {
      let found = await this.userModel.exists({_id: user});
      if(!found) {
        throw new HttpException("A user does not exist in the facilitators array", HttpStatus.NOT_FOUND);
      }
    }
    // Check that the code is not active in the database
    let found = new this.discussionModel();
    while(found !== null) {
      const code = makeInsoId(5);
      found = await this.discussionModel.findOne({ insoCode: code });
      if(!found) {
        const setting = new this.settingModel();
        const settingId = await setting.save();

        const createdDiscussion = new this.discussionModel({...discussion, poster: new Types.ObjectId(discussion.poster), insoCode: code, settings: settingId._id});
        return await createdDiscussion.save();
      }
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
  @UseGuards(JwtAuthGuard, IsDiscussionCreatorGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateDiscussionMetadata(
    @Param('discussionId') discussionId: string,
    @Param('entity') entity: string,
    @Body() discussion: DiscussionEditDTO
  ): Promise<any> {
    // Check that discussion exists
    const found = await this.discussionModel.findOne({_id: discussionId});
    if(!found) {
      throw new HttpException("Discussion not found", HttpStatus.NOT_FOUND);
    }

    // If there are new facilitators verify they exist and push them into the existing array
    if(discussion.facilitators) {
      for await (const user of discussion.facilitators) {
        let found = await this.userModel.findOne({_id: user});
        if(!found) {
          throw new HttpException("A user does not exist in the facilitators array", HttpStatus.NOT_FOUND);
        }
      }
      // Filter out any duplicate Ids
      discussion.facilitators = discussion.facilitators.filter((c, index) => {
        return discussion.facilitators.indexOf(c) === index;
      });
    }
    // Update the discussion and return the new value
    return await this.discussionModel.findOneAndUpdate({_id: discussionId}, discussion, { new: true });
  }

  @Get('discussion/:discussionId')
  @ApiOperation({description: 'Update the metadata for the discussion'})
  @ApiParam({name: 'discussionId', description: 'The id of the discussion'})
  @ApiOkResponse({ description: 'Discussions'})
  @ApiBadRequestResponse({ description: 'The discussion Id is not valid'})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: 'The discussion was not found'})
  @ApiTags('Discussion')
  @UseGuards(JwtAuthGuard, IsDiscussionMemberGuard)
  async getDiscussion(@Param('discussionId') discussionId: string): Promise<any> {
    if(!Types.ObjectId.isValid(discussionId)) {
      throw new HttpException('Discussion Id is not valid', HttpStatus.BAD_REQUEST);
    }
    const discussion = await this.discussionModel.findOne({ _id: discussionId })
      .populate('facilitators', ['f_name', 'l_name', 'email', 'username'])
      .populate('poster', ['f_name', 'l_name', 'email', 'username'])
      .populate({ path: 'settings', populate: [{ path: 'calendar'}, { path: 'score'}, { path: 'inspiration'}]}).lean();

    if(!discussion) {
      throw new HttpException('Discussion does not exist', HttpStatus.NOT_FOUND);
    }

    // Get posts
    // Needs recursion here 
    const dbPosts = await this.postModel.find({ discussionId: new Types.ObjectId(discussion._id), draft: false, comment_for: null }).populate('userId', ['f_name', 'l_name', 'email', 'username']).sort({ date: -1 }).lean();
    const posts = [];
    for await(const post of dbPosts) {
      const comments = await this.postModel.find({ comment_for: new Types.ObjectId(post._id)}).sort({ date: -1}).populate('userId', ['f_name', 'l_name', 'email', 'username']);
      const reactions = await this.reactionModel.find({ postId: new Types.ObjectId(post._id)}).populate('userId', ['f_name', 'l_name', 'email', 'username']);
      let newPost = { ...post, user: post.userId, reactions: reactions, comments: comments };
      delete newPost.userId;
      posts.push(newPost);
    }

    const discussionRead = new DiscussionReadDTO({
      ...discussion,
      posts: posts
    });

    return discussionRead;
  }

  @Post('discussion/:discussionId/archive')
  @ApiOperation({description: 'Archive a discussion'})
  @ApiOkResponse({ description: 'Newly archived discussion'})
  @ApiBadRequestResponse({ description: 'The discussionId is not valid'})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: 'The discussion to be archived does not exist'})
  @ApiTags('Discussion')
  @UseGuards(JwtAuthGuard, IsDiscussionCreatorGuard)
  async archiveDiscussion(@Param('discussionId') discussionId: string): Promise<any> {
    if(!Types.ObjectId.isValid(discussionId)) {
      throw new HttpException('DiscussionId is not a valid MongoId', HttpStatus.BAD_REQUEST);
    }
    const archivedDate = new Date();
    return await this.discussionModel.findOneAndUpdate({ _id: discussionId }, { archived: archivedDate });
  }

  @Post('discussion/:discussionId/duplicate')
  @ApiOperation({description: 'Duplicate a discussion with all settings'})
  @ApiOkResponse({ description: 'Discussions'})
  @ApiBadRequestResponse({ description: 'The discussionId is not valid'})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: 'The discussion to be archived does not exist'})
  @ApiTags('Discussion')
  @UseGuards(JwtAuthGuard, IsDiscussionFacilitatorGuard)
  async duplicateDiscussion(@Param('discussionId') discussionId: string): Promise<any> {
    if(!Types.ObjectId.isValid(discussionId)) {
      throw new HttpException('DiscussionId is not a valid MongoId', HttpStatus.BAD_REQUEST);
    }
    const discussion = await this.discussionModel.findOne({ _id: discussionId });
    if(!discussion) {
      throw new HttpException('Discussion does not exist!', HttpStatus.NOT_FOUND);
    }
    const settings = await this.settingModel.findOne({ _id: discussion.settings });
  

    //Duplicate the score
    const score = await this.scoreModel.findOne({ _id: settings.score });
    delete score._id;
    const newScore = new this.scoreModel(score);
    const newScoreId = await newScore.save();

    // duplicate the settings 
    // calendar is set to null because the calendar needs to be set
    delete settings._id;
    const newSetting = new this.settingModel({ 
      userId: settings.userId,
      starter_prompt: settings.starter_prompt,
      inspiration: settings.inspiration,
      score: newScoreId._id,
      calendar: null 
    });
    const settingId = await newSetting.save();

     // duplicate a discussion
    let found = new this.discussionModel();
    while(found !== null) {
      const code = makeInsoId(5);
      found = await this.discussionModel.findOne({ insoCode: code });
      if(!found) {
        const createdDiscussion = new this.discussionModel({ 
          name: discussion.name,
          facilitators: discussion.facilitators,
          insoCode: code,
          settings: settingId._id,
          poster: discussion.poster,
        });
        return await createdDiscussion.save();
      }
    }
  }


  @Get('users/:userId/discussions')
  @ApiOperation({description: 'Gets discussions for a user from the database'})
  @ApiOkResponse({ description: 'Discussions'})
  @ApiBadRequestResponse({ description: ''})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiQuery({ description: ''})
  @ApiTags('Discussion')
  @UseGuards(JwtAuthGuard, IsDiscussionMemberGuard)
  async getDiscussions(
    @Param('userId') userId: string,
    @Query('participant') participant: boolean,
    @Query('facilitator') facilitator: boolean,
    @Query('text') text: string,
    @Query('archived') archived: boolean
  ): Promise<any []> {

    if(!Types.ObjectId.isValid(userId)) {
      throw new HttpException('UserId is not valid!', HttpStatus.BAD_REQUEST);
    }

    // TODO add search for inso code and text
    const aggregation = [];
    if(participant === undefined && facilitator === undefined) {
      // aggregation.push({ $match: { participants._id: new Types.ObjectId(userId)}});
      aggregation.push({ $match : { facilitators: new Types.ObjectId(userId) }});
    }
    if(participant === true) {
      // aggregation.push({ $match: { participants._id: new Types.ObjectId(userId)}});
    }
    if(facilitator === true) {
      aggregation.push({ $match : { facilitators: new Types.ObjectId(userId) }})
    }
    if(archived !== undefined) {
      if(archived === false) {
        aggregation.push({ $match: { archived: null }});
      } else if (archived === true) {
        aggregation.push({ $match: { archived: { $ne: null }}});
      }
    }

    const discussions = await this.discussionModel.aggregate(
      aggregation
    );

    const returnDiscussions = [];
    for await(const discuss of discussions) {
      discuss.poster = await this.userModel.findOne({ _id: discuss.poster});
      returnDiscussions.push(new BulkReadDiscussionDTO(discuss));
    }
    return returnDiscussions;
  }

  @Patch('discussion/:discussionId/settings')
  @ApiOperation({description: 'Update the discussion settings'})
  @ApiBody({description: '', type: SettingsCreateDTO})
  @ApiParam({name: '', description: ''})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: ''})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion')
  @UseGuards(JwtAuthGuard, IsDiscussionCreatorGuard)
  async updateDiscussionSettings(
    @Body() setting: SettingsCreateDTO,
    @Param('discussionId') discussionId: string): Promise<any> {

    //check discussionId is valid]
    if(!Types.ObjectId.isValid(discussionId)){
      throw new HttpException('Discussion Id is invalid', HttpStatus.BAD_REQUEST)
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
  @ApiOperation({description: 'Add the user as a participant on the discussion'})
  @ApiOkResponse({ description: 'Participant added'})
  @ApiBadRequestResponse({ description: 'UserId is not valid'})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: 'UserId not found in the discussion'})
  @ApiTags('Discussion')
  @UseGuards(JwtAuthGuard)
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
  @ApiParam({name: '', description: ''})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: 'The discussion has already been answered. It cannot be deleted'})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion')
  @UseGuards(JwtAuthGuard, IsDiscussionCreatorGuard)
  async deleteDiscussion(
    @Param('discussionId') discussionId: string,
    @Param('entity') entity: string
    ): Promise<void> {
    // Verify the entity parameter equals 'discussion', for IsCreator Guard to query database
    if(entity !== 'discussion'){
      throw new HttpException("Entity parameter for discussion patch route must be 'discussion'", HttpStatus.BAD_REQUEST);
    }
    // Check if there are any posts before deleting
    let discussion = new Types.ObjectId(discussionId);
    const posts = await this.postModel.find({ discussionId: discussion });
    if(posts.length > 0) {
      throw new HttpException("Cannot delete a discussion that has posts", HttpStatus.CONFLICT);
    }
    await this.discussionModel.deleteOne({ _id: discussion });
    return;
  }



  //** PRIVATE FUNCTIONS */

  async getPostsAndComments(post: any) {
    const comments = await this.postModel.find({ comment_for: new Types.ObjectId(post._id)}).sort({ date: -1}).populate('userId', ['f_name', 'l_name', 'email', 'username']);
    const reactions = await this.reactionModel.find({ postId: new Types.ObjectId(post._id)}).populate('userId', ['f_name', 'l_name', 'email', 'username']);
    let newPost = { ...post, user: post.userId, reactions: reactions, comments: comments };
    delete newPost.userId;
    return newPost;
  }
}