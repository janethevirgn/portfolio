/* ===================================================
   main.js  -  Lovely Jane Araya portfolio interactions
   =================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, ms = 3200) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}
window.toast = toast;

/* ---------- Preloader ---------- */
(function preloader() {
    const pre = $('#preloader'), fill = $('#boot-fill'), line = $('#boot-line');
    const msgs = ['BOOTING LOVELY.JANE.OS ...', 'LOADING TAILWIND CORE ...', 'WAKING UP CYBER-BOT ...', 'ACCESS GRANTED ✦'];
    let p = 0, i = 0;
    const tick = setInterval(() => {
        p = Math.min(100, p + 12 + Math.random() * 14);
        fill.style.width = p + '%';
        line.textContent = msgs[Math.min(msgs.length - 1, Math.floor(p / 26))];
        if (p >= 100) { clearInterval(tick); setTimeout(hide, 350); }
    }, 220);
    let hidden = false;
    function hide() { if (hidden) return; hidden = true; pre.classList.add('done'); document.body.classList.add('loaded'); }
    setTimeout(hide, 4500); // safety fallback
})();

/* ---------- Cursor glow ---------- */
const cursorGlow = $('#cursor-glow');
document.addEventListener('mousemove', e => {
    if (cursorGlow) { cursorGlow.style.left = e.clientX + 'px'; cursorGlow.style.top = e.clientY + 'px'; }
});

/* ---------- Scroll: progress bar, navbar, parallax, back-to-top ---------- */
const progress = $('#scroll-progress'), navbar = $('#navbar'), toTop = $('#to-top');
const parallaxEls = $$('[data-speed]');
function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    navbar.classList.toggle('scrolled', scrollY > 20);
    toTop.classList.toggle('show', scrollY > 600);
    if (!reduceMotion) parallaxEls.forEach(el => {
        el.style.translate = `0 ${scrollY * parseFloat(el.dataset.speed) * -1}px`;
    });
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- Mouse-reactive floating icons ---------- */
if (finePointer && !reduceMotion) {
    const icons = $$('.deco-icon');
    document.addEventListener('mousemove', e => {
        const nx = (e.clientX / innerWidth - .5), ny = (e.clientY / innerHeight - .5);
        icons.forEach(el => {
            const d = parseFloat(el.dataset.depth || 20);
            el.style.transform = `translate(${nx * d * 2}px, ${ny * d * 2}px)`;
        });
    });
}

/* ---------- Particles ---------- */
(function particles() {
    const canvas = $('#particle-canvas'), ctx = canvas.getContext('2d');
    let ps = [];
    const mouse = { x: -999, y: -999 };
    addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    addEventListener('resize', resize); resize();
    class P {
        constructor() {
            this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + .5; this.sx = (Math.random() - .5) * .5; this.sy = (Math.random() - .5) * .5;
            this.color = Math.random() > .5 ? '#00f3ff' : '#bc13fe'; this.alpha = Math.random() * .6 + .2;
        }
        update() {
            const dx = this.x - mouse.x, dy = this.y - mouse.y, d = Math.hypot(dx, dy);
            if (d < 110) { this.x += dx / d * 1.6; this.y += dy / d * 1.6; }   // particles run away from cursor
            this.x += this.sx; this.y += this.sy;
            if (this.x < 0) this.x = canvas.width; if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height; if (this.y > canvas.height) this.y = 0;
        }
        draw() { ctx.globalAlpha = this.alpha; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, 6.283); ctx.fill(); }
    }
    for (let i = 0; i < 55; i++) ps.push(new P());
    (function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ps.forEach(p => { p.update(); p.draw(); });
        // connect near particles
        ctx.globalAlpha = 1;
        for (let a = 0; a < ps.length; a++) for (let b = a + 1; b < ps.length; b++) {
            const d = Math.hypot(ps[a].x - ps[b].x, ps[a].y - ps[b].y);
            if (d < 90) { ctx.strokeStyle = `rgba(0,243,255,${.12 * (1 - d / 90)})`; ctx.beginPath(); ctx.moveTo(ps[a].x, ps[a].y); ctx.lineTo(ps[b].x, ps[b].y); ctx.stroke(); }
        }
        requestAnimationFrame(loop);
    })();
})();

/* ---------- Typing text ---------- */
(function typing() {
    const roles = ['Junior Full-Stack Web Developer', 'ProtCo Spatial System Developer', 'Network Specialist Aspirant', 'Cyberpunk & Anime Cosplayer', 'Proud Student of Mr. Jay Millena'];
    const el = $('#typing-text');
    let r = 0, c = 0, del = false;
    (function step() {
        const cur = roles[r];
        el.textContent = del ? cur.substring(0, c--) : cur.substring(0, c++);
        let delay = del ? 40 : 80;
        if (!del && c === cur.length + 1) { delay = 2000; del = true; }
        else if (del && c < 0) { del = false; r = (r + 1) % roles.length; c = 0; delay = 500; }
        setTimeout(step, delay);
    })();
})();

/* ---------- Bidirectional fade-in + counters + skill bars + timeline ---------- */
function countUp(el) {
    const target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || 0), dur = 1400, t0 = performance.now();
    (function f(now) {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (target * e).toFixed(dec);
        if (k < 1) requestAnimationFrame(f);
    })(t0);
}
const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
        const el = en.target;
        if (en.isIntersecting) {
            const d = parseInt(el.dataset.delay || 0);
            setTimeout(() => el.classList.add('visible'), d);
            if (el.classList.contains('timeline') || el.closest('.timeline')) el.closest('.timeline')?.classList.add('drawn');
            $$('[data-count]', el).forEach(n => { if (!n.dataset.done) { n.dataset.done = 1; countUp(n); } });
            $$('.skill-fill', el).forEach(f => f.style.width = f.dataset.level + '%');
        } else {
            el.classList.remove('visible');
        }
    });
}, { threshold: .15 });
$$('.fade-scroll').forEach(el => io.observe(el));
// counters outside fade blocks (hero card)
const cio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { $$('[data-count]', e.target).forEach(n => { if (!n.dataset.done) { n.dataset.done = 1; countUp(n); } }); }
}), { threshold: .3 });
$$('#hero .tilt, #capstone .glass-card').forEach(el => cio.observe(el));
const skillIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('.skill-fill', e.target).forEach(f => f.style.width = f.dataset.level + '%');
}), { threshold: .2 });
const sg = $('#skills-grid'); if (sg) skillIO.observe(sg);
const tl = $('.timeline'); if (tl) new IntersectionObserver(es => es.forEach(e => e.isIntersecting && tl.classList.add('drawn')), { threshold: .2 }).observe(tl);

/* ---------- Active nav link ---------- */
const navLinks = $$('.nav-link');
const secIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-40% 0px -55% 0px' });
$$('main section[id]').forEach(s => secIO.observe(s));

/* ---------- 3D tilt cards ---------- */
if (finePointer && !reduceMotion) {
    $$('.tilt').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
            card.classList.add('tilting');
            card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => { card.classList.remove('tilting'); card.style.transform = ''; });
    });
    // magnetic buttons
    $$('.magnetic').forEach(b => {
        b.addEventListener('mousemove', e => {
            const r = b.getBoundingClientRect();
            b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
        });
        b.addEventListener('mouseleave', () => b.style.transform = '');
    });
}

/* ---------- Ripple on buttons ---------- */
$$('.btn-shine, .filter-btn').forEach(b => b.addEventListener('click', e => {
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), d = document.createElement('span');
    d.className = 'ripple-dot'; d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
    b.style.overflow = 'hidden'; b.appendChild(d); setTimeout(() => d.remove(), 650);
}));

/* ---------- Skill filter ---------- */
const filterBtns = $$('.filter-btn'), skillCards = $$('.skill-card');
filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => { b.classList.remove('border-cyber-cyan', 'text-cyber-cyan', 'active'); b.classList.add('text-gray-400'); });
    btn.classList.add('border-cyber-cyan', 'text-cyber-cyan', 'active'); btn.classList.remove('text-gray-400');
    const f = btn.dataset.filter;
    skillCards.forEach((c, i) => {
        const show = f === 'all' || c.dataset.category === f;
        c.style.display = show ? 'flex' : 'none';
        if (show) { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = `cardPop .5s ${i * 40}ms both`; }
    });
    $$('.skill-fill').forEach(x => x.style.width = x.dataset.level + '%');
}));

/* ---------- Mobile menu ---------- */
const mBtn = $('#mobile-menu-btn'), mMenu = $('#mobile-menu');
mBtn.addEventListener('click', () => mMenu.classList.toggle('hidden'));
$$('.mobile-nav-link').forEach(l => l.addEventListener('click', () => mMenu.classList.add('hidden')));

/* ---------- Project modal ---------- */
const projectData = {
    protco: { title: 'ProtCo — AI Spatial Decision Support System', badge: 'DepEd Cawayan ES & LGU Manito Project',
        description: 'Spatial vulnerability assessment tool built with building defect detection logic, structural lifetime estimation, weather API, and emergency SMS gateway dispatching.',
        tech: ['Laravel / PHP', 'MySQL', 'Spatial GIS API', 'SMS Gateway', 'Tailwind CSS'], github: 'https://github.com/janethevirgn' },
    buildquin: { title: 'BuildQuin — Hardware Product Catalog', badge: 'Inventory & Hardware Platform',
        description: 'Hardware product management dashboard featuring instant client-side searching, inventory stock alerts, and category filtering.',
        tech: ['PHP Core', 'MySQL', 'JavaScript ES6', 'Tailwind CSS'], github: 'https://github.com/janethevirgn' },
    vetcare: { title: 'VetCare — Pet Companion Web App', badge: 'Laravel 11 Project',
        description: 'Pet wellness log application built to keep track of cat vaccination records, medical histories, deworming alerts, and daily care expenses.',
        tech: ['Laravel 11', 'Blade', 'MySQL', 'Tailwind CSS'], github: 'https://github.com/janethevirgn' },
    whisk: { title: 'Daily Whisk — Matcha Marketing Hub', badge: 'Pop-up Brand Platform',
        description: 'Digital catalog showcase designed for pop-up beverage concepts with interactive animation cards and seasonal menu displays.',
        tech: ['HTML5', 'CSS Keyframes', 'JavaScript'], github: 'https://github.com/janethevirgn' }
};
window.openModal = function (id) {
    const d = projectData[id]; if (!d) return;
    $('#modal-content').innerHTML = `
        <span class="px-3 py-1 rounded-full text-[10px] font-mono bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 mb-3 inline-block">${d.badge}</span>
        <h3 class="text-2xl font-bold text-white font-mono mb-4 pr-8">${d.title}</h3>
        <p class="text-gray-300 text-sm leading-relaxed mb-6">${d.description}</p>
        <div class="flex flex-wrap gap-2 mb-6">${d.tech.map(t => `<span class="px-2.5 py-1 rounded bg-white/10 text-xs font-mono text-cyber-cyan">${t}</span>`).join('')}</div>
        <a href="${d.github}" target="_blank" rel="noopener noreferrer" class="btn-shine px-5 py-2.5 rounded-xl bg-cyber-cyan text-black font-mono font-bold text-xs hover:bg-white transition-colors inline-flex items-center gap-2"><i class="fa-brands fa-github"></i> View GitHub Repo</a>`;
    $('#project-modal').classList.remove('hidden');
};
window.closeModal = () => $('#project-modal').classList.add('hidden');
$('#project-modal').addEventListener('click', e => { if (e.target.id === 'project-modal') closeModal(); });

/* ---------- Gallery lightbox ---------- */
(function lightbox() {
    const items = $$('.gallery-item'), lb = $('#lightbox'), img = $('#lb-img'), cap = $('#lb-cap');
    let idx = 0;
    function show(i) {
        idx = (i + items.length) % items.length;
        const it = items[idx]; img.src = $('img', it).src; cap.textContent = it.dataset.caption + `  (${idx + 1}/${items.length})`;
        const f = $('figure', lb); f.style.animation = 'none'; void f.offsetWidth; f.style.animation = '';
    }
    items.forEach((it, i) => it.addEventListener('click', () => { show(i); lb.classList.remove('hidden'); }));
    const close = () => lb.classList.add('hidden');
    $('#lb-close').onclick = close; $('#lb-prev').onclick = () => show(idx - 1); $('#lb-next').onclick = () => show(idx + 1);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
        if (lb.classList.contains('hidden')) return;
        if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
    });
})();

/* ---------- Contact ---------- */
window.copyEmail = function () {
    const email = $('#email-text').innerText, btn = $('#copy-btn-text');
    const done = () => { btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!'; setTimeout(() => btn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy', 2000); toast('📋 Email copied!'); };
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(done).catch(done); else done();
};
window.handleContactSubmit = function (e) {
    e.preventDefault();
    const n = $('#f-name').value, em = $('#f-email').value, m = $('#f-msg').value;
    const to = $('#email-text').innerText;
    location.href = `mailto:${to}?subject=${encodeURIComponent('Portfolio message from ' + n)}&body=${encodeURIComponent(m + '\n\n— ' + n + ' (' + em + ')')}`;
    toast('✉️ Opening your email app...'); confetti(80); e.target.reset();
};

/* ---------- ESC closes modals ---------- */
addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); $('#lightbox').classList.add('hidden'); } });

/* ---------- Confetti ---------- */
window.confetti = function (n = 140) {
    let c = $('#confetti');
    if (!c) { c = document.createElement('canvas'); c.id = 'confetti'; document.body.appendChild(c); }
    c.width = innerWidth; c.height = innerHeight;
    const ctx = c.getContext('2d'), cols = ['#00f3ff', '#bc13fe', '#ff9900', '#ff007f', '#ffd700'];
    const ps = Array.from({ length: n }, () => ({
        x: innerWidth / 2, y: innerHeight * .6, vx: (Math.random() - .5) * 18, vy: -Math.random() * 18 - 6,
        s: Math.random() * 7 + 3, r: Math.random() * 6, vr: (Math.random() - .5) * .4, col: cols[(Math.random() * cols.length) | 0]
    }));
    let t = 0;
    (function f() {
        ctx.clearRect(0, 0, c.width, c.height);
        ps.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); ctx.restore(); });
        if (++t < 180) requestAnimationFrame(f); else c.remove();
    })();
};

/* ---------- SURPRISES ---------- */
// 1) Click the LJ logo 5 times
(function logoSecret() {
    let clicks = 0, timer;
    $('#logo-link').addEventListener('click', () => {
        clicks++; clearTimeout(timer); timer = setTimeout(() => clicks = 0, 1500);
        if (clicks >= 5) {
            clicks = 0; document.body.classList.add('glitch'); confetti(200);
            toast('🎉 SECRET UNLOCKED: Developer Mode! Hi Mr. Millena!');
            setTimeout(() => document.body.classList.remove('glitch'), 1200);
        }
    });
})();
// 2) Double-click name = glitch
$('#hero-name').addEventListener('dblclick', () => {
    document.body.classList.add('glitch'); toast('⚡ SYSTEM GLITCH!');
    setTimeout(() => document.body.classList.remove('glitch'), 700);
});
// 3) Konami code = matrix rain
(function konami() {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let pos = 0;
    addEventListener('keydown', e => {
        pos = (e.key === code[pos] || e.key.toLowerCase() === code[pos]) ? pos + 1 : 0;
        if (pos === code.length) { pos = 0; matrix(); }
    });
})();
function matrix() {
    const c = $('#matrix-canvas'), ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const cols = Math.floor(c.width / 16), drops = Array(cols).fill(1), chars = 'ｱｲｳｴｵｶｷｸｹｺ01{}<>/=;LJ';
    toast('🟢 KONAMI! Entering the matrix...', 4000);
    const start = performance.now();
    (function f(now) {
        ctx.fillStyle = 'rgba(7,7,14,.12)'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#00f3ff'; ctx.font = '15px Fira Code, monospace';
        drops.forEach((y, i) => {
            ctx.fillText(chars[(Math.random() * chars.length) | 0], i * 16, y * 16);
            if (y * 16 > c.height && Math.random() > .975) drops[i] = 0; drops[i]++;
        });
        if (now - start < 7000) requestAnimationFrame(f);
        else { c.style.transition = 'opacity 1s'; c.style.opacity = 0; setTimeout(() => { ctx.clearRect(0, 0, c.width, c.height); c.style.opacity = 1; c.style.transition = ''; }, 1000); }
    })(start);
}
// 4) Click anywhere (not on links/buttons) -> tiny sparkle
document.addEventListener('click', e => {
    if (reduceMotion || e.target.closest('a,button,input,textarea,#cyberbot,#bot-screen,#lightbox')) return;
    for (let i = 0; i < 6; i++) {
        const s = document.createElement('span');
        s.textContent = ['✦', '✧', '+', '•'][i % 4];
        const a = Math.random() * 6.283, d = 30 + Math.random() * 40;
        s.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:99;pointer-events:none;color:${['#00f3ff', '#bc13fe', '#ff9900', '#ff007f'][i % 4]};font-size:14px;transition:all .7s cubic-bezier(.1,.8,.3,1);text-shadow:0 0 8px currentColor`;
        document.body.appendChild(s);
        requestAnimationFrame(() => { s.style.transform = `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(.3)`; s.style.opacity = 0; });
        setTimeout(() => s.remove(), 750);
    }
});

/* ---------- Character clips: hover to play a short video WITH sound ----------
   Put clips in assets/video/  (bakugo.mp4, mirko.mp4, rocklee.mp4, arshes.mp4, optimus.mp4, akaza.mp4)
   - Desktop: hover plays, mouse-leave stops.
   - Phone/tablet (no hover): tap the picture to play/stop.
   - Browsers only allow sound after the visitor has clicked/tapped/pressed a key once;
     before that the clip plays muted and a small hint is shown. */
(function characterClips() {
    const boxes = $$('.char-media');
    if (!boxes.length) return;
    let audioOK = false, current = null;
    const unlock = () => { audioOK = true; ['pointerdown', 'keydown', 'touchstart'].forEach(ev => removeEventListener(ev, unlock)); };
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, unlock, { once: false, passive: true }));

    function stop(box) {
        const v = $('.char-clip', box); if (!v) return;
        box.classList.remove('playing', 'hint');
        v.pause(); try { v.currentTime = 0; } catch (_) {}
        if (current === box) current = null;
    }
    function play(box) {
        const v = $('.char-clip', box); if (!v) return;
        if (current && current !== box) stop(current);
        if (!v.src) { v.src = v.dataset.src; v.load(); }
        v.muted = !audioOK;
        v.volume = 0.85;
        const p = v.play();
        const started = () => {
            box.classList.add('playing'); current = box;
            if (v.muted) { box.classList.add('hint'); }
        };
        if (p && p.then) p.then(started).catch(() => {
            // autoplay with sound blocked -> retry muted
            v.muted = true; v.play().then(started).catch(() => {});
        }); else started();
    }

    boxes.forEach(box => {
        const v = $('.char-clip', box); if (!v) return;
        // show the speaker badge only if the clip file really exists
        v.addEventListener('loadeddata', () => box.classList.add('has-clip'));
        v.addEventListener('error', () => { box.classList.remove('playing', 'has-clip'); });
        const hint = document.createElement('span');
        hint.className = 'clip-hint'; hint.textContent = '🔇 click anywhere for sound'; box.appendChild(hint);
        // probe quickly so the badge appears only when the clip exists
        fetch(v.dataset.src, { method: 'HEAD' }).then(r => { if (r.ok) box.classList.add('has-clip'); }).catch(() => {});

        if (finePointer) {
            const card = box.closest('.tilt') || box;
            card.addEventListener('mouseenter', () => play(box));
            card.addEventListener('mouseleave', () => stop(box));
        } else {
            box.addEventListener('click', () => box.classList.contains('playing') ? stop(box) : play(box));
        }
    });
    // stop clips when the tab is hidden
    document.addEventListener('visibilitychange', () => { if (document.hidden && current) stop(current); });
})();
