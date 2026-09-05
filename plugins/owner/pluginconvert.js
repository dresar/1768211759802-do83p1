const fs = require('fs')
const path = require('path')

const pluginConfig = {
    name: 'pluginconvert',
    alias: ['convertplugin', 'invywedplugin'],
    category: 'owner',
    description: 'Convert format plugin external ke format Invywed Bot (Smart System V3)',
    usage: '.pluginconvert [namafile] [folder]',
    example: '.pluginconvert sticker sticker',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    limit: 0,
    isEnabled: true
}

// Parameter yang harus di-extract dari destructuring
const PARAM_MAPPING = {
    'conn': 'sock',
    'this': 'sock',
    'text': 'm.text',
    'args': 'm.args',
    'command': 'm.command',
    'usedPrefix': 'm.prefix',
    'prefix': 'm.prefix',
    'quoted': 'm.quoted',
    'isOwner': 'm.isOwner',
    'isAdmin': 'm.isAdmin',
    'isBotAdmin': 'm.isBotAdmin',
    'isGroup': 'm.isGroup',
    'isPremium': 'm.isPremium',
    'sender': 'm.sender',
    'chat': 'm.chat',
    'participants': 'groupMeta?.participants || []',
    'groupMetadata': 'groupMeta',
    'mentionedJid': 'm.mentionedJid || []',
    'mime': 'm.mimetype',
    'mimetype': 'm.mimetype',
    'body': 'm.body',
    'pushName': 'm.pushName',
    'isMedia': '!!m.mimetype',
    'isImage': 'm.type === "imageMessage"',
    'isVideo': 'm.type === "videoMessage"',
    'isSticker': 'm.type === "stickerMessage"',
    'isAudio': 'm.type === "audioMessage"',
    'isDocument': 'm.type === "documentMessage"'
}

// Property conversions
const PROPERTY_MAPPING = {
    // Message properties
    'm.msg.mimetype': 'm.mimetype',
    'm.msg': 'm.message',
    'm.mtype': 'm.type',
    'm.type': 'm.type',
    'm.messageType': 'm.type',
    'm.mediaMessage': 'm.message',
    'm.id': 'm.key.id',
    'm.key.id': 'm.key.id',
    'm.fromMe': 'm.fromMe',
    'm.isBot': 'm.fromMe',
    
    // Quoted message properties
    'q.msg.mimetype': 'm.quoted?.mimetype',
    'q.msg': 'm.quoted?.message',
    'q.mtype': 'm.quoted?.type',
    'q.type': 'm.quoted?.type',
    'q.text': 'm.quoted?.text || m.quoted?.body',
    'q.body': 'm.quoted?.body',
    'q.sender': 'm.quoted?.sender',
    'q.pushName': 'm.quoted?.pushName',
    'q.fromMe': 'm.quoted?.fromMe',
    'q.id': 'm.quoted?.key?.id',
    'quoted.text': 'm.quoted?.text || m.quoted?.body',
    'quoted.body': 'm.quoted?.body',
    'quoted.sender': 'm.quoted?.sender',
    'quoted.mimetype': 'm.quoted?.mimetype',
    'quoted.msg': 'm.quoted?.message',
    'quoted.mtype': 'm.quoted?.type',
    'quoted.type': 'm.quoted?.type',
    'quoted.id': 'm.quoted?.key?.id',
    
    // Connection methods
    'conn.sendMessage': 'sock.sendMessage',
    'conn.sendFile': 'sock.sendMessage',
    'conn.sendSticker': 'sock.sendMessage',
    'conn.sendImage': 'sock.sendMessage',
    'conn.sendVideo': 'sock.sendMessage',
    'conn.sendAudio': 'sock.sendMessage',
    'conn.sendDocument': 'sock.sendMessage',
    'conn.reply': 'm.reply',
    'conn.sendButton': 'sock.sendMessage',
    'conn.sendList': 'sock.sendMessage',
    'conn.sendContact': 'sock.sendMessage',
    'conn.sendPoll': 'sock.sendMessage',
    'conn.getName': '(jid) => jid?.split("@")[0]',
    'conn.parseMention': '(text) => [...text.matchAll(/@([0-9]{5,16})/g)].map(v => v[1] + "@s.whatsapp.net")',
    'conn.decodeJid': '(jid) => jid',
    'conn.groupMetadata': 'sock.groupMetadata',
    
    // Other properties
    'global.db.data': 'global.db.data',
    'global.API': 'global.API'
}

// Template Invywed Bot
const TEMPLATE = `const config = {
    name: '{{NAME}}',
    alias: {{ALIAS}},
    category: '{{CATEGORY}}',
    description: '{{DESCRIPTION}}',
    usage: '{{USAGE}}',
    example: '{{EXAMPLE}}',
    isOwner: {{IS_OWNER}},
    isPremium: {{IS_PREMIUM}},
    isGroup: {{IS_GROUP}},
    isPrivate: {{IS_PRIVATE}},
    cooldown: {{COOLDOWN}},
    limit: {{LIMIT}},
    isEnabled: true
}

async function handler(m, { {{PARAMS}} }) {
{{CODE}}
}

module.exports = {
    config,
    handler
}`

async function handler(m, { sock, m: message }) {
    if (!m.quoted || !m.quoted.text) {
        return m.reply('Reply kode plugin yang ingin di-convert!')
    }
    
    let args = m.args
    let filename = args[0] || 'converted-plugin'
    let folder = args[1] || 'converted'
    
    let code = m.quoted.text
    let result = convertCode(code)
    
    let finalCode = TEMPLATE
        .replace('{{NAME}}', filename)
        .replace('{{ALIAS}}', '[]')
        .replace('{{CATEGORY}}', folder)
        .replace('{{DESCRIPTION}}', `Plugin ${filename} (Converted)`)
        .replace('{{USAGE}}', `.${filename}`)
        .replace('{{EXAMPLE}}', `.${filename}`)
        .replace('{{IS_OWNER}}', 'false')
        .replace('{{IS_PREMIUM}}', 'false')
        .replace('{{IS_GROUP}}', 'false')
        .replace('{{IS_PRIVATE}}', 'false')
        .replace('{{COOLDOWN}}', '5')
        .replace('{{LIMIT}}', '0')
        .replace('{{PARAMS}}', result.params.join(', '))
        .replace('{{CODE}}', result.code)
        
    // Save to file
    const targetPath = path.join(process.cwd(), 'plugins', folder, `${filename}.js`)
    const dir = path.dirname(targetPath)
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(targetPath, finalCode)
    
    await m.reply(`✅ Berhasil convert plugin!\n\n📂 File: plugins/${folder}/${filename}.js\n\nSilakan cek dan sesuaikan kembali kode hasil convert.`)
    await sock.sendMessage(m.chat, { document: fs.readFileSync(targetPath), mimetype: 'application/javascript', fileName: `${filename}.js` }, { quoted: m })
}

function convertCode(code) {
    let lines = code.split('\n')
    let newLines = []
    let params = new Set(['sock']) // Default param
    
    for (let line of lines) {
        // Skip imports yang tidak compatible
        if (line.includes('require') && !line.includes('fs') && !line.includes('path') && !line.includes('axios')) {
            continue
        }
        
        // Convert handler signature
        if (line.includes('handler') && line.includes('m')) {
            continue
        }
        
        // Apply property mappings
        for (let [oldProp, newProp] of Object.entries(PROPERTY_MAPPING)) {
            if (line.includes(oldProp)) {
                line = line.split(oldProp).join(newProp)
            }
        }
        
        // Collect used params
        for (let [key, val] of Object.entries(PARAM_MAPPING)) {
            if (line.includes(val) || line.includes(key)) {
                // Extract param name from mapping value (e.g., m.text -> text)
                // This is a simplification, ideally we check what variables are actually used
            }
        }
        
        newLines.push(line)
    }
    
    // Basic formatting
    let formattedCode = newLines.join('\n')
    
    return {
        code: formattedCode,
        params: ['sock', 'm', 'text', 'args', 'command', 'prefix'] // Standard params
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
