import { GuildMember, Role, TextChannel } from "discord.js";
import { PrefixCommands } from "../../cmds";
import ticketModel from "../../database/models/ticketModel";

export default {
    name: "addticket",
    description: "cho người dùng có quyền xem ticket",
    aliases: ["add"],
    adminOnly: true,

    callback: async (client, message, args) => {
        const ticketData = await ticketModel.findOne({ guildId: message.guildId });
        if (!ticketData) return;

        const channelTicket = message.guild?.channels.cache.get(message.channelId) as TextChannel;
        if (!channelTicket || !ticketData.categories.find(c => c.categoryId === channelTicket.parentId)) return message.reply("Chỉ được sử dụng trong channel ticket!");

        const id = args[0];
        const member = message.guild?.members.cache.get(id) as GuildMember;
        const role = message.guild?.roles.cache.get(id) as Role;

        if (!member && !role) return message.reply("Không tìm thấy thành viên hoặc vai trò!");

        try {
            if (member) {
                const currentPermissions = channelTicket.permissionsFor(member);

                if (!currentPermissions || !currentPermissions.has("ViewChannel")) {
                    await channelTicket.permissionOverwrites.edit(member, { ViewChannel: true });
                    await message.reply(`Đã thêm quyền xem cho thành viên ${member.toString()} trong kênh này!`);
                } else {
                    await message.reply(`Thành viên ${member.toString()} đã có quyền xem trong kênh này.`);
                }
            } else if (role) {
                const currentPermissions = channelTicket.permissionsFor(role);

                if (!currentPermissions || !currentPermissions.has("ViewChannel")) {
                    await channelTicket.permissionOverwrites.edit(role, { ViewChannel: true });
                    await message.reply(`Đã thêm quyền xem cho vai trò ${role.toString()} trong kênh này!`);
                } else {
                    await message.reply(`Vai trò ${role.toString()} đã có quyền xem trong kênh này.`);
                }
            }
        } catch (error) {
            console.error("Lỗi khi thêm quyền xem: ", error);
            await message.reply("Đã xảy ra lỗi khi thêm quyền xem cho thành viên hoặc vai trò này.");
        }
    },
} as const as PrefixCommands;