import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiOperation, ApiBody, ApiParam, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiTags, ApiConflictResponse } from '@nestjs/swagger';
import { Model, Types } from 'mongoose';
import { DiscussionSetCreateDTO } from 'src/entities/discussion-set/create-discussion-set';
import { DiscussionSet } from 'src/entities/discussion-set/discussion-set';
import { DiscussionSetEditDTO } from 'src/entities/discussion-set/edit-discussion-set';
import { Discussion } from 'src/entities/discussion/discussion';
import { User } from 'src/entities/user/user';
import { makeInsoId } from '../shared/generateInsoCode';


@Controller()
export class DiscussionSetController {
  constructor(
    @InjectModel(DiscussionSet.name) private discussionSetModel: Model<DiscussionSet>,
    @InjectModel(Discussion.name) private discussionModel: Model<Discussion>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  @Post('discussion-set')
  @ApiOperation({description: 'Creates a discussion Set'})
  @ApiBody({description: 'Discussion Set to create', type: DiscussionSetCreateDTO})
  @ApiOkResponse({ description: 'DiscussionId', type: String})
  @ApiBadRequestResponse({ description: 'Poster, facilitators, or user is not valid'})
  @ApiUnauthorizedResponse({ description: 'User is not authorized to create a discussion set'})
  @ApiNotFoundResponse({ description: 'The User trying to create the discussion set does not exist'})
  @ApiTags('Discussion Set')
  async createDiscussionSet(@Body() discussionSet: DiscussionSetCreateDTO): Promise<string> {
    discussionSet.poster = new Types.ObjectId(discussionSet.poster);
    discussionSet.facilitators = discussionSet.facilitators.map(user => {
      return new Types.ObjectId(user)
    });

    // Check if the poster exists
    const foundUser = await this.userModel.findOne({ _id: discussionSet.poster});
    if(!foundUser) {
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND)
    }

    // Check if all the facilitators exist
    for await(const user of discussionSet.facilitators) {
      let found = await this.userModel.findOne({ _id: user});
      if(!found) {
        throw new HttpException('User in facilitators array does not exist', HttpStatus.NOT_FOUND);
      }
    }

    let foundSet = new this.discussionSetModel();
    let foundDiscussion = new this.discussionModel();
    while(foundSet !== null && foundDiscussion !== null) {
      const code = makeInsoId(5);
      foundDiscussion = await this.discussionModel.findOne({ insoCode: code});
      foundSet = await this.discussionSetModel.findOne({ insoCode: code });
      const discussSet = new this.discussionSetModel( { ...discussionSet, insoCode: code });
      return (await discussSet.save())._id.toString();
    }
  }

  @Patch('discussion-set/:setId')
  @ApiOperation({description: 'Updates a discussion set'})
  @ApiBody({description: 'Discussion Set Update', type: DiscussionSetEditDTO})
  @ApiParam({name: 'setId', description: 'The id of the discussion set to update'})
  @ApiOkResponse({ description: 'Discussion Set Updated'})
  @ApiBadRequestResponse({ description: 'Discussion Set Id is not valid'})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: 'The '})
  @ApiTags('Discussion Set')
  async updateDiscussionSetMetadata(
    @Param('setId') setId: string,
    @Body() updates: DiscussionSetEditDTO
  ): Promise<string> {
    if(!Types.ObjectId.isValid(setId)){
      throw new HttpException('Discussion Set Id is not valid', HttpStatus.BAD_REQUEST);
    }
    const mongoSetId = new Types.ObjectId(setId);
    await this.discussionSetModel.updateOne({ _id: mongoSetId }, updates);
    return 'Discussion Set Updated';
  }

  @Patch('discussion-set/:setId/discussions')
  @ApiOperation({description: 'Updates the list of discussions in a discussion set'})
  @ApiBody({description: '', type: DiscussionSetEditDTO})
  @ApiParam({name: 'setId', description: 'The id of the discussion set having discussions added to it'})
  @ApiOkResponse({ description: 'Discussions added'})
  @ApiBadRequestResponse({ description: 'Discussion Id is not valid or one of the discussion Ids is not valid'})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: 'The discussion set does not exist or the discussion being added to the set does not exist'})
  @ApiTags('Discussion Set')
  async addDiscussionToSet(@Param('setId') setId: string, @Body() discussionIds: string[]): Promise<any> {
    if(!Types.ObjectId.isValid(setId)){
      throw new HttpException('Discussion Set Id is not valid', HttpStatus.BAD_REQUEST);
    }
    const mongoSetId = new Types.ObjectId(setId);

    for await(const discussion of discussionIds) {
      if(!Types.ObjectId.isValid(discussion)) {
        throw new HttpException('Discussion id is not a valid ObjectId', HttpStatus.BAD_REQUEST);
      }
      let discussionId = new Types.ObjectId(discussion);

      const updated = await this.discussionModel.updateOne({ _id: discussionId }, {$push: { set: mongoSetId }});
      if(updated.matchedCount === 0) {
        throw new HttpException('Discussion Set not found', HttpStatus.NOT_FOUND);
      } else if(updated.modifiedCount === 0) {
        throw new HttpException('Discussion Set already archived', HttpStatus.BAD_REQUEST);
      }
    }
    return 'Discussions added to set';
  }

  @Patch('discussion-set/:setId/archive')
  @ApiOperation({description: 'Updates the archived status of a discussion set'})
  @ApiParam({name: 'setId', description: 'The ObjectId of the discussion-set'})
  @ApiOkResponse({ description: 'Set archived'})
  @ApiBadRequestResponse({ description: 'The setId provided in not valid'})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: 'The discussion set was not found'})
  @ApiConflictResponse({ description: 'The discussion is already archived'})
  @ApiTags('Discussion Set')
  async archiveDiscussionSet(@Param('setId') setId: string): Promise<any> {
    if(!Types.ObjectId.isValid(setId)){
      throw new HttpException('Discussion Set Id is not valid', HttpStatus.BAD_REQUEST);
    }
    const mongoSetId = new Types.ObjectId(setId);
    const update = await this.discussionSetModel.updateOne({ _id: mongoSetId}, { archived: new Date()});
    if(update.matchedCount > 0 && update.modifiedCount === 1) {
      return 'Discussion ' + mongoSetId + ' archived';
    } else if(update.matchedCount === 0) {
      throw new HttpException('Discussion Set not found', HttpStatus.NOT_FOUND);
    } else if(update.modifiedCount === 0) {
      throw new HttpException('Discussion Set already archived', HttpStatus.CONFLICT);
    }
  }

  @Delete('discussion-set/:setId')
  @ApiOperation({description: 'Deletes a discussion set'})
  @ApiParam({name: 'setId', description: 'The ObjectId of the set'})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: 'A discussion has already been answered. You cannot delete the discussion set'})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: 'The discussion to delete was not found'})
  @ApiTags('Discussion Set')
  async deleteSet(@Param('setId') setId: string): Promise<string> {
    if(!Types.ObjectId.isValid(setId)){
      throw new HttpException('Discussion Set Id is not valid', HttpStatus.BAD_REQUEST);
    }
    const mongoSetId = new Types.ObjectId(setId);
    const deleted = await this.discussionSetModel.deleteOne({ _id: mongoSetId });
    if(deleted.deletedCount > 0) {
      return 'Discussion Set deleted';
    } else {
      throw new HttpException('Discussion Set not found', HttpStatus.NOT_FOUND)
    }
  }
}