module.exports = {
    name: "profile",
    aliases: ["me", "prof", "profil"],
    category: "profile",
    code: async (ctx) => {
        const users = ctx.db.users.getAll();
        const userDb = ctx.db.user;
        const leaderboardData = users.map(user => ({
            id: user.id,
            winGame: user.winGame || 0
        })).sort((a, b) => b.winGame - a.winGame);

        await ctx.reply(
            `❖ ${ctx.format.bold("Nama")}: ${ctx.sender.pushName}\n` +
            `❖ ${ctx.format.bold("Status")}: ${ctx.sender.isOwner() ? "Owner" : (userDb.premium ? `Premium (${userDb.premiumExpiration ? `${ctx.format.convertMsToDuration(userDb.premiumExpiration - Date.now(), ["hari", "jam"])} tersisa` : "Selamanya"})` : "Freemium")}\n` +
            `❖ ${ctx.format.bold("Koin")}: ${userDb.coin}\n` +
            `❖ ${ctx.format.bold("Menang")}: ${userDb.winGame || 0}\n` +
            `❖ ${ctx.format.bold("Rank")}: ${leaderboardData.findIndex(user => ctx.helper.areJidsSameUser(user.id, ctx.sender.jid)) + 1}`
        );
    }
};