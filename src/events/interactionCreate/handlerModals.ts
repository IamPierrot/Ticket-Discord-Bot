import { Interaction } from "discord.js";
import { LoliBotClient } from "../../utils/clients";

export = async (client: LoliBotClient, interaction: Interaction) => {
    if (!interaction.isModalSubmit()) return;

    const modalObject = client.components.modals.find(value => value.name === interaction.customId);
    if (!modalObject) return;

    try {
        await interaction.deferReply();
        await modalObject.callback(client, interaction);
    } catch (error) {
        console.log('there was an error modals: ', error);
    }
}