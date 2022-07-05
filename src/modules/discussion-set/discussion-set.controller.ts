import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiOperation, ApiBody, ApiParam, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { Model, Types } from 'mongoose';
import { DiscussionSetCreateDTO } from 'src/entities/discussion-set/create-discussion-set';
import { DiscussionSet } from 'src/entities/discussion-set/discussion-set';
import { DiscussionSetEditDTO } from 'src/entities/discussion-set/edit-discussion-set';
import { Discussion } from 'src/entities/discussion/discussion';
import { User } from 'src/entities/user/user';


@Controller()
export class DiscussionSetController {
  constructor(
    @InjectModel(DiscussionSet.name) private discussionSetModel: Model<DiscussionSet>,
    @InjectModel(Discussion.name) private discussionModel: Model<Discussion>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  @Post('discussion-set')
  @ApiOperation({description: 'Creates a discussion Set'})
  @ApiBody({description: '', type: DiscussionSetCreateDTO})
  @ApiParam({name: '', description: ''})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: ''})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
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
      let found = await this.userModel.findOne({ _id: user})
    }
    const discussSet = new this.discussionSetModel(discussionSet);
    return await(await discussSet.save())._id.toString();
  }

  @Patch('discussion-set/:setId')
  @ApiOperation({description: 'Updates a discussion set'})
  @ApiBody({description: '', type: DiscussionSetEditDTO})
  @ApiParam({name: '', description: ''})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: ''})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion Set')
  async updateDiscussionSetMetadata(@Param('setId') setId: string): Promise<string> {
    return 'discussion-set'
  }

  @Patch('discussion-set/:setId/discussions')
  @ApiOperation({description: 'Updates the list of discussions in a discussion set'})
  @ApiBody({description: '', type: DiscussionSetEditDTO})
  @ApiParam({name: '', description: ''})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: ''})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion Set')
  async addDiscussionToSet(@Param('setId') setId: string, @Body() discussionIds: string[]): Promise<string> {
    return 'discussion-set'
  }

  @Patch('discussion-set/:setId/archive')
  @ApiOperation({description: 'Updates the archived status of a discussion set'})
  @ApiBody({description: '', type: DiscussionSetEditDTO})
  @ApiParam({name: 'setId', description: 'The ObjectId of the discussion-set'})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: ''})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion Set')
  async archiveDiscussionSet(@Param('setId') setId: string): Promise<string> {
    return 'discussion-set'
  }

  @Delete('discussion-set/:setId')
  @ApiOperation({description: 'Deletes a discussion set'})
  @ApiParam({name: 'setId', description: 'The ObjectId of the set'})
  @ApiOkResponse({ description: ''})
  @ApiBadRequestResponse({ description: 'A discussion has already been answered. You cannot delete the discussion set'})
  @ApiUnauthorizedResponse({ description: ''})
  @ApiNotFoundResponse({ description: ''})
  @ApiTags('Discussion Set')
  async deleteSet(@Param('setId') setId: string): Promise<string> {
    return 'discussion-set'
  }
}