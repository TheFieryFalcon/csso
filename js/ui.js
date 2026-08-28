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
        <span class="${isError ? 'text-rose-400' : 'text-emerald-400'} font-bold">${isError ? '⚠️' : '✨'}</span>
        <span class="text-xs text-slate-100">${message}</span>
    `;

    container.classList.remove('translate-y-28', 'opacity-0');
    container.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        container.classList.remove('translate-y-0', 'opacity-100');
        container.classList.add('translate-y-28', 'opacity-0');
    }, 2800);
}

export function updateNavbarProfileBadge(userProfile) {
    const avatarEl = document.getElementById('nav-user-avatar');
    const nameEl = document.getElementById('nav-user-name');
    const eloEl = document.getElementById('nav-user-elo');
    if (avatarEl) avatarEl.innerText = userProfile.avatar || '🧮';
    if (nameEl) nameEl.innerText = userProfile.displayName || 'Player';
    if (eloEl) eloEl.innerText = userProfile.elo || 1200;
}

export function renderProfileDashboard(userProfile, currentUser) {
    const avatarDisplay = document.getElementById('profile-avatar-display');
    const nameDisplay = document.getElementById('profile-name-display');
    const emailDisplay = document.getElementById('profile-email-display');
    const eloDisplay = document.getElementById('profile-elo-display');
    const tierBadge = document.getElementById('profile-tier-badge');
    const rankTitle = document.getElementById('profile-rank-title');

    if (avatarDisplay) avatarDisplay.innerText = userProfile.avatar || '🧮';
    if (nameDisplay) nameDisplay.innerText = userProfile.displayName || 'Mathlete';
    if (emailDisplay) emailDisplay.innerText = (currentUser && !currentUser.isGuest) ? (currentUser.email || 'Cloud Account') : 'Local Guest Account';
    if (eloDisplay) eloDisplay.innerText = userProfile.elo || 1200;

    const elo = userProfile.elo || 1200;
    let tier = 'Bronze';
    let title = 'Apprentice';
    let tierClass = 'bg-amber-700/20 text-amber-300 border-amber-700/30';

    if (elo >= 1600) {
        tier = 'Grandmaster';
        title = 'WACE Legend';
        tierClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    } else if (elo >= 1400) {
        tier = 'Diamond';
        title = 'Specialist Prodigy';
        tierClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    } else if (elo >= 1300) {
        tier = 'Gold';
        title = 'Methods Master';
        tierClass = 'bg-amber-400/20 text-amber-300 border-amber-400/30';
    } else if (elo >= 1200) {
        tier = 'Silver';
        title = 'Mathlete';
        tierClass = 'bg-slate-400/20 text-slate-300 border-slate-400/30';
    }

    if (tierBadge) {
        tierBadge.innerText = tier;
        tierBadge.className = `px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${tierClass}`;
    }
    if (rankTitle) rankTitle.innerText = title;

    const stats = userProfile.stats || {};
    const totalAns = stats.totalAnswered || 0;
    const totalCorr = stats.totalCorrect || 0;
    const pct = totalAns > 0 ? Math.round((totalCorr / totalAns) * 100) : 0;
    const won = stats.matchesWon || 0;
    const played = stats.matchesPlayed || 0;
    const lost = Math.max(0, played - won);
    const wlRatio = lost > 0 ? (won / lost).toFixed(2) : won.toFixed(2);

    const statAns = document.getElementById('stat-total-answered');
    const statAcc = document.getElementById('stat-accuracy-rate');
    const statWon = document.getElementById('stat-matches-won');
    const statWl = document.getElementById('stat-win-loss-ratio');

    if (statAns) statAns.innerText = totalAns;
    if (statAcc) statAcc.innerText = `${pct}%`;
    if (statWon) statWon.innerText = won;
    if (statWl) statWl.innerText = wlRatio;

    // Render topic mastery
    const topicContainer = document.getElementById('topic-mastery-container');
    if (topicContainer) {
        topicContainer.innerHTML = '';
        const topicStats = stats.topicStats || {};
        const topics = [
            'Functions and Graphs', 'Trigonometric Functions', 'Counting and Probability',
            'Exponential Functions', 'Sequences and Series', 'Rates of Change',
            'Geometry', 'Combinatorics', 'Vectors in the Plane', 'Trigonometry (Spec)',
            'Matrices', 'Real and Complex Numbers'
        ];

        topics.forEach(t => {
            const data = topicStats[t] || { answered: 0, correct: 0 };
            const topicPct = data.answered > 0 ? Math.round((data.correct / data.answered) * 100) : 0;

            const item = document.createElement('div');
            item.className = "p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5";
            item.innerHTML = `
                <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-slate-200">${t}</span>
                    <span class="font-mono text-indigo-400 font-bold">${topicPct}% (${data.correct}/${data.answered})</span>
                </div>
                <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style="width: ${topicPct}%;"></div>
                </div>
            `;
            topicContainer.appendChild(item);
        });
    }
}

// ---------------------------------------------------------
// DUAL-MODE SCRATCHPAD (FREEHAND CANVAS + LATEX TYPER)
// ---------------------------------------------------------
export function initScratchpad() {
    const toggleBtn = document.getElementById('btn-toggle-scratchpad');
    const drawer = document.getElementById('scratchpad-drawer');
    const canvas = document.getElementById('scratchpad-canvas');
    const clearBtn = document.getElementById('btn-clear-canvas');

    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener('click', () => {
        drawer.classList.toggle('hidden');
        if (!drawer.classList.contains('hidden')) {
            resizeCanvas();
        }
    });

    // Tab switcher between Drawing Canvas and LaTeX Typer
    const tabDraw = document.getElementById('scratchpad-tab-draw');
    const tabLatex = document.getElementById('scratchpad-tab-latex');
    const viewDraw = document.getElementById('scratchpad-view-draw');
    const viewLatex = document.getElementById('scratchpad-view-latex');

    if (tabDraw && tabLatex && viewDraw && viewLatex) {
        tabDraw.addEventListener('click', () => {
            tabDraw.className = "px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white";
            tabLatex.className = "px-3 py-1 rounded-lg text-xs font-bold glass-button text-slate-400 hover:text-white";
            viewDraw.classList.remove('hidden');
            viewLatex.classList.add('hidden');
            resizeCanvas();
        });

        tabLatex.addEventListener('click', () => {
            tabLatex.className = "px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white";
            tabDraw.className = "px-3 py-1 rounded-lg text-xs font-bold glass-button text-slate-400 hover:text-white";
            viewLatex.classList.remove('hidden');
            viewDraw.classList.add('hidden');
        });
    }

    // LaTeX Typer Live MathJax Preview & Symbol Buttons
    const latexInput = document.getElementById('scratchpad-latex-input');
    const latexPreview = document.getElementById('scratchpad-latex-preview');

    function updateLatexPreview() {
        if (!latexInput || !latexPreview) return;
        const val = latexInput.value.trim();
        if (!val) {
            latexPreview.innerHTML = `<span class="text-xs text-slate-500 italic">Live rendered LaTeX math appears here...</span>`;
            return;
        }
        latexPreview.innerHTML = `\\[${val}\\]`;
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([latexPreview]).catch(err => console.warn(err));
        }
    }

    if (latexInput) {
        latexInput.addEventListener('input', updateLatexPreview);
    }

    // Quick symbol toolbar buttons
    document.querySelectorAll('.scratch-sym-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!latexInput) return;
            const snippet = btn.getAttribute('data-latex') || '';
            const start = latexInput.selectionStart;
            const end = latexInput.selectionEnd;
            const text = latexInput.value;
            latexInput.value = text.substring(0, start) + snippet + text.substring(end);
            latexInput.focus();
            latexInput.selectionStart = latexInput.selectionEnd = start + snippet.length;
            updateLatexPreview();
        });
    });

    const clearLatexBtn = document.getElementById('btn-clear-latex');
    if (clearLatexBtn && latexInput) {
        clearLatexBtn.addEventListener('click', () => {
            latexInput.value = '';
            updateLatexPreview();
        });
    }

    // Canvas drawing logic
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        function resizeCanvas() {
            canvas.width = canvas.parentElement.clientWidth || 600;
            canvas.height = 180;
            ctx.strokeStyle = '#818cf8';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }

        window.addEventListener('resize', resizeCanvas);

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        });

        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseleave', () => isDrawing = false);

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            ctx.beginPath();
            ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
            ctx.stroke();
        });

        canvas.addEventListener('touchend', () => isDrawing = false);

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        }
    }
}
