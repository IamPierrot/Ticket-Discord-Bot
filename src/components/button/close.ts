import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ComponentType } from "discord.js";
import { ButtonStandardComponent } from "../../component";
import ticketModel from "../../database/models/ticketModel";
import ticketResolveModel from "../../database/models/ticketResolveModel";

export default {
    name: "close",

    callback: async (client, interaction, customId, message) => {
        const menuPickResolve = new StringSelectMenuBuilder()
            .setCustomId("pick")
            .setMinValues(1)
            .setMaxValues(3)
            .setPlaceholder("⟩ Chọn người giải quyết ticket.")
            .setOptions([
                new StringSelectMenuOptionBuilder()
                    .setValue("id ca")
                    .setLabel("Hàu Péo")
                    .setEmoji("🥛"),
                new StringSelectMenuOptionBuilder()
                    .setValue("id hau")
                    .setLabel("Hàu Péo")
                    .setEmoji("🥛"),
                new StringSelectMenuOptionBuilder()
                    .setValue("id vet")
                    .setLabel("Hàu Péo")
                    .setEmoji("🥛"),
            ]);

        const rowMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menuPickResolve);

        const pickResolveEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL()! })
            .setTitle("Chọn người giải quyết ticket!")

        const msg = await message?.edit({ embeds: [pickResolveEmbed], components: [rowMenu] });

        const menuCollector = msg?.createMessageComponentCollector({
            componentType: ComponentType.StringSelect
        });

        menuCollector?.on('collect', async menuInteraction => {
            const ticketData = await ticketModel.findOne({ guildId: menuInteraction.guildId });
            if (!ticketData) throw new Error("có lỗi trong pick menu");

            for (const userId of menuInteraction.values) {
                const ticketResolveData = await ticketResolveModel.findOne({ userId: userId }) || new ticketResolveModel({ guildId: menuInteraction.guildId, userId: userId });

                ticketResolveData.ticketResolved.push({
                    from: interaction.user.id,
                    type: client.ticketModals.get(interaction.user.id) || "unknown",
                    at: new Date().toISOString()
                })
            }

            await msg?.edit({ content: "Cảm ơn bạn! Chúc bạn 1 ngày tốt lành", embeds: [], components: [] });

            client.ticketModals.delete(interaction.user.id);
        });
    },

} as const as ButtonStandardComponent;