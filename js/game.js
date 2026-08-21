// ---------------------------------------------------------
// GAME MATCH ENGINE & HOST-DELEGATED PROOF STEP VALIDATION
// ---------------------------------------------------------
import { questionDB } from './questions/questionDB.js';
import { updateRoomInDB, saveLocalProfile, getInitialStats, submitProofQueryToRoom, getRoomFromDB } from './firebase.js';
import { evaluateProofStepWithGemini, fallbackLocalProofEvaluator } from './gemini.js';
import { showToast, showScreen, updateScoreboardUI } from './ui.js';

export class GameEngine {
    constructor(state) {
        this.state = state;
        this.matchQuestions = [];
        this.currentQuestionIndex = 0;
        this.currentMultiStepIndex = 0;
        this.wrongAttemptsOnCurrentQuestion = 0;
        this.localScore = 0;
        this.targetScore = 10;
        this.isAnswerCooldown = false;
        this.isAwaitingHostEvaluation = false;
    }

    startMatch({ questions, targetScore, roomId, isSolo = false }) {
        this.matchQuestions = questions || questionDB.generateMatchSet(null, 50);
        this.currentQuestionIndex = 0;
        this.currentMultiStepIndex = 0;
        this.wrongAttemptsOnCurrentQuestion = 0;
        this.localScore = 0;
        this.targetScore = targetScore || 10;
        this.isAnswerCooldown = false;
        this.isAwaitingHostEvaluation = false;
        this.isSolo = isSolo;

        document.getElementById('game-room-indicator').innerText = isSolo ? "Solo Practice Mode" : `Room #${roomId}`;
        document.getElementById('game-target-indicator').innerText = `Goal: ${this.targetScore} pts`;

        showScreen('game');
        this.renderQuestion();
    }

    renderQuestion() {
        if (this.currentQuestionIndex >= this.matchQuestions.length) {
            this.currentQuestionIndex = 0;
        }
        const q = this.matchQuestions[this.currentQuestionIndex];
        if (!q) return;

        document.getElementById('game-topic-badge').innerText = q.topic || 'WACE Math';
        document.getElementById('game-local-score').innerText = this.localScore;

        const questionTextEl = document.getElementById('game-question-text');
        const visualContainer = document.getElementById('game-visual-container');
        const optionsGrid = document.getElementById('game-options-grid');
        const shortAnsContainer = document.getElementById('game-short-answer-container');
        const multistepContainer = document.getElementById('multistep-progress-container');
        const aiBadge = document.getElementById('game-ai-eval-badge');

        visualContainer.innerHTML = q.visual || '';

        // Show AI Evaluation Active Indicator if proof step
        if (aiBadge) {
            if (q.isProof) {
                aiBadge.classList.remove('hidden');
                aiBadge.innerText = this.isSolo ? "\u2728 Gemini AI Evaluated" : "\u2728 Host AI Evaluated";
            } else {
                aiBadge.classList.add('hidden');
            }
        }

        if (q.type === 'multi_step' && q.steps && q.steps.length > 0) {
            if (!q.steps[this.currentMultiStepIndex]) {
                this.currentMultiStepIndex = 0;
            }
            multistepContainer.classList.remove('hidden');
            const activeStep = q.steps[this.currentMultiStepIndex];
            document.getElementById('multistep-step-label').innerText = `Step ${this.currentMultiStepIndex + 1} of ${q.steps.length}${q.isProof ? ' (Rigorous Proof Step)' : ''}`;
            
            const pct = Math.round(((this.currentMultiStepIndex + 1) / q.steps.length) * 100);
            document.getElementById('multistep-pct-label').innerText = `${pct}% Completed`;
            document.getElementById('multistep-progress-fill').style.width = `${pct}%`;

            questionTextEl.innerHTML = `<span class="text-sm block text-indigo-400 mb-1 font-semibold">${q.text}</span> ${activeStep.prompt}`;
            this.renderInputsForStep(activeStep);
        } else {
            this.currentMultiStepIndex = 0;
            multistepContainer.classList.add('hidden');
            questionTextEl.innerHTML = q.text;

            if (q.type === 'short_answer') {
                optionsGrid.innerHTML = '';
                optionsGrid.classList.add('hidden');
                shortAnsContainer.classList.remove('hidden');
                const input = document.getElementById('short-answer-input');
                input.value = '';
                input.placeholder = "Type exact answer (e.g. 5, -2/3, 4pi)...";
                input.focus();
            } else {
                shortAnsContainer.classList.add('hidden');
                optionsGrid.classList.remove('hidden');
                this.renderMCQOptions(q.options, q.ansIndex);
            }
        }

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([questionTextEl, optionsGrid, visualContainer]).catch(err => console.warn(err));
        }
    }

    renderInputsForStep(step) {
        const optionsGrid = document.getElementById('game-options-grid');
        const shortAnsContainer = document.getElementById('game-short-answer-container');

        if (step.type === 'short_answer') {
            optionsGrid.innerHTML = '';
            optionsGrid.classList.add('hidden');
            shortAnsContainer.classList.remove('hidden');
            const input = document.getElementById('short-answer-input');
            input.value = '';
            input.placeholder = step.placeholder || "Enter algebraic expression or value (e.g. 2cos^2(x), 4)...";
            input.focus();
        } else {
            shortAnsContainer.classList.add('hidden');
            optionsGrid.classList.remove('hidden');
            this.renderMCQOptions(step.options, step.ansIndex);
        }
    }

    renderMCQOptions(options, ansIndex) {
        const grid = document.getElementById('game-options-grid');
        grid.innerHTML = '';

        (options || []).forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = "w-full p-4 rounded-xl glass-button text-left font-semibold text-slate-100 hover:border-indigo-500/80 hover:bg-slate-800/80 transition flex items-center justify-between text-sm group";
            btn.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="w-6 h-6 rounded-lg bg-slate-800 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white flex items-center justify-center text-xs font-bold font-mono transition">
                        ${String.fromCharCode(65 + idx)}
                    </span>
                    <span class="mcq-option-text block leading-relaxed">${opt}</span>
                </div>
            `;
            btn.onclick = () => this.handleSubmission(idx === ansIndex, btn);
            grid.appendChild(btn);
        });
    }

    async submitShortAnswer() {
        if (this.isAwaitingHostEvaluation || this.isAnswerCooldown) return;

        const inputVal = document.getElementById('short-answer-input').value;
        const q = this.matchQuestions[this.currentQuestionIndex];
        if (!q) return;

        let targetAnswers = [];
        let promptText = q.text;
        let expectedGuidelines = q.expectedAnswerGuidelines || '';
        let isProof = Boolean(q.isProof);

        if (q.type === 'multi_step' && q.steps && q.steps[this.currentMultiStepIndex]) {
            const activeStep = q.steps[this.currentMultiStepIndex];
            targetAnswers = activeStep.acceptableAnswers || [];
            promptText = activeStep.prompt;
            expectedGuidelines = activeStep.expectedAnswerGuidelines || expectedGuidelines;
        } else {
            targetAnswers = q.acceptableAnswers || [];
        }

        const submitBtn = document.getElementById('btn-submit-short-ans');

        // Check if Gemini evaluation should be called for open-ended proofs
        let isCorrect = false;
        let customFeedback = '';

        if (isProof) {
            const isHost = this.state.roomData?.hostUid === this.state.currentUser?.uid;

            if (this.isSolo || isHost) {
                // Evaluate directly on host/solo client
                const evalResult = await evaluateProofStepWithGemini({
                    problemContext: q.text,
                    stepPrompt: promptText,
                    studentAnswer: inputVal,
                    expectedAnswerGuidelines: expectedGuidelines,
                    acceptableAnswers: targetAnswers
                });
                isCorrect = evalResult.isCorrect;
                customFeedback = evalResult.feedback;
            } else {
                // Delegate to room host
                this.isAwaitingHostEvaluation = true;
                if (submitBtn) {
                    submitBtn.innerText = "Verifying with Host AI...";
                    submitBtn.classList.add('opacity-75', 'pointer-events-none');
                }

                try {
                    const queryId = await submitProofQueryToRoom(this.state.currentRoomId, {
                        playerId: this.state.currentUser.uid,
                        problemContext: q.text,
                        stepPrompt: promptText,
                        studentAnswer: inputVal,
                        expectedAnswerGuidelines: expectedGuidelines,
                        acceptableAnswers: targetAnswers
                    });

                    // Wait for host to resolve query
                    const result = await this.pollForQueryResolution(this.state.currentRoomId, queryId);
                    isCorrect = result.isCorrect;
                    customFeedback = result.feedback;
                } catch (e) {
                    console.warn("Host proof delegation timed out/failed, using local fallback:", e);
                    const fallback = fallbackLocalProofEvaluator(inputVal, targetAnswers);
                    isCorrect = fallback.isCorrect;
                    customFeedback = fallback.feedback;
                } finally {
                    this.isAwaitingHostEvaluation = false;
                    if (submitBtn) {
                        submitBtn.innerText = "Submit";
                        submitBtn.classList.remove('opacity-75', 'pointer-events-none');
                    }
                }
            }
        } else {
            isCorrect = this.isAnswerMatching(inputVal, targetAnswers);
        }

        this.handleSubmission(isCorrect, submitBtn, customFeedback);
    }

    pollForQueryResolution(roomId, queryId, timeoutMs = 8000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = setInterval(async () => {
                if (Date.now() - startTime > timeoutMs) {
                    clearInterval(interval);
                    reject(new Error("Host resolution timeout"));
                    return;
                }
                const room = await getRoomFromDB(roomId);
                const query = room?.pendingQueries?.[queryId];
                if (query && query.status === 'resolved' && query.result) {
                    clearInterval(interval);
                    resolve(query.result);
                }
            }, 300);
        });
    }

    async handleSubmission(isCorrect, sourceElement, feedbackMsg = '') {
        if (this.isAnswerCooldown) return;
        this.isAnswerCooldown = true;

        const q = this.matchQuestions[this.currentQuestionIndex];
        if (!q) {
            this.isAnswerCooldown = false;
            return;
        }

        const userProfile = this.state.userProfile;
        if (!userProfile.stats) userProfile.stats = getInitialStats();
        userProfile.stats.totalAnswered = (userProfile.stats.totalAnswered || 0) + 1;

        if (!userProfile.stats.topicStats) userProfile.stats.topicStats = {};
        if (!userProfile.stats.topicStats[q.topic]) {
            userProfile.stats.topicStats[q.topic] = { answered: 0, correct: 0 };
        }
        userProfile.stats.topicStats[q.topic].answered = (userProfile.stats.topicStats[q.topic].answered || 0) + 1;

        if (isCorrect) {
            this.wrongAttemptsOnCurrentQuestion = 0;
            userProfile.stats.totalCorrect = (userProfile.stats.totalCorrect || 0) + 1;
            userProfile.stats.topicStats[q.topic].correct = (userProfile.stats.topicStats[q.topic].correct || 0) + 1;

            if (sourceElement && sourceElement.classList) {
                sourceElement.classList.add('ring-4', 'ring-emerald-400', 'bg-emerald-600/60');
            }

            if (q.type === 'multi_step' && q.steps && this.currentMultiStepIndex < q.steps.length - 1) {
                showToast(feedbackMsg || "\u2705 Correct Step! Advancing to next step...");
                this.currentMultiStepIndex++;
                setTimeout(() => {
                    this.isAnswerCooldown = false;
                    this.renderQuestion();
                }, 650);
                return;
            }

            showToast(feedbackMsg || "\u2705 Correct Answer! (+1 point)");
            this.localScore += 1;
            document.getElementById('game-local-score').innerText = this.localScore;
            this.currentMultiStepIndex = 0;

            if (!this.isSolo && this.state.currentRoomId && this.state.currentUser) {
                await updateRoomInDB(this.state.currentRoomId, {
                    [`players.${this.state.currentUser.uid}.score`]: this.localScore
                });
            } else if (this.isSolo) {
                const soloScore = document.getElementById('solo-live-score');
                const soloBar = document.getElementById('solo-live-bar');
                if (soloScore) soloScore.innerText = `${this.localScore} / ${this.targetScore}`;
                if (soloBar) soloBar.style.width = `${Math.min(100, Math.round((this.localScore / this.targetScore) * 100))}%`;
            }

            setTimeout(() => {
                this.isAnswerCooldown = false;
                this.currentQuestionIndex++;

                if (this.localScore >= this.targetScore) {
                    this.concludeMatch();
                } else {
                    this.renderQuestion();
                }
            }, 850);

        } else {
            this.wrongAttemptsOnCurrentQuestion++;

            if (sourceElement && sourceElement.classList) {
                sourceElement.classList.add('ring-4', 'ring-rose-500', 'bg-rose-900/60');
                setTimeout(() => {
                    sourceElement.classList.remove('ring-4', 'ring-rose-500', 'bg-rose-900/60');
                }, 600);
            }

            const gameScreen = document.getElementById('screen-game');
            if (gameScreen) {
                gameScreen.classList.add('animate-shake');
                setTimeout(() => gameScreen.classList.remove('animate-shake'), 450);
            }

            // 3-Attempt Question Skipping Rule
            if (this.wrongAttemptsOnCurrentQuestion < 3) {
                const attemptsRemaining = 3 - this.wrongAttemptsOnCurrentQuestion;
                showToast(feedbackMsg || `\u274c Incorrect! ${attemptsRemaining} attempt${attemptsRemaining > 1 ? 's' : ''} left. Try again!`, true);

                setTimeout(() => {
                    this.isAnswerCooldown = false;
                    const input = document.getElementById('short-answer-input');
                    if (input && !input.classList.contains('hidden')) {
                        input.value = '';
                        input.focus();
                    }
                }, 500);

            } else {
                // 3 strikes -> skip question
                showToast("\u274c 3 incorrect attempts. Skipping question...", true);
                this.wrongAttemptsOnCurrentQuestion = 0;
                this.currentMultiStepIndex = 0;

                setTimeout(() => {
                    this.isAnswerCooldown = false;
                    this.currentQuestionIndex++;

                    if (this.localScore >= this.targetScore) {
                        this.concludeMatch();
                    } else {
                        this.renderQuestion();
                    }
                }, 850);
            }
        }

        saveLocalProfile(userProfile);
    }

    concludeMatch() {
        const isWinner = this.localScore >= this.targetScore;
        const userProfile = this.state.userProfile;

        if (isWinner && window.confetti) {
            window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }

        const oldElo = userProfile.elo || 1200;
        const delta = isWinner ? 32 : -16;
        const newElo = Math.max(800, oldElo + delta);

        userProfile.elo = newElo;
        if (!userProfile.stats) userProfile.stats = getInitialStats();
        userProfile.stats.matchesPlayed = (userProfile.stats.matchesPlayed || 0) + 1;
        if (isWinner) userProfile.stats.matchesWon = (userProfile.stats.matchesWon || 0) + 1;
        saveLocalProfile(userProfile);

        document.getElementById('results-winner-emoji').innerText = isWinner ? '\ud83c\udfc6' : '\ud83e\udd48';
        document.getElementById('results-headline').innerText = isWinner ? 'Victory!' : 'Match Concluded';
        document.getElementById('results-subtext').innerText = isWinner ? 'Goal reached! Elo rating increased.' : 'Good match!';
        document.getElementById('results-old-elo').innerText = oldElo;
        document.getElementById('results-new-elo').innerText = newElo;

        const deltaEl = document.getElementById('results-elo-delta');
        deltaEl.innerText = `${delta > 0 ? '+' : ''}${delta}`;
        deltaEl.className = `px-2 py-0.5 rounded text-xs font-bold ${delta > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`;

        const standingsList = document.getElementById('results-standings-list');
        standingsList.innerHTML = `
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                <div class="flex items-center space-x-2">
                    <span class="font-bold text-slate-400 font-mono">#1</span>
                    <span>${userProfile.avatar || '\ud83e\uddee'}</span>
                    <span class="font-semibold text-white">${userProfile.displayName} (You)</span>
                </div>
                <span class="font-mono text-indigo-400 font-bold">${this.localScore} pts</span>
            </div>
        `;

        if (!this.isSolo && this.state.currentRoomId) {
            updateRoomInDB(this.state.currentRoomId, { status: 'finished' });
        }

        showScreen('results');
    }

    isAnswerMatching(userInput, acceptableList) {
        if (!userInput || !acceptableList) return false;
        const clean = userInput.trim().toLowerCase().replace(/\s+/g, '').replace(/[\$\(\)]/g, '');
        return acceptableList.some(ans => {
            const target = ans.toString().trim().toLowerCase().replace(/\s+/g, '').replace(/[\$\(\)]/g, '');
            return clean === target;
        });
    }
}
