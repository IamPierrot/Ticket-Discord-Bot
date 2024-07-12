import mongoose from "mongoose"

export interface TicketResolveModel {
    guildId: string
    userId: string
    ticketResolved: {
        from: string
        type: string
        at: string
    }[]
}

const ticketResolverSchema = new mongoose.Schema<TicketResolveModel & mongoose.Document>({
    guildId: String,
    userId: String,
    ticketResolved: [{
        from: String,
        type: String,
        at: String
    }]
})

const ticketResolveModel = mongoose.model("ticket-solver", ticketResolverSchema);

export default ticketResolveModel;