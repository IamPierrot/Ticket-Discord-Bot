import { ButtonStandardComponent } from "../../component";

export default {
    name: "closeticket",

    callback: async (client, interaction) => {
        const userCreate = client.users.cache.find(u => u.id === client.ticketModals.get(interaction.channelId)!);
        if (!userCreate) return;
        await interaction.editReply("Tiến hành xoá ticket trong vài giây nữa~");

        client.ticketModals.delete(interaction.channelId);
        client.ticketModals.delete(userCreate.id)

        setTimeout(async () => {
            interaction.channel?.delete();
        }, 10000)
    },
} as const as ButtonStandardComponent;