module.exports = {
    name: "addcoinuser",
    aliases: ["acu", "addcoin"],
    category: "owner",
    permissions: {
        owner: true
    },
    code: async (ctx) => {
        const target = await ctx.target();
        const coinAmount = parseInt(ctx.args[target.source === "quoted" ? 0 : 1], 10);
        if (!target || !coinAmount)
            return await ctx.reply({
                text: `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                    `${ctx.format.generateCmdExample(ctx.used, "@6281234567891 8 -s")}\n` +
                    `${ctx.format.generateNotes([
                        "Balas/quote pesan target."
                    ])}\n` +
                    ctx.format.generatesFlagInfo({
                        "-s": "Diam, tanpa notifikasi"
                    }),
                mentions: ["6281234567891@s.whatsapp.net"]
            });

        try {
            const targetDb = ctx.getDb("users", target.id);
            targetDb.coin += coinAmount;
            targetDb.save();
            const flag = ctx.flag({
                silent: {
                    type: "boolean",
                    short: "s",
                    default: false
                }
            });
            if (!flag.silent && !config.system.restrict) await ctx.sendMessage(target.id, ctx.format.info(`Anda menerima ${coinAmount} koin dari owner.`));
            await ctx.reply(ctx.format.info(`+${coinAmount} koin untuk target.`));
        } catch (error) {
            await ctx.helper.handleError(ctx, error);
        }
    }
};