import { EmbedBuilder } from "discord.js";
import { SlashCommands } from "../../cmds";
import ticketResolverModel from "../../database/models/ticketResolverModel";

export = {
    name: "checkticketresolvers",
    description: "Check the list of ticket resolvers",
    adminOnly: true,

    callback: async (client, interaction) => {
        try {
            const resolvers = await ticketResolverModel.find();
            if (resolvers.length === 0) {
                return interaction.editReply("There are no ticket resolvers in the database.");
            }

            const embed = new EmbedBuilder()
                .setTitle("Danh sách người giải quyết ticket")
                .setColor("Gold")
                .setTimestamp();

            resolvers.forEach(resolver => {
                embed.addFields({
                    name: `Người giải quyết: ${resolver.label}`,
                    value: `**Ping:** <@${resolver.userId}>`,
                    inline: false
                });
            });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Error fetching ticket resolvers:", error);
            return interaction.editReply("There was an error fetching the ticket resolvers.");
        }
    }
} as const as SlashCommands;
