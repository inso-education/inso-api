import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiBadRequestResponse, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { CalendarCreateDTO } from 'src/entities/calendar/create-calendar';
import { DiscussionCreateDTO } from 'src/entities/discussion/create-discussion';
import { Discussion, DiscussionDocument } from 'src/entities/discussion/discussion';
import { DiscussionEditDTO } from 'src/entities/discussion/edit-discussion';
import { DiscussionReadDTO } from 'src/entities/discussion/read-discussion';
import { Inspiration } from 'src/entities/inspiration/inspiration';
import { Score } from 'src/entities/score/score';
import { SettingsCreateDTO } from 'src/entities/setting/create-setting';
import { Setting } from 'src/entities/setting/setting';
import { makeInsoId } from '../shared/generateInsoCode';

@Controller()
export class DiscussionController {
  constructor(@InjectModel(Discussion.name) private discussionModel: Model<DiscussionDocument>, 
              @InjectModel(Setting.name) private settingModel: Model<Setting>,
              @InjectModel(Score.name) private scoreModel: Model<Score>,
              @InjectModel(Inspiration.name) private post_inspirationModel: Model<Inspiration> ) {}
              
  @Post('discussion')
  @ApiOperation({description: 'Creates a discussion'})
  @ApiBody({description: '', type: DiscussionCreateDTO})
  @ApiOkResponse({ description: 'Discussion created!'})
  @ApiBadRequestResponse({ description: 'The discussion is missing a name, poster, or facilitators'})
  @ApiUnauthorizedResponse({ description: 'The user does not have permission to create a discussion'})
  @ApiNotFoundResponse({ description: 'The poster or one of the facilitators was not found'})
  @ApiTags('Discussion')
  async createDiscussion(@Body() discussion: DiscussionCreateDTO): Promise<Discussion> {
    // TODO: Check that user exists in DB

    // Add the poster to the facilitators
    if(discussion.facilitators === undefined) {
      discussion.facilitators = [];
    }
    discussion.facilitators.push(discussion.poster);
    // Create Inso Code 
    const code = makeInsoId(5);
    // Check that the code is not active in the database
    let found = new this.discussionModel();
    while(found !== null) {
      found = await this.discussionModel.findOne({ insoCode: code });
      const createdDiscussion = new this.discussionModel({...discussion, insoCode: code});
      return createdDiscussion.save();
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
  async updateDiscussionMetadata(@Body() discussion: Partial<DiscussionEditDTO>): Promise<string> {
    console.log(discussion);
    return 'update discussion metadata'
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
    console.log(discussionId);
    return 'update discussion metadata'
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
    const found = this.discussionModel.findOne({_id: discussionId})
    
    if (!found){
      this.discussionModel.findOneAndUpdate({_id: discussionId}, setting, { new: true });
    }

    const post_inspiration = await this.post_inspirationModel.findOne({_id: setting.post_inspiration});
    if (!post_inspiration){
      throw new HttpException('Post Inspiration id not found', HttpStatus.BAD_REQUEST);
    }

    const score = await this.scoreModel.findOne({_id: setting.scores});
    if (!score){
      throw new HttpException('Score id not found', HttpStatus.BAD_REQUEST);
    }

    console.log(found)
    return 'update discussion settings'
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
  deleteDiscussion(
  ): string {
    return 'deleted discussion settings'
  }
}