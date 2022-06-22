import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type SettingDocument = Setting & Document;

@Schema()
export class Setting {
    @Prop(Types.ObjectId)
    public id: Types.ObjectId;

    @Prop(String)
    public starter_prompt: string;

    @Prop(Types.ObjectId)
    public post_inspiration: Types.ObjectId;

    @Prop(Types.ObjectId)
    public score: Types.ObjectId;

    @Prop(Types.ObjectId)
    public calendar: Types.ObjectId;
    
    constructor(partial: Partial<Setting>) {
        Object.assign(this, partial);
    }
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
