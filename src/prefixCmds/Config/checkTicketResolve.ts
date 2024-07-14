import { EmbedBuilder } from "discord.js";
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

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Thông tin người giải quyết ticket", iconURL: member.user.displayAvatarURL() })
            .setTitle(`Thông tin giải quyết ticket của ${member.user.tag}`)
            .setColor('Gold')
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(ticketResolveData.ticketResolved.map(ticket => {
                return { name: 'Ticket:', value: `**Từ:** ${ticket.from}\n**Loại:** ${ticket.type}\n**Lúc:** ${ticket.at}`, inline: false }
            }))
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
} as const as PrefixCommands;
