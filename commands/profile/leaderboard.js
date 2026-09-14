module.exports = {
    name: "leaderboard",
    aliases: ["lb", "peringkat", "rank"],
    category: "profile",
    code: async (ctx) => {
        const users = ctx.db.users.getAll();
        const senderJid = ctx.sender.jid;
        const senderId = ctx.getId(senderJid);
        const leaderboardData = users.map(user => ({
            id: user.id,
            pushName: user.pushName,
            winGame: user.winGame || 0
        })).sort((a, b) => b.winGame - a.winGame);
        const userRank = leaderboardData.findIndex(user => ctx.helper.areJidsSameUser(user.id, senderJid)) + 1;
        const topUsers = leaderboardData.slice(0, 10);
        let resultText = "";
        const mentions = [];
        topUsers.forEach((user, i) => {
            const isSelf = ctx.helper.areJidsSameUser(user.id, senderJid);
            const displayUser = isSelf ? `@${senderId}` : (user.pushName || ctx.getId(user.id));
            if (isSelf) mentions.push(senderJid);
            resultText += `❖ ${displayUser} - Menang: ${user.winGame}, Rank: ${i + 1}\n`;
        });
        if (userRank > 10) {
            const userStats = leaderboardData[userRank - 1];
            resultText += `❖ @${senderId} - Menang: ${userStats.winGame}, Rank: ${userRank}\n`;
            mentions.push(senderJid);
        }
        await ctx.reply({
            text: resultText.trim(),
            mentions
        });
    }
};