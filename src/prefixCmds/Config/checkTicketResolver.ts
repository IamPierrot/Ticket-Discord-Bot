import { EmbedBuilder } from "discord.js";
import { PrefixCommands } from "../../cmds";
import ticketResolverModel from "../../database/models/ticketResolverModel";

export default {
    name: "checkresolver",
    callback: async (client, message, args) => {
        try {
            const resolvers = await ticketResolverModel.find();
            if (resolvers.length === 0) {
                return message.reply("There are no ticket resolvers in the database.");
            }

            const embed = new EmbedBuilder()
                .setTitle("Danh sách người giải quyết ticket")
                .setColor("Gold")
                .addFields(resolvers.map(resolver => {
                    return {
                        name: `Người giải quyết: ${resolver.label}`,
                        value: `**Ping:** <@${resolver.userId}>`,
                        inline: false
                    }
                }))
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error fetching ticket resolvers:", error);
            return message.reply("There was an error fetching the ticket resolvers.");
        }
    },
} as const as PrefixCommands;