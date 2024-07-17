import { CategoryChannel, ChannelType, EmbedBuilder, ModalSubmitInteraction, TextChannel } from "discord.js";
import { ModalComponent } from "../../component";
import { LoliBotClient } from "../../utils/clients";
import ticketModel from "../../database/models/ticketModel";
import { sendTicketInformation } from "../../utils/functions";
import userTicketModel from "../../database/models/userTicket";

export default {
    name: "ticket",
    callback: async (client, interaction) => {
        const ticketData = await ticketModel.findOne({ guildId: interaction.guildId });
        const userTicketData = await userTicketModel.findOne({ userId: interaction.user.id });
        if (!ticketData || !userTicketData) return await interaction.editReply("Đã có lỗi vui lòng thông báo cho admin");
        // Lấy channel bằng id trong db
        const category = ticketData.categories.find(c => c.categoryName === userTicketData.categoryName)!;
        const categoryChannel = interaction.guild?.channels.cache.find(c => c.id === category?.categoryId && c.type === ChannelType.GuildCategory) as CategoryChannel;
        const logChannel = interaction.guild?.channels.cache.find(c => c.id === category.logChannelId && c.type === ChannelType.GuildText) as TextChannel;

        try {
            const newTicketChannel = await interaction.guild?.channels.create({
                name: `ticket-#${category?.ticketChannelIds.length + 1}`,
                type: ChannelType.GuildText,
                parent: categoryChannel,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // Den access to everyone in the guild
                        deny: "ViewChannel",
                    },
                    {
                        id: interaction.user.id, // Allow access only to the user
                        allow: "ViewChannel",
                    },
                    {
                        id: client.user?.id!, // Allow access only to the user
                        allow: "ViewChannel",
                    },
                ]
            })
            if (!newTicketChannel) throw new Error();
            category.ticketChannelIds.push(newTicketChannel.id);
            
            userTicketData.ticketChannelId = newTicketChannel.id;
            userTicketData.logChannelId = logChannel.id;
            userTicketData.categoryId = category.categoryId;

            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: "Thông báo tạo ticket", iconURL: client.user?.avatarURL()! })
                .setTitle(`${interaction.user.tag} đã tạo ticket mới`)
                .addFields([
                    {
                        name: "Loại Ticket",
                        value: category.categoryName,
                        inline: true
                    },
                    {
                        name: "Thời gian tạo ticket",
                        value: `Ngày: ${new Date().toLocaleDateString('vi')}\nTại: ${new Date().toLocaleTimeString('vi')}`,
                        inline: true
                    }
                ])
                .setTimestamp();

            await Promise.all([
                ticketData.save(),
                userTicketData.save(),
                sendTicketInformation(client, interaction, newTicketChannel, logChannel),
                logChannel.send({ embeds: [logEmbed] })
            ]);

        } catch (error) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Có lỗi khi tạo channel!")
                        .setColor('Red')]
            });
            return console.log(error);
        }

    },

} as const as ModalComponent;