// ---------------------------------------------------------
// UI ROUTING, PROFILE DASHBOARD & DUAL-MODE SCRATCHPAD
// ---------------------------------------------------------
export const AVAILABLE_AVATARS = ['🧮', '📐', '🧠', '⚡', '🚀', '🔥', '🧙‍♂️', '🏆', '🎯', '🦉', '🎓', '👑'];

export function showScreen(screenId) {
    const screens = ['landing', 'login', 'profile', 'lobby', 'room-waiting', 'game', 'results'];
    screens.forEach(s => {
        const el = document.getElementById(`screen-${s}`);
        if (el) {
            if (s === screenId) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    const msgEl = document.getElementById('toast-message');
    if (!container || !msgEl) return;

    msgEl.innerHTML = `
        <span class="${isError ? 'text-rose-400' : 'text-emerald-400'} font-medium">${isError ? '●' : '●'}</span>
        <span class="text-xs text-slate-200">${message}</span>
    `;

    container.classList.remove('translate-y-28', 'opacity-0');
    container.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        container.classList.remove('translate-y-0', 'opacity-100');
        container.classList.add('translate-y-28', 'opacity-0');
    }, 2500);
}

export function updateNavbarProfileBadge(userProfile) {
    const avatarEl = document.getElementById('nav-user-avatar');
    const nameEl = document.getElementById('nav-user-name');
    const eloEl = document.getElementById('nav-user-elo');
    if (avatarEl) avatarEl.innerText = userProfile.avatar || '🧮';
    if (nameEl) nameEl.innerText = userProfile.displayName || 'Account';
    if (eloEl) eloEl.innerText = userProfile.elo || 1200;
}

export function renderProfileDashboard(userProfile, currentUser) {
    const avatarDisplay = document.getElementById('profile-avatar-display');
    const nameDisplay = document.getElementById('profile-name-display');
    const emailDisplay = document.getElementById('profile-email-display');
    const eloDisplay = document.getElementById('profile-elo-display');
    const tierBadge = document.getElementById('profile-tier-badge');

    if (avatarDisplay) avatarDisplay.innerText = userProfile.avatar || '🧮';
    if (nameDisplay) nameDisplay.innerText = userProfile.displayName || 'Player';
    if (emailDisplay) emailDisplay.innerText = currentUser?.email || 'Cloud Account';
    if (eloDisplay) eloDisplay.innerText = userProfile.elo || 1200;

    const elo = userProfile.elo || 1200;
    let tier = 'Standard';
    let tierClass = 'bg-slate-800 text-slate-300 border-slate-700';

    if (elo >= 1500) {
        tier = 'Advanced';
        tierClass = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
    } else if (elo >= 1350) {
        tier = 'Proficient';
        tierClass = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    } else if (elo >= 1200) {
        tier = 'Intermediate';
        tierClass = 'bg-slate-800 text-slate-300 border-slate-700';
    }

    if (tierBadge) {
        tierBadge.innerText = tier;
        tierBadge.className = `px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${tierClass}`;
    }

    const stats = userProfile.stats || {};
    const totalAns = stats.totalAnswered || 0;
    const totalCorr = stats.totalCorrect || 0;
    const pct = totalAns > 0 ? Math.round((totalCorr / totalAns) * 100) : 0;
    const won = stats.matchesWon || 0;

    const statAns = document.getElementById('stat-total-answered');
    const statAcc = document.getElementById('stat-accuracy-rate');
    const statWon = document.getElementById('stat-matches-won');
    const statElo = document.getElementById('stat-win-loss-ratio');

    if (statAns) statAns.innerText = totalAns;
    if (statAcc) statAcc.innerText = `${pct}%`;
    if (statWon) statWon.innerText = won;
    if (statElo) statElo.innerText = elo;

    renderTopicMastery(stats.topicStats || {});
}

function renderTopicMastery(topicStats) {
    const container = document.getElementById('topic-mastery-container');
    if (!container) return;
    container.innerHTML = '';

    const topics = [
        'Functions and Graphs', 'Trigonometric Functions', 'Counting and Probability',
        'Exponential Functions', 'Sequences and Series', 'Rates of Change',
        'Geometry', 'Combinatorics', 'Vectors in the Plane',
        'Trigonometry (Spec)', 'Matrices', 'Real and Complex Numbers'
    ];

    topics.forEach(topic => {
        const item = topicStats[topic] || { answered: 0, correct: 0 };
        const pct = item.answered > 0 ? Math.round((item.correct / item.answered) * 100) : 0;

        const card = document.createElement('div');
        card.className = "p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5";
        card.innerHTML = `
            <div class="flex justify-between items-center text-xs">
                <span class="font-medium text-slate-200">${topic}</span>
                <span class="font-mono text-slate-400 text-[11px]">${item.correct}/${item.answered} (${pct}%)</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-500 transition-all duration-300" style="width: ${pct}%;"></div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ---------------------------------------------------------
// DUAL-MODE SCRATCHPAD INITIALIZER
// ---------------------------------------------------------
export function initScratchpad() {
    const drawer = document.getElementById('scratchpad-drawer');
    const toggleBtn = document.getElementById('btn-toggle-scratchpad');
    const tabDraw = document.getElementById('scratchpad-tab-draw');
    const tabLatex = document.getElementById('scratchpad-tab-latex');
    const viewDraw = document.getElementById('scratchpad-view-draw');
    const viewLatex = document.getElementById('scratchpad-view-latex');

    if (toggleBtn && drawer) {
        toggleBtn.addEventListener('click', () => {
            drawer.classList.toggle('hidden');
            if (!drawer.classList.contains('hidden') && viewDraw && !viewDraw.classList.contains('hidden')) {
                resizeCanvas();
            }
        });
    }

    if (tabDraw && tabLatex && viewDraw && viewLatex) {
        tabDraw.addEventListener('click', () => {
            tabDraw.className = "px-3 py-1 rounded-md text-xs font-medium bg-indigo-600 text-white";
            tabLatex.className = "px-3 py-1 rounded-md text-xs font-medium glass-button text-slate-400 hover:text-white";
            viewDraw.classList.remove('hidden');
            viewLatex.classList.add('hidden');
            resizeCanvas();
        });

        tabLatex.addEventListener('click', () => {
            tabLatex.className = "px-3 py-1 rounded-md text-xs font-medium bg-indigo-600 text-white";
            tabDraw.className = "px-3 py-1 rounded-md text-xs font-medium glass-button text-slate-400 hover:text-white";
            viewLatex.classList.remove('hidden');
            viewDraw.classList.add('hidden');
        });
    }

    initCanvas();
    initLatexTyper();
}

function initCanvas() {
    const canvas = document.getElementById('scratchpad-canvas');
    const clearBtn = document.getElementById('btn-clear-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            canvas.width = rect.width;
            canvas.height = rect.height;
            ctx.strokeStyle = '#a5b4fc';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }

    window.addEventListener('resize', resize);
    setTimeout(resize, 100);

    function start(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        lastX = clientX - rect.left;
        lastY = clientY - rect.top;
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastX = x;
        lastY = y;
    }

    function stop() {
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('mouseleave', stop);

    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stop);

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }
}

function resizeCanvas() {
    const canvas = document.getElementById('scratchpad-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
        const temp = document.createElement('canvas');
        temp.width = canvas.width;
        temp.height = canvas.height;
        const tempCtx = temp.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.drawImage(temp, 0, 0);
        ctx.strokeStyle = '#a5b4fc';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
}

function initLatexTyper() {
    const input = document.getElementById('scratchpad-latex-input');
    const preview = document.getElementById('scratchpad-latex-preview');
    const clearBtn = document.getElementById('btn-clear-latex');

    if (!input || !preview) return;

    function renderPreview() {
        const text = input.value.trim();
        if (!text) {
            preview.innerHTML = `<span class="text-slate-500 italic text-xs">Rendered math preview appears here...</span>`;
            return;
        }
        preview.innerHTML = `$$${text}$$`;
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([preview]).catch(() => {});
        }
    }

    input.addEventListener('input', renderPreview);

    document.querySelectorAll('.scratch-sym-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sym = btn.dataset.latex || '';
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.value = input.value.substring(0, start) + sym + input.value.substring(end);
            input.focus();
            input.selectionStart = input.selectionEnd = start + sym.length;
            renderPreview();
        });
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            renderPreview();
        });
    }
}
