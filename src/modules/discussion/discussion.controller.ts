import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiBadRequestResponse, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Model, Types } from 'mongoose';
import { DiscussionCreateDTO } from 'src/entities/discussion/create-discussion';
import { Discussion, DiscussionDocument } from 'src/entities/discussion/discussion';
import { DiscussionEditDTO } from 'src/entities/discussion/edit-discussion';
import { DiscussionReadDTO } from 'src/entities/discussion/read-discussion';
import { makeInsoId } from '../shared/generateInsoCode';
import { User } from 'src/entities/user/user';
import { IsMongoId, IsString } from 'class-validator';
import { DiscussionPost } from 'src/entities/post/post';
import { Transform, Type } from 'class-transformer';

@Controller()
export class DiscussionController {
  constructor(
    @InjectModel(Discussion.name) private discussionModel: Model<DiscussionDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(DiscussionPost.name) private postModel: Model<DiscussionPost>
  ) {}

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
  async getDiscussion(@Param('discussionId') discussionId: string): Promise<DiscussionReadDTO> {
    if(!Types.ObjectId.isValid(discussionId)) {
      throw new HttpException('Discussion Id is not valid', HttpStatus.BAD_REQUEST)
    }
    // Have to build out a discussion read functionality
    // Need to get settings, members, inspirations in full, score in full, and calendar in full. 
    return this.discussionModel.findOne({discussionId});
  }

  @Get('users/:userId/discussions')
  @ApiOperation({description: 'Gets discussions for a user from the database'})
  @ApiOkResponse({ description: 'Discussions'})
  @ApiBadRequestResponse({ description: ''})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion')
  async getDiscussions(@Param('userId') userId: string, @Query('participant') participant: boolean, @Query('facilitator') facilitator: boolean): Promise<Discussion[]> {
    // If participant is not there then we assume true
    // If facilitator is not there then we assume true
    // If participant is true we will retrieve the discussionsIds from the user and query to get those
    // If facilitator is true we will retrieve the discussions that have their userId in the facilitators array
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
  updateDiscussionSettings(): string {
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