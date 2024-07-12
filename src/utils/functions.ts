import path from "path";
import fs from 'fs';
// import { pathToFileURL } from "url";
import chalk from "chalk";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Interaction, ModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel } from "discord.js";
import { LoliBotClient } from "./clients";
import ticketModel from "../database/models/ticketModel";
import ticketResolveModel from "../database/models/ticketResolveModel";

export function getAllFiles(directory: string, foldersOnly: boolean = false): string[] {
     const fileNames: string[] = [];
     try {
          const files = fs.readdirSync(directory, { withFileTypes: true });
          for (const file of files) {
               const filePath = path.join(directory, file.name);

               if (foldersOnly) {
                    if (file.isDirectory()) {
                         fileNames.push(filePath);
                    }
               } else {
                    if (file.isFile()) {
                         fileNames.push(filePath);
                    }
               }
          }

     } catch (error) {
          console.log(`There was an error in ${directory} : ${error}`);
     }

     return fileNames;
}
export const dynamicImportModule = async (filePath: string) => {
     try {
          // const fileUrl = pathToFileURL(path.resolve(filePath)).href;
          const module = await import(filePath);
          // Check for ES6 default export
          return module.default || module;
     } catch (error) {
          console.log(chalk.red.bold(`Error importing module ${filePath}:`, error));
     }
}

export const sendTicketInformation = async (client: LoliBotClient, interaction: ModalSubmitInteraction, channel: TextChannel, logChannel: TextChannel) => {
     const ingame = interaction.fields.getTextInputValue('ingame');
     const gadget = interaction.fields.getTextInputValue('gadget');
     const reason = interaction.fields.getTextInputValue('reason');

     const successImg = new AttachmentBuilder(path.join(__dirname, "..", "assets", "copyright-success.png"));
     const successEmbed = new EmbedBuilder()
          .setTitle("Đã tạo ticket!")
          .setDescription(`Bạn đã yêu cầu 1 ticket tại ${channel?.toString()}`)
          .setImage("attachment://copyright-success.png")
          .setFooter({ text: "Tình yêu là sức mạnh~", iconURL: client.user?.avatarURL()! });

     const toTicket = new EmbedBuilder()
          .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL()! })
          .addFields([
               {
                    name: "Tên ingame",
                    value: `\`\`\`\n${ingame}\`\`\``,
                    inline: true
               },
               {
                    name: "Loại Máy sử dụng",
                    value: `\`\`\`\n${gadget}\`\`\``,
                    inline: true
               },
               {
                    name: "Lý do",
                    value: `\`\`\`\n${reason}\`\`\``,
                    inline: false
               }
          ])
          .setTimestamp()
          .setFooter({ text: "Yêu cầu sẽ được xem xét trong vài phút ", iconURL: client.user?.avatarURL()! });

     await Promise.all([
          interaction.editReply({ embeds: [successEmbed], files: [successImg] }),
          channel?.send({ embeds: [toTicket] }),
          logChannel.send({ embeds: [successEmbed], files: [successImg] })
     ])

     const buttonCloseTicket = new ButtonBuilder()
          .setCustomId('close')
          .setLabel("Đóng ticket")
          .setStyle(ButtonStyle.Success)
          .setDisabled();

     const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonCloseTicket);

     setTimeout(async () => {

          const msg = await channel?.send({ content: "Có thế đóng ticket được chưa:c", components: [row] });
          const collector = msg?.createMessageComponentCollector({
               componentType: ComponentType.StringSelect
          });

          collector?.on("collect", async i => {
               if (i.customId == "close") {
                    
                    // Add id người giải quyết ở đây!
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

                    const message = await msg?.edit({ embeds: [pickResolveEmbed], components: [rowMenu] });

                    const menuCollector = message.createMessageComponentCollector({
                         componentType: ComponentType.StringSelect
                    });

                    menuCollector.on('collect', async menuInteraction => {
                         const ticketData = await ticketModel.findOne({ guildId: menuInteraction.guildId });
                         if (!ticketData) throw new Error("có lỗi trong pick menu");

                         for (const userId of menuInteraction.values) {
                              const ticketResolveData = await ticketResolveModel.findOne({ userId: userId }) || new ticketResolveModel({ guildId: menuInteraction.guildId, userId: userId });

                              ticketResolveData.ticketResolved.push({
                                   from: interaction.user.id,
                                   type: "",
                                   at: new Date().toISOString()
                              })
                         }

                         await message.edit({ content: "Cảm ơn bạn! Chúc bạn 1 ngày tốt lành", embeds: [], components: [] });

                         client.ticketModals.delete(interaction.user.id);
                         setTimeout(async () => {
                              channel.delete();
                         }, 2 * 60 * 1000)
                    });

               }
          })
     }, 2 * 60 * 1000)
}