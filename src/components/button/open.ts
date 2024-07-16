import { ButtonStandardComponent } from "../../component";
import ticketResolverModel from "../../database/models/ticketResolverModel";

export default {
    name: "open",
    callback: async (client, interaction) => {
        const ticketResolverData = await ticketResolverModel.find();
        if (!ticketResolverData) return;

        await interaction.editReply({ content: `Dậy đê các con giời ${ticketResolverData.map(v => `<@${v.userId}>`).join(" ")}` })
    },
} as const as ButtonStandardComponent; 