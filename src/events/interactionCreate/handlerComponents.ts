import { Interaction } from "discord.js";
import { EmbedBuilder } from 'discord.js';
import { LoliBotClient } from "../../utils/clients";

export = async (client: LoliBotClient, interaction: Interaction) => {
     try {
          if (!interaction.isMessageComponent()) return;

          if (interaction.isButton()) {
               const customId = interaction.customId;
               console.log("hello?");
               // Check if it's a normal button
               const normalButton = client.components.buttons.find((cpt) => cpt.name === customId);
               if (normalButton) {
                    const user = client.userComponent.get(interaction.user.id);
                    // if (!user) return;

                    await interaction.deferReply({ ephemeral: true });

                    // if (!client.userComponent.has(interaction.user.id) || !(user?.custom_id == customId) || interaction.user.id == user?.msg.author.id) {
                    //      const unauthorizedMessage = new EmbedBuilder()
                    //           .setAuthor({ name: "Cái nút này không phải dành cho bạn!" })
                    //           .setColor('Red');
                    //      await interaction.editReply({ embeds: [unauthorizedMessage] });
                    //      setTimeout(() => interaction.deleteReply(), 40000);
                    // }

                    await normalButton.callback(client, interaction, customId, user?.msg);
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
                         menu.type !== "hasmodal" && await interaction.deferReply({ ephemeral: true });
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
