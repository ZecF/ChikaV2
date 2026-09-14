const { SpeedTestService } = require("@ginkohub/speedtest-js");

module.exports = {
    name: "speedtest",
    aliases: ["speed"],
    category: "information",
    code: async (ctx) => {
        const speedtestMsg = await ctx.reply(ctx.format.info("Memulai speedtest..."));
        await ctx.edit(speedtestMsg.key, ctx.format.info("Ambil info client..."));
        const service = new SpeedTestService();
        await service.fetchClientInfo();
        await ctx.edit(speedtestMsg.key, ctx.format.info("Cari server terbaik..."));
        const bestServer = await service.findBestServer();
        await ctx.edit(speedtestMsg.key, ctx.format.info("Uji latency..."));
        const latencySpeed = (await service.testLatency(bestServer, 5)).latency;
        await ctx.edit(speedtestMsg.key, ctx.format.info("Uji download..."));
        const downloadSpeed = await service.testDownload(bestServer, null, {
            threads: 4,
            duration: 10000
        });
        await ctx.edit(speedtestMsg.key, ctx.format.info("Uji upload..."));
        const uploadSpeed = await service.testUpload(bestServer, null, {
            duration: 10000
        });
        await ctx.edit(speedtestMsg.key,
            `❖ ${ctx.format.bold("Latency")}: ${ctx.format.convertMsToDuration(latencySpeed)}\n` +
            `❖ ${ctx.format.bold("Download")}: ${ctx.format.formatSize(downloadSpeed, true)}\n` +
            `❖ ${ctx.format.bold("Upload")}: ${ctx.format.formatSize(uploadSpeed, true)}`
        );
    }
};