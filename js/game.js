// ---------------------------------------------------------
// GAME MATCH ENGINE: MULTI-STEP HISTORY & GEMINI PROOF VALIDATION
// ---------------------------------------------------------
import { questionDB } from './questions/questionDB.js';
import { updateRoomInDB, saveLocalProfile, getInitialStats, submitProofQueryToRoom, getRoomFromDB } from './firebase.js';
import { evaluateProofStepWithGemini, fallbackLocalProofEvaluator } from './gemini.js';
import { showToast, showScreen } from './ui.js';

export class GameEngine {
    constructor(state) {
        this.state = state;
        this.matchQuestions = [];
        this.currentQuestionIndex = 0;
        this.currentMultiStepIndex = 0;
        this.completedSteps = []; // Track past steps: [{ prompt, answer }]
        this.wrongAttemptsOnCurrentQuestion = 0;
        this.localScore = 0;
        this.targetScore = 10;
        this.isAnswerCooldown = false;
        this.isAwaitingHostEvaluation = false;
        this.isSolo = false;
    }

    startMatch({ questions, targetScore, roomId, isSolo = false }) {
        this.matchQuestions = questions || questionDB.generateMatchSet(null, 50);
        this.currentQuestionIndex = 0;
        this.currentMultiStepIndex = 0;
        this.completedSteps = [];
        this.wrongAttemptsOnCurrentQuestion = 0;
        this.localScore = 0;
        this.targetScore = targetScore || 10;
        this.isAnswerCooldown = false;
        this.isAwaitingHostEvaluation = false;
        this.isSolo = isSolo;

        const roomIndicator = document.getElementById('game-room-indicator');
        if (roomIndicator) roomIndicator.innerText = isSolo ? "Solo Practice Mode" : `Room #${roomId}`;
        
        const targetIndicator = document.getElementById('game-target-indicator');
        if (targetIndicator) targetIndicator.innerText = `Goal: ${this.targetScore} pts`;

        showScreen('game');
        this.renderQuestion();
    }

    renderQuestion() {
        if (this.currentQuestionIndex >= this.matchQuestions.length) {
            this.currentQuestionIndex = 0;
        }
        const q = this.matchQuestions[this.currentQuestionIndex];
        if (!q) return;

        const topicBadge = document.getElementById('game-topic-badge');
        if (topicBadge) topicBadge.innerText = q.topic || 'WACE Math';

        const scoreEl = document.getElementById('game-local-score');
        if (scoreEl) scoreEl.innerText = this.localScore;

        const questionTextEl = document.getElementById('game-question-text');
        const visualContainer = document.getElementById('game-visual-container');
        const optionsGrid = document.getElementById('game-options-grid');
        const shortAnsContainer = document.getElementById('game-short-answer-container');
        const longProofContainer = document.getElementById('game-long-proof-container');
        const multistepContainer = document.getElementById('multistep-progress-container');
        const multistepHistory = document.getElementById('multistep-history-box');
        const aiBadge = document.getElementById('game-ai-eval-badge');

        if (visualContainer) visualContainer.innerHTML = q.visual || '';

        // Long-Answer Single-Step Proof
        if (q.type === 'long_answer_proof' || q.isLongProof) {
            this.currentMultiStepIndex = 0;
            this.completedSteps = [];
            if (multistepContainer) multistepContainer.classList.add('hidden');
            if (optionsGrid) optionsGrid.classList.add('hidden');
            if (shortAnsContainer) shortAnsContainer.classList.add('hidden');
            if (longProofContainer) longProofContainer.classList.remove('hidden');

            if (aiBadge) {
                aiBadge.classList.remove('hidden');
                aiBadge.innerText = this.isSolo ? "✨ Gemini 3.7 Flash AI Grader" : "✨ Host Gemini AI Grader";
            }

            if (questionTextEl) questionTextEl.innerHTML = `<span class="text-sm block text-purple-400 mb-1 font-bold">Rigorous Mathematical Proof:</span> ${q.text}`;
            
            const proofInput = document.getElementById('long-proof-input');
            if (proofInput) {
                proofInput.value = '';
                proofInput.placeholder = "Write out your complete proof here with clear mathematical justification and steps...\nExample: Let origin be D... expand (b-a).(b-a)...";
                proofInput.focus();
            }

        } else if (q.type === 'multi_step' && q.steps && q.steps.length > 0) {
            // Multi-Step Question (with history of preceding steps)
            if (longProofContainer) longProofContainer.classList.add('hidden');
            if (aiBadge) aiBadge.classList.add('hidden');

            if (!q.steps[this.currentMultiStepIndex]) {
                this.currentMultiStepIndex = 0;
                this.completedSteps = [];
            }
            if (multistepContainer) multistepContainer.classList.remove('hidden');
            const activeStep = q.steps[this.currentMultiStepIndex];
            
            const stepLabel = document.getElementById('multistep-step-label');
            if (stepLabel) stepLabel.innerText = `Step ${this.currentMultiStepIndex + 1} of ${q.steps.length}`;
            
            const pct = Math.round(((this.currentMultiStepIndex + 1) / q.steps.length) * 100);
            const pctLabel = document.getElementById('multistep-pct-label');
            if (pctLabel) pctLabel.innerText = `${pct}% Completed`;
            
            const fill = document.getElementById('multistep-progress-fill');
            if (fill) fill.style.width = `${pct}%`;

            // Build Previous Step History Breadcrumb
            let historyHtml = '';
            if (this.currentMultiStepIndex > 0 && this.completedSteps.length > 0) {
                historyHtml = `<div class="mb-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Previous Steps:</div>`;
                this.completedSteps.forEach((stepRecord, idx) => {
                    historyHtml += `
                        <div class="flex items-start space-x-2 text-slate-300">
                            <span class="text-emerald-400 font-bold">✓ Step ${idx + 1}:</span>
                            <div>
                                <span class="text-slate-400">${stepRecord.prompt}</span>
                                <div class="font-mono text-emerald-300 font-semibold mt-0.5">Answer: ${stepRecord.answer}</div>
                            </div>
                        </div>
                    `;
                });
                historyHtml += `</div>`;
            }

            if (questionTextEl) {
                questionTextEl.innerHTML = `
                    <span class="text-sm block text-indigo-400 mb-1 font-semibold">${q.text}</span>
                    ${historyHtml}
                    <div class="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                        <span class="text-xs font-bold text-indigo-300 uppercase block mb-1">Active Step ${this.currentMultiStepIndex + 1}:</span>
                        <div class="text-white">${activeStep.prompt}</div>
                    </div>
                `;
            }

            this.renderInputsForStep(activeStep);

        } else {
            // Standard Single-Step MCQ / Short Answer
            this.currentMultiStepIndex = 0;
            this.completedSteps = [];
            if (multistepContainer) multistepContainer.classList.add('hidden');
            if (longProofContainer) longProofContainer.classList.add('hidden');
            if (aiBadge) aiBadge.classList.add('hidden');

            if (questionTextEl) questionTextEl.innerHTML = q.text;

            if (q.type === 'short_answer') {
                if (optionsGrid) {
                    optionsGrid.innerHTML = '';
                    optionsGrid.classList.add('hidden');
                }
                if (shortAnsContainer) {
                    shortAnsContainer.classList.remove('hidden');
                    const input = document.getElementById('short-answer-input');
                    if (input) {
                        input.value = '';
                        input.placeholder = "Type exact answer (e.g. 5, -2/3, 4pi)...";
                        input.focus();
                    }
                }
            } else {
                if (shortAnsContainer) shortAnsContainer.classList.add('hidden');
                if (optionsGrid) {
                    optionsGrid.classList.remove('hidden');
                    this.renderMCQOptions(q.options, q.ansIndex);
                }
            }
        }

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([questionTextEl, optionsGrid, visualContainer]).catch(err => console.warn(err));
        }
    }

    renderInputsForStep(step) {
        const optionsGrid = document.getElementById('game-options-grid');
        const shortAnsContainer = document.getElementById('game-short-answer-container');
        const longProofContainer = document.getElementById('game-long-proof-container');

        if (longProofContainer) longProofContainer.classList.add('hidden');

        if (step.type === 'short_answer') {
            if (optionsGrid) {
                optionsGrid.innerHTML = '';
                optionsGrid.classList.add('hidden');
            }
            if (shortAnsContainer) {
                shortAnsContainer.classList.remove('hidden');
                const input = document.getElementById('short-answer-input');
                if (input) {
                    input.value = '';
                    input.placeholder = step.placeholder || "Enter algebraic expression or value (e.g. 2cos^2(x), 4)...";
                    input.focus();
                }
            }
        } else {
            if (shortAnsContainer) shortAnsContainer.classList.add('hidden');
            if (optionsGrid) {
                optionsGrid.classList.remove('hidden');
                this.renderMCQOptions(step.options, step.ansIndex);
            }
        }
    }

    renderMCQOptions(options, ansIndex) {
        const grid = document.getElementById('game-options-grid');
        if (!grid) return;
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
            btn.onclick = () => this.handleMCQSubmission(idx === ansIndex, opt, btn);
            grid.appendChild(btn);
        });
    }

    handleMCQSubmission(isCorrect, selectedText, btnElement) {
        const q = this.matchQuestions[this.currentQuestionIndex];
        if (q && q.type === 'multi_step' && isCorrect) {
            const activeStep = q.steps[this.currentMultiStepIndex];
            this.completedSteps.push({
                prompt: activeStep.prompt,
                answer: selectedText
            });
        }
        this.handleSubmission(isCorrect, btnElement);
    }

    async submitShortAnswer() {
        if (this.isAnswerCooldown) return;

        const input = document.getElementById('short-answer-input');
        const inputVal = input ? input.value : '';
        const q = this.matchQuestions[this.currentQuestionIndex];
        if (!q) return;

        let targetAnswers = [];
        if (q.type === 'multi_step' && q.steps && q.steps[this.currentMultiStepIndex]) {
            const activeStep = q.steps[this.currentMultiStepIndex];
            targetAnswers = activeStep.acceptableAnswers || [];
        } else {
            targetAnswers = q.acceptableAnswers || [];
        }

        const submitBtn = document.getElementById('btn-submit-short-ans');
        const isCorrect = this.isAnswerMatching(inputVal, targetAnswers);

        if (isCorrect && q.type === 'multi_step') {
            const activeStep = q.steps[this.currentMultiStepIndex];
            this.completedSteps.push({
                prompt: activeStep.prompt,
                answer: inputVal
            });
        }

        this.handleSubmission(isCorrect, submitBtn);
    }

    async submitLongAnswerProof() {
        if (this.isAwaitingHostEvaluation || this.isAnswerCooldown) return;

        const input = document.getElementById('long-proof-input');
        const studentProof = input ? input.value.trim() : '';
        if (!studentProof) {
            showToast("Please type out your mathematical proof before submitting!", true);
            return;
        }

        const q = this.matchQuestions[this.currentQuestionIndex];
        if (!q) return;

        const submitBtn = document.getElementById('btn-submit-long-proof');
        let isCorrect = false;
        let feedbackMsg = '';

        const isHost = this.state.roomData?.hostUid === this.state.currentUser?.uid;

        if (this.isSolo || isHost) {
            // Host or Solo client evaluates proof directly
            if (submitBtn) {
                submitBtn.innerText = "Evaluating Proof with Gemini...";
                submitBtn.classList.add('opacity-75', 'pointer-events-none');
            }
            try {
                const evalResult = await evaluateProofStepWithGemini({
                    problemContext: q.text,
                    stepPrompt: "Full Mathematical Proof Submission",
                    studentAnswer: studentProof,
                    expectedAnswerGuidelines: q.expectedAnswerGuidelines || ''
                });
                isCorrect = evalResult.isCorrect;
                feedbackMsg = evalResult.feedback;
            } catch (e) {
                console.warn("Direct proof evaluation fallback:", e);
                const fb = fallbackLocalProofEvaluator(studentProof, []);
                isCorrect = fb.isCorrect;
                feedbackMsg = fb.feedback;
            } finally {
                if (submitBtn) {
                    submitBtn.innerText = "Submit Proof for AI Evaluation";
                    submitBtn.classList.remove('opacity-75', 'pointer-events-none');
                }
            }
        } else {
            // Multiplayer player delegates to room host
            this.isAwaitingHostEvaluation = true;
            if (submitBtn) {
                submitBtn.innerText = "Sending to Host AI...";
                submitBtn.classList.add('opacity-75', 'pointer-events-none');
            }

            try {
                const queryId = await submitProofQueryToRoom(this.state.currentRoomId, {
                    playerId: this.state.currentUser.uid,
                    problemContext: q.text,
                    stepPrompt: "Full Mathematical Proof Submission",
                    studentAnswer: studentProof,
                    expectedAnswerGuidelines: q.expectedAnswerGuidelines || ''
                });

                const result = await this.pollForQueryResolution(this.state.currentRoomId, queryId);
                isCorrect = result.isCorrect;
                feedbackMsg = result.feedback;
            } catch (e) {
                console.warn("Host proof delegation timed out/failed, using fallback:", e);
                const fb = fallbackLocalProofEvaluator(studentProof, []);
                isCorrect = fb.isCorrect;
                feedbackMsg = fb.feedback;
            } finally {
                this.isAwaitingHostEvaluation = false;
                if (submitBtn) {
                    submitBtn.innerText = "Submit Proof for AI Evaluation";
                    submitBtn.classList.remove('opacity-75', 'pointer-events-none');
                }
            }
        }

        this.handleSubmission(isCorrect, submitBtn, feedbackMsg);
    }

    pollForQueryResolution(roomId, queryId, timeoutMs = 12000) {
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

    async handleSubmission(isCorrect, sourceElement, customFeedback = '') {
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
                showToast(customFeedback || "✅ Correct Step! Advancing to next step...");
                this.currentMultiStepIndex++;
                setTimeout(() => {
                    this.isAnswerCooldown = false;
                    this.renderQuestion();
                }, 650);
                return;
            }

            showToast(customFeedback || "✅ Correct Proof / Answer! (+1 point)");
            this.localScore += 1;
            const scoreEl = document.getElementById('game-local-score');
            if (scoreEl) scoreEl.innerText = this.localScore;
            
            this.currentMultiStepIndex = 0;
            this.completedSteps = [];

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
                showToast(customFeedback || `❌ Incorrect! ${attemptsRemaining} attempt${attemptsRemaining > 1 ? 's' : ''} left. Try again!`, true);

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
                showToast("❌ 3 incorrect attempts. Skipping to next question...", true);
                this.wrongAttemptsOnCurrentQuestion = 0;
                this.currentMultiStepIndex = 0;
                this.completedSteps = [];

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

        document.getElementById('results-winner-emoji').innerText = isWinner ? '🏆' : '🥈';
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
                    <span>${userProfile.avatar || '🧮'}</span>
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
