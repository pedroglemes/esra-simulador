const https = require('https');

module.exports = function handler(req, res) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY não configurada.' });

    const body = JSON.stringify({
        expires_after: { anchor: 'created_at', seconds: 600 },
        session: { type: 'realtime', model: 'gpt-realtime-2' }
    });

    const options = {
        hostname: 'api.openai.com',
        path: '/v1/realtime/client_secrets',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    };

    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
            try {
                res.status(response.statusCode).json(JSON.parse(data));
            } catch (e) {
                res.status(500).json({ error: 'Resposta inválida: ' + data });
            }
        });
    });

    request.on('error', (err) => res.status(500).json({ error: err.message }));
    request.write(body); request.end();
};
