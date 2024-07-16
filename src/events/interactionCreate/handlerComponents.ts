import { Interaction } from "discord.js";
import { EmbedBuilder } from 'discord.js';
import { LoliBotClient } from "../../utils/clients";

export = async (client: LoliBotClient, interaction: Interaction) => {
     try {
          if (!interaction.isMessageComponent()) return;

          const customId = interaction.customId;
          if (interaction.isButton()) {
               const button = client.components.buttons.find((cpt) => cpt.name === customId);
               if (button) {

                    await interaction.deferReply();

                    // if (button.type !== "global" && interaction.message.author.id !== interaction.user.id) {
                    //      const unauthorizedMessage = new EmbedBuilder()
                    //           .setAuthor({ name: "Cái nút này không phải dành cho bạn!" })
                    //           .setColor('Red');
                    //      await interaction.editReply({ embeds: [unauthorizedMessage] });
                    //      setTimeout(() => interaction.deleteReply(), 40000);
                    // }

                    await button.callback(client, interaction);
               }

               if (!interaction.replied && !interaction.deferred) {
                    await interaction.deferUpdate();
               }
          }


          if (interaction.isStringSelectMenu()) {
               const menuName = interaction.customId;
               const values = interaction.values;

               if (menuName) {
                    const menu = client.components.menus.find((m) => m.name === menuName);
                    if (menu) {
                         menu.type !== "hasmodal" && await interaction.deferReply();
                         await menu.callback(client, interaction, values);
                    }
               }

               // Only call deferUpdate if there has been no reply or deferral
               if (!interaction.replied && !interaction.deferred) {
                    await interaction.deferUpdate();
               }
          }

     } catch (error) {
          console.log(`There was an Error when running handle Components: ${error}`);
     }
};
