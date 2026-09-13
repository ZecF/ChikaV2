module.exports = {
    name: "coin",
    aliases: ["koin"],
    category: "profile",
    code: async (ctx) => {
        await ctx.reply(ctx.format.info(`Koin: ${ctx.db.user.coin}`));
    }
};