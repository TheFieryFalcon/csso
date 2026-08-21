// ---------------------------------------------------------
// UI CONTROLLER & SCREEN ROUTER
// ---------------------------------------------------------
import { getInitialStats } from './firebase.js';
import { getGeminiApiKey, setGeminiApiKey } from './gemini.js';

export const AVAILABLE_AVATARS = ['🧮', '📐', '🎯', '⚡', '🧠', '🚀', '🔥', '💎', '👑', '🦉', '🎓', '🏆'];

export function showToast(msg, isError = false) {
    const container = document.getElementById('toast-container');
    const messageEl = document.getElementById('toast-message');
    if (!container || !messageEl) return;

    messageEl.innerHTML = `<span>${msg}</span>`;
    if (isError) {
        messageEl.className = "glass-panel px-5 py-3 rounded-xl border border-rose-500/50 bg-rose-950/80 text-xs font-bold text-rose-200 shadow-2xl flex items-center space-x-2";
    } else {
        messageEl.className = "glass-panel px-5 py-3 rounded-xl border border-indigo-500/40 bg-slate-900/90 text-xs font-bold text-white shadow-2xl flex items-center space-x-2";
    }

    container.classList.remove('translate-y-28', 'opacity-0');
    container.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        container.classList.remove('translate-y-0', 'opacity-100');
        container.classList.add('translate-y-28', 'opacity-0');
    }, 3000);
}

export function showScreen(name) {
    const screenIds = ['screen-landing', 'screen-login', 'screen-profile', 'screen-lobby', 'screen-room-waiting', 'screen-game', 'screen-results'];
    screenIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(`screen-${name}`);
    if (target) target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function getEloTier(elo) {
    if (elo >= 2000) return { title: 'Grandmaster', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    if (elo >= 1800) return { title: 'Diamond', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    if (elo >= 1600) return { title: 'Platinum', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
    if (elo >= 1400) return { title: 'Gold', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (elo >= 1200) return { title: 'Silver', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    return { title: 'Bronze', badge: 'bg-orange-900/20 text-orange-300 border-orange-700/30' };
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
    document.getElementById('profile-avatar-display').innerText = userProfile.avatar || '🧮';
    document.getElementById('profile-name-display').innerText = userProfile.displayName || 'Guest Player';
    document.getElementById('profile-email-display').innerText = userProfile.isGuest ? 'Local Offline Profile' : (currentUser?.email || 'Cloud Verified Account');
    document.getElementById('profile-elo-display').innerText = userProfile.elo || 1200;

    const tier = getEloTier(userProfile.elo || 1200);
    const badgeEl = document.getElementById('profile-tier-badge');
    badgeEl.className = `px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${tier.badge}`;
    badgeEl.innerText = tier.title;
    document.getElementById('profile-rank-title').innerText = `${tier.title} Division`;

    // Load Gemini API Key into Input
    const geminiInput = document.getElementById('input-gemini-key');
    if (geminiInput) {
        geminiInput.value = getGeminiApiKey();
    }

    // Stats
    const stats = userProfile.stats || getInitialStats();
    const totalAnswered = stats.totalAnswered || 0;
    const totalCorrect = stats.totalCorrect || 0;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    const matchesPlayed = stats.matchesPlayed || 0;
    const matchesWon = stats.matchesWon || 0;
    const matchesLost = matchesPlayed - matchesWon;
    const wlRatio = matchesLost > 0 ? (matchesWon / matchesLost).toFixed(2) : matchesWon.toFixed(2);

    document.getElementById('stat-total-answered').innerText = totalAnswered;
    document.getElementById('stat-accuracy-rate').innerText = `${accuracy}%`;
    document.getElementById('stat-matches-won').innerText = matchesWon;
    document.getElementById('stat-win-loss-ratio').innerText = wlRatio;

    // Topic Breakdown
    const topicContainer = document.getElementById('topic-mastery-container');
    topicContainer.innerHTML = '';

    const allTopics = [
        'Functions and Graphs', 'Trigonometric Functions', 'Counting and Probability',
        'Exponential Functions', 'Sequences and Series', 'Rates of Change',
        'Geometry', 'Combinatorics', 'Vectors in the Plane', 'Trigonometry (Spec)',
        'Matrices', 'Real and Complex Numbers'
    ];

    allTopics.forEach(topic => {
        const tStat = (stats.topicStats && stats.topicStats[topic]) ? stats.topicStats[topic] : { answered: 0, correct: 0 };
        const tPct = tStat.answered > 0 ? Math.round((tStat.correct / tStat.answered) * 100) : 0;

        const card = document.createElement('div');
        card.className = "glass-card p-3 rounded-xl border border-slate-800 space-y-1.5";
        card.innerHTML = `
            <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-slate-200 truncate pr-2">${topic}</span>
                <span class="font-mono text-[11px] text-indigo-400 font-bold">${tStat.correct}/${tStat.answered} (${tPct}%)</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style="width: ${tPct}%"></div>
            </div>
        `;
        topicContainer.appendChild(card);
    });
}

export function updateScoreboardUI(players, targetScore, localDisplayName) {
    const container = document.getElementById('live-progress-bars-container');
    if (!container) return;
    container.innerHTML = '';

    const sorted = Object.values(players || {}).sort((a, b) => b.score - a.score);
    sorted.forEach(p => {
        const pct = Math.min(100, Math.round((p.score / targetScore) * 100));
        const isMe = p.displayName === localDisplayName;

        const bar = document.createElement('div');
        bar.className = "space-y-1";
        bar.innerHTML = `
            <div class="flex justify-between text-xs font-semibold">
                <span class="${isMe ? 'text-indigo-400 font-bold' : 'text-slate-300'}">${p.avatar || '🧮'} ${p.displayName} ${isMe ? '(You)' : ''}</span>
                <span class="font-mono ${isMe ? 'text-indigo-400' : 'text-slate-400'}">${p.score} / ${targetScore}</span>
            </div>
            <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r ${isMe ? 'from-indigo-500 to-purple-500' : 'from-slate-600 to-slate-500'} transition-all duration-300" style="width: ${pct}%;"></div>
            </div>
        `;
        container.appendChild(bar);
    });
}

// Scratchpad Canvas Setup Helper
export function initScratchpad() {
    const canvas = document.getElementById('scratchpad-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth || 600;
        canvas.height = 180;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#818cf8';
    }

    document.getElementById('btn-toggle-scratchpad')?.addEventListener('click', () => {
        const drawer = document.getElementById('scratchpad-drawer');
        drawer.classList.toggle('hidden');
        if (!drawer.classList.contains('hidden')) {
            resizeCanvas();
        }
    });

    document.getElementById('btn-clear-canvas')?.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    });
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
        e.preventDefault();
    });
    canvas.addEventListener('touchmove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        ctx.stroke();
        e.preventDefault();
    });
    canvas.addEventListener('touchend', () => isDrawing = false);
}
