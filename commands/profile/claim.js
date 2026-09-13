const claimRewards = {
    regular: {
        reward: 100,
        cooldown: 24 * 60 * 60 * 1000
    },
    premium: {
        reward: 500,
        cooldown: 24 * 60 * 60 * 1000
    }
};

module.exports = {
    name: "claim",
    aliases: ["bonus", "klaim"],
    category: "profile",
    code: async (ctx) => {
        const senderDb = ctx.db.user;
        const rewardData = ctx.sender.isOwner() || senderDb.premium ? claimRewards.premium : claimRewards.regular;
        const currentTime = Date.now();
        if (!senderDb.lastClaim) senderDb.lastClaim = {};
        const lastClaim = senderDb.lastClaim || 0;
        const remainingTime = rewardData.cooldown - (currentTime - lastClaim);
        if (remainingTime > 0) return await ctx.reply(ctx.format.info(`Sudah klaim. Tunggu ${ctx.format.convertMsToDuration(remainingTime)}.`));
        try {
            senderDb.coin += rewardData.reward;
            senderDb.lastClaim = currentTime;
            senderDb.save();
            await ctx.reply(ctx.format.info(`Klaim ${rewardData.reward} koin. Total: ${senderDb.coin}`));
        } catch (error) {
            await ctx.helper.handleError(ctx, error);
        }
    }
};