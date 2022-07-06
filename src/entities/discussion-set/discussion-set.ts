import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type DiscussionSetDocument = DiscussionSet & Document;

@Schema()
export class DiscussionSet {
    @Prop(String)
    public insoCode: string;

    @Prop(String)
    public name: string;

    @Prop({ Date, default: new Date()})
    public created: Date;

    @Prop({ Date, default: null })
    public archived: Date;

    @Prop([Types.ObjectId])
    public facilitators: Types.ObjectId [];

    @Prop(String)
    public poster: string;
    
    constructor(partial: Partial<DiscussionSet>) {
        Object.assign(this, partial);
    }
}

export const DiscussionSetSchema = SchemaFactory.createForClass(DiscussionSet);

