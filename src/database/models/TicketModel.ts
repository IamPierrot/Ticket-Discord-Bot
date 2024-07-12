import mongoose, { Document } from 'mongoose';

interface ITicketSchema {
    categories: [
        {
            categoryName: string
            categoryId: string
            logChannelId: string
            ticketChannelIds: string[]
        }
    ]
    guildId: string
}


const ticketSchema = new mongoose.Schema<ITicketSchema & Document>({
    guildId: { type: String, required: true },
    categories: [
        {
            categoryName: { type: String, required: true },
            categoryId: { type: String, required: true },
            logChannelId: { type: String, required: true },
            ticketChannelIds: [{ type: String }]
        }
    ]
})
const ticketModel = mongoose.model('ticket', ticketSchema);

export default ticketModel;