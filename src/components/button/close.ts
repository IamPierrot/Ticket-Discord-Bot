import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ComponentType } from "discord.js";
import { ButtonStandardComponent } from "../../component";
import ticketModel from "../../database/models/ticketModel";
import ticketResolveModel from "../../database/models/ticketResolveModel";
import ticketResolverModel from "../../database/models/ticketResolverModel";

const generateMenuOptions = async () => {
    const resolvers = await ticketResolverModel.find();
    return resolvers.map(resolver => new StringSelectMenuOptionBuilder()
        .setValue(resolver.userId)
        .setLabel(resolver.label)
        .setEmoji(resolver.emoji));
};

export default {
    name: "close",
    type: "standard",

    callback: async (client, interaction, customId, message) => {
        
        const userCreate = client.users.cache.find(u => u.id === client.ticketModals.get(interaction.channelId)!);
        
        const menuPickResolve = new StringSelectMenuBuilder()
            .setCustomId("pick")
            .setMinValues(1)
            .setMaxValues(3)
            .setPlaceholder("⟩ Chọn người giải quyết ticket.")
            .setOptions(await generateMenuOptions());

        const rowMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menuPickResolve);

        const pickResolveEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL()! })
            .setTitle("Chọn người giải quyết ticket!")

        const msg = await message?.edit({ embeds: [pickResolveEmbed], components: [rowMenu] });

        const menuCollector = msg?.createMessageComponentCollector({
            componentType: ComponentType.StringSelect
        });

        menuCollector?.on('collect', async menuInteraction => {
            const ticketData = await ticketModel.findOne({ guildId: interaction.guildId });
            if (!ticketData) throw new Error("có lỗi trong pick menu");

            for (const userId of menuInteraction.values) {
                const ticketResolveData = await ticketResolveModel.findOne({ userId: userId }) || new ticketResolveModel({ userId: userId });

                ticketResolveData.ticketResolved.push({
                    from: userCreate?.id!,
                    type: client.ticketModals.get(userCreate?.id!) || "unknown",
                    at: new Date().toISOString()
                })
                await ticketResolveData.save();
            }
            
            await msg?.edit("Cảm ơn bạn! Chúc bạn 1 ngày tốt lành");

            await interaction.editReply("Thực hiện sao lưu ticket!");

            client.ticketModals.delete(interaction.channelId);
            client.ticketModals.delete(userCreate?.id!);
            
            setTimeout(async () => interaction.channel?.delete(), 2 * 60 * 1000);
        });
    },

} as const as ButtonStandardComponent;


