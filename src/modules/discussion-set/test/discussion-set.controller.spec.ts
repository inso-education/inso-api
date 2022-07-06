import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect, Types } from 'mongoose';
import { DiscussionSet, DiscussionSetSchema } from 'src/entities/discussion-set/discussion-set';
import { Discussion, DiscussionSchema } from 'src/entities/discussion/discussion';
import { User, UserSchema } from 'src/entities/user/user';
import { DiscussionSetController } from '../discussion-set.controller';

const IDS = {
  FOUND_USER: '62b276fda78b2a00063b1de0',
  FOUND_DISCUSSION: '62c47e75622811a80d3454bf',
  MISSING_USER: '62c47e75622811a80d3454be',
  MISSING_DISCUSSION: '62b276fda78b2a00063b1de1',
  INVALID_ID: '62b276fda78b2a00063b1dep'
}
describe('AppController', () => {
  let appController: DiscussionSetController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let discussionModel: Model<any>;
  let userModel: Model<any>;
  let discussionSetModel: Model<any>;

  beforeAll(async() => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    discussionSetModel = mongoConnection.model(DiscussionSet.name, DiscussionSetSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    discussionModel = mongoConnection.model(Discussion.name, DiscussionSchema);

    // SEED DATA
    await userModel.insertMany([
      {
        "_id": new Types.ObjectId('62b276fda78b2a00063b1de0'),
        "f_name": "Paige",
        "l_name": "Zaleppa"
      }
    ]);

    await discussionModel.insertMany([
      {
        _id: new Types.ObjectId('62c47e75622811a80d3454bf'),
        insoCode: 'IQBDJ',
        name: 'CIS 435 Week 15 Discussion Plan I',
        archived: null,
        facilitators: [
            new Types.ObjectId('62b276fda78b2a00063b1de0')
        ],
        poster: '62b276fda78b2a00063b1de0',
        set: [],
        created: new Date(),
      }
    ])
  })
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DiscussionSetController],
      providers: [
        { provide: getModelToken(Discussion.name), useValue: discussionModel},
        { provide: getModelToken(DiscussionSet.name), useValue: discussionSetModel},
        { provide: getModelToken(User.name), useValue: userModel}
      ],
    }).compile();

    appController = app.get<DiscussionSetController>(DiscussionSetController);
  });

  describe('POST /discussion-set', () => {
    it('should return a 200 for valid discussion set creation', () => {

    });
    it('should return a 404 for the poster not existing', () => {

    });
    it('should return a 404 for a facilitator not existing', () => {

    });
    it('should return a 400 for an empty name', () => {

    });
    it('should return a 400 for a facilitator not being a mongoId', () => {

    });
    it('should return a 400 for poster not being a mongoId', () => {

    });

  });

  describe('PATCH discussion-set/:setId', () => {
    it('should return a 200 for a valid update', () => {

    });
    it('should return a 400 for an invalid setId', () => {
      
    });
    it('should return a 404 for discussion set not found', () => {
      
    });
    it('should return a 400 for an empty name', () => {

    });
    it('should return a 400 for an invalid facilitators id', () => {

    });
    it('should return a 400 for an invalid poster id', () => {

    });
  });
});