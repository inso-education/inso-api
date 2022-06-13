import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class DiscussionEditDTO {

    @ApiProperty({
      name: 'id',
      description: 'The ObjectId of the discussion',
      required: true,
      type: Types.ObjectId,
      isArray: false,
      example: '507f1f77bcf86cd799439011'
    })
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    @Transform((id:any) => {
        if (!Types.ObjectId.isValid(id.value)) {
          throw new BadRequestException(['Invalid ObjectId for Discussion Id']);
        }
    
        return new Types.ObjectId(id.value);
    })
    public id: Types.ObjectId;

    @ApiProperty({
      name: 'name',
      description: 'The updated name of the discussion',
      required: false,
      type: String,
      isArray: false,
      example: 'CIS 435 Week 5 Discussion'
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    public name: string;

    @ApiProperty({
      name: 'archived',
      description: 'The date that the discussion is being archived',
      required: false,
      type: Date,
      isArray: false,
      example: 'Fri Apr 15 2022 13:01:58 GMT-0400 (Eastern Daylight Time)'
    })
    @IsOptional()
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    public archived: Date;

    @ApiProperty({
      name: 'settings',
      description: 'The ObjectId of the settings object being associated with this discussion',
      required: false,
      type: Types.ObjectId,
      isArray: false,
      example: '507f1f77bcf86cd799439011'
    })
    @IsOptional()
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    @Transform((id:any) => {
        if (!Types.ObjectId.isValid(id.value)) {
          throw new BadRequestException(['Invalid ObjectId for Settings Id']);
        }
    
        return new Types.ObjectId(id.value);
    })
    public settings: Types.ObjectId;

    @ApiProperty({
      name: 'settings',
      description: 'The ObjectId of the users that will be the facilitators for the discussion',
      required: false,
      type: [Types.ObjectId],
      isArray: true,
      example: '[ \'507f1f77bcf86cd799439011\']'
    })
    @IsOptional()
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    @Transform((id:any) => {
        if (!Types.ObjectId.isValid(id.value)) {
          throw new BadRequestException(['Invalid ObjectId for Facilitator Id']);
        }
    
        return new Types.ObjectId(id.value);
    })
    public facilitators: Types.ObjectId [];
    
    @ApiProperty({
      name: 'calendar',
      description: 'The ObjectId of the calendar associated with the discussion',
      required: false,
      type: Types.ObjectId,
      isArray: false,
      example: '507f1f77bcf86cd799439011'
    })
    @IsOptional()
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    @Transform((id:any) => {
        if (!Types.ObjectId.isValid(id.value)) {
          throw new BadRequestException(['Invalid ObjectId for Calendar Id']);
        }
    
        return new Types.ObjectId(id.value);
    })
    public set: Types.ObjectId;

    
    constructor(partial: Partial<DiscussionEditDTO>) {
        Object.assign(this, partial);
    }
}