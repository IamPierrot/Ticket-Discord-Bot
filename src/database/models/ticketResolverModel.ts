import mongoose, { Document, Schema } from "mongoose";

interface TicketResolver {
    userId: string;
    label: string;
    emoji: string;
}

export interface ITicketResolverSchema extends Document {
    userId: string;
    label: string;
    emoji: string;
}

const ticketResolverSchema = new Schema<ITicketResolverSchema>({
    userId: { type: String, required: true },
    label: { type: String, required: true },
    emoji: { type: String, required: true }
});

const ticketResolverModel = mongoose.model<ITicketResolverSchema>("TicketResolver", ticketResolverSchema);

export default ticketResolverModel;
