import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { StringSelectMenuComponent } from "../../component";
import ticketModel from "../../database/models/ticketModel";
import ticketResolveModel from "../../database/models/ticketResolveModel";
import userTicketModel from "../../database/models/userTicket";
import ticketResolverModel from "../../database/models/ticketResolverModel";

export default {
    name: "pick",

    callback: async (client, interaction, values) => {
        const userTicketData = await userTicketModel.findOne({ ticketChannelId: interaction.channelId });
        const ticketResolverData = await ticketResolverModel.find();
        if (!userTicketData || ticketResolverData.length <= 0) return;

        if (!ticketResolverData.some(v => v.userId === interaction.user.id)) return await interaction.editReply("Bạn không có quyền dùng thứ này!");

        const userCreate = client.users.cache.find(u => u.id === userTicketData.userId);

        const ticketData = await ticketModel.findOne({ guildId: interaction.guildId });
        if (!ticketData) throw new Error("có lỗi trong pick menu");
        const category = ticketData.categories.find(c => c.ticketChannelIds.includes(interaction.channelId));
        const logChannel = interaction.guild?.channels.cache.find(c => c.id === category?.logChannelId)

        await interaction.editReply("Đang thực hiện sao lưu ticket!");
        for (const userId of values) {
            const ticketResolveData = await ticketResolveModel.findOne({ userId: userId }) || new ticketResolveModel({ userId: userId });

            ticketResolveData.ticketResolved.push({
                from: userCreate?.id!,
                type: userTicketData.categoryName || "unknown",
                at: new Date().toISOString()
            })
            await ticketResolveData.save();
        }

        const openButton = new ButtonBuilder()
            .setCustomId('open')
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Mở lại Ticket")
            .setEmoji('📭')
        const closeTicket = new ButtonBuilder()
            .setCustomId("closeticket")
            .setStyle(ButtonStyle.Danger)
            .setLabel("Xoá ticket")
            .setEmoji('🛑')

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(openButton, closeTicket);
        const embed = new EmbedBuilder()
            .setTitle("Trước khi bạn rời đi!")
            .setDescription("Ticket sẽ được lưu lại ở đây, hoặc xoá hoàn toànn\n bạn có thể mở lại ticket bất kì lúc nào!")
            .setColor('Red')
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: "Thông báo đóng ticket", iconURL: client.user?.avatarURL()! })
            .setTitle(`${interaction.user.tag} đã đóng ticket-${category?.ticketChannelIds.length || 0 + 1}`)
            .addFields([
                {
                    name: "Loại Ticket",
                    value: category?.categoryName || "unknow",
                    inline: true
                },
                {
                    name: "Thời gian đóng ticket",
                    value: `Ngày: ${new Date().toLocaleDateString('vi')}\nTại: ${new Date().toLocaleTimeString('vi')}`,
                    inline: true
                }
            ])
            .setTimestamp();

        logChannel?.isTextBased() && await logChannel?.send({ embeds: [logEmbed] })

        await interaction.message.edit({ embeds: [embed], components: [row] });

    },
} as const as StringSelectMenuComponent;