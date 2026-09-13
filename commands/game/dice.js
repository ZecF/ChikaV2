module.exports = {
    name: "dice",
    aliases: ["dadu"],
    category: "game",
    code: async (ctx) => {
        const input = parseInt(ctx.args[0]);
        if (isNaN(input) || input < 1 || input > 6)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "4")}\n` +
                ctx.format.generateNotes([
                    "Tebak: 1-6"
                ])
            );

        const senderDb = ctx.db.user;
        if (senderDb.coin < 500) return await ctx.reply(ctx.format.info("Taruhan harus > 500."));

        try {
            const result = Math.floor(Math.random() * 6) + 1;
            const winChance = ctx.sender.isOwner() || senderDb.premium ? 0.60 : 0.20;
            const isWin = Math.random() < winChance;
            const finalResult = isWin ? input : (result === input ? (input % 6) + 1 : result);

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
            await ctx.reply(ctx.format.info(`${responseText} Dadu: ${finalResult}. ${prizeText}`));
        } catch (error) {
            await ctx.helper.handleError(ctx, error);
        }
    }
};