import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { SlashCommands } from "../../cmds";
import ticketResolverModel from "../../database/models/ticketResolverModel";

export = {
    name: "addticketresolver",
    description: "Add a ticket resolver to the database",
    adminOnly: true,
    options: [
        {
            name: "userid",
            description: "The user ID of the ticket resolver",
            required: true,
            type: ApplicationCommandOptionType.String
        },
        {
            name: "label",
            description: "The label for the ticket resolver",
            required: true,
            type: ApplicationCommandOptionType.String
        },
        {
            name: "emoji",
            description: "The emoji for the ticket resolver",
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],

    callback: async (client, interaction) => {
        const userId = interaction.options.getString('userid');
        const label = interaction.options.getString('label');
        const emoji = interaction.options.getString('emoji');

        if (!userId || !label || !emoji) {
            return interaction.editReply("You must provide all the required fields: userId, label, and emoji.");
        }

        try {
            const newResolver = new ticketResolverModel({ userId, label, emoji });
            await newResolver.save();

            const embed = new EmbedBuilder()
                .setTitle(`Thông Báo ticket!`)
                .setDescription(`Added new ticket resolver with ID <@${userId}>, label **${label}**, and emoji ${emoji}.`)
                .setColor("Green");

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Error adding ticket resolver:", error);
            return interaction.editReply("There was an error adding the ticket resolver.");
        }
    }
} as const as SlashCommands;
