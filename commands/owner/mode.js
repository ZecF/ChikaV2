module.exports = {
    name: "mode",
    aliases: ["m"],
    category: "owner",
    permissions: {
        owner: true
    },
    code: async (ctx) => {
        const input = ctx.text;
        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "self")}\n` +
                ctx.format.generateNotes([
                    `Ketik: ${ctx.format.inlineCode(`${ctx.used.prefix + ctx.used.command} list`)} untuk daftar`
                ])
            );

        if (input.toLowerCase() === "list") {
            const listText = await ctx.list.get(ctx, "mode");
            return await ctx.reply(listText);
        }

        try {
            const validModes = [
                "premium",
                "group",
                "private",
                "public",
                "self"
            ];
            const mode = input.toLowerCase();
            if (!validModes.includes(mode)) return await ctx.reply(ctx.format.info(`Mode "${input}" tidak valid.`));
            const botDb = ctx.db.bot;
            botDb.mode = mode;
            botDb.save();
            await ctx.reply(ctx.format.info(`Mode diubah ke ${input}.`));
        } catch (error) {
            await ctx.helper.handleError(ctx, error);
        }
    }
};