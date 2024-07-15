import { EmbedBuilder, ReactionCollector } from "discord.js";
import { PrefixCommands } from "../../cmds";
import ticketResolveModel from "../../database/models/ticketResolveModel";

export default {
    name: "check",
    description: "Kiểm tra thông tin giải quyết ticket của người dùng",
    aliases: ["c"],
    adminOnly: true,

    callback: async (client, message, args) => {
        const userId = message.mentions.members?.first()?.id || args[0];

        const ticketResolveData = await ticketResolveModel.findOne({ userId: userId });
        if (!ticketResolveData) return await message.reply("Không có dữ liệu người dùng này?");

        const member = message.guild?.members.cache.find(m => m.user.id === ticketResolveData.userId);
        if (!member) return await message.reply("Không tìm thấy thành viên!");

        const itemsPerPage = 10;
        const totalPages = Math.ceil(ticketResolveData.ticketResolved.length / itemsPerPage);

        const generateEmbed = (page: number) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;

            const embed = new EmbedBuilder()
                .setAuthor({ name: "Thông tin người giải quyết ticket", iconURL: member.user.displayAvatarURL() })
                .setTitle(`Thông tin giải quyết ticket của ${member.user.tag}`)
                .setColor('Gold')
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(ticketResolveData.ticketResolved.slice(start, end).map(ticket => {
                    return { name: 'Ticket:', value: `**Từ:** <@${ticket.from}>\n**Loại:** ${ticket.type}\n**Lúc:** ${ticket.at}`, inline: false };
                }))
                .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
                .setTimestamp();

            return embed;
        };

        let currentPage = 0;
        const embedMessage = await message.reply({ embeds: [generateEmbed(currentPage)] });

        if (totalPages > 1) {
            await embedMessage.react('⬅️');
            await embedMessage.react('➡️');

            const collector = embedMessage.createReactionCollector({
                filter: (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name!) && !user.bot && user.id === message.author.id,
                time: 60000
            });

            collector.on('collect', (reaction, user) => {
                reaction.users.remove(user);

                if (reaction.emoji.name === '⬅️') {
                    if (currentPage > 0) currentPage--;
                } else if (reaction.emoji.name === '➡️') {
                    if (currentPage < totalPages - 1) currentPage++;
                }

                embedMessage.edit({ embeds: [generateEmbed(currentPage)] });
            });

            collector.on('end', () => {
                embedMessage.reactions.removeAll().catch(error => console.error('Failed to clear reactions:', error));
            });
        }
    },
} as const as PrefixCommands;
