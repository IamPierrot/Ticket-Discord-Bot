import { Document, model, Schema } from "mongoose";

interface IUserTicketSchema {
    userId: string
    ticketChannelId: string
    logChannelId: string
    categoryId: string
    categoryName: string
}

const userTicketSchema = new Schema<IUserTicketSchema & Document>({
    userId: { type: String, required: true },
    ticketChannelId: { type: String, default: "" },
    logChannelId: { type: String, default: "" },
    categoryId: { type: String, default: "" },
    categoryName: { type: String, default: "" }
});

const userTicketModel = model<IUserTicketSchema & Document>("userticket", userTicketSchema);

export default userTicketModel;