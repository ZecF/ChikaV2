const util = require("node:util");

module.exports = (bot) => {
    bot.use(async (ctx, next) => {
        const isGroup = ctx.isGroup();
        const isPrivate = ctx.isPrivate();

        const senderJid = ctx.sender.jid;
        const senderId = ctx.getId(senderJid);
        const senderName = ctx.sender.pushName;
        const groupId = isGroup ? ctx.getId(ctx.id) : null;
        const groupName = (await ctx.group()).name;
        const isOwner = ctx.sender.isOwner();

        const botDb = ctx.db.bot;
        const senderDb = ctx.db.user;

        if (botDb.mode === "premium" && !isOwner && !senderDb.premium) return;
        if (botDb.mode === "group" && isPrivate && !isOwner && !senderDb.premium) return;
        if (botDb.mode === "private" && isGroup && !isOwner && !senderDb.premium) return;
        if (botDb.mode === "self" && !isOwner) return;

        if (isGroup) {
            const groupDb = ctx.db.group;
            if (groupDb.mutebot && !isOwner && !await ctx.group().isSenderAdmin() && !(ctx.used.command === "unmute" && ctx.args[0]?.toLowerCase() === "bot")) return;
            const muteList = groupDb.mute || [];
            if (muteList.some(mute => mute.id === senderJid)) return;
        }

        if (ctx.prefix !== "force") {
            if (isGroup && !ctx.msg.key.fromMe) {
                console.log(util.styleText("magenta", "[~]"), `Incoming command: ${ctx.used.command}, from group: ${groupName} (${groupId}), by: ${senderName} (${senderId})`);
            } else if (isPrivate && !ctx.msg.key.fromMe) {
                console.log(util.styleText("magenta", "[~]"), `Incoming command: ${ctx.used.command}, from: ${senderName} (${senderId})`);
            }
        }

        await next();
    });
};