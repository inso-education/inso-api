import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from 'mongoose';

export class DiscussionSetCreateDTO {
    @ApiProperty({
      name: 'name',
      description: 'The name of the discussion set',
      required: true,
      type: String,
      isArray: false,
      example: 'Spring 2022 Discussions: CIS 436'
    })
    @IsString()
    @IsNotEmpty()
    public name: string;

    @ApiProperty({
      name: 'facilitators',
      description: 'The facilitators for the discussion set',
      required: true,
      type: [Types.ObjectId],
      isArray: true,
      example: '[\'507f1f77bcf86cd799439011\']'
    })
    @IsOptional()
    @IsNotEmpty()
    @IsArray()
    @IsMongoId({ each: true })
    public facilitators: Types.ObjectId[];


    @ApiProperty({
      name: 'poster',
      description: 'The poster for the discussion set',
      required: true,
      type: Types.ObjectId,
      isArray: true,
      example: '507f1f77bcf86cd799439011'
    })
    @IsNotEmpty()
    @IsMongoId()
    public poster: Types.ObjectId;
    
    constructor(partial: Partial<DiscussionSetCreateDTO>) {
        Object.assign(this, partial);
    }
}