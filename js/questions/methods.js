// ---------------------------------------------------------
// WACE MATHEMATICS METHODS QUESTION GENERATORS
// ---------------------------------------------------------
export const methodsGenerators = {
    genMethComplexShortAns() {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 15) + 5;
                const ans = a * 2 + b;
                return {
                    type: 'short_answer',
                    topic: 'Exponential Functions',
                    text: `Evaluate $2(${a}) + ${b}$.`,
                    acceptableAnswers: [`${ans}`, `x=${ans}`]
                };
            },

    genMethMultiStepCalculus() {
                const a = Math.floor(Math.random() * 3) + 2;
                const c = Math.floor(Math.random() * 5) + 1;
                return {
                    type: 'multi_step',
                    topic: 'Rates of Change',
                    text: `Multi-Step Polynomial Derivative (${a}x^2 + ${c}x)`,
                    steps: [
                        {
                            prompt: `Step 1: Differentiate $f(x) = ${a}x^2 + ${c}x$.`,
                            type: 'mcq',
                            options: [`$${2*a}x + ${c}$`, `$${a}x + ${c}$`, `$${2*a}x$`, `$${a*2}x^2 + ${c}$`],
                            ansIndex: 0
                        },
                        {
                            prompt: `Step 2: Evaluate $f'(2)$.`,
                            type: 'short_answer',
                            acceptableAnswers: [`${4*a + c}`]
                        }
                    ]
                };
            },

    genMethCalculusIntegralShortAns() {
                const a = Math.floor(Math.random() * 5) + 1;
                const upper = Math.floor(Math.random() * 3) + 2;
                const ans = a * upper * upper;
                return {
                    type: 'short_answer',
                    topic: 'Rates of Change',
                    text: `Evaluate the definite integral $\\int_0^{${upper}} ${2*a}x \\, dx$.`,
                    acceptableAnswers: [`${ans}`]
                };
            },

    genMethProbabilityBinomialMulti() {
                const n = Math.floor(Math.random() * 10) * 10 + 20;
                const p = 0.5;
                const mean = n * p;
                const variance = n * p * (1 - p);
                return {
                    type: 'multi_step',
                    topic: 'Counting and Probability',
                    text: `Binomial Distribution Analysis (n=${n})`,
                    steps: [
                        {
                            prompt: `Step 1: A random variable $X \\sim B(${n}, 0.5)$. Find the expected value $E(X)$.`,
                            type: 'short_answer',
                            acceptableAnswers: [`${mean}`]
                        },
                        {
                            prompt: `Step 2: Find the variance $\\text{Var}(X)$.`,
                            type: 'short_answer',
                            acceptableAnswers: [`${variance}`]
                        }
                    ]
                };
            },

    genMethTrigShortAns() {
                const a = Math.floor(Math.random() * 5) + 2;
                const c = Math.floor(Math.random() * 10) - 5;
                return {
                    type: 'short_answer',
                    topic: 'Trigonometric Functions',
                    text: `What is the amplitude of the function $y = -${a}\\cos(2x) ${c >= 0 ? '+' : ''} ${Math.abs(c)}$?`,
                    acceptableAnswers: [`${a}`]
                };
            },

    genMethFunctionsComposite() {
                const a = Math.floor(Math.random()*4)+2;
                const b = Math.floor(Math.random()*5)+1;
                return this.formatQuestion('Functions and Graphs', `If $f(x) = ${a}x$ and $g(x) = x + ${b}$, find the composite function $f(g(x))$.`, `$${a}x + ${a*b}$`, [`$${a}x + ${b}$`, `$x + ${a*b}$`, `$${a}x + ${a+b}$`]);
            },

    genMethFunctionsInverse() {
                const a = Math.floor(Math.random()*4)+2;
                const b = Math.floor(Math.random()*5)+1;
                return this.formatQuestion('Functions and Graphs', `Find the inverse function $f^{-1}(x)$ for $f(x) = ${a}x - ${b}$.`, `$\\frac{x + ${b}}{${a}}$`, [`$\\frac{x - ${b}}{${a}}$`, `$\\frac{x}{${a}} - ${b}$`, `$${a}x + ${b}$`]);
            },

    genMethFunctionsRoots() {
                const r1 = Math.floor(Math.random()*4)+1;
                const r2 = Math.floor(Math.random()*4)+2;
                const b = -(r1 + r2);
                const c = r1 * r2;
                return this.formatQuestion('Functions and Graphs', `What are the $x$-intercepts of $y = x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x + ${c}$?`, `$x = ${r1}, x = ${r2}$`, [`$x = -${r1}, x = -${r2}$`, `$x = ${r1}, x = -${r2}$`, `$x = -${r1}, x = ${r2}$`]);
            },

    genMethTrigPeriod() {
                const b = Math.floor(Math.random()*4)+2;
                return this.formatQuestion('Trigonometric Functions', `What is the period of the function $f(x) = \\sin(${b}x)$?`, `$\\frac{2\\pi}{${b}}$`, [`$\\frac{\\pi}{${b}}$`, `$${b}\\pi$`, `$2\\pi$`]);
            },

    genMethTrigExactVal() {
                const vals = [
                    { q: '\\sin\\left(\\frac{\\pi}{6}\\right)', a: '\\frac{1}{2}', dist: ['\\frac{\\sqrt{3}}{2}', '\\frac{\\sqrt{2}}{2}', '1'] },
                    { q: '\\cos\\left(\\frac{\\pi}{3}\\right)', a: '\\frac{1}{2}', dist: ['\\frac{\\sqrt{3}}{2}', '\\frac{\\sqrt{2}}{2}', '0'] },
                    { q: '\\tan\\left(\\frac{\\pi}{4}\\right)', a: '1', dist: ['\\sqrt{3}', '\\frac{1}{\\sqrt{3}}', '0'] },
                    { q: '\\cos\\left(\\frac{\\pi}{4}\\right)', a: '\\frac{1}{\\sqrt{2}}', dist: ['\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}', '1'] }
                ];
                const choice = vals[Math.floor(Math.random() * vals.length)];
                return this.formatQuestion('Trigonometric Functions', `Find the exact value of $${choice.q}$.`, `$${choice.a}$`, choice.dist.map(d => `$${d}$`));
            },

    genMethTrigEquation() {
                return this.formatQuestion('Trigonometric Functions', `Solve $2\\cos(x) - 1 = 0$ for $0 \\le x \\le \\pi$.`, `$x = \\frac{\\pi}{3}$`, [`$x = \\frac{\\pi}{6}$`, `$x = \\frac{2\\pi}{3}$`, `$x = \\frac{5\\pi}{6}$`]);
            },

    genMethCountingIndependent() {
                const pA = 0.4;
                const pB = 0.5;
                const ans = (pA * pB).toFixed(2);
                return this.formatQuestion('Counting and Probability', `Events $A$ and $B$ are independent. If $P(A) = 0.4$ and $P(B) = 0.5$, find $P(A \\cap B)$.`, `$${ans}$`, [`$0.90$`, `$0.10$`, `$0.25$`]);
            },

    genMethCountingConditional() {
                return this.formatQuestion('Counting and Probability', `If $P(A \\cap B) = 0.2$ and $P(B) = 0.5$, find $P(A|B)$.`, `$0.4$`, [`$0.1$`, `$0.7$`, `$0.25$`]);
            },

    genMethExponentialSolve() {
                const x = Math.floor(Math.random()*3)+2;
                const rhs = Math.pow(2, x);
                return this.formatQuestion('Exponential Functions', `Solve for $x$: $2^x = ${rhs}$.`, `$x = ${x}$`, [`$x = ${x+1}$`, `$x = ${x-1}$`, `$x = ${x*2}$`]);
            },

    genMethExponentialLogRule() {
                const a = Math.floor(Math.random()*4)+2;
                const b = Math.floor(Math.random()*4)+2;
                return this.formatQuestion('Exponential Functions', `Simplify $\\ln(${a}) + \\ln(${b})$.`, `$\\ln(${a*b})$`, [`$\\ln(${a+b})$`, `$\\ln\\left(\\frac{${a}}{${b}}\\right)$`, `$${a*b}$`]);
            },

    genMethSequencesArith() {
                const a = Math.floor(Math.random()*5)+1;
                const d = Math.floor(Math.random()*4)+2;
                const n = 10;
                const ans = a + (n-1)*d;
                return this.formatQuestion('Sequences and Series', `Find the 10th term of the arithmetic sequence: $${a}, ${a+d}, ${a+2*d}, \\dots$`, `$${ans}$`, [`$${ans+d}$`, `$${ans-d}$`, `$${ans+2*d}$`]);
            },

    genMethSequencesGeom() {
                const a = 2;
                const r = 3;
                const n = 4;
                const ans = a * Math.pow(r, n-1);
                return this.formatQuestion('Sequences and Series', `Find the 4th term of the geometric sequence: $2, 6, 18, \\dots$`, `$${ans}$`, [`$162$`, `$36$`, `$72$`]);
            },

    genMethSequencesInfinite() {
                const a = 6;
                const r = '1/2';
                return this.formatQuestion('Sequences and Series', `Find the sum to infinity of the series $6 + 3 + 1.5 + \\dots$`, `$12$`, [`$18$`, `$9$`, `$24$`]);
            },

    genMethRatesAverage() {
                return this.formatQuestion('Rates of Change', `Find the average rate of change of $f(x) = x^2$ between $x = 1$ and $x = 4$.`, `$5$`, [`$3$`, `$15$`, `$4$`]);
            },

    genMethRatesPowerRule() {
                const n = Math.floor(Math.random()*4)+2;
                const c = Math.floor(Math.random()*4)+2;
                return this.formatQuestion('Rates of Change', `Differentiate $f(x) = ${c}x^{${n}}$.`, `$${c*n}x^{${n-1}}$`, [`$${c}x^{${n-1}}$`, `$${c*n}x^{${n}}$`, `$${n}x^{${n-1}}$`]);
            },

    genMethFuncDomain() {
                const a = Math.floor(Math.random() * 8) + 1;
                return this.formatQuestion(
                    'Functions and Graphs',
                    `Find the natural domain of $f(x) = \\sqrt{x - ${a}}$.`,
                    `$[${a}, \\infty)$`,
                    [`$(${a}, \\infty)$`, `$(-\\infty, ${a}]$`, `$(-\\infty, \\infty)$`]
                );
            },

    genMethFuncVertex() {
                const h = Math.floor(Math.random() * 6) - 3;
                const k = Math.floor(Math.random() * 8) - 4;
                const a = Math.floor(Math.random() * 3) + 1;
                const expr = h >= 0 ? `(x - ${h})^2` : `(x + ${Math.abs(h)})^2`;
                const kStr = k >= 0 ? `+ ${k}` : `- ${Math.abs(k)}`;
                return this.formatQuestion(
                    'Functions and Graphs',
                    `What is the turning point (vertex) of the parabola $y = ${a === 1 ? '' : a}${expr} ${kStr}$?`,
                    `$(${h}, ${k})$`,
                    [`$(${-h}, ${k})$`, `$(${h}, ${-k})$`, `$(${-h}, ${-k})$`]
                );
            },

    genMethFuncAxisOfSymmetry() {
                const h = Math.floor(Math.random() * 8) - 4;
                const b = -2 * h;
                const bStr = b >= 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`;
                return {
                    type: 'short_answer',
                    topic: 'Functions and Graphs',
                    text: `Find the axis of symmetry $x$ for the quadratic $y = x^2 ${bStr} + 7$. (Enter the numerical value of $x$)`,
                    acceptableAnswers: [`${h}`, `x=${h}`]
                };
            },

    genMethFuncAsymptotes() {
                const a = Math.floor(Math.random() * 5) + 1;
                const b = Math.floor(Math.random() * 6) + 1;
                const c = Math.floor(Math.random() * 5) + 1;
                return this.formatQuestion(
                    'Functions and Graphs',
                    `Find the vertical and horizontal asymptotes of $y = \\frac{${a}}{x - ${b}} + ${c}$.`,
                    `$x = ${b}, y = ${c}$`,
                    [`$x = -${b}, y = ${c}$`, `$x = ${b}, y = 0$`, `$x = ${c}, y = ${b}$`]
                );
            },

    genMethFuncTransformations() {
                const c = Math.floor(Math.random() * 5) + 2;
                return this.formatQuestion(
                    'Functions and Graphs',
                    `The graph of $y = f(x)$ is transformed to $y = f(x - ${c})$. What is the geometric effect?`,
                    `Translation of $${c}$ units in the positive $x$-direction (right)`,
                    [
                        `Translation of $${c}$ units in the negative $x$-direction (left)`,
                        `Translation of $${c}$ units in the positive $y$-direction (up)`,
                        `Horizontal dilation by a factor of $${c}$`
                    ]
                );
            },

    genMethFuncDiscriminant() {
                const b = Math.floor(Math.random() * 4) + 3;
                const c = 2;
                const disc = b*b - 8;
                return this.formatQuestion(
                    'Functions and Graphs',
                    `Calculate the discriminant $\\Delta = b^2 - 4ac$ for $x^2 + ${b}x + ${c} = 0$ and state the nature of roots.`,
                    `$\\Delta = ${disc} > 0$, so two distinct real roots`,
                    [
                        `$\\Delta = ${disc + 16} > 0$, so one repeated root`,
                        `$\\Delta < 0$, so no real roots`,
                        `$\\Delta = 0$, so two imaginary roots`
                    ]
                );
            },

    genMethFuncRemainderTheorem() {
                const c = Math.floor(Math.random() * 3) + 1;
                const val = Math.pow(c, 3) - 2 * Math.pow(c, 2) + 5;
                return {
                    type: 'short_answer',
                    topic: 'Functions and Graphs',
                    text: `Using the Remainder Theorem, find the remainder when $P(x) = x^3 - 2x^2 + 5$ is divided by $(x - ${c})$.`,
                    acceptableAnswers: [`${val}`]
                };
            },

    genMethFuncOddEven() {
                return this.formatQuestion(
                    'Functions and Graphs',
                    `Is the function $f(x) = x^3 - 4x$ even, odd, or neither?`,
                    `Odd ($f(-x) = -f(x)$)`,
                    [`Even ($f(-x) = f(x)$)`, `Neither even nor odd`, `Both even and odd`]
                );
            },

    genMethFuncPiecewise() {
                const val = Math.floor(Math.random() * 4) + 4;
                const ans = 3 * val - 1;
                return {
                    type: 'short_answer',
                    topic: 'Functions and Graphs',
                    text: `Given $f(x) = \\begin{cases} x^2 + 1 & x \\le 2 \\\\ 3x - 1 & x > 2 \\end{cases}$, evaluate $f(${val})$.`,
                    acceptableAnswers: [`${ans}`]
                };
            },

    genMethFuncCompositeMulti() {
                const a = Math.floor(Math.random() * 3) + 2;
                const b = Math.floor(Math.random() * 4) + 1;
                const inputVal = 2;
                const step1Ans = inputVal + b;
                const step2Ans = a * step1Ans;
                return {
                    type: 'multi_step',
                    topic: 'Functions and Graphs',
                    text: `Composite Function Step-by-Step ($f(x)=${a}x, g(x)=x+${b}$)`,
                    steps: [
                        {
                            prompt: `Step 1: Given $g(x) = x + ${b}$, evaluate $g(${inputVal})$.`,
                            type: 'short_answer',
                            acceptableAnswers: [`${step1Ans}`]
                        },
                        {
                            prompt: `Step 2: Given $f(x) = ${a}x$, evaluate $f(g(${inputVal})) = f(${step1Ans})$.`,
                            type: 'short_answer',
                            acceptableAnswers: [`${step2Ans}`]
                        }
                    ]
                };
            },

    genMethTrigPythagoreanIdentity() {
                return this.formatQuestion(
                    'Trigonometric Functions',
                    `If $\\sin(\\theta) = \\frac{3}{5}$ and $\\theta$ is acute ($0 < \\theta < \\frac{\\pi}{2}$), find $\\cos(\\theta)$.`,
                    `$\\frac{4}{5}$`,
                    [`$\\frac{3}{4}$`, `$\\frac{2}{5}$`, `$\\frac{5}{4}$`]
                );
            },

    genMethTrigMaxMin() {
                const a = Math.floor(Math.random() * 5) + 2;
                const c = Math.floor(Math.random() * 5) + 1;
                const maxVal = a + c;
                return {
                    type: 'short_answer',
                    topic: 'Trigonometric Functions',
                    text: `What is the maximum value of the function $y = ${a}\\sin(3x) + ${c}$?`,
                    acceptableAnswers: [`${maxVal}`]
                };
            },

    genMethTrigRadianDegrees() {
                const rads = [
                    { rad: '\\frac{\\pi}{3}', deg: '60' },
                    { rad: '\\frac{\\pi}{4}', deg: '45' },
                    { rad: '\\frac{2\\pi}{3}', deg: '120' },
                    { rad: '\\frac{3\\pi}{4}', deg: '135' },
                    { rad: '\\frac{5\\pi}{6}', deg: '150' }
                ];
                const item = rads[Math.floor(Math.random() * rads.length)];
                return {
                    type: 'short_answer',
                    topic: 'Trigonometric Functions',
                    text: `Convert $${item.rad}$ radians into degrees. (Enter integer value)`,
                    acceptableAnswers: [item.deg, `${item.deg}°`]
                };
            },

    genMethTrigArcLength() {
                const r = Math.floor(Math.random() * 6) + 4;
                const theta = 2;
                const s = r * theta;
                return {
                    type: 'short_answer',
                    topic: 'Trigonometric Functions',
                    text: `Find the arc length $s$ subtended by a central angle $\\theta = ${theta}$ radians in a circle of radius $r = ${r}$ cm.`,
                    acceptableAnswers: [`${s}`]
                };
            },

    genMethTrigSectorArea() {
                return this.formatQuestion(
                    'Trigonometric Functions',
                    `Find the area of a sector with radius $r = 6$ cm and central angle $\\theta = 1$ radian ($A = \\frac{1}{2}r^2\\theta$).`,
                    `$18\\text{ cm}^2$`,
                    [`$36\\text{ cm}^2$`, `$12\\text{ cm}^2$`, `$9\\text{ cm}^2$`]
                );
            },

    genMethTrigTanExact() {
                return this.formatQuestion(
                    'Trigonometric Functions',
                    `Find the exact value of $\\tan\\left(\\frac{\\pi}{3}\\right)$.`,
                    `$\\sqrt{3}$`,
                    [`$\\frac{1}{\\sqrt{3}}$`, `$1$`, `$\\frac{\\sqrt{3}}{2}$`]
                );
            },

    genMethTrigShift() {
                const c = Math.floor(Math.random() * 4) + 1;
                return this.formatQuestion(
                    'Trigonometric Functions',
                    `What is the vertical translation of $y = 3\\cos(x) - ${c}$ from $y = 3\\cos(x)$?`,
                    `$${c}$ units downwards`,
                    [`$${c}$ units upwards`, `$${c}$ units to the right`, `$${c}$ units to the left`]
                );
            },

    genMethTrigSimpleSolve() {
                return this.formatQuestion(
                    'Trigonometric Functions',
                    `Solve $\\sin(x) = 1$ for $0 \\le x \\le 2\\pi$.`,
                    `$x = \\frac{\\pi}{2}$`,
                    [`$x = \\pi$`, `$x = \\frac{3\\pi}{2}$`, `$x = 0$`]
                );
            },

    genMethTrigQuadrantSigns() {
                return this.formatQuestion(
                    'Trigonometric Functions',
                    `In Quadrant II (where $\\frac{\\pi}{2} < \\theta < \\pi$), which trigonometric function is positive?`,
                    `$\\sin(\\theta)$ only`,
                    [`$\\cos(\\theta)$ only`, `$\\tan(\\theta)$ only`, `All trigonometric functions`]
                );
            },

    genMethTrigMultiStepGraph() {
                const a = Math.floor(Math.random() * 4) + 2;
                const b = 2;
                return {
                    type: 'multi_step',
                    topic: 'Trigonometric Functions',
                    text: `Properties of $y = ${a}\\sin(${b}x) + 1$`,
                    steps: [
                        {
                            prompt: `Step 1: State the amplitude of $y = ${a}\\sin(${b}x) + 1$.`,
                            type: 'short_answer',
                            acceptableAnswers: [`${a}`]
                        },
                        {
                            prompt: `Step 2: What is the period of this trigonometric function?`,
                            type: 'mcq',
                            options: [`$\\pi$`, `$2\\pi$`, `$\\frac{\\pi}{2}$`, `$4\\pi$`],
                            ansIndex: 0
                        }
                    ]
                };
            },

    genMethProbComplement() {
                return this.formatQuestion(
                    'Counting and Probability',
                    `If the probability of event $A$ occurring is $P(A) = 0.35$, what is $P(A')$?`,
                    `$0.65$`,
                    [`$0.35$`, `$0.75$`, `$0.45$`]
                );
            },

    genMethProbUnionFormula() {
                return {
                    type: 'short_answer',
                    topic: 'Counting and Probability',
                    text: `If $P(A) = 0.4$, $P(B) = 0.5$, and $P(A \\cap B) = 0.2$, calculate $P(A \\cup B)$.`,
                    acceptableAnswers: ['0.7', '.7']
                };
            },

    genMethProbMutuallyExclusive() {
                return this.formatQuestion(
                    'Counting and Probability',
                    `If two events $A$ and $B$ are mutually exclusive, what is $P(A \\cap B)$?`,
                    `$0$`,
                    [`$1$`, `$P(A) \\times P(B)$`, `$P(A) + P(B)$`]
                );
            },

    genMethProbExpectedValueDiscrete() {
                return this.formatQuestion(
                    'Counting and Probability',
                    `A discrete random variable $X$ has distribution: $P(X=0)=0.2$, $P(X=1)=0.5$, $P(X=2)=0.3$. Find $E(X)$.`,
                    `$1.1$`,
                    [`$1.0$`, `$1.5$`, `$0.8$`]
                );
            },

    genMethProbBinomialSingle() {
                return this.formatQuestion(
                    'Counting and Probability',
                    `A fair coin is tossed $3$ times. What is the probability of obtaining exactly $2$ heads?`,
                    `$\\frac{3}{8}$`,
                    [`$\\frac{1}{8}$`, `$\\frac{1}{2}$`, `$\\frac{1}{4}$`]
                );
            },

    genMethProbTwoDice() {
                return this.formatQuestion(
                    'Counting and Probability',
                    `Two standard 6-sided dice are rolled. What is the probability that the sum of the dice equals $7$?`,
                    `$\\frac{1}{6}$`,
                    [`$\\frac{1}{12}$`, `$\\frac{7}{36}$`, `$\\frac{5}{36}$`]
                );
            },

    genMethProbMarbleWithoutReplacement() {
                return this.formatQuestion(
                    'Counting and Probability',
                    `A bag contains $3$ red marbles and $2$ blue marbles. Two marbles are drawn without replacement. Find $P(\\text{both red})$.`,
                    `$\\frac{3}{10}$`,
                    [`$\\frac{9}{25}$`, `$\\frac{6}{25}$`, `$\\frac{1}{5}$`]
                );
            },

    genMethProbTreeDiagram() {
                return this.formatQuestion(
                    'Counting and Probability',
                    `In a two-stage process, stage 1 succeeds with probability $0.6$. If it succeeds, stage 2 succeeds with probability $0.8$. Find the probability that both stages succeed.`,
                    `$0.48$`,
                    [`$0.14$`, `$0.70$`, `$0.50$`]
                );
            },

    genMethProbStandardDeviation() {
                const sd = Math.floor(Math.random() * 5) + 3;
                const variance = sd * sd;
                return {
                    type: 'short_answer',
                    topic: 'Counting and Probability',
                    text: `If the variance of a random variable $X$ is $\\text{Var}(X) = ${variance}$, find its standard deviation $\\sigma$.`,
                    acceptableAnswers: [`${sd}`]
                };
            },

    genMethProbMultiStepVenn() {
                return {
                    type: 'multi_step',
                    topic: 'Counting and Probability',
                    text: `Probability Analysis with Venn Diagrams`,
                    steps: [
                        {
                            prompt: `Step 1: If $P(A) = 0.6$ and $P(A \\cap B) = 0.2$, calculate $P(A \\cap B') = P(A) - P(A \\cap B)$.`,
                            type: 'short_answer',
                            acceptableAnswers: ['0.4', '.4']
                        },
                        {
                            prompt: `Step 2: If $P(B) = 0.5$, calculate $P(B|A)$.`,
                            type: 'mcq',
                            options: [`$\\frac{1}{3}$`, `$\\frac{1}{2}$`, `$\\frac{2}{5}$`, `$\\frac{3}{5}$`],
                            ansIndex: 0
                        }
                    ]
                };
            },

    genMethExpLogToExponential() {
                const b = Math.floor(Math.random() * 3) + 2;
                const c = Math.floor(Math.random() * 3) + 2;
                const a = Math.pow(b, c);
                return this.formatQuestion(
                    'Exponential Functions',
                    `Convert the logarithmic equation $\\log_{${b}}(${a}) = ${c}$ into exponential form.`,
                    `$${b}^{${c}} = ${a}$`,
                    [`$${c}^{${b}} = ${a}$`, `$${a}^{${b}} = ${c}$`, `$${b} \\times ${c} = ${a}$`]
                );
            },

    genMethExpChangeOfBase() {
                return this.formatQuestion(
                    'Exponential Functions',
                    `According to the change of base rule, $\\log_2(7)$ can be expressed as:`,
                    `$\\frac{\\ln(7)}{\\ln(2)}$`,
                    [`$\\frac{\\ln(2)}{\\ln(7)}$`, `$\\ln(7) - \\ln(2)$`, `$\\ln(14)$`]
                );
            },

    genMethExpPowerLogRule() {
                const k = Math.floor(Math.random() * 6) + 2;
                return {
                    type: 'short_answer',
                    topic: 'Exponential Functions',
                    text: `Evaluate $\\log_3(3^{${k}})$.`,
                    acceptableAnswers: [`${k}`]
                };
            },

    genMethExpSolveSameBase() {
                const k = Math.floor(Math.random() * 4) + 2;
                return {
                    type: 'short_answer',
                    topic: 'Exponential Functions',
                    text: `Solve for $x$: $2^{2x + 1} = 2^{x + ${k}}$.`,
                    acceptableAnswers: [`${k - 1}`, `x=${k - 1}`]
                };
            },

    genMethExpNaturalLogSolve() {
                const k = Math.floor(Math.random() * 5) + 3;
                return this.formatQuestion(
                    'Exponential Functions',
                    `Solve for $x$: $e^{2x} = ${k}$.`,
                    `$x = \\frac{\\ln(${k})}{2}$`,
                    [`$x = 2\\ln(${k})$`, `$x = \\ln\\left(\\frac{${k}}{2}\\right)$`, `$x = \\sqrt{${k}}$`]
                );
            },

    genMethExpLogProductQuotient() {
                return this.formatQuestion(
                    'Exponential Functions',
                    `Simplify into a single logarithm: $\\log(6) + \\log(5) - \\log(3)$.`,
                    `$\\log(10)$`,
                    [`$\\log(8)$`, `$\\log(90)$`, `$\\log(15)$`]
                );
            },

    genMethExpGrowthDoubling() {
                return {
                    type: 'short_answer',
                    topic: 'Exponential Functions',
                    text: `A bacteria colony begins with $100$ cells and doubles every hour. How many cells exist after $3$ hours?`,
                    acceptableAnswers: ['800']
                };
            },

    genMethExpDecayHalfLife() {
                return this.formatQuestion(
                    'Exponential Functions',
                    `A radioactive substance has a half-life of $10$ days. What fraction of the original sample remains after $30$ days?`,
                    `$\\frac{1}{8}$`,
                    [`$\\frac{1}{4}$`, `$\\frac{1}{16}$`, `$\\frac{1}{3}$`]
                );
            },

    genMethExpDomainRange() {
                const c = Math.floor(Math.random() * 5) + 1;
                return this.formatQuestion(
                    'Exponential Functions',
                    `What is the range of the function $f(x) = e^x + ${c}$?`,
                    `$(${c}, \\infty)$`,
                    [`$[${c}, \\infty)$`, `$(0, \\infty)$`, `$(-\\infty, \\infty)$`]
                );
            },

    genMethExpMultiStepSolve() {
                return {
                    type: 'multi_step',
                    topic: 'Exponential Functions',
                    text: `Solving Exponential Quadratic Equation ($e^{2x} - 5e^x + 6 = 0$)`,
                    steps: [
                        {
                            prompt: `Step 1: Substituting $u = e^x$, solve $u^2 - 5u + 6 = 0$. What are the values of $u$?`,
                            type: 'mcq',
                            options: [`$u = 2$ and $u = 3$`, `$u = -2$ and $u = -3$`, `$u = 1$ and $u = 6$`, `$u = 5$ and $u = 6$`],
                            ansIndex: 0
                        },
                        {
                            prompt: `Step 2: Solve for $x$ where $e^x = 2$ and $e^x = 3$.`,
                            type: 'mcq',
                            options: [`$x = \\ln(2)$ and $x = \\ln(3)$`, `$x = 2$ and $x = 3$`, `$x = e^2$ and $x = e^3$`, `$x = \\log_{10}(5)$`],
                            ansIndex: 0
                        }
                    ]
                };
            },

    genMethSeqArithCommonDiff() {
                const a = Math.floor(Math.random() * 5) + 2;
                const d = Math.floor(Math.random() * 6) + 3;
                return {
                    type: 'short_answer',
                    topic: 'Sequences and Series',
                    text: `Find the common difference $d$ of the arithmetic sequence: $${a}, ${a + d}, ${a + 2*d}, ${a + 3*d}, \\dots$`,
                    acceptableAnswers: [`${d}`]
                };
            },

    genMethSeqArithSum() {
                return {
                    type: 'short_answer',
                    topic: 'Sequences and Series',
                    text: `Find the sum of the first $10$ terms of the arithmetic series $1 + 3 + 5 + \\dots + 19$.`,
                    acceptableAnswers: ['100']
                };
            },

    genMethSeqGeomCommonRatio() {
                const a = Math.floor(Math.random() * 4) + 2;
                const r = Math.floor(Math.random() * 3) + 2;
                return {
                    type: 'short_answer',
                    topic: 'Sequences and Series',
                    text: `Find the common ratio $r$ of the geometric progression: $${a}, ${a*r}, ${a*r*r}, \\dots$`,
                    acceptableAnswers: [`${r}`]
                };
            },

    genMethSeqGeomSumFinite() {
                return this.formatQuestion(
                    'Sequences and Series',
                    `Find the sum of the first $4$ terms of the geometric series $1 + 2 + 4 + 8 + \\dots$`,
                    `$15$`,
                    [`$16$`, `$14$`, `$31$`]
                );
            },

    genMethSeqArithRecursive() {
                const a1 = Math.floor(Math.random() * 4) + 1;
                const d = 3;
                const a4 = a1 + 3 * d;
                return {
                    type: 'short_answer',
                    topic: 'Sequences and Series',
                    text: `A sequence is defined recursively by $a_1 = ${a1}$ and $a_{n+1} = a_n + 3$. Find the value of $a_4$.`,
                    acceptableAnswers: [`${a4}`]
                };
            },

    genMethSeqGeomRecursive() {
                return {
                    type: 'short_answer',
                    topic: 'Sequences and Series',
                    text: `A geometric sequence is defined by $a_1 = 2$ and $a_{n+1} = 3a_n$. Find $a_3$.`,
                    acceptableAnswers: ['18']
                };
            },

    genMethSeqSummationNotation() {
                return this.formatQuestion(
                    'Sequences and Series',
                    `Evaluate $\\sum_{k=1}^4 (2k - 1)$.`,
                    `$16$`,
                    [`$12$`, `$20$`, `$15$`]
                );
            },

    genMethSeqInfiniteConvergenceCondition() {
                return this.formatQuestion(
                    'Sequences and Series',
                    `Under what condition does an infinite geometric series with common ratio $r$ converge?`,
                    `$|r| < 1$`,
                    [`$r > 1$`, `$|r| \\le 1$`, `$r \\neq 0$`]
                );
            },

    genMethSeqArithMean() {
                return {
                    type: 'short_answer',
                    topic: 'Sequences and Series',
                    text: `Find the arithmetic mean between $4$ and $16$.`,
                    acceptableAnswers: ['10']
                };
            },

    genMethSeqMultiStepSeries() {
                return {
                    type: 'multi_step',
                    topic: 'Sequences and Series',
                    text: `Series Classification and Summation`,
                    steps: [
                        {
                            prompt: `Step 1: Is the sequence $3, 9, 27, 81, \\dots$ arithmetic or geometric?`,
                            type: 'mcq',
                            options: [`Geometric`, `Arithmetic`, `Neither`],
                            ansIndex: 0
                        },
                        {
                            prompt: `Step 2: Find the 5th term $T_5$.`,
                            type: 'short_answer',
                            acceptableAnswers: ['243']
                        }
                    ]
                };
            },

    genMethRatesTangentSlope() {
                const a = Math.floor(Math.random() * 3) + 1;
                const x0 = 2;
                const slope = 2 * a * x0;
                return {
                    type: 'short_answer',
                    topic: 'Rates of Change',
                    text: `Find the gradient of the tangent to $y = ${a}x^2$ at the point where $x = ${x0}$.`,
                    acceptableAnswers: [`${slope}`]
                };
            },

    genMethRatesNormalSlope() {
                return this.formatQuestion(
                    'Rates of Change',
                    `If the gradient of the tangent to a curve at point $P$ is $m = 2$, what is the gradient of the normal at $P$?`,
                    `$-\\frac{1}{2}$`,
                    [`$2$`, `$-2$`, `$\\frac{1}{2}$`]
                );
            },

    genMethRatesStationaryPoints() {
                const h = Math.floor(Math.random() * 4) + 1;
                return {
                    type: 'short_answer',
                    topic: 'Rates of Change',
                    text: `Find the $x$-coordinate of the stationary point of $f(x) = x^2 - ${2*h}x + 9$.`,
                    acceptableAnswers: [`${h}`, `x=${h}`]
                };
            },

    genMethRatesChainRule() {
                return this.formatQuestion(
                    'Rates of Change',
                    `Use the chain rule to differentiate $y = (2x + 1)^3$.`,
                    `$6(2x + 1)^2$`,
                    [`$3(2x + 1)^2$`, `$2(2x + 1)^3$`, `$6(2x + 1)^3$`]
                );
            },

    genMethRatesProductRule() {
                return this.formatQuestion(
                    'Rates of Change',
                    `Differentiate $y = x e^x$ with respect to $x$.`,
                    `$(x + 1)e^x$`,
                    [`$e^x$`, `$x e^x$`, `$x^2 e^x$`]
                );
            },

    genMethRatesQuotientRule() {
                return this.formatQuestion(
                    'Rates of Change',
                    `Differentiate $y = \\frac{x}{x + 1}$.`,
                    `$\\frac{1}{(x + 1)^2}$`,
                    [`$\\frac{-1}{(x + 1)^2}$`, `$\\frac{2x + 1}{(x + 1)^2}$`, `$1$`]
                );
            },

    genMethRatesSecondDerivative() {
                return this.formatQuestion(
                    'Rates of Change',
                    `Find the second derivative $\\frac{d^2y}{dx^2}$ of $y = 2x^3 - 5x^2 + 4$.`,
                    `$12x - 10$`,
                    [`$6x^2 - 10x$`, `$12x$`, `$6x - 10$`]
                );
            },

    genMethRatesIndefiniteIntegral() {
                return this.formatQuestion(
                    'Rates of Change',
                    `Evaluate the indefinite integral $\\int 6x^2 \\, dx$.`,
                    `$2x^3 + C$`,
                    [`$3x^3 + C$`, `$12x + C$`, `$6x^3 + C$`]
                );
            },

    genMethRatesAreaUnderCurve() {
                return {
                    type: 'short_answer',
                    topic: 'Rates of Change',
                    text: `Calculate the area enclosed by $y = x^2$, the $x$-axis, and the vertical line $x = 3$.`,
                    acceptableAnswers: ['9']
                };
            },

    genMethRatesMultiStepKinematics() {
                return {
                    type: 'multi_step',
                    topic: 'Rates of Change',
                    text: `Kinematics: Displacement, Velocity, Acceleration ($s(t) = t^3 - 6t^2 + 9t$)`,
                    steps: [
                        {
                            prompt: `Step 1: Find the velocity function $v(t) = s'(t)$.`,
                            type: 'mcq',
                            options: [`$3t^2 - 12t + 9$`, `$t^2 - 6t + 9$`, `$3t^2 - 6t$`, `$3t^2 - 12t$`],
                            ansIndex: 0
                        },
                        {
                            prompt: `Step 2: Find the acceleration at $t = 3$ seconds ($a(t) = v'(t) = 6t - 12$).`,
                            type: 'short_answer',
                            acceptableAnswers: ['6', '6 m/s^2']
                        }
                    ]
                };
            }
};
