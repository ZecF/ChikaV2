module.exports = {
    name: "gamble",
    aliases: ["slot"],
    category: "game",
    code: async (ctx) => {
        const input = parseInt(ctx.args[0], 10);
        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                ctx.format.generateCmdExample(ctx.used, "18")
            );
        const senderDb = ctx.db.user;
        if (input < 10) return await ctx.reply(ctx.format.info("Taruhan harus > 10."));
        if (senderDb.coin < input) return await ctx.reply(ctx.format.info(config.msg.coin));

        try {
            const jackpotPrize = Math.ceil(input * 5);
            const winPrize = Math.ceil(input * 2);
            const emojis = ["🍏", "🍎", "🍊", "🍋", "🍑", "🪙", "🍅", "🍐", "🍒", "🥥", "🍌"];
            const topRow = Array.from({
                length: 3
            }, () => emojis[Math.floor(Math.random() * emojis.length)]);
            const middleRow = Array.from({
                length: 3
            }, () => emojis[Math.floor(Math.random() * emojis.length)]);
            const bottomRow = Array.from({
                length: 3
            }, () => emojis[Math.floor(Math.random() * emojis.length)]);
            const roll = Math.random();
            let isJackpot = false;
            let isWin = false;
            const rates = (ctx.sender.isOwner() || senderDb.premium) ? {
                jackpot: 0.15,
                win: 0.65
            } : {
                jackpot: 0.05,
                win: 0.25
            };
            if (roll < rates.jackpot) {
                isJackpot = true;
            } else if (roll < rates.win) {
                isWin = true;
            }
            if (isJackpot) {
                const jackpotEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                middleRow[0] = middleRow[1] = middleRow[2] = jackpotEmoji;
            } else if (isWin) {
                const pairEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                const diffEmoji = emojis.filter(e => e !== pairEmoji)[Math.floor(Math.random() * (emojis.length - 1))];
                const positions = [
                    [0, 1],
                    [0, 2],
                    [1, 2]
                ];
                const [a, b] = positions[Math.floor(Math.random() * positions.length)];
                middleRow[a] = pairEmoji;
                middleRow[b] = pairEmoji;
                middleRow[3 - a - b] = diffEmoji;
            } else {
                do {
                    for (let i = 0; i < 3; i++) middleRow[i] = emojis[Math.floor(Math.random() * emojis.length)];
                } while (middleRow[0] === middleRow[1] || middleRow[0] === middleRow[2] || middleRow[1] === middleRow[2]);
            }
            const slotText = `${topRow[0]} | ${topRow[1]} | ${topRow[2]}\n` +
                `${middleRow[0]} | ${middleRow[1]} | ${middleRow[2]} <===\n` +
                `${bottomRow[0]} | ${bottomRow[1]} | ${bottomRow[2]}`;
            let responseText = "";
            if (isJackpot) {
                responseText = `Jackpot! +${jackpotPrize} koin (5x)`;
                senderDb.coin += jackpotPrize;
            } else if (isWin) {
                responseText = `Menang! +${winPrize} koin (2x)`;
                senderDb.coin += winPrize;
            } else {
                responseText = `Kalah! Semoga beruntung lain kali. -${input} koin`;
                senderDb.coin -= input;
            }
            senderDb.save();
            await ctx.reply(
                `${ctx.format.info(responseText)}\n` +
                slotText
            );
        } catch (error) {
            await ctx.helper.handleError(ctx, error);
        }
    }
};