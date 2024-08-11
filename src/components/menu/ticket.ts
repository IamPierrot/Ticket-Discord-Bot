import { ActionRowBuilder, CategoryChannel, ChannelType, EmbedBuilder, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";
import { StringSelectMenuComponent } from "../../component";
import userTicketModel from "../../database/models/userTicket";
import ticketModel from "../../database/models/ticketModel";
import { sendTicketInformation } from "../../utils/functions";

export default {
    name: "ticket",
    type: "hasmodal",

    callback: async (client, interaction, values) => {
        const modal = new ModalBuilder()
            .setCustomId('ticket')
            .setTitle("Phiếu tạo ticket");

        const value = values[0];

        if (await userTicketModel.findOne({ userId: interaction.user.id, categoryName: value })) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Tạo ticket mới thất bại!")
                    .setDescription("Bạn đã tạo 1 ticket rồi!")
                    .setColor("Red")
            ],
            ephemeral: true
        }).then(msg => setTimeout(() => msg.delete(), 20000));

        const ingameInput = new TextInputBuilder()
            .setCustomId('ingame')
            .setRequired(true)
            .setPlaceholder('VD: Hauluu_nek, haumilkso1vn,...')
            .setLabel("Tên game của bạn?")
            .setStyle(TextInputStyle.Short);

        const gadgetInput = new TextInputBuilder()
            .setCustomId('gadget')
            .setLabel('Bạn đang dùng thiết bị gì?')
            .setPlaceholder('VD: PC, mobile, điện thoại, PS5,...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const reasonInput = new TextInputBuilder()
            .setCustomId('reason')
            .setRequired(true)
            .setPlaceholder("VD: Bug, hỗ trợ nạp, có con chó đang bay,...")
            .setLabel("Mô tả chi tiết vấn đề của bạn?")
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(ingameInput);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(gadgetInput);
        const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput)

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        await interaction.showModal(modal);
        
        const collected = await interaction.awaitModalSubmit({
            filter: i => i.user.id == interaction.user.id,
            time: 60000
        })
        if (!collected) return await interaction.deferUpdate();

        const ingame = collected.fields.getTextInputValue('ingame');
        const gadget = collected.fields.getTextInputValue('gadget');
        const reason = collected.fields.getTextInputValue('reason');
        if (!ingame || !reason || !gadget) return;

        const ticketData = await ticketModel.findOne({ guildId: collected.guildId });
        const userTicketData = await userTicketModel.findOne({ userId: collected.user.id, categoryName: value }) || new userTicketModel({ userId: collected.user.id, categoryName: value });

        await userTicketData.save();
        if (!ticketData || !userTicketData) return await collected.editReply("Đã có lỗi vui lòng thông báo cho admin");
        // Lấy channel bằng id trong db
        const category = ticketData.categories.find(c => c.categoryName === userTicketData.categoryName)!;
        const categoryChannel = collected.guild?.channels.cache.find(c => c.id === category?.categoryId && c.type === ChannelType.GuildCategory) as CategoryChannel;
        const logChannel = collected.guild?.channels.cache.find(c => c.id === category.logChannelId && c.type === ChannelType.GuildText) as TextChannel;

        try {
            const newTicketChannel = await collected.guild?.channels.create({
                name: `ticket-#${category?.ticketChannelIds.length + 1}`,
                type: ChannelType.GuildText,
                parent: categoryChannel,
                permissionOverwrites: [
                    {
                        id: collected.guild.id, // Den access to everyone in the guild
                        deny: "ViewChannel",
                    },
                    {
                        id: collected.user.id, // Allow access only to the user
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
                .setTitle(`${collected.user.tag} đã tạo ticket mới`)
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
                sendTicketInformation(client, collected, newTicketChannel, logChannel),
                logChannel.send({ embeds: [logEmbed] })
            ]);

        } catch (error) {
            await collected.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Có lỗi khi tạo channel!")
                        .setColor('Red')]
            });
            return console.log(error);
        }
        

    },
} as const as StringSelectMenuComponent;