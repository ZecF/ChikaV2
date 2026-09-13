module.exports = {
    name: "coinflip",
    aliases: ["flip"],
    category: "game",
    code: async (ctx) => {
        const input = ctx.args[0]?.toLowerCase();
        if (!input || !["garuda", "melati"].includes(input))
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "melati")}\n` +
                ctx.format.generateNotes([
                    "Tebak: garuda/melati"
                ])
            );

        const senderDb = ctx.db.user;
        if (senderDb.coin < 500) return await ctx.reply(ctx.format.info(`${config.msg.coin} Butuh: 500`));

        try {
            const winRate = ctx.sender.isOwner() || senderDb.premium ? 0.60 : 0.20;
            const isWin = Math.random() < winRate;
            const flip = isWin ? input : (input === "garuda" ? "melati" : "garuda");
            let responseText = "";
            let prizeText = "";

            if (isWin) {
                const prize = 1000;
                senderDb.coin += prize;
                responseText = "Selamat!";
                prizeText = `+${prize} koin`;
            } else {
                const forfeit = 500;
                senderDb.coin -= forfeit;
                responseText = "Kalah!";
                prizeText = `-${forfeit} koin`;
            }

            senderDb.save();
            await ctx.reply(ctx.format.info(`${responseText} Koin: ${flip}. ${prizeText}`));
        } catch (error) {
            await ctx.helper.handleError(ctx, error);
        }
    }
};