/* ===================================================================
   groq_proxy.js  -  Cloudflare Worker that hides your Groq API key
   (v2: auto-allows localhost + home/hotspot network addresses, and
        returns clear errors so JANE.AI can tell you what is wrong)
 
   Worker settings (Settings > Variables and Secrets):
     GROQ_API_KEY     (Secret)  your Groq key
     ALLOWED_ORIGINS  (Text)    your public site(s), comma-separated, e.g.
                                https://yourname.github.io
     ALLOW_LAN        (Text, optional) set to "false" in production to stop
                                allowing localhost / 192.168.x.x / 172.16-31.x.x / 10.x.x.x
     MODEL            (Text, optional) default llama-3.3-70b-versatile
   =================================================================== */
const PRIVATE_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d{1,5})?$/;
 
export default {
    async fetch(req, env) {
        const origin = req.headers.get('Origin') || '';
        const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);
        const lanOk = String(env.ALLOW_LAN || 'true').toLowerCase() !== 'false' && PRIVATE_ORIGIN.test(origin);
        const ok = allowed.includes(origin) || lanOk;
 
        // Always echo the origin in CORS headers so the browser can READ our error messages.
        const cors = {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Vary': 'Origin'
        };
        const json = (obj, status) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
 
        if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
        if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);
        if (!ok) return json({ error: 'origin_not_allowed', origin, hint: 'Add this origin to ALLOWED_ORIGINS' }, 403);
        if (!env.GROQ_API_KEY) return json({ error: 'missing_key', hint: 'Set the GROQ_API_KEY secret on the Worker' }, 500);
 
        let body;
        try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }
 
        const messages = (Array.isArray(body.messages) ? body.messages : [])
            .slice(-20)
            .map(m => ({ role: String(m.role), content: String(m.content).slice(0, 6000) }));
 
        const payload = {
            model: env.MODEL || 'llama-3.3-70b-versatile',
            messages,
            temperature: Math.min(1, Number(body.temperature) || 0.6),
            max_tokens: Math.min(1000, Number(body.max_tokens) || 700),
            stream: true
        };
 
        let upstream;
        try {
            upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + env.GROQ_API_KEY },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            return json({ error: 'groq_unreachable' }, 502);
        }
 
        return new Response(upstream.body, {
            status: upstream.status,
            headers: { ...cors, 'Content-Type': upstream.headers.get('Content-Type') || 'text/event-stream', 'Cache-Control': 'no-store' }
        });
    }
};