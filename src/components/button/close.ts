import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ComponentType } from "discord.js";
import { ButtonStandardComponent } from "../../component";
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
    type: "global",

    callback: async (client, interaction) => {

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

        await interaction.editReply({ embeds: [pickResolveEmbed], components: [rowMenu] });
    },

} as const as ButtonStandardComponent;


