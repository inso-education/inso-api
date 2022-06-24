import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type DiscussionPostDocument = DiscussionPost & Document;

@Schema()
export class DiscussionPost {
    @Prop(Types.ObjectId)
    public id: Types.ObjectId;

    @Prop(Types.ObjectId)
    public userId: Types.ObjectId;

    @Prop(Types.ObjectId)
    public discussionId: Types.ObjectId;

    @Prop(Boolean)
    public draft: boolean;

    @Prop(Date)
    public date: Date;

    @Prop(String)
    public tags: string [];

    @Prop(Types.ObjectId)
    public comment_for: Types.ObjectId;

    @Prop(String)
    public post: string;

    constructor(partial: Partial<DiscussionPost>) {
        Object.assign(this, partial);
    }
}

export const DiscussionPostSchema = SchemaFactory.createForClass(DiscussionPost);
