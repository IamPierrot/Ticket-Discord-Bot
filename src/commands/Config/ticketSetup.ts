import { ActionRowBuilder, ChannelType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { SlashCommands } from "../../cmds";
import ticketModel from "../../database/models/ticketModel";

const ticketSetup = {
    lost: {
        label: "Mất đồ",
        description: "Báo cáo việc mất đồ có lý do chính đáng",
        emoji: "1260576858978914305"
    },
    bug: {
        label: "Tố cáo bug",
        description: "Phát hiện có thành phần bug",
        emoji: "1260576970832347218"
    },
    base: {
        label: "Tố cáo phá nhà",
        description: "Phát hiện thủ phạm phá nhà",
        emoji: "1260577255445495900"
    },
    hack: {
        label: "Tố cáo hack",
        description: "Phát hiện có thành phần hack",
        emoji: "1260577067758649377"
    },
    fix: {
        label: "Fix/Trade đồ",
        description: "Báo cáo có lỗi về vật phẩm",
        emoji: "1260577418679287888"
    },
    scam: {
        label: "Tố cáo scam (lừa đảo)",
        description: "Báo cáo có người lừa đảo",
        emoji: "1260577486388068432"
    },
    severerror: {
        label: "Báo cáo lỗi tính năng sever",
        description: "Có phát hiện lỗi sever",
        emoji: "1260577603035861003"
    },
    donate: {
        label: "Không nhận được xu/donate lỗi",
        description: "Lỗi nạp thẻ/donate",
        emoji: "1260577713140269086"
    },
    other: {
        label: "Vấn đề khác",
        description: "những vấn đề khác",
        emoji: "1260578145527005204"
    }
}

const categories = [
    "LOST",
    "BUG",
    "HACK",
    "BASE",
    "FIX",
    "SCAM",
    "SEVERERROR",
    "DONATE",
    "OTHER"
];

export default {
    name: "setupticket",
    description: "set up ticket channel",
    adminOnly: true,

    callback: async (client, interaction) => {
        const options: StringSelectMenuOptionBuilder[] = []
        try {
            const ticketData = await ticketModel.findOne({ guildId: interaction.guildId }) || new ticketModel({ guildId: interaction.guildId });
            for (const categoryName of categories) {
                const categoryProperty = categoryName.toLowerCase().replace(" ", "")
                const dataCategory = ticketSetup[categoryProperty as keyof typeof ticketSetup];
                const newCategory = await interaction.guild?.channels.create({
                    name: `${categoryName} TICKET`,
                    type: ChannelType.GuildCategory
                });
                const logChannel = await interaction.guild?.channels.create({
                    name: `Log ${categoryName.toLowerCase()}`,
                    type: ChannelType.GuildText,
                    parent: newCategory,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id, // Deny access to everyone in the guild
                            deny: "ViewChannel",
                        },
                        {
                            id: interaction.user.id, // Allow access only to the user
                            allow: "ViewChannel",
                        },
                        {
                            id: client.user?.id!, // Allow access only to the user
                            allow: "ViewChannel",
                        },
                    ]
                });
                ticketData.categories.push({
                    categoryName: categoryProperty,
                    categoryId: newCategory!.id,
                    logChannelId: logChannel!.id,
                    ticketChannelIds: [] // Initialize with an empty array
                });
                options.push(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(dataCategory.label)
                        .setDescription(dataCategory.description)
                        .setValue(categoryProperty)
                        .setEmoji(dataCategory.emoji)
                )
            }
            await ticketData.save();

            console.log(options);

            const ticketManager = await interaction.guild?.channels.create({
                name: "ticket-create",
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guildId!,
                        allow: "ViewChannel",
                        deny: "SendMessages"
                    },
                    {
                        id: client.user?.id!,
                        allow: ["SendMessages", "ViewChannel", "ManageChannels"]
                    }
                ]
            });
            const ticketMenu = new StringSelectMenuBuilder()
                .setCustomId('ticket')
                .setMinValues(1)
                .setMaxValues(1)
                .setPlaceholder("⟫ Tạo ticket")
                .setOptions(options)
            const embed = new EmbedBuilder()
                .setTitle("Day la 1 bang tao ticket vui ve")
            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(ticketMenu);

            await ticketManager?.send({ embeds: [embed], components: [row] });
            await interaction.editReply("Setup thành công!");
        } catch (err) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Có lỗi khi tạo channel!")
                        .setColor('Red')]
            });
            return console.log(err);
        }


    },
} as const as SlashCommands;