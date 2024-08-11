import { ButtonStandardComponent } from "../../component";
import userTicketModel from "../../database/models/userTicket";

export default {
    name: "closeticket",

    callback: async (client, interaction) => {
        const userTicketData = await userTicketModel.findOne({ ticketChannelId: interaction.channelId});
        if (!userTicketData) return interaction.editReply("Có lỗi khi đóng hẵn ticket!");
        
        const userCreate = client.users.cache.get(userTicketData.userId);
        
        if (!userCreate) return;
        await interaction.editReply("Tiến hành xoá ticket trong vài giây nữa~");
        await userTicketData.deleteOne();

        setTimeout(async () => {
            interaction.channel?.delete();
        }, 10000)
    },
} as const as ButtonStandardComponent;