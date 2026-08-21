// ---------------------------------------------------------
// UNIFIED QUESTION DATABASE (METHODS, SPECIALIST & PROOFS)
// ---------------------------------------------------------
import { methodsGenerators } from './methods.js';
import { specialistGenerators } from './specialist.js';
import { proofGenerators } from './proofs.js';

export class QuestionDB {
    constructor() {
        this.generators = [];

        // Bind Methods generators
        Object.keys(methodsGenerators).forEach(key => {
            this.generators.push(methodsGenerators[key].bind(this));
        });

        // Bind Specialist generators
        Object.keys(specialistGenerators).forEach(key => {
            this.generators.push(specialistGenerators[key].bind(this));
        });

        // Bind 20 Multi-Step Proof generators
        Object.keys(proofGenerators).forEach(key => {
            this.generators.push(proofGenerators[key].bind(this));
        });

        this.staticQuestions = [
            { 
                topic: 'Functions and Graphs', 
                text: `If $f(x) = |2x - 4|$, solve for $x$ when $f(x) = 6$.`, 
                options: [`$x = 5$ or $x = -1$`, `$x = 1$ or $x = 5$`, `$x = -1$ or $x = 1$`, `$x = 5$`], 
                ansIndex: 0 
            },
            {
                type: 'short_answer',
                topic: 'Functions and Graphs',
                text: `Solve for $x$: $3x + 14 = 29$.`,
                acceptableAnswers: ['5', 'x=5', '+5'],
                explanation: '3x = 15 => x = 5'
            },
            {
                type: 'short_answer',
                topic: 'Rates of Change',
                text: `Find the value of $\\frac{d}{dx}(x^3 - 4x)$ evaluated at $x = 3$.`,
                acceptableAnswers: ['23', 'x=23'],
                explanation: '3(3)^2 - 4 = 27 - 4 = 23'
            },
            {
                type: 'multi_step',
                topic: 'Rates of Change',
                text: `Multi-Step Calculus Problem`,
                steps: [
                    {
                        prompt: `Step 1: Find the derivative $\\frac{dy}{dx}$ for $y = x^3 - 6x^2 + 9x$.`,
                        type: 'mcq',
                        options: [`$3x^2 - 12x + 9$`, `$3x^2 - 6x + 9$`, `$x^2 - 12x + 9$`, `$3x^2 - 12x$`],
                        ansIndex: 0
                    },
                    {
                        prompt: `Step 2: Find the smaller $x$-coordinate where stationary points occur (i.e. $\\frac{dy}{dx} = 0$).`,
                        type: 'short_answer',
                        acceptableAnswers: ['1', 'x=1']
                    }
                ]
            },
            {
                type: 'multi_step',
                topic: 'Vectors in the Plane',
                text: `Multi-Step Vector Analysis`,
                steps: [
                    {
                        prompt: `Step 1: Given $\\mathbf{u} = 3\\mathbf{i} + 4\\mathbf{j}$, find its magnitude $|\\mathbf{u}|$.`,
                        type: 'short_answer',
                        acceptableAnswers: ['5', '|u|=5']
                    },
                    {
                        prompt: `Step 2: Find the dot product $\\mathbf{u} \\cdot \\mathbf{v}$ where $\\mathbf{v} = 2\\mathbf{i} - \\mathbf{j}$.`,
                        type: 'short_answer',
                        acceptableAnswers: ['2', 'u.v=2']
                    }
                ]
            }
        ];
    }

    formatQuestion(topic, text, correct, distractors) {
        const options = [correct, ...distractors];
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        return {
            topic: topic,
            text: text,
            options: options,
            ansIndex: options.indexOf(correct)
        };
    }

    /**
     * Determines whether a question object matches the allowed format filters
     */
    matchesFormat(q, formats) {
        if (!formats) return true;
        if (q.isProof) {
            return Boolean(formats.proofs);
        }
        if (q.type === 'multi_step') {
            return Boolean(formats.multi_step);
        }
        if (q.type === 'short_answer') {
            return Boolean(formats.short_answer);
        }
        // Standard MCQ
        return Boolean(formats.mcq);
    }

    generateMatchSet(topics, count = 50, allowedFormats = null) {
        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            topics = [
                'Functions and Graphs', 'Trigonometric Functions', 'Counting and Probability',
                'Exponential Functions', 'Sequences and Series', 'Rates of Change',
                'Geometry', 'Combinatorics', 'Vectors in the Plane', 'Trigonometry (Spec)',
                'Matrices', 'Real and Complex Numbers'
            ];
        }

        const formats = allowedFormats || {
            mcq: true,
            short_answer: true,
            multi_step: true,
            proofs: true
        };

        let pool = [];
        pool.push(...this.staticQuestions.filter(q => topics.includes(q.topic) && this.matchesFormat(q, formats)));
        
        const getQuestionKey = (q) => {
            if (!q) return '';
            if (q.type === 'multi_step' && Array.isArray(q.steps)) {
                return q.topic + '::' + q.steps.map(s => s.prompt || s.text || '').join('||');
            }
            return q.topic + '::' + (q.text || '') + '::' + (q.options ? q.options.join('|') : (q.acceptableAnswers ? q.acceptableAnswers.join('|') : ''));
        };

        let attempts = 0;
        while (pool.length < count && attempts < 8000) {
            attempts++;
            const gen = this.generators[Math.floor(Math.random() * this.generators.length)];
            const q = gen();
            if (q && topics.includes(q.topic) && this.matchesFormat(q, formats)) {
                const qKey = getQuestionKey(q);
                if (!pool.some(existing => getQuestionKey(existing) === qKey)) {
                    pool.push(q);
                }
            }
        }
        
        // If pool is smaller than count, fill with shuffled copies to reach target count
        if (pool.length < count && pool.length > 0) {
            const originalPool = [...pool];
            while (pool.length < count) {
                const clone = JSON.parse(JSON.stringify(originalPool[Math.floor(Math.random() * originalPool.length)]));
                pool.push(clone);
            }
        }
        
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool.slice(0, count);
    }
}

export const questionDB = new QuestionDB();
