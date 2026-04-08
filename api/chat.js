// api/chat.js
const BOT_TOKEN = '8606015215:AAF0ECEhBqchYwOlgGuwRQD9ggJvhKVYszU';
const CHAT_ID = '-1003749023921';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // 🔥 TEST ENDPOINT (biar gak 404)
    if (req.method === 'GET' && req.url === '/api/chat') {
        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=50`);
            const data = await response.json();
            
            if (data.ok) {
                const messages = [];
                for (const update of data.result) {
                    const msg = update.message;
                    if (msg && msg.text) {
                        const text = msg.text;
                        const from = msg.from.username || msg.from.first_name || 'anonymous';
                        const timestamp = msg.date;
                        const toMatch = text.match(/- to \(([^)]+)\)/);
                        const targetUser = toMatch ? toMatch[1] : null;
                        const content = text.replace(/- to \([^)]+\)/, '').trim();
                        
                        messages.push({
                            id: update.update_id,
                            from: from,
                            to: targetUser,
                            message: content,
                            timestamp: timestamp
                        });
                    }
                }
                return res.status(200).json({ success: true, messages: messages });
            }
            return res.status(500).json({ error: 'Gagal ambil pesan' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    // 🔥 KIRIM PESAN
    if (req.method === 'POST' && req.url === '/api/chat') {
        const { username, to, message } = req.body;
        
        if (!username || !to || !message) {
            return res.status(400).json({ error: 'username, to, dan message wajib diisi' });
        }
        
        try {
            const formattedMessage = `${message} - to (${to})`;
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: formattedMessage })
            });
            const data = await response.json();
            
            if (data.ok) {
                return res.status(200).json({ success: true, message_id: data.result.message_id });
            } else {
                return res.status(500).json({ error: data.description });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    // 🔥 404 buat endpoint lain
    return res.status(404).json({ error: 'Endpoint tidak ditemukan' });
}
