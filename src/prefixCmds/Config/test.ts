import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { PrefixCommands } from "../../cmds";

export default {
    name: "test",
    
    callback: async (client, message, args) => {

        const buttonCloseTicket = new ButtonBuilder()
            .setCustomId('test')
            .setLabel("Đóng ticket")
            .setStyle(ButtonStyle.Primary);

        const rowMenu = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonCloseTicket);
        await message.reply({components: [rowMenu], content: "concac"});
    },
} as const as PrefixCommands;