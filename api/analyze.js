// Vercel serverless function: POST /api/analyze
const { handleAnalyze } = require('./_lib');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (_) { return res.status(400).json({ error: 'Invalid JSON' }); }
    }
    const { status, json } = await handleAnalyze(body);
    res.status(status).json(json);
};
