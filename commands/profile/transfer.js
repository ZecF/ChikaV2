module.exports = {
    name: "transfer",
    aliases: ["tf"],
    category: "profile",
    code: async (ctx) => {
        const target = await ctx.target();
        const coinAmount = parseInt(ctx.args[target.source === "quoted" ? 0 : 1], 10);
        if (!target || !coinAmount)
            return await ctx.reply({
                text: `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                    `${ctx.format.generateCmdExample(ctx.used, "@6281234567891 8")}\n` +
                    ctx.format.generateNotes([
                        "Balas/quote pesan target."
                    ]),
                mentions: ["6281234567891@s.whatsapp.net"]
            });
        const senderDb = ctx.db.user;
        const adminFeePercent = 2;
        const adminFee = ctx.sender.isOwner() || senderDb.premium ? 0 : Math.ceil((coinAmount * adminFeePercent) / 100);
        const totalDeduction = coinAmount + adminFee;
        if (coinAmount <= 0) return await ctx.reply(ctx.format.info("Jumlah harus > 0."));
        if (senderDb.coin < totalDeduction) return await ctx.reply(ctx.format.info(`${config.msg.coin} ${adminFee > 0 ? `Butuh: ${totalDeduction} (transfer ${coinAmount} + admin ${adminFee})` : ""}`.trim()));
        if (ctx.helper.areJidsSameUser(target.id, ctx.me.lid)) return await ctx.reply(ctx.format.info("Tidak bisa transfer ke bot."));
        try {
            const targetDb = ctx.getDb("users", target.id);
            targetDb.coin += coinAmount;
            senderDb.coin -= totalDeduction;
            targetDb.save();
            senderDb.save();
            await ctx.reply(ctx.format.info(`Transfer ${coinAmount} koin berhasil. ${adminFee > 0 ? `Admin ${adminFeePercent}%: ${adminFee} koin` : "Admin: Gratis"}`.trim()));
        } catch (error) {
            await ctx.helper.handleError(ctx, error);
        }
    }
};