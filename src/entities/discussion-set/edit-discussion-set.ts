import { BadRequestException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDate, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { Types } from 'mongoose';

export class DiscussionSetEditDTO {
    @ApiProperty({
        name: 'name',
        description: 'The updated name for the discussion set',
        required: false,
        type: Types.ObjectId,
        isArray: true,
        example: 'New Discussion Set Name'
      })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    public name: string;

    @ApiProperty({
        name: 'facilitators',
        description: 'The ObjectId of the facilitators of the discussion set',
        required: false,
        type: [Types.ObjectId],
        isArray: true,
        example: '[\'507f1f77bcf86cd799439011\']'
    })
    @IsOptional()
    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    @Transform((id:any) => {
      const ids = id.value.map(id => {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(['Invalid ObjectId for Facilitator Id']);
        }
      
        return new Types.ObjectId(id);
      });
      return ids;
    })
    public facilitators: Types.ObjectId [];


    @ApiProperty({
        name: 'poster',
        description: 'The ObjectId of the poster of the discussion set',
        required: false,
        type: Types.ObjectId,
        isArray: true,
        example: '507f1f77bcf86cd799439011'
      })
    @IsOptional()
    @IsNotEmpty()
    @Transform((id:any) => {
        if (!Types.ObjectId.isValid(id.value)) {
          throw new BadRequestException(['Invalid ObjectId for Calendar Id']);
        }
    
        return new Types.ObjectId(id.value);
    })
    public poster: Types.ObjectId;
    
    constructor(partial: Partial<DiscussionSetEditDTO>) {
        Object.assign(this, partial);
    }
}