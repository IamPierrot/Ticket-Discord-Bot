import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { StringSelectMenuComponent } from "../../component";

export default {
    name: "ticket",
    type: "hasmodal",

    callback: async (client, interaction, values) => {
        const modal = new ModalBuilder()
            .setCustomId('ticket')
            .setTitle("Phiếu tạo ticket");

        const value = values[0];
        client.ticketModals.set(interaction.user.id, value);

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