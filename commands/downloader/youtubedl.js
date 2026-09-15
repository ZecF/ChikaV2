const ytSearch = require('yt-search');

const BASE_URL = 'https://cnvmp3.com';
const FETCH_URL = `${BASE_URL}/fetch.php`;
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': `${BASE_URL}/`,
    'Origin': BASE_URL,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

// Fungsi scraper cnvmp3
async function cnvmp3(url, format = 'mp3') {
    if (!url) throw new Error('Parameter url diperlukan');
    const downloadMode = String(format).toLowerCase() === 'mp4' || String(format).toLowerCase() === 'video' ? 'auto' : 'audio';
    
    let retries = 0;
    let lastRes = null;
    
    while (retries < 5) {
        const payload = { url, downloadMode, filenameStyle: 'basic' };
        
        try {
            const res = await fetch(FETCH_URL, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify(payload),
            });
            
            lastRes = await res.json().catch(() => null);
            
            if (lastRes && lastRes.status === 'rate-limit') {
                retries++;
                await new Promise((r) => setTimeout(r, 2000));
                continue;
            }
            break;
        } catch (err) {
            throw new Error('Gagal menghubungi server converter');
        }
    }

    if (!lastRes) throw new Error('Tidak mendapat respon dari server cnvmp3');
    if (lastRes.error) throw new Error(lastRes.error.code || lastRes.error || 'Gagal memproses media');
    
    if (lastRes.url) {
        return {
            status: true,
            title: lastRes.filename || 'YouTube_AudioVideo',
            format: downloadMode === 'audio' ? 'mp3' : 'mp4',
            download_url: lastRes.url,
            original_url: url,
        };
    }
    
    throw new Error('URL download tidak ditemukan pada respon cnvmp3');
}

module.exports = {
    name: "ytdl",
    aliases: ["ytmp3", "ytmp4", "yta", "ytv", "youtubedl", "play"],
    category: "downloader",
    permissions: {
        coin: 5
    },
    description: "Mengunduh Audio, Video, atau Memutar lagu dari YouTube",
    code: async (ctx) => {
        try {
            // BACA TEKS MURNI: Membaca apa yang benar-benar diketik oleh user (contoh: ".play lagu" atau ".ytmp4 link")
            const rawMsg = ctx.used?.upsert?.toLowerCase() || "";
            const cmdText = rawMsg.split(" ")[0]; // Mengambil kata pertamanya saja
            
            // Logika deteksi baru yang kebal dari salah paham sistem
            const isPlay = cmdText.includes("play");
            const isVideo = cmdText.includes("mp4") || cmdText.includes("ytv") || cmdText.includes("video");
            const format = isVideo ? "mp4" : "mp3";
            
            let url = ctx.args[0] || (ctx.quoted ? ctx.quoted.body : null);
            const query = ctx.args.join(" ");

            // ==========================================
            // LOGIKA UNTUK FITUR .play (Pencarian Judul)
            // ==========================================
            if (isPlay) {
                if (!query) {
                    return await ctx.reply("❌ *Format Salah!*\nSilakan masukkan judul lagu yang ingin diputar.\n\n*Contoh:* `.play sempurna andra and the backbone`");
                }

                await ctx.reply(`🔍 _Sedang mencari lagu: *${query}*..._`);
                
                const searchResults = await ytSearch(query);
                const video = searchResults.videos[0];
                
                if (!video) return await ctx.reply("❌ *Lagu tidak ditemukan!* Coba gunakan kata kunci lain.");
                
                url = video.url;
                await ctx.reply(`🎵 *Ditemukan!* Mengunduh audio...\n\n📌 *Judul:* ${video.title}\n⏱️ *Durasi:* ${video.timestamp}\n👀 *Views:* ${video.views}`);
            } 
            // ==========================================
            // LOGIKA UNTUK FITUR .ytmp3 / .ytmp4 (Link Langsung)
            // ==========================================
            else {
                if (!url || !url.match(/(?:youtube\.com|youtu\.be)/i)) {
                    return await ctx.reply("❌ *Format Salah!*\nSilakan masukkan atau balas link YouTube yang valid.\n\n*Contoh:* `.ytmp4 https://youtu.be/dQw4w9WgXcQ`");
                }
                
                await ctx.reply(`⏳ _Sedang memproses ${format.toUpperCase()} dari YouTube..._`);
            }

            // Memanggil fungsi API cnvmp3
            const result = await cnvmp3(url, format);

            if (format === "mp3") {
                await ctx.reply({
                    audio: { url: result.download_url },
                    mimetype: "audio/mpeg",
                    ptt: false, // Set ke true jika ingin berupa rekaman suara (VN)
                    fileName: `${result.title}.mp3`
                });
            } else {
                await ctx.reply({
                    video: { url: result.download_url },
                    caption: `✅ *Berhasil Mengunduh Video!*\n\n🎬 *Judul:* ${result.title}\n🔗 *Sumber:* ${result.original_url}`,
                    fileName: `${result.title}.mp4`
                });
            }

        } catch (error) {
            console.error("[YouTube/Play Error]:", error.message);
            await ctx.reply(`❌ *Gagal memproses:*\n_${error.message}_`);
        }
    }
};
