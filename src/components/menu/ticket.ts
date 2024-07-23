import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { StringSelectMenuComponent } from "../../component";
import userTicketModel from "../../database/models/userTicket";

export default {
    name: "ticket",
    type: "hasmodal",

    callback: async (client, interaction, values) => {
        if (await userTicketModel.findOne({ userId: interaction.user.id })) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Tạo ticket mới thất bại!")
                    .setDescription("Bạn đã tạo 1 ticket rồi!")
                    .setColor("Red")
            ],
            ephemeral: true
        }).then(msg => setTimeout(() => msg.delete(), 20000));

        const modal = new ModalBuilder()
            .setCustomId('ticket')
            .setTitle("Phiếu tạo ticket");

        const value = values[0];
        client.categoryName.set(interaction.user.id, value);

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
    },
} as const as StringSelectMenuComponent;