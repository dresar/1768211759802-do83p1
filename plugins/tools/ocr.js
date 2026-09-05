const config = require('../../config')
const path = require('path')
const fs = require('fs')
const FormData = require('form-data')

const pluginConfig = {
    name: 'ocr',
    alias: ['totext', 'imagetotext', 'readtext'],
    category: 'tools',
    description: 'Extract teks dari gambar',
    usage: '.ocr (reply gambar)',
    example: '.ocr',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    limit: 1,
    isEnabled: true
}

let thumbTools = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'games.jpg')
    if (fs.existsSync(thumbPath)) thumbTools = fs.readFileSync(thumbPath)
} catch (e) {}

function getContextInfo(title = '📖 *ᴏᴄʀ*', body = 'Text extraction') {
    const contextInfo = {
        forwardingScore: 9999,
        isForwarded: true
    }
    
    if (thumbTools) {
        contextInfo.externalAdReply = {
            title: title,
            body: body,
            thumbnail: thumbTools,
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
    
    return contextInfo
}

async function uploadImage(buffer) {
    const { fileTypeFromBuffer } = await import('file-type')
    const type = await fileTypeFromBuffer(buffer)
    const ext = type?.ext || 'jpg'
    
    const form = new FormData()
    form.append('file', buffer, { filename: `image.${ext}`, contentType: type?.mime || 'image/jpeg' })
    
    const res = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: form
    })
    
    const data = await res.json()
    if (data.status === 'success' && data.data?.url) {
        return data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
    }
    
    throw new Error('Upload gagal')
}

async function ocrSpace(imageUrl) {
    const params = new URLSearchParams({
        url: imageUrl,
        language: 'eng',
        isOverlayRequired: 'false',
        detectOrientation: 'true',
        scale: 'true',
        OCREngine: '2'
    })
    
    const res = await fetch('https://api.ocr.space/parse/image?' + params.toString(), {
        method: 'POST',
        headers: { 'apikey': 'K87648783188957' }
    })
    
    const data = await res.json()
    
    if (data.ParsedResults?.[0]?.ParsedText) {
        return data.ParsedResults[0].ParsedText.trim()
    }
    
    if (data.ErrorMessage) {
        throw new Error(data.ErrorMessage[0] || 'OCR gagal')
    }
    
    throw new Error('Tidak ada teks terdeteksi')
}

async function handler(m, { sock }) {
    const q = m.quoted || m
    const mime = q.mimetype || ''
    
    if (!mime) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> Reply gambar dengan \`${m.prefix}ocr\`\n\n` +
            `> Media yang didukung:\n` +
            `> JPG, PNG, GIF, WEBP`
        )
    }
    
    if (!/image\/(jpe?g|png|gif|webp)/.test(mime)) {
        return m.reply(`❌ *ᴛɪᴘᴇ ᴛɪᴅᴀᴋ ᴅɪᴅᴜᴋᴜɴɢ*\n\n> Jenis ${mime} tidak didukung`)
    }
    
    await m.react('⏳')
    await m.reply(`⏳ *ᴍᴇᴍᴘʀᴏsᴇs...*\n\n> Mengekstrak teks dari gambar...`)
    
    try {
        const buffer = await q.download()
        
        if (!buffer || buffer.length === 0) {
            await m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak dapat download gambar`)
        }
        
        const imageUrl = await uploadImage(buffer)
        const extractedText = await ocrSpace(imageUrl)
        
        if (!extractedText || extractedText.length === 0) {
            await m.react('❌')
            return m.reply(`❌ *ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴛᴇᴋs*\n\n> Tidak ada teks yang terdeteksi di gambar`)
        }
        
        await m.react('✅')
        
        const text = `📖 *ᴏᴄʀ ʀᴇsᴜʟᴛ*\n\n` +
            `╭┈┈⬡「 📝 *ᴛᴇᴋs* 」\n` +
            `${extractedText.split('\n').map(l => `┃ ${l}`).join('\n')}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> Total: ${extractedText.length} karakter`
        
        await sock.sendMessage(m.chat, {
            text: text.length > 4000 ? text.slice(0, 4000) + '\n\n... (terpotong)' : text,
            contextInfo: getContextInfo('📖 *ᴏᴄʀ*', `${extractedText.length} chars`)
        }, { quoted: m })
        
    } catch (e) {
        await m.react('❌')
        await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${e.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
