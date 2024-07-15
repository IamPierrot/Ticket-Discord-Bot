import mongoose, { Document, Schema } from "mongoose";

export interface TicketResolved {
    from: string;
    type: string;
    at: String;
}

export interface TicketResolveModel extends Document {
    userId: string;
    ticketResolved: TicketResolved[];
}

const ticketResolvedSchema = new Schema<TicketResolved>({
    from: { type: String, required: true },
    type: { type: String, required: true },
    at: { type: String, required: true }
}, { _id: false });

const ticketResolverSchema = new Schema<TicketResolveModel>({
    userId: { type: String, required: true },
    ticketResolved: { type: [ticketResolvedSchema], default: [] }
});

const ticketResolveModel = mongoose.model<TicketResolveModel>("TicketResolve", ticketResolverSchema);

export default ticketResolveModel;
