const { getDatabase } = require('../../src/lib/database')
const config = require('../../config')

const pluginConfig = {
    name: 'topbalance',
    alias: ['topbal', 'leaderboardbalance', 'lbbal'],
    category: 'user',
    description: 'Leaderboard balance',
    usage: '.topbalance',
    example: '.topbalance',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    limit: 0,
    isEnabled: true
}

function formatBalance(num) {
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(1) + 'T'
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
}

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

async function handler(m, { sock }) {
    const db = getDatabase()
    
    const topUsers = db.getTopUsers('balance', 10)
    
    if (topUsers.length === 0) {
        return m.reply(`📊 *ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ ʙᴀʟᴀɴᴄᴇ*\n\n> Belum ada data`)
    }
    
    let text = `╭━━━━━━━━━━━━━━━━━╮\n`
    text += `┃  🏆 *ᴛᴏᴘ ʙᴀʟᴀɴᴄᴇ*\n`
    text += `╰━━━━━━━━━━━━━━━━━╯\n\n`
    
    const mentions = []
    
    for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i]
        const medal = MEDALS[i]
        const name = user.name || user.jid
        const balance = formatBalance(user.balance || 0)
        
        text += `${medal} *${name}*\n`
        text += `    💰 ${balance}\n\n`
        
        mentions.push(`${user.jid}@s.whatsapp.net`)
    }
    
    text += `> 📊 Total: ${topUsers.length} users`
    
    await sock.sendMessage(m.chat, {
        text,
        mentions,
        contextInfo: {
            forwardingScore: 9999,
            isForwarded: true
        }
    }, { quoted: m })
}

module.exports = {
    config: pluginConfig,
    handler
}
