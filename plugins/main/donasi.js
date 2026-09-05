const config = require('../../config')
const path = require('path')
const fs = require('fs')

const pluginConfig = {
    name: 'donasi',
    alias: ['donate', 'donation', 'support', 'saweria', 'trakteer'],
    category: 'main',
    description: 'Informasi donasi untuk mendukung bot',
    usage: '.donasi',
    example: '.donasi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    limit: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const botName = config.bot?.name || 'Invywed Bot'
    const ownerName = config.owner?.name || 'Owner'
    
    const donasiConfig = config.donasi || {}
    const payments = donasiConfig.payment || []
    const links = donasiConfig.links || []
    const benefits = donasiConfig.benefits || [
        'Mendukung development',
        'Server lebih stabil',
        'Fitur baru lebih cepat',
        'Priority support'
    ]
    
    let text = `╭━━━━━━━━━━━━━━━━━╮\n`
    text += `┃  💝 *ᴅᴏɴᴀsɪ*\n`
    text += `╰━━━━━━━━━━━━━━━━━╯\n\n`
    
    text += `> Terima kasih telah menggunakan\n`
    text += `> *${botName}*! 🙏\n\n`
    
    if (payments.length > 0 || links.length > 0) {
        text += `╭┈┈⬡「 💳 *ᴘᴀʏᴍᴇɴᴛ* 」\n`
        text += `┃\n`
        
        for (const pay of payments) {
            text += `┃ 🏦 *${pay.name?.toLowerCase().split('').map((c,i) => i === 0 ? c.toUpperCase() : c).join('')}*\n`
            text += `┃ ◦ ${pay.number} (a/n ${pay.holder})\n`
            text += `┃\n`
        }
        
        for (const link of links) {
            const icons = { saweria: '☕', trakteer: '🍵', paypal: '💰', default: '🔗' }
            const icon = icons[link.name?.toLowerCase()] || icons.default
            text += `┃ ${icon} *${link.name}*\n`
            text += `┃ ◦ ${link.url}\n`
            text += `┃\n`
        }
        
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    } else {
        text += `╭┈┈⬡「 💳 *ᴘᴀʏᴍᴇɴᴛ* 」\n`
        text += `┃\n`
        text += `┃ > Belum dikonfigurasi\n`
        text += `┃ > Edit config.donasi\n`
        text += `┃\n`
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    }
    
    text += `╭┈┈⬡「 🎁 *ʙᴇɴᴇꜰɪᴛ* 」\n`
    for (const benefit of benefits) {
        text += `┃ ◦ ${benefit}\n`
    }
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    
    text += `> _Donasi berapapun sangat berharga_\n`
    text += `> Contact: @${config.owner?.number?.[0] || 'owner'}`
    
    let thumbBuffer = null
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'thumbnail2.jpg')
    const fallbackPath = path.join(process.cwd(), 'assets', 'images', 'thumbnail.jpg')
    
    if (fs.existsSync(thumbPath)) {
        thumbBuffer = fs.readFileSync(thumbPath)
    } else if (fs.existsSync(fallbackPath)) {
        thumbBuffer = fs.readFileSync(fallbackPath)
    }
    
    const contextInfo = {
        mentionedJid: config.owner?.number?.[0] ? [`${config.owner.number[0]}@s.whatsapp.net`] : [],
        forwardingScore: 9999,
        isForwarded: true,
        externalAdReply: {
            title: `💝 Donasi ${botName}`,
            body: 'Dukung pengembangan bot ini!',
            sourceUrl: config.saluran?.link || '',
            mediaType: 1,
            showAdAttribution: false,
            renderLargerThumbnail: false
        }
    }
    
    if (thumbBuffer) {
        contextInfo.externalAdReply.thumbnail = thumbBuffer
    }
    
    await sock.sendMessage(m.chat, {
        text: text,
        contextInfo: contextInfo
    }, { quoted: m })
}

module.exports = {
    config: pluginConfig,
    handler
}
