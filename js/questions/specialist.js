import { SvgBuilder, GeoMath, buildDynamicCircleDiagram, buildDynamicVectorDiagram } from '../svg-builder.js';

export const specialistGenerators = {
    genSpecMultiStepVectors() {
                const x = Math.floor(Math.random() * 4) + 1;
                const y = Math.floor(Math.random() * 4) + 1;
                const dotVal = x * 2 + y * 3;
                return {
                    type: 'multi_step',
                    topic: 'Vectors in the Plane',
                    text: `Multi-Step Vector Operations (${x}i + ${y}j)`,
                    steps: [
                        {
                            prompt: `Step 1: Given $\\mathbf{a} = ${x}\\mathbf{i} + ${y}\\mathbf{j}$, find the dot product $\\mathbf{a} \\cdot (2\\mathbf{i} + 3\\mathbf{j})$.`,
                            type: 'short_answer',
                            acceptableAnswers: [`${dotVal}`]
                        },
                        {
                            prompt: `Step 2: Is $\\mathbf{a}$ perpendicular to $-${y}\\mathbf{i} + ${x}\\mathbf{j}$?`,
                            type: 'mcq',
                            options: [`Yes`, `No`],
                            ansIndex: 0
                        }
                    ]
                };
            },

    genSpecComplexRootsMulti() {
                const a = Math.floor(Math.random() * 4) + 1;
                const r = 2 * a;
                return {
                    type: 'multi_step',
                    topic: 'Real and Complex Numbers',
                    text: `Complex Number Polar Form (${a})`,
                    steps: [
                        {
                            prompt: `Step 1: Find the modulus $|z|$ of $z = ${a} + ${a}\\sqrt{3}i$.`,
                            type: 'short_answer',
                            acceptableAnswers: [`${r}`]
                        },
                        {
                            prompt: `Step 2: What is the principal argument $\\text{Arg}(z)$?`,
                            type: 'mcq',
                            options: [`$\\frac{\\pi}{3}$`, `$\\frac{\\pi}{6}$`, `$\\frac{2\\pi}{3}$`, `$\\frac{\\pi}{4}$`],
                            ansIndex: 0
                        }
                    ]
                };
            },

    genSpecMatricesSystemMulti() {
                const a = Math.floor(Math.random() * 3) + 1;
                const b = Math.floor(Math.random() * 3) + 1;
                const c = Math.floor(Math.random() * 3) + 1;
                const d = Math.floor(Math.random() * 3) + 1;
                const det = (a*d) - (b*c);
                return {
                    type: 'multi_step',
                    topic: 'Matrices',
                    text: `System of Linear Equations (${a},${b},${c},${d})`,
                    steps: [
                        {
                            prompt: `Step 1: Consider the matrix $M = \\begin{bmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{bmatrix}$. Find $|M|$.`,
                            type: 'short_answer',
                            acceptableAnswers: [`${det}`]
                        },
                        {
                            prompt: `Step 2: Does the equation $M\\mathbf{x} = \\mathbf{0}$ have a unique solution?`,
                            type: 'mcq',
                            options: det !== 0 ? [`Yes`, `No`] : [`No`, `Yes`],
                            ansIndex: 0
                        }
                    ]
                };
            },

    genSpecVectorsProjectionShortAns() {
                const x = Math.floor(Math.random() * 6) + 2;
                const y = Math.floor(Math.random() * 5) + 1;
                return {
                    type: 'short_answer',
                    topic: 'Vectors in the Plane',
                    text: `Given vector $\\mathbf{v} = ${x}\\mathbf{i} - ${y}\\mathbf{j}$, what is its scalar projection onto the x-axis?`,
                    acceptableAnswers: [`${x}`]
                };
            },

    genSpecGeomCenterCircumference() {
        const inscribed = Math.floor(Math.random() * 30) + 25;
        const central = inscribed * 2;
        const visual = buildDynamicCircleDiagram({
            points: [
                { id: 'A', angle: 210, label: 'A' },
                { id: 'B', angle: 330, label: 'B' },
                { id: 'P', angle: 80, label: 'P' }
            ],
            chords: [
                ['A', 'O', '#6366f1', 2],
                ['B', 'O', '#6366f1', 2],
                ['A', 'P', '#94a3b8', 1.5],
                ['B', 'P', '#94a3b8', 1.5]
            ],
            angles: [
                { vertex: 'P', p1: 'A', p2: 'B', label: `${inscribed}°`, radius: 22, color: '#818cf8' },
                { vertex: 'O', p1: 'A', p2: 'B', label: 'θ', radius: 18, color: '#c084fc' }
            ],
            showCenter: true,
            centerLabel: 'O'
        });
        return {
            topic: 'Geometry',
            text: `In the circle with centre $O$, $\\angle APB = ${inscribed}^\\circ$. Find the angle subtended at the centre, $\\theta = \\angle AOB$.`,
            visual: visual,
            options: [`$${central}^\\circ$`, `$${inscribed}^\\circ$`, `$${180 - inscribed}^\\circ$`, `$${central / 2}^\\circ$`],
            ansIndex: 0
        };
    },

    genSpecGeomCyclicQuad() {
        const angleA = Math.floor(Math.random() * 35) + 65;
        const angleC = 180 - angleA;
        const visual = buildDynamicCircleDiagram({
            points: [
                { id: 'A', angle: 135, label: 'A' },
                { id: 'B', angle: 45, label: 'B' },
                { id: 'C', angle: 315, label: 'C' },
                { id: 'D', angle: 225, label: 'D' }
            ],
            polygons: [{ points: ['A', 'B', 'C', 'D'], fill: 'rgba(99,102,241,0.08)', stroke: '#818cf8' }],
            angles: [
                { vertex: 'A', p1: 'D', p2: 'B', label: `${angleA}°`, radius: 18, color: '#f8fafc' },
                { vertex: 'C', p1: 'B', p2: 'D', label: 'x', radius: 18, color: '#c084fc' }
            ],
            showCenter: false
        });
        return {
            topic: 'Geometry',
            text: `Given the cyclic quadrilateral $ABCD$ inscribed in the circle, find $x = \\angle BCD$.`,
            visual: visual,
            options: [`$${angleC}^\\circ$`, `$${angleA}^\\circ$`, `$${90 + angleA}^\\circ$`, `$${360 - angleA}^\\circ$`],
            ansIndex: 0
        };
    },

    genSpecGeomSemicircle() {
        const angleB = Math.floor(Math.random() * 30) + 25;
        const angleA = 90 - angleB;
        const visual = buildDynamicCircleDiagram({
            points: [
                { id: 'A', angle: 180, label: 'A' },
                { id: 'B', angle: 0, label: 'B' },
                { id: 'C', angle: 60, label: 'C' }
            ],
            polygons: [{ points: ['A', 'B', 'C'], fill: 'rgba(99,102,241,0.06)', stroke: '#818cf8' }],
            chords: [['A', 'B', '#6366f1', 2]],
            angles: [
                { vertex: 'B', p1: 'C', p2: 'A', label: `${angleB}°`, radius: 22, color: '#f8fafc' },
                { vertex: 'A', p1: 'B', p2: 'C', label: 'θ', radius: 22, color: '#c084fc' }
            ],
            rightAngles: [{ vertex: 'C', p1: 'A', p2: 'B', size: 10 }],
            showCenter: true,
            centerLabel: 'O'
        });
        return {
            topic: 'Geometry',
            text: `Diameter $AB$ passes through the centre $O$. If $\\angle CBA = ${angleB}^\\circ$, find $\\theta = \\angle CAB$.`,
            visual: visual,
            options: [`$${angleA}^\\circ$`, `$${angleB}^\\circ$`, `$${180 - angleB}^\\circ$`, `$90^\\circ$`],
            ansIndex: 0
        };
    },

    genSpecGeomAlternateSegment() {
        const angle = Math.floor(Math.random() * 25) + 40;
        const visual = buildDynamicCircleDiagram({
            points: [
                { id: 'T', angle: 270, label: 'T' },
                { id: 'A', angle: 140, label: 'A' },
                { id: 'B', angle: 40, label: 'B' }
            ],
            tangents: [{ pointId: 'T', length: 110, color: '#fb7185', label: '' }],
            polygons: [{ points: ['T', 'A', 'B'], fill: 'rgba(99,102,241,0.08)', stroke: '#818cf8' }],
            angles: [
                { vertex: 'A', p1: 'T', p2: 'B', label: 'θ', radius: 20, color: '#c084fc' }
            ],
            showCenter: false
        });
        return {
            topic: 'Geometry',
            text: `A tangent touches the circle at $T$. Using the alternate segment theorem, find $\\theta = \\angle TAB$.`,
            visual: visual,
            options: [`$${angle}^\\circ$`, `$${180 - angle}^\\circ$`, `$${90 - angle}^\\circ$`, `$${2 * angle}^\\circ$`],
            ansIndex: 0
        };
    },

    genSpecCombinatoricsPerm() {
                return this.formatQuestion('Combinatorics', `Evaluate $^5P_3$.`, `$60$`, [`$20$`, `$120$`, `$10$`]);
            },

    genSpecCombinatoricsComb() {
                return this.formatQuestion('Combinatorics', `Evaluate $\\binom{6}{2}$.`, `$15$`, [`$30$`, `$12$`, `$20$`]);
            },

    genSpecVectorsMagnitude() {
                return this.formatQuestion('Vectors in the Plane', `Find the magnitude of $\\mathbf{v} = 3\\mathbf{i} - 4\\mathbf{j}$.`, `$5$`, [`$7$`, `$\\sqrt{7}$`, `$25$`]);
            },

    genSpecVectorsDotProduct() {
                const a1 = Math.floor(Math.random()*4)+1;
                const a2 = Math.floor(Math.random()*4)+1;
                const b1 = Math.floor(Math.random()*4)+1;
                const b2 = Math.floor(Math.random()*4)+1;
                const ans = (a1*b1) + (a2*b2);
                return this.formatQuestion('Vectors in the Plane', `Find $\\mathbf{a} \\cdot \\mathbf{b}$ for $\\mathbf{a} = ${a1}\\mathbf{i} + ${a2}\\mathbf{j}$ and $\\mathbf{b} = ${b1}\\mathbf{i} + ${b2}\\mathbf{j}$.`, `$${ans}$`, [`$${ans+2}$`, `$${ans-3}$`, `$${a1*b1 - a2*b2}$`]);
            },

    genSpecTrigIdentity() {
                return this.formatQuestion('Trigonometry (Spec)', `Simplify $\\sin^2(x) + \\cos^2(x)$.`, `$1$`, [`$\\tan^2(x)$`, `$0$`, `$2\\sin(x)$`]);
            },

    genSpecTrigDoubleAngle() {
                return this.formatQuestion('Trigonometry (Spec)', `Which expression is equivalent to $\\sin(2x)$?`, `$2\\sin(x)\\cos(x)$`, [`$\\cos^2(x) - \\sin^2(x)$`, `$2\\sin(x)$`, `$\\sin^2(x)$`]);
            },

    genSpecMatricesDeterminant() {
                const a = Math.floor(Math.random()*4)+1;
                const b = Math.floor(Math.random()*3)+1;
                const c = Math.floor(Math.random()*3)+1;
                const d = Math.floor(Math.random()*4)+1;
                const det = (a*d) - (b*c);
                return this.formatQuestion('Matrices', `Find the determinant of $\\begin{bmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{bmatrix}$.`, `$${det}$`, [`$${det+4}$`, `$${(a*d)+(b*c)}$`, `$${det-2}$`]);
            },

    genSpecMatricesInverse() {
                return this.formatQuestion('Matrices', `What is the condition for matrix $M$ to have an inverse $M^{-1}$?`, `$\\det(M) \\neq 0$`, [`$\\det(M) = 0$`, `$\\text{Trace}(M) > 0$`, `$M$ is a diagonal matrix`]);
            },

    genSpecComplexModulus() {
                return this.formatQuestion('Real and Complex Numbers', `Find the modulus of $z = 1 + i$.`, `$\\sqrt{2}$`, [`$2$`, `$1$`, `$\\sqrt{3}$`]);
            },

    genSpecComplexConjugateMult() {
                return this.formatQuestion('Real and Complex Numbers', `If $z = 2 + 3i$, find $z \\bar{z}$.`, `$13$`, [`$4 - 9i$`, `$-5$`, `$13 + 12i$`]);
            },

    genSpecGeomTangentRadiusAngle() {
                return this.formatQuestion(
                    'Geometry',
                    `What is the angle between a tangent to a circle and the radius drawn to the point of contact?`,
                    `$90^\\circ$ (perpendicular)`,
                    [`$45^\\circ$`, `$60^\\circ$`, `$180^\\circ$`]
                );
            },

    genSpecGeomAnglesInSameSegment() {
                const angle = Math.floor(Math.random() * 20) + 35;
                return {
                    type: 'short_answer',
                    topic: 'Geometry',
                    text: `Angles in the same segment of a circle subtended by the same chord are equal. If $\\angle ACB = ${angle}^\\circ$, find $\\angle ADB$.`,
                    acceptableAnswers: [`${angle}`, `${angle}°`]
                };
            },

    genSpecGeomIntersectingChords() {
                return {
                    type: 'short_answer',
                    topic: 'Geometry',
                    text: `Two chords $AB$ and $CD$ intersect at $P$. If $PA = 4$, $PB = 6$, and $PC = 3$, find the length of $PD$ ($PA \\cdot PB = PC \\cdot PD$).`,
                    acceptableAnswers: ['8']
                };
            },

    genSpecGeomTangentSecantTheorem() {
                return {
                    type: 'short_answer',
                    topic: 'Geometry',
                    text: `A tangent from external point $P$ touches a circle at $T$, and a secant through $P$ intersects the circle at $A$ and $B$. If $PA = 2$ and $PB = 8$, find the length of tangent segment $PT$ ($PT^2 = PA \\cdot PB$).`,
                    acceptableAnswers: ['4']
                };
            },

    genSpecGeomCircumscribedPolygon() {
                return this.formatQuestion(
                    'Geometry',
                    `In any cyclic quadrilateral, the opposite angles are:`,
                    `Supplementary (sum to $180^\\circ$)`,
                    [`Complementary (sum to $90^\\circ$)`, `Equal`, `Adjacent`]
                );
            },

    genSpecGeomChordBisection() {
                return this.formatQuestion(
                    'Geometry',
                    `The perpendicular line drawn from the centre of a circle to a chord:`,
                    `Bisects the chord`,
                    [`Is parallel to the chord`, `Is twice the length of the chord`, `Equals the diameter`]
                );
            },

    genSpecGeomTriangleMidpoint() {
                const base = Math.floor(Math.random() * 6) * 2 + 10;
                const mid = base / 2;
                return {
                    type: 'short_answer',
                    topic: 'Geometry',
                    text: `By the Midpoint Theorem, the line segment joining the midpoints of two sides of a triangle is parallel to the third side and half its length. If the base length is $${base}$ cm, find the midpoint segment length.`,
                    acceptableAnswers: [`${mid}`]
                };
            },

    genSpecGeomCentroidRatio() {
                return this.formatQuestion(
                    'Geometry',
                    `The centroid of a triangle divides each median in the ratio (from vertex to opposite side):`,
                    `$2 : 1$`,
                    [`$1 : 1$`, `$3 : 1$`, `$1 : 2$`]
                );
            },

    genSpecGeomExteriorAngleCyclic() {
                const intOpp = Math.floor(Math.random() * 25) + 70;
                return {
                    type: 'short_answer',
                    topic: 'Geometry',
                    text: `An exterior angle of a cyclic quadrilateral equals the interior opposite angle. If the interior opposite angle is $${intOpp}^\\circ$, what is the exterior angle?`,
                    acceptableAnswers: [`${intOpp}`, `${intOpp}°`]
                };
            },

    genSpecGeomMultiStepCircleProof() {
                return {
                    type: 'multi_step',
                    topic: 'Geometry',
                    text: `Circle Geometry Angle Calculations`,
                    steps: [
                        {
                            prompt: `Step 1: In a circle with centre $O$, diameter $AB$ is drawn. What is the measure of angle $\\angle ACB$ at any point $C$ on the circumference?`,
                            type: 'short_answer',
                            acceptableAnswers: ['90', '90°']
                        },
                        {
                            prompt: `Step 2: If $\\angle CAB = 35^\\circ$ in right-angled $\\triangle ABC$, find $\\angle ABC$.`,
                            type: 'short_answer',
                            acceptableAnswers: ['55', '55°']
                        }
                    ]
                };
            },

    genSpecCombFactorial() {
                return this.formatQuestion(
                    'Combinatorics',
                    `Evaluate $\\frac{6!}{4!}$.`,
                    `$30$`,
                    [`$24$`, `$120$`, `$6$`]
                );
            },

    genSpecCombPermutationLetters() {
                return this.formatQuestion(
                    'Combinatorics',
                    `Find the number of distinct permutations of the letters in the word $\\text{LEVEL}$.`,
                    `$30$`,
                    [`$120$`, `$60$`, `$15$`]
                );
            },

    genSpecCombRoundTable() {
                return this.formatQuestion(
                    'Combinatorics',
                    `In how many distinct ways can $5$ people be seated around a circular table? ($(n-1)!$)`,
                    `$24$`,
                    [`$120$`, `$60$`, `$12$`]
                );
            },

    genSpecCombCommitteeSelection() {
                return {
                    type: 'short_answer',
                    topic: 'Combinatorics',
                    text: `A committee of $2$ men and $1$ woman is formed from a group of $4$ men and $3$ women. How many different committees are possible? ($\\binom{4}{2} \\times \\binom{3}{1}$)`,
                    acceptableAnswers: ['18']
                };
            },

    genSpecCombPigeonhole() {
                return this.formatQuestion(
                    'Combinatorics',
                    `A drawer contains black socks and blue socks. What is the minimum number of socks you must pull in the dark to guarantee at least one matching pair?`,
                    `$3$`,
                    [`$2$`, `$4$`, `$5$`]
                );
            },

    genSpecCombInclusionExclusion() {
                return {
                    type: 'short_answer',
                    topic: 'Combinatorics',
                    text: `In a class of 30 students, 18 take Physics, 15 take Chemistry, and 8 take both. How many students take at least one of these subjects? ($|P \\cup C| = 18 + 15 - 8$)`,
                    acceptableAnswers: ['25']
                };
            },

    genSpecCombBinomialCoeff() {
                return this.formatQuestion(
                    'Combinatorics',
                    `Find the coefficient of $x^2$ in the expansion of $(1 + x)^5$ using $\\binom{5}{2}$.`,
                    `$10$`,
                    [`$5$`, `$20$`, `$15$`]
                );
            },

    genSpecCombPascalIdentity() {
                return this.formatQuestion(
                    'Combinatorics',
                    `According to Pascal's Identity, $\\binom{n}{k} + \\binom{n}{k+1}$ is equal to:`,
                    `$\\binom{n+1}{k+1}$`,
                    [`$\\binom{n+1}{k}$`, `$\\binom{n}{k+2}$`, `$\\binom{2n}{k+1}$`]
                );
            },

    genSpecCombDerangements() {
                return this.formatQuestion(
                    'Combinatorics',
                    `A derangement is a permutation where no element appears in its original position. How many derangements exist for $3$ items ($!3$)?`,
                    `$2$`,
                    [`$6$`, `$1$`, `$3$`]
                );
            },

    genSpecCombMultiStepArrangement() {
                return {
                    type: 'multi_step',
                    topic: 'Combinatorics',
                    text: `Arrangements with Restrictions (4 Boys and 2 Girls in a Line)`,
                    steps: [
                        {
                            prompt: `Step 1: If the 2 girls must sit together, treat them as 1 block. How many items are being arranged?`,
                            type: 'short_answer',
                            acceptableAnswers: ['5']
                        },
                        {
                            prompt: `Step 2: Calculate the total number of arrangements where the 2 girls sit together ($5! \\times 2!$).`,
                            type: 'short_answer',
                            acceptableAnswers: ['240']
                        }
                    ]
                };
            },

    genSpecVecUnitVector() {
                return this.formatQuestion(
                    'Vectors in the Plane',
                    `Find the unit vector $\\hat{\\mathbf{u}}$ in the direction of $\\mathbf{u} = 3\\mathbf{i} + 4\\mathbf{j}$.`,
                    `$\\frac{3}{5}\\mathbf{i} + \\frac{4}{5}\\mathbf{j}$`,
                    [`$\\frac{3}{7}\\mathbf{i} + \\frac{4}{7}\\mathbf{j}$`, `$3\\mathbf{i} + 4\\mathbf{j}$`, `$\\frac{4}{5}\\mathbf{i} + \\frac{3}{5}\\mathbf{j}$`]
                );
            },

    genSpecVecAngleBetween() {
                return this.formatQuestion(
                    'Vectors in the Plane',
                    `If two non-zero vectors $\\mathbf{a}$ and $\\mathbf{b}$ satisfy $\\mathbf{a} \\cdot \\mathbf{b} = 0$, what is the angle between them?`,
                    `$90^\\circ$ ($\\frac{\\pi}{2}$ radians)`,
                    [`$0^\\circ$`, `$180^\\circ$`, `$45^\\circ$`]
                );
            },

    genSpecVecVectorAddition() {
                return this.formatQuestion(
                    'Vectors in the Plane',
                    `Given $\\mathbf{a} = 2\\mathbf{i} + 3\\mathbf{j}$ and $\\mathbf{b} = \\mathbf{i} - \\mathbf{j}$, find $\\mathbf{a} + 2\\mathbf{b}$.`,
                    `$4\\mathbf{i} + \\mathbf{j}$`,
                    [`$3\\mathbf{i} + 2\\mathbf{j}$`, `$4\\mathbf{i} + 5\\mathbf{j}$`, `$2\\mathbf{i} + \\mathbf{j}$`]
                );
            },

    genSpecVecScalarMultiplication() {
                const k = Math.floor(Math.random() * 3) + 2;
                return {
                    type: 'short_answer',
                    topic: 'Vectors in the Plane',
                    text: `If vector $\\mathbf{u} = 2\\mathbf{i} + 5\\mathbf{j}$ is multiplied by scalar $k = ${k}$, find the coefficient of $\\mathbf{j}$ in $k\\mathbf{u}$.`,
                    acceptableAnswers: [`${5 * k}`]
                };
            },

    genSpecVecVectorBetweenPoints() {
                return this.formatQuestion(
                    'Vectors in the Plane',
                    `Find the position vector $\\vec{AB}$ from point $A(1, 4)$ to point $B(5, 7)$.`,
                    `$4\\mathbf{i} + 3\\mathbf{j}$`,
                    [`$6\\mathbf{i} + 11\\mathbf{j}$`, `$-4\\mathbf{i} - 3\\mathbf{j}$`, `$3\\mathbf{i} + 4\\mathbf{j}$`]
                );
            },

    genSpecVecVectorProjectionFormula() {
                return this.formatQuestion(
                    'Vectors in the Plane',
                    `The scalar resolute (projection) of $\\mathbf{u}$ in the direction of $\\mathbf{v}$ is given by:`,
                    `$\\frac{\\mathbf{u} \\cdot \\mathbf{v}}{|\\mathbf{v}|}$`,
                    [`$\\frac{\\mathbf{u} \\cdot \\mathbf{v}}{|\\mathbf{u}|}$`, `$\\mathbf{u} \\cdot \\mathbf{v}$`, `$\\frac{|\\mathbf{u}|}{|\\mathbf{v}|}$`]
                );
            },

    genSpecVecPerpendicularCondition() {
                return {
                    type: 'short_answer',
                    topic: 'Vectors in the Plane',
                    text: `Find the value of $k$ such that $\\mathbf{a} = 3\\mathbf{i} + 2\\mathbf{j}$ is perpendicular to $\\mathbf{b} = k\\mathbf{i} - 6\\mathbf{j}$.`,
                    acceptableAnswers: ['4', 'k=4']
                };
            },

    genSpecVecCrossProduct2D() {
                return {
                    type: 'short_answer',
                    topic: 'Vectors in the Plane',
                    text: `Find the area of the parallelogram spanned by vectors $\\mathbf{u} = 3\\mathbf{i} + \\mathbf{j}$ and $\\mathbf{v} = \\mathbf{i} + 4\\mathbf{j}$ using $|u_1 v_2 - u_2 v_1|$.`,
                    acceptableAnswers: ['11']
                };
            },

    genSpecVecParametricLine() {
                return this.formatQuestion(
                    'Vectors in the Plane',
                    `A line passes through $(1, 2)$ in the direction $\\mathbf{d} = 3\\mathbf{i} + 4\\mathbf{j}$. What is its vector equation?`,
                    `$\\mathbf{r}(t) = (\\mathbf{i} + 2\\mathbf{j}) + t(3\\mathbf{i} + 4\\mathbf{j})$`,
                    [`$\\mathbf{r}(t) = (3\\mathbf{i} + 4\\mathbf{j}) + t(\\mathbf{i} + 2\\mathbf{j})$`, `$\\mathbf{r}(t) = 4\\mathbf{i} + 6\\mathbf{j}$`, `$\\mathbf{r}(t) = t(3\\mathbf{i} + 4\\mathbf{j})$`]
                );
            },

    genSpecVecMultiStepResolve() {
                return {
                    type: 'multi_step',
                    topic: 'Vectors in the Plane',
                    text: `Vector Operations: Resultant and Magnitude`,
                    steps: [
                        {
                            prompt: `Step 1: Given $\\mathbf{a} = 5\\mathbf{i} + 2\\mathbf{j}$ and $\\mathbf{b} = \\mathbf{i} + 6\\mathbf{j}$, find resultant $\\mathbf{R} = \\mathbf{a} + \\mathbf{b}$.`,
                            type: 'mcq',
                            options: [`$6\\mathbf{i} + 8\\mathbf{j}$`, `$4\\mathbf{i} - 4\\mathbf{j}$`, `$6\\mathbf{i} + 4\\mathbf{j}$`, `$5\\mathbf{i} + 12\\mathbf{j}$`],
                            ansIndex: 0
                        },
                        {
                            prompt: `Step 2: Calculate the magnitude $|\\mathbf{R}|$ of the resultant vector $6\\mathbf{i} + 8\\mathbf{j}$.`,
                            type: 'short_answer',
                            acceptableAnswers: ['10']
                        }
                    ]
                };
            },

    genSpecTrigSecCscCot() {
                return this.formatQuestion(
                    'Trigonometry (Spec)',
                    `Evaluate $\\sec\\left(\\frac{\\pi}{3}\\right) = \\frac{1}{\\cos(\\pi/3)}$.`,
                    `$2$`,
                    [`$\\frac{1}{2}$`, `$\\sqrt{3}$`, `$\\frac{2}{\\sqrt{3}}$`]
                );
            },

    genSpecTrigPythagoreanExtended() {
                return this.formatQuestion(
                    'Trigonometry (Spec)',
                    `Which of the following trigonometric identities is correct?`,
                    `$1 + \\tan^2(x) = \\sec^2(x)$`,
                    [`$1 + \\cos^2(x) = \\sin^2(x)$`, `$1 + \\sec^2(x) = \\tan^2(x)$`, `$\\sin^2(x) - \\cos^2(x) = 1$`]
                );
            },

    genSpecTrigCompoundAngleSin() {
                return this.formatQuestion(
                    'Trigonometry (Spec)',
                    `Expand $\\sin(A + B)$ using the compound angle formula.`,
                    `$\\sin(A)\\cos(B) + \\cos(A)\\sin(B)$`,
                    [`$\\sin(A)\\cos(B) - \\cos(A)\\sin(B)$`, `$\\cos(A)\\cos(B) - \\sin(A)\\sin(B)$`, `$\\sin(A)\\sin(B) + \\cos(A)\\cos(B)$`]
                );
            },

    genSpecTrigCompoundAngleCos() {
                return this.formatQuestion(
                    'Trigonometry (Spec)',
                    `Expand $\\cos(A - B)$ using the compound angle formula.`,
                    `$\\cos(A)\\cos(B) + \\sin(A)\\sin(B)$`,
                    [`$\\cos(A)\\cos(B) - \\sin(A)\\sin(B)$`, `$\\sin(A)\\cos(B) + \\cos(A)\\sin(B)$`, `$\\cos(A) - \\cos(B)$`]
                );
            },

    genSpecTrigTanDoubleAngle() {
                return this.formatQuestion(
                    'Trigonometry (Spec)',
                    `State the double angle identity for $\\tan(2x)$.`,
                    `$\\frac{2\\tan(x)}{1 - \\tan^2(x)}$`,
                    [`$\\frac{2\\tan(x)}{1 + \\tan^2(x)}$`, `$\\frac{\\tan^2(x) - 1}{2\\tan(x)}$`, `$2\\tan(x)$`]
                );
            },

    genSpecTrigTFormula() {
                return this.formatQuestion(
                    'Trigonometry (Spec)',
                    `Using the $t$-formula where $t = \\tan\\left(\\frac{x}{2}\\right)$, express $\\sin(x)$ in terms of $t$.`,
                    `$\\frac{2t}{1 + t^2}$`,
                    [`$\\frac{1 - t^2}{1 + t^2}$`, `$\\frac{2t}{1 - t^2}$`, `$\\frac{t}{1 + t^2}$`]
                );
            },

    genSpecTrigRForm() {
                return {
                    type: 'short_answer',
                    topic: 'Trigonometry (Spec)',
                    text: `Express $3\\cos(x) + 4\\sin(x)$ in the form $R\\cos(x - \\alpha)$. What is the value of $R$?`,
                    acceptableAnswers: ['5', 'R=5']
                };
            },

    genSpecTrigInverseDomain() {
                return this.formatQuestion(
                    'Trigonometry (Spec)',
                    `What is the domain of the inverse sine function $y = \\arcsin(x)$?`,
                    `$[-1, 1]$`,
                    [`$(-\\infty, \\infty)$`, `$[0, \\pi]$`, `$\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$`]
                );
            },

    genSpecTrigCosDoubleAngleVariants() {
                return this.formatQuestion(
                    'Trigonometry (Spec)',
                    `Which of the following is an identity for $\\cos(2x)$?`,
                    `$1 - 2\\sin^2(x)$`,
                    [`$1 + 2\\sin^2(x)$`, `$2\\sin(x)\\cos(x)$`, `$\\cos^2(x) + \\sin^2(x)$`]
                );
            },

    genSpecTrigMultiStepIdentity() {
                return {
                    type: 'multi_step',
                    topic: 'Trigonometry (Spec)',
                    text: `Evaluation using Compound Angle Identities`,
                    steps: [
                        {
                            prompt: `Step 1: Note that $\\sin(75^\\circ) = \\sin(45^\\circ + 30^\\circ)$. Expand this as $\\sin(45^\\circ)\\cos(30^\\circ) + \\cos(45^\\circ)\\sin(30^\\circ)$. Which expression represents the result?`,
                            type: 'mcq',
                            options: [`$\\frac{\\sqrt{6} + \\sqrt{2}}{4}$`, `$\\frac{\\sqrt{6} - \\sqrt{2}}{4}$`, `$\\frac{\\sqrt{3} + 1}{2}$`, `$\\frac{1}{2}$`],
                            ansIndex: 0
                        },
                        {
                            prompt: `Step 2: Is $\\sin(75^\\circ)$ equal to $\\cos(15^\\circ)$?`,
                            type: 'mcq',
                            options: [`Yes (complementary angles)`, `No`],
                            ansIndex: 0
                        }
                    ]
                };
            },

    genSpecMatMatrixMult() {
                return this.formatQuestion(
                    'Matrices',
                    `Calculate the matrix product $\\begin{bmatrix} 1 & 2 \\\\ 0 & 1 \\end{bmatrix} \\begin{bmatrix} 2 & 0 \\\\ 1 & 3 \\end{bmatrix}$.`,
                    `$\\begin{bmatrix} 4 & 6 \\\\ 1 & 3 \\end{bmatrix}$`,
                    [`$\\begin{bmatrix} 2 & 0 \\\\ 0 & 3 \\end{bmatrix}$`, `$\\begin{bmatrix} 3 & 2 \\\\ 1 & 4 \\end{bmatrix}$`, `$\\begin{bmatrix} 4 & 0 \\\\ 1 & 3 \\end{bmatrix}$`]
                );
            },

    genSpecMatScalarMult() {
                const k = Math.floor(Math.random() * 3) + 2;
                return this.formatQuestion(
                    'Matrices',
                    `Multiply scalar $${k}$ with matrix $M = \\begin{bmatrix} 1 & -2 \\\\ 3 & 4 \\end{bmatrix}$.`,
                    `$\\begin{bmatrix} ${k} & ${-2*k} \\\\ ${3*k} & ${4*k} \\end{bmatrix}$`,
                    [`$\\begin{bmatrix} ${k} & -2 \\\\ 3 & 4 \\end{bmatrix}$`, `$\\begin{bmatrix} 1 & ${-2*k} \\\\ 3 & 4 \\end{bmatrix}$`, `$\\begin{bmatrix} ${k+1} & ${-2+k} \\\\ ${3+k} & ${4+k} \\end{bmatrix}$`]
                );
            },

    genSpecMatIdentity() {
                return this.formatQuestion(
                    'Matrices',
                    `For any $2 \\times 2$ matrix $A$, what is the product $A \\cdot I$ where $I$ is the identity matrix?`,
                    `$A$`,
                    [`$I$`, `$0$`, `$A^2$`]
                );
            },

    genSpecMatTranspose() {
                return this.formatQuestion(
                    'Matrices',
                    `Find the transpose $M^T$ of matrix $M = \\begin{bmatrix} 1 & 5 \\\\ 2 & 7 \\end{bmatrix}$.`,
                    `$\\begin{bmatrix} 1 & 2 \\\\ 5 & 7 \\end{bmatrix}$`,
                    [`$\\begin{bmatrix} 7 & -5 \\\\ -2 & 1 \\end{bmatrix}$`, `$\\begin{bmatrix} 7 & 5 \\\\ 2 & 1 \\end{bmatrix}$`, `$\\begin{bmatrix} 2 & 7 \\\\ 1 & 5 \\end{bmatrix}$`]
                );
            },

    genSpecMatInverseExplicit() {
                return this.formatQuestion(
                    'Matrices',
                    `Find the inverse of matrix $A = \\begin{bmatrix} 2 & 1 \\\\ 3 & 2 \\end{bmatrix}$.`,
                    `$\\begin{bmatrix} 2 & -1 \\\\ -3 & 2 \\end{bmatrix}$`,
                    [`$\\begin{bmatrix} -2 & 1 \\\\ 3 & -2 \\end{bmatrix}$`, `$\\begin{bmatrix} 2 & 3 \\\\ 1 & 2 \\end{bmatrix}$`, `$\\begin{bmatrix} 1 & -1 \\\\ -3 & 1 \\end{bmatrix}$`]
                );
            },

    genSpecMatTrace() {
                const a = Math.floor(Math.random() * 5) + 1;
                const d = Math.floor(Math.random() * 5) + 1;
                const trace = a + d;
                return {
                    type: 'short_answer',
                    topic: 'Matrices',
                    text: `Find the trace $\\text{tr}(M)$ (the sum of main diagonal elements) of $M = \\begin{bmatrix} ${a} & 9 \\\\ -4 & ${d} \\end{bmatrix}$.`,
                    acceptableAnswers: [`${trace}`]
                };
            },

    genSpecMatRotationMatrix() {
                return this.formatQuestion(
                    'Matrices',
                    `Which matrix represents an anticlockwise rotation by $90^\\circ$ ($\\frac{\\pi}{2}$) about the origin?`,
                    `$\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$`,
                    [`$\\begin{bmatrix} 0 & 1 \\\\ -1 & 0 \\end{bmatrix}$`, `$\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$`, `$\\begin{bmatrix} -1 & 0 \\\\ 0 & -1 \\end{bmatrix}$`]
                );
            },

    genSpecMatReflectionMatrix() {
                return this.formatQuestion(
                    'Matrices',
                    `Which matrix represents a reflection in the $x$-axis?`,
                    `$\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$`,
                    [`$\\begin{bmatrix} -1 & 0 \\\\ 0 & 1 \\end{bmatrix}$`, `$\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$`, `$\\begin{bmatrix} 0 & -1 \\\\ -1 & 0 \\end{bmatrix}$`]
                );
            },

    genSpecMatSingularMatrixCondition() {
                return {
                    type: 'short_answer',
                    topic: 'Matrices',
                    text: `Find the value of $k$ for which the matrix $M = \\begin{bmatrix} 2 & k \\\\ 4 & 6 \\end{bmatrix}$ is singular (has no inverse).`,
                    acceptableAnswers: ['3', 'k=3']
                };
            },

    genSpecMatMultiStepSolveSystem() {
                return {
                    type: 'multi_step',
                    topic: 'Matrices',
                    text: `Solving Matrix System $\\begin{bmatrix} 2 & 1 \\\\ 1 & 1 \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} 5 \\\\ 3 \\end{bmatrix}$`,
                    steps: [
                        {
                            prompt: `Step 1: Calculate the determinant of the coefficient matrix $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 1 \\end{bmatrix}$.`,
                            type: 'short_answer',
                            acceptableAnswers: ['1']
                        },
                        {
                            prompt: `Step 2: Solve for $x$ and $y$. What is the value of $x$?`,
                            type: 'short_answer',
                            acceptableAnswers: ['2', 'x=2']
                        }
                    ]
                };
            },

    genSpecComplexAddition() {
                return this.formatQuestion(
                    'Real and Complex Numbers',
                    `Simplify $(3 + 2i) + (1 + 4i)$.`,
                    `$4 + 6i$`,
                    [`$4 + 2i$`, `$2 + 6i$`, `$3 + 8i$`]
                );
            },

    genSpecComplexMultiplication() {
                return this.formatQuestion(
                    'Real and Complex Numbers',
                    `Expand and simplify $(1 + 2i)(3 + i)$.`,
                    `$1 + 7i$`,
                    [`$3 + 7i$`, `$5 + 7i$`, `$1 + 6i$`]
                );
            },

    genSpecComplexDivision() {
                return this.formatQuestion(
                    'Real and Complex Numbers',
                    `Simplify $\\frac{1}{i}$ into standard form $a + bi$.`,
                    `$-i$`,
                    [`$i$`, `$1$`, `$-1$`]
                );
            },

    genSpecComplexArg() {
                return this.formatQuestion(
                    'Real and Complex Numbers',
                    `Find the principal argument $\\text{Arg}(z)$ of the complex number $z = -3i$.`,
                    `$-\\frac{\\pi}{2}$`,
                    [`$\\frac{\\pi}{2}$`, `$\\pi$`, `$-\\pi$`]
                );
            },

    genSpecComplexDeMoivre() {
                return this.formatQuestion(
                    'Real and Complex Numbers',
                    `According to De Moivre's Theorem, $(\\text{cis}(\\theta))^3$ simplifies to:`,
                    `$\\text{cis}(3\\theta)$`,
                    [`$3\\text{cis}(\\theta)$`, `$\\text{cis}\\left(\\frac{\\theta}{3}\\right)$`, `$\\text{cis}^3(\\theta)$`]
                );
            },

    genSpecComplexEuler() {
                return this.formatQuestion(
                    'Real and Complex Numbers',
                    `Evaluate Euler's identity expression $e^{i\\pi}$.`,
                    `$-1$`,
                    [`$1$`, `$0$`, `$i$`]
                );
            },

    genSpecComplexRootsUnity() {
                return this.formatQuestion(
                    'Real and Complex Numbers',
                    `What is the sum of all the $n$-th roots of unity for $n \\ge 2$?`,
                    `$0$`,
                    [`$1$`, `$n$`, `$-1$`]
                );
            },

    genSpecComplexLocusCircle() {
                const r = Math.floor(Math.random() * 4) + 2;
                return this.formatQuestion(
                    'Real and Complex Numbers',
                    `Describe the geometric locus of the equation $|z - (2 + 3i)| = ${r}$ in the complex plane.`,
                    `A circle with centre $(2, 3)$ and radius $${r}$`,
                    [
                        `A circle with centre $(-2, -3)$ and radius $${r}$`,
                        `A line through $(2, 3)$ with gradient $${r}$`,
                        `An ellipse with foci at $(2, 3)$`
                    ]
                );
            },

    genSpecComplexLocusLine() {
                return this.formatQuestion(
                    'Real and Complex Numbers',
                    `The locus defined by $|z - 2| = |z - 4i|$ represents:`,
                    `The perpendicular bisector of the segment connecting $(2, 0)$ and $(0, 4)$`,
                    [
                        `A circle with radius $2$`,
                        `A line connecting $(2, 0)$ and $(0, 4)$`,
                        `A parabola with focus $(2, 0)$`
                    ]
                );
            },

    genSpecComplexMultiStepPowers() {
                return {
                    type: 'multi_step',
                    topic: 'Real and Complex Numbers',
                    text: `Powers of Complex Numbers ($z = 1 + i$)`,
                    steps: [
                        {
                            prompt: `Step 1: Find the modulus $|z|$ of $z = 1 + i$.`,
                            type: 'short_answer',
                            acceptableAnswers: ['sqrt(2)', '√2', '1.414']
                        },
                        {
                            prompt: `Step 2: Using polar form $z = \\sqrt{2}\\text{cis}(\\pi/4)$, compute $z^4 = (\\sqrt{2})^4 \\text{cis}(\\pi)$. What is the real value?`,
                            type: 'short_answer',
                            acceptableAnswers: ['-4', '-4+0i']
                        }
                    ]
                };
            }
};
