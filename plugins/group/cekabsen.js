const config = require('../../config')

const pluginConfig = {
    name: 'cekabsen',
    alias: ['listabsen', 'daftarabsen', 'lihathadir'],
    category: 'group',
    description: 'Lihat daftar peserta yang sudah absen',
    usage: '.cekabsen',
    example: '.cekabsen',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    limit: 0,
    isEnabled: true
}

if (!global.absensi) global.absensi = {}

async function handler(m, { sock }) {
    const chatId = m.chat
    
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴀʙsᴇɴ*\n\n` +
            `> Belum ada sesi absen di grup ini!\n\n` +
            `> Admin dapat memulai dengan\n` +
            `> *.mulaiabsen [keterangan]*`
        )
    }
    
    const absen = global.absensi[chatId]
    
    const now = new Date()
    const dateStr = now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    
    const createdDate = new Date(absen.createdAt)
    const timeStr = createdDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    })
    
    let list = '┃ _Belum ada yang absen_'
    if (absen.peserta.length > 0) {
        list = absen.peserta
            .map((jid, i) => `┃ ${i + 1}. @${jid.split('@')[0]}`)
            .join('\n')
    }
    
    await sock.sendMessage(chatId, {
        text: `📋 *ᴅᴀғᴛᴀʀ ᴀʙsᴇɴ*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n` +
            `┃ 📝 ${absen.keterangan}\n` +
            `┃ 📅 ${dateStr}\n` +
            `┃ ⏰ Dimulai: ${timeStr}\n` +
            `┃ 👑 Dibuat: @${absen.createdBy.split('@')[0]}\n` +
            `├┈┈⬡「 👥 *ᴘᴇsᴇʀᴛᴀ (${absen.peserta.length})* 」\n` +
            `${list}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> _Ketik *.absen* untuk hadir_`,
        mentions: [...absen.peserta, absen.createdBy],
        contextInfo: {
            mentionedJid: [...absen.peserta, absen.createdBy],
            forwardingScore: 9999,
            isForwarded: true
        }
    }, { quoted: m })
}

module.exports = {
    config: pluginConfig,
    handler
}
