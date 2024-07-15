import mongoose, { Document, Schema } from 'mongoose';

interface Category {
    categoryName: string;
    categoryId: string;
    logChannelId: string;
    ticketChannelIds: string[];
}

export interface ITicketSchema extends Document {
    guildId: string;
    categories: Category[];
}

const categorySchema = new Schema<Category>({
    categoryName: { type: String, required: true },
    categoryId: { type: String, required: true },
    logChannelId: { type: String, required: true },
    ticketChannelIds: { type: [String], default: [] }
}, { _id: false });

const ticketSchema = new Schema<ITicketSchema>({
    guildId: { type: String, required: true },
    categories: { type: [categorySchema], default: [] }
});

const ticketModel = mongoose.model<ITicketSchema>('Ticket', ticketSchema);

export default ticketModel;
