/* ===================================================
   cyberbot.js  -  cute roaming cyber-bot companion
   - roams around the viewport
   - follows scroll direction (down -> goes lower, up -> goes higher)
   - comments on the section you are viewing
   - click: magic burst + slow cyberpunk screen popup (video slot)
   =================================================== */
(() => {
    const bot = document.getElementById('cyberbot');
    if (!bot) return;
    const inner = bot.querySelector('.bot-inner');
    const bubble = document.getElementById('bot-bubble');
    const pupils = bot.querySelector('.bot-pupils');
    const screen = document.getElementById('bot-screen');
    const bootLog = document.getElementById('boot-log');
    const video = document.getElementById('bot-video');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const W = 96, H = 112;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const rand = (a, b) => a + Math.random() * (b - a);
    const bounds = () => ({ minX: 10, maxX: Math.max(20, innerWidth - W - 10), minY: 80, maxY: Math.max(140, innerHeight - H - 14) });

    let x = innerWidth - W - 40, y = innerHeight * .55;
    let tx = x, ty = y, vx = 0, facing = 1;
    let mode = 'roam';            // roam | follow | cast | still
    let scrollDir = 0, lastScroll = scrollY, scrollTimer = null, nextRoam = 0;
    const mouse = { x: innerWidth / 2, y: innerHeight / 2 };

    /* ---------- speech bubble ---------- */
    let bubbleTimer, lastSay = 0;
    function say(text, ms = 3200) {
        const now = performance.now();
        if (now - lastSay < 1500 && ms < 3200) return;
        lastSay = now;
        bubble.textContent = text;
        // keep bubble inside screen
        const cx = x + W / 2, half = 90;
        bubble.style.setProperty('--bx', clamp(cx, half + 8, innerWidth - half - 8) - cx + 'px');
        bubble.classList.add('show');
        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
    }

    /* ---------- roaming ---------- */
    function pickRoam() {
        const b = bounds();
        tx = rand(b.minX, b.maxX); ty = rand(b.minY + 20, b.maxY);
        nextRoam = performance.now() + rand(2800, 5200);
    }
    pickRoam();

    /* ---------- follow scroll direction ---------- */
    addEventListener('scroll', () => {
        if (mode === 'cast' || mode === 'still') return;
        const dy = scrollY - lastScroll; lastScroll = scrollY;
        if (Math.abs(dy) < 1) return;
        const dir = dy > 0 ? 1 : -1;
        const b = bounds();
        if (mode !== 'follow' || dir !== scrollDir) {
            scrollDir = dir; mode = 'follow';
            ty = dir > 0 ? b.minY + (b.maxY - b.minY) * .82 : b.minY + (b.maxY - b.minY) * .12;
            tx = clamp(x + rand(-70, 70), b.minX, b.maxX);
            if (!reduce) bot.classList.add('boost');
        }
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            if (mode === 'follow') { mode = 'roam'; scrollDir = 0; bot.classList.remove('boost'); pickRoam(); }
        }, 650);
    }, { passive: true });

    addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    addEventListener('resize', () => { const b = bounds(); x = clamp(x, b.minX, b.maxX); y = clamp(y, b.minY, b.maxY); pickRoam(); });

    /* ---------- animation loop ---------- */
    function frame(now) {
        if (mode === 'roam' && now > nextRoam && !reduce) pickRoam();
        if (mode !== 'still') {
            const k = mode === 'follow' ? .09 : mode === 'cast' ? .1 : .022;
            const px = x;
            x += (tx - x) * k; y += (ty - y) * k;
            vx = x - px;
        } else vx = 0;

        const bob = reduce ? 0 : Math.sin(now / 450) * 6;
        if (Math.abs(vx) > .3) facing = vx > 0 ? 1 : -1;
        const tilt = clamp(vx * 3, -16, 16) + (mode === 'follow' ? scrollDir * 7 : 0);

        bot.style.transform = `translate3d(${x.toFixed(1)}px,${(y + bob).toFixed(1)}px,0)`;
        inner.style.transform = `scaleX(${facing}) rotate(${(tilt * facing).toFixed(1)}deg)`;

        // eyes follow cursor (or look in scroll direction)
        let dx = mouse.x - (x + W / 2), dy = mouse.y - (y + H / 2);
        if (mode === 'follow') { dx = 0; dy = scrollDir * 80; }
        const d = Math.hypot(dx, dy) || 1;
        pupils.style.transform = `translate(${(dx / d) * 3 * facing}px, ${(dy / d) * 2.5}px)`;

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    /* ---------- comments on sections ---------- */
    const tips = {
        hero: 'Hi! I\'m Cyber-Bot ✦ Click me!',
        about: 'Jane\'s IT journey... grit over talent!',
        hobbies: 'Anime shrine! Rock Lee approves',
        gallery: 'Click a photo to open the viewer',
        skills: 'Try the filter buttons!',
        capstone: 'ProtCo is the flagship project',
        projects: 'Hover the cards, they tilt!',
        mentor: 'Jane\'s proud of Mr. Millena',
        contact: 'Say hello to Jane!'
    };
    let currentSection = '';
    const sio = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting && e.target.id !== currentSection) {
            currentSection = e.target.id;
            if (tips[currentSection] && mode !== 'cast') setTimeout(() => say(tips[currentSection]), 500);
        }
    }), { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(s => sio.observe(s));

    const idleLines = ['Psst... try the Konami code ↑↑↓↓←→←→BA', 'Click the LJ logo 3 times 👀', 'Double-click her name!', 'Beep boop ♥', 'Click me for a surprise!'];
    setInterval(() => { if (mode === 'roam' && !bubble.classList.contains('show')) say(idleLines[(Math.random() * idleLines.length) | 0], 2800); }, 14000);
    setTimeout(() => say('Hi! I\'m Cyber-Bot ✦ Click me!', 4000), 3500);

    /* ---------- magic on click ---------- */
    function magicBurst() {
        const layer = document.createElement('div');
        layer.className = 'magic-layer';
        layer.style.left = x + W / 2 + 'px'; layer.style.top = y + H / 2 + 'px';
        ['', 'r2', 'r3'].forEach(c => { const r = document.createElement('div'); r.className = 'magic-ring ' + c; layer.appendChild(r); });
        const cols = ['#00f3ff', '#bc13fe', '#ff9900', '#ff007f', '#ffd700'], shapes = ['✦', '✧', '★', '✺', '♥', '+'];
        for (let i = 0; i < 34; i++) {
            const s = document.createElement('span'); s.className = 'spark';
            const a = (i / 34) * 6.283 + Math.random() * .4, dist = 90 + Math.random() * 190;
            s.textContent = shapes[i % shapes.length]; s.style.color = cols[i % cols.length];
            s.style.fontSize = 10 + Math.random() * 14 + 'px';
            s.style.setProperty('--dx', Math.cos(a) * dist + 'px'); s.style.setProperty('--dy', Math.sin(a) * dist + 'px');
            s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
            layer.appendChild(s);
        }
        document.body.appendChild(layer);
        setTimeout(() => layer.remove(), 1500);
    }

    const lines = [
        '> INITIALIZING CYBER-BOT v1.0 ...',
        '> SCANNING PORTFOLIO .......... OK',
        '> USER: Lovely Jane Araya  [BSIT-3E]',
        '> MENTOR: Mr. Jay Millena',
        '> ROLE: Software Engineering Professor',
        '> STATUS: Naghihingalo na sa kaka-code haha!',
        '> PLAYING TRANSMISSION ...'
    ];
    let typeToken = 0;
    function typeLog() {
        const token = ++typeToken; bootLog.textContent = '';
        let li = 0, ci = 0;
        (function step() {
            if (token !== typeToken || li >= lines.length) return;
            bootLog.textContent += lines[li][ci++];
            if (ci >= lines[li].length) { bootLog.textContent += '\n'; li++; ci = 0; setTimeout(step, 260); }
            else setTimeout(step, 22);
        })();
    }

    function openScreen() {
        screen.classList.add('open'); screen.setAttribute('aria-hidden', 'false');
        setTimeout(typeLog, 900);
        if (video) { const p = video.play(); if (p && p.catch) p.catch(() => {}); }
    }
    function closeScreen() {
        if (!screen.classList.contains('open')) return;
        typeToken++; screen.classList.remove('open'); screen.setAttribute('aria-hidden', 'true');
        if (video) video.pause();
        bot.classList.remove('casting'); mode = 'roam'; pickRoam();
        say('Thanks for visiting! ♥', 2500);
        if (window.confetti) window.confetti(70);
    }
    if (video) {
        video.addEventListener('playing', () => video.classList.add('ready'));
        video.addEventListener('error', () => video.classList.remove('ready'));
    }

    function cast() {
        if (mode === 'cast' || screen.classList.contains('open')) return;
        mode = 'cast'; bot.classList.remove('boost'); bot.classList.add('casting');
        const b = bounds();
        tx = clamp(innerWidth / 2 - W / 2, b.minX, b.maxX); ty = clamp(innerHeight / 2 - H / 2, b.minY, b.maxY);
        say('✨ Casting cyber-magic...', 1200);
        setTimeout(magicBurst, 650);
        setTimeout(openScreen, 1100);
    }
    bot.addEventListener('click', cast);
    bot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cast(); } });
    document.getElementById('bot-screen-close').addEventListener('click', closeScreen);
    screen.addEventListener('click', e => { if (e.target === screen) closeScreen(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') closeScreen(); });
})();
