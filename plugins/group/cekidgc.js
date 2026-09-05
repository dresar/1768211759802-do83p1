const config = require('../../config')

const pluginConfig = {
    name: 'cekidgc',
    alias: ['idgc', 'idgrup', 'groupid'],
    category: 'group',
    description: 'Cek ID grup saat ini',
    usage: '.cekidgc',
    example: '.cekidgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    limit: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.isGroup) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Perintah ini hanya bisa digunakan di grup`)
    }
    
    await m.react('📋')
    
    try {
        const groupMeta = await sock.groupMetadata(m.chat)
        const groupName = groupMeta?.subject || 'Unknown'
        const groupDesc = groupMeta?.desc || '-'
        const memberCount = groupMeta?.participants?.length || 0
        const groupOwner = groupMeta?.owner || '-'
        const createdAt = groupMeta?.creation ? new Date(groupMeta.creation * 1000).toLocaleDateString('id-ID') : '-'
        
        const text = `📋 *ɢʀᴏᴜᴘ ɪɴꜰᴏ*\n\n` +
            `╭┈┈⬡「 🏠 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 📛 Nama: *${groupName}*\n` +
            `┃ 🆔 ID: \`${m.chat}\`\n` +
            `┃ 👥 Member: *${memberCount}*\n` +
            `┃ 📅 Dibuat: *${createdAt}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        
        await sock.sendMessage(m.chat, {
            text: text,
            contextInfo: {
                forwardingScore: 9999,
                isForwarded: true
            }
        }, { quoted: m })
        
        await m.react('✅')
        
    } catch (error) {
        await m.react('❌')
        await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${error.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
