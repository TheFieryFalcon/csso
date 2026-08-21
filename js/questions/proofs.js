// ---------------------------------------------------------
// 20 MULTI-STEP PROOFS & THEOREMS (SPEC TRIG, VECTORS, GEOMETRY)
// Equipped with Asymptote-Style SVG Diagrams & Gemini Verification Criteria
// ---------------------------------------------------------
import { SvgBuilder } from '../svg-builder.js';

export const proofGenerators = {
    // =========================================================
    // SECTION A: SPECIALIST TRIGONOMETRY PROOFS (7 PROOFS)
    // =========================================================

    // 1. Triple Angle Cosine Proof
    genProofTrigTripleAngleCos() {
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Proof of Triple Angle Formula: $\\cos(3x) = 4\\cos^3(x) - 3\\cos(x)$`,
            steps: [
                {
                    prompt: `Step 1: Write $\\cos(3x)$ as $\\cos(2x + x)$ and apply the compound angle cosine addition formula $\\cos(A+B) = \\cos A \\cos B - \\sin A \\sin B$. Which expression is obtained?`,
                    type: 'mcq',
                    options: [
                        `$\\cos(2x)\\cos(x) - \\sin(2x)\\sin(x)$`,
                        `$\\cos(2x)\\cos(x) + \\sin(2x)\\sin(x)$`,
                        `$\\cos(3x) - \\sin(3x)$`,
                        `$2\\cos(x)\\cos(2x)$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: Substitute $\\cos(2x) = 2\\cos^2(x) - 1$ and $\\sin(2x) = 2\\sin(x)\\cos(x)$. Express the entire equation in terms of $\\cos(x)$ and $\\sin^2(x)$.`,
                    type: 'mcq',
                    options: [
                        `$(2\\cos^2(x) - 1)\\cos(x) - 2\\sin^2(x)\\cos(x)$`,
                        `$(2\\cos^2(x) + 1)\\cos(x) + 2\\sin^2(x)\\cos(x)$`,
                        `$2\\cos^3(x) - 2\\sin^2(x)$`,
                        `$\\cos^3(x) - 3\\sin^2(x)\\cos(x)$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 3: Replace $\\sin^2(x)$ with $1 - \\cos^2(x)$ and simplify algebraically. State the final coefficient of $\\cos^3(x)$.`,
                    type: 'short_answer',
                    acceptableAnswers: ['4', '4cos^3(x)', '+4'],
                    expectedAnswerGuidelines: 'Coefficient is 4 since 2cos^3(x) - (-2cos^3(x)) = 4cos^3(x)'
                }
            ]
        };
    },

    // 2. Double Angle Half-Tangent Proof
    genProofTrigHalfTangent() {
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Proof of Identity: $\\frac{\\sin(2x)}{1 + \\cos(2x)} = \\tan(x)$`,
            steps: [
                {
                    prompt: `Step 1: Using double angle formulas, substitute $\\sin(2x) = 2\\sin(x)\\cos(x)$ and $\\cos(2x) = 2\\cos^2(x) - 1$. What does the denominator $1 + \\cos(2x)$ simplify to?`,
                    type: 'short_answer',
                    acceptableAnswers: ['2cos^2(x)', '2cos^2x', '2*cos(x)^2'],
                    expectedAnswerGuidelines: '1 + (2cos^2(x) - 1) = 2cos^2(x)'
                },
                {
                    prompt: `Step 2: Simplify the fraction $\\frac{2\\sin(x)\\cos(x)}{2\\cos^2(x)}$ by cancelling common non-zero factors ($2\\cos(x)$).`,
                    type: 'mcq',
                    options: [
                        `$\\frac{\\sin(x)}{\\cos(x)} = \\tan(x)$`,
                        `$\\frac{\\cos(x)}{\\sin(x)} = \\cot(x)$`,
                        `$2\\tan(x)$`,
                        `$\\sin(x)\\cos(x)$`
                    ],
                    ansIndex: 0
                }
            ]
        };
    },

    // 3. Triple Sum Tangent Addition Proof
    genProofTrigTripleTangent() {
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Proof of 3-Angle Tangent Identity: $\\tan(A+B+C) = \\frac{\\sum \\tan A - \\prod \\tan A}{1 - \\sum \\tan A \\tan B}$`,
            steps: [
                {
                    prompt: `Step 1: Let $\\theta = A + B$. Apply the tangent addition formula $\\tan(\\theta + C) = \\frac{\\tan\\theta + \\tan C}{1 - \\tan\\theta\\tan C}$. What is the numerator after substituting $\\tan(A+B) = \\frac{\\tan A + \\tan B}{1 - \\tan A\\tan B}$ and finding a common denominator?`,
                    type: 'mcq',
                    options: [
                        `$\\tan A + \\tan B + \\tan C - \\tan A \\tan B \\tan C$`,
                        `$\\tan A + \\tan B + \\tan C + \\tan A \\tan B \\tan C$`,
                        `$\\tan A \\tan B \\tan C - (\\tan A + \\tan B + \\tan C)$`,
                        `$1 - \\tan A \\tan B - \\tan B \\tan C - \\tan C \\tan A$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: If $A, B, C$ are the interior angles of a triangle ($A + B + C = \\pi$), then $\\tan(A+B+C) = \\tan(\\pi) = 0$. What fundamental relation between $\\tan A + \\tan B + \\tan C$ and $\\tan A \\tan B \\tan C$ follows?`,
                    type: 'mcq',
                    options: [
                        `$\\tan A + \\tan B + \\tan C = \\tan A \\tan B \\tan C$`,
                        `$\\tan A + \\tan B + \\tan C = 0$`,
                        `$\\tan A \\tan B \\tan C = 1$`,
                        `$\\tan A + \\tan B + \\tan C = -1$`
                    ],
                    ansIndex: 0
                }
            ]
        };
    },

    // 4. Telescoping Cosine Sum Product Proof
    genProofTrigTelescopingCosSum() {
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Proof of Summation Identity: $\\sum_{k=1}^3 \\cos((2k-1)x) = \\frac{\\sin(6x)}{2\\sin(x)}$`,
            steps: [
                {
                    prompt: `Step 1: Multiply the sum $S = \\cos(x) + \\cos(3x) + \\cos(5x)$ by $2\\sin(x)$. Apply the product-to-sum identity $2\\sin(x)\\cos(nx) = \\sin((n+1)x) - \\sin((n-1)x)$ to each term. What telescoping sum is produced?`,
                    type: 'mcq',
                    options: [
                        `$(\\sin(2x) - 0) + (\\sin(4x) - \\sin(2x)) + (\\sin(6x) - \\sin(4x))$`,
                        `$(\\sin(2x) + \\sin(0)) + (\\sin(4x) + \\sin(2x)) + (\\sin(6x) + \\sin(4x))$`,
                        `$\\sin(6x) - \\sin(x)$`,
                        `$2\\sin(6x) - 2\\sin(2x)$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: After telescoping cancellation of intermediate terms, what is the single remaining numerator term?`,
                    type: 'short_answer',
                    acceptableAnswers: ['sin(6x)', '\\sin(6x)', 'sin6x'],
                    expectedAnswerGuidelines: 'All intermediate terms sin(2x) and sin(4x) cancel, leaving sin(6x).'
                }
            ]
        };
    },

    // 5. Complementary Inverse Trig Proof
    genProofTrigArcSinArcCos() {
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Proof that $\\arcsin(x) + \\arccos(x) = \\frac{\\pi}{2}$ for all $x \\in [-1, 1]$`,
            steps: [
                {
                    prompt: `Step 1: Let $\\theta = \\arcsin(x)$, so $\\sin(\\theta) = x$ with $\\theta \\in [-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$. Using the co-function identity, write $x$ as a cosine: $x = \\cos(\\phi)$. What is $\\phi$ in terms of $\\theta$?`,
                    type: 'mcq',
                    options: [
                        `$\\phi = \\frac{\\pi}{2} - \\theta$`,
                        `$\\phi = \\pi - \\theta$`,
                        `$\\phi = \\theta - \\frac{\\pi}{2}$`,
                        `$\\phi = 2\\pi - \\theta$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: Since $x = \\cos\\left(\\frac{\\pi}{2} - \\theta\\right)$ and $\\frac{\\pi}{2} - \\theta \\in [0, \\pi]$, it follows that $\\arccos(x) = \\frac{\\pi}{2} - \\theta$. Adding $\\arcsin(x) = \\theta$ yields what constant sum?`,
                    type: 'short_answer',
                    acceptableAnswers: ['pi/2', '\\pi/2', '1.5708'],
                    expectedAnswerGuidelines: 'arcsin(x) + arccos(x) = theta + (pi/2 - theta) = pi/2'
                }
            ]
        };
    },

    // 6. Multiple Angle Sum Identity Proof
    genProofTrigFourAngleCos() {
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Proof of Identity: $1 + \\cos(2\\theta) + \\cos(4\\theta) + \\cos(6\\theta) = 4\\cos(\\theta)\\cos(2\\theta)\\cos(3\\theta)$`,
            steps: [
                {
                    prompt: `Step 1: Group the terms as $(1 + \\cos(6\\theta)) + (\\cos(2\\theta) + \\cos(4\\theta))$. Use $1 + \\cos(6\\theta) = 2\\cos^2(3\\theta)$ and the sum-to-product formula $\\cos(2\\theta) + \\cos(4\\theta) = 2\\cos(3\\theta)\\cos(\\theta)$. Factor out the common term $2\\cos(3\\theta)$. What expression remains in parentheses?`,
                    type: 'mcq',
                    options: [
                        `$\\cos(3\\theta) + \\cos(\\theta)$`,
                        `$\\cos(3\\theta) - \\cos(\\theta)$`,
                        `$2\\cos(3\\theta)$`,
                        `$\\cos(2\\theta) + 1$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: Apply sum-to-product again to $\\cos(3\\theta) + \\cos(\\theta) = 2\\cos(2\\theta)\\cos(\\theta)$. Multiply by the outer factor $2\\cos(3\\theta)$ to obtain the final product. What is the scalar coefficient?`,
                    type: 'short_answer',
                    acceptableAnswers: ['4', '+4'],
                    expectedAnswerGuidelines: '2 * 2 = 4'
                }
            ]
        };
    },

    // 7. Auxiliary R-Formula Transformation Proof
    genProofTrigRFormulaDerivation() {
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Proof of the Auxiliary R-Formula: $a\\cos(x) + b\\sin(x) \\equiv R\\cos(x - \\alpha)$`,
            steps: [
                {
                    prompt: `Step 1: Expand $R\\cos(x - \\alpha) = R\\cos(x)\\cos(\\alpha) + R\\sin(x)\\sin(\\alpha)$. Equating coefficients with $a\\cos(x) + b\\sin(x)$ gives $R\\cos(\\alpha) = a$ and $R\\sin(\\alpha) = b$. Squaring and adding both equations ($R^2\\cos^2\\alpha + R^2\\sin^2\\alpha$) yields $R^2 = ?$`,
                    type: 'short_answer',
                    acceptableAnswers: ['a^2 + b^2', 'a^2+b^2', 'b^2+a^2'],
                    expectedAnswerGuidelines: 'R^2(cos^2(alpha) + sin^2(alpha)) = a^2 + b^2 => R^2 = a^2 + b^2'
                },
                {
                    prompt: `Step 2: Dividing $R\\sin(\\alpha) = b$ by $R\\cos(\\alpha) = a$ yields what exact expression for $\\tan(\\alpha)$?`,
                    type: 'mcq',
                    options: [
                        `$\\tan(\\alpha) = \\frac{b}{a}$`,
                        `$\\tan(\\alpha) = \\frac{a}{b}$`,
                        `$\\tan(\\alpha) = \\frac{a^2}{b^2}$`,
                        `$\\tan(\\alpha) = \\sqrt{a^2 + b^2}$`
                    ],
                    ansIndex: 0
                }
            ]
        };
    },

    // =========================================================
    // SECTION B: VECTORS IN THE PLANE & 3D PROOFS (7 PROOFS)
    // =========================================================

    // 8. Vector Proof of Apollonius' Theorem
    genProofVectorApollonius() {
        const visual = SvgBuilder.planeTemplate(`
            ${SvgBuilder.path([{x: -70, y: 50}, {x: 70, y: 50}, {x: 0, y: -60}], true, '#818cf8')}
            ${SvgBuilder.line({x: 0, y: -60}, {x: 0, y: 50}, '#ec4899', 2, '4,4')}
            ${SvgBuilder.dot({x: 0, y: -60}, 'A', {x: 0, y: -12})}
            ${SvgBuilder.dot({x: -70, y: 50}, 'B', {x: -12, y: 12})}
            ${SvgBuilder.dot({x: 70, y: 50}, 'C', {x: 12, y: 12})}
            ${SvgBuilder.dot({x: 0, y: 50}, 'D (Midpoint)', {x: 0, y: 15}, '#ec4899')}
        `);
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Vectors in the Plane',
            text: `Vector Proof of Apollonius' Theorem: $|AB|^2 + |AC|^2 = 2|AD|^2 + 2|BD|^2$`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Set the origin at midpoint $D$, so position vector $\\mathbf{d} = \\mathbf{0}$. If $B$ has vector $-\\mathbf{m}$, then $C$ has vector $+\\mathbf{m}$. Let $A$ have vector $\\mathbf{a}$. Express $\\vec{AB} = \\mathbf{b} - \\mathbf{a}$ and $\\vec{AC} = \\mathbf{c} - \\mathbf{a}$ in terms of $\\mathbf{a}$ and $\\mathbf{m}$.`,
                    type: 'mcq',
                    options: [
                        `$\\vec{AB} = -\\mathbf{m} - \\mathbf{a}$ and $\\vec{AC} = \\mathbf{m} - \\mathbf{a}$`,
                        `$\\vec{AB} = \\mathbf{a} + \\mathbf{m}$ and $\\vec{AC} = \\mathbf{a} - \\mathbf{m}$`,
                        `$\\vec{AB} = 2\\mathbf{m}$ and $\\vec{AC} = 2\\mathbf{a}$`,
                        `$\\vec{AB} = -\\mathbf{a}$ and $\\vec{AC} = \\mathbf{m}$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: Expand $|AB|^2 + |AC|^2 = |-\\mathbf{m} - \\mathbf{a}|^2 + |\\mathbf{m} - \\mathbf{a}|^2 = (\\mathbf{m}+\\mathbf{a})\\cdot(\\mathbf{m}+\\mathbf{a}) + (\\mathbf{m}-\\mathbf{a})\\cdot(\\mathbf{m}-\\mathbf{a})$. What is the simplified dot product expansion?`,
                    type: 'mcq',
                    options: [
                        `$2|\\mathbf{a}|^2 + 2|\\mathbf{m}|^2$`,
                        `$|\\mathbf{a}|^2 + |\\mathbf{m}|^2$`,
                        `$4\\mathbf{a}\\cdot\\mathbf{m}$`,
                        `$2|\\mathbf{a}|^2 - 2|\\mathbf{m}|^2$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 3: Since $|\\mathbf{a}| = |AD|$ (median length) and $|\\mathbf{m}| = |BD|$, what is the coefficient multiplying $(|AD|^2 + |BD|^2)$?`,
                    type: 'short_answer',
                    acceptableAnswers: ['2', '+2'],
                    expectedAnswerGuidelines: '|AB|^2 + |AC|^2 = 2(|AD|^2 + |BD|^2)'
                }
            ]
        };
    },

    // 9. Centroid Concurrency Proof
    genProofVectorCentroid() {
        const visual = SvgBuilder.planeTemplate(`
            ${SvgBuilder.path([{x: -80, y: 60}, {x: 80, y: 60}, {x: 20, y: -70}], true, '#818cf8')}
            ${SvgBuilder.line({x: 20, y: -70}, {x: 0, y: 60}, '#94a3b8', 1.5, '3,3')}
            ${SvgBuilder.line({x: -80, y: 60}, {x: 50, y: -5}, '#94a3b8', 1.5, '3,3')}
            ${SvgBuilder.line({x: 80, y: 60}, {x: -30, y: -5}, '#94a3b8', 1.5, '3,3')}
            ${SvgBuilder.dot({x: 6.67, y: 16.67}, 'G', {x: 12, y: -8}, '#ec4899')}
        `);
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Vectors in the Plane',
            text: `Vector Proof of Centroid Concurrency in $\\triangle ABC$`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Let the position vectors of vertices $A, B, C$ be $\\mathbf{a}, \\mathbf{b}, \\mathbf{c}$. The midpoint of side $BC$ is $D = \\frac{\\mathbf{b} + \\mathbf{c}}{2}$. Point $G$ divides median $AD$ in the ratio $2:1$ from $A$. Use the section formula $\\mathbf{g} = \\frac{1\\mathbf{a} + 2\\mathbf{d}}{1 + 2}$ to find $\\mathbf{g}$.`,
                    type: 'mcq',
                    options: [
                        `$\\mathbf{g} = \\frac{\\mathbf{a} + \\mathbf{b} + \\mathbf{c}}{3}$`,
                        `$\\mathbf{g} = \\frac{\\mathbf{a} + 2\\mathbf{b} + 2\\mathbf{c}}{5}$`,
                        `$\\mathbf{g} = \\frac{\\mathbf{a} + \\mathbf{b} + \\mathbf{c}}{2}$`,
                        `$\\mathbf{g} = \\frac{2\\mathbf{a} + \\mathbf{b} + \\mathbf{c}}{4}$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: Because the expression $\\frac{\\mathbf{a} + \\mathbf{b} + \\mathbf{c}}{3}$ is completely symmetric in $\\mathbf{a}, \\mathbf{b}, \\mathbf{c}$, does the same point $G$ divide the other two medians $BE$ and $CF$ in the ratio $2:1$?`,
                    type: 'mcq',
                    options: [
                        `Yes, proving all three medians are concurrent at G`,
                        `No, each median has a different division point`
                    ],
                    ansIndex: 0
                }
            ]
        };
    },

    // 10. Vector Pythagorean Theorem Proof
    genProofVectorPythagoras() {
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Vectors in the Plane',
            text: `Vector Dot Product Proof of the Pythagorean Theorem`,
            steps: [
                {
                    prompt: `Step 1: In right-angled triangle $ABC$, let $\\vec{CB} = \\mathbf{a}$ and $\\vec{CA} = \\mathbf{b}$ meet at $90^\\circ$ at vertex $C$. What is the value of the dot product $\\mathbf{a} \\cdot \\mathbf{b}$?`,
                    type: 'short_answer',
                    acceptableAnswers: ['0', 'zero'],
                    expectedAnswerGuidelines: 'Perpendicular vectors have dot product equal to zero: a . b = |a||b|cos(90) = 0.'
                },
                {
                    prompt: `Step 2: The hypotenuse vector is $\\mathbf{c} = \\vec{AB} = \\mathbf{a} - \\mathbf{b}$. Expand the squared magnitude $|\\mathbf{c}|^2 = (\\mathbf{a} - \\mathbf{b}) \\cdot (\\mathbf{a} - \\mathbf{b})$. Since $\\mathbf{a} \\cdot \\mathbf{b} = 0$, what does this simplify to?`,
                    type: 'mcq',
                    options: [
                        `$|\\mathbf{a}|^2 + |\\mathbf{b}|^2$`,
                        `$|\\mathbf{a}|^2 - |\\mathbf{b}|^2$`,
                        `$|\\mathbf{a}|^2 + |\\mathbf{b}|^2 - 2|\\mathbf{a}||\\mathbf{b}|$`,
                        `$2|\\mathbf{a}|^2 + 2|\\mathbf{b}|^2$`
                    ],
                    ansIndex: 0
                }
            ]
        };
    },

    // 11. Rhombus Perpendicular Diagonals Vector Proof
    genProofVectorRhombusDiagonals() {
        const visual = SvgBuilder.planeTemplate(`
            ${SvgBuilder.path([{x: -60, y: 0}, {x: 0, y: -45}, {x: 60, y: 0}, {x: 0, y: 45}], true, '#818cf8')}
            ${SvgBuilder.line({x: -60, y: 0}, {x: 60, y: 0}, '#ec4899', 2)}
            ${SvgBuilder.line({x: 0, y: -45}, {x: 0, y: 45}, '#ec4899', 2)}
            ${SvgBuilder.dot({x: 0, y: 0}, '90°', {x: 14, y: -6}, '#cbd5e1')}
        `);
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Vectors in the Plane',
            text: `Vector Proof: Diagonals of a Rhombus are Perpendicular`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Let the sides of rhombus $OACB$ be represented by vectors $\\vec{OA} = \\mathbf{u}$ and $\\vec{OB} = \\mathbf{v}$. By definition of a rhombus, $|\\mathbf{u}| = |\\mathbf{v}|$. The diagonal vectors are $\\vec{OC} = \\mathbf{u} + \\mathbf{v}$ and $\\vec{BA} = \\mathbf{u} - \\mathbf{v}$. Expand their dot product $(\\mathbf{u} + \\mathbf{v}) \\cdot (\\mathbf{u} - \\mathbf{v})$.`,
                    type: 'mcq',
                    options: [
                        `$|\\mathbf{u}|^2 - |\\mathbf{v}|^2$`,
                        `$|\\mathbf{u}|^2 + |\\mathbf{v}|^2$`,
                        `$2\\mathbf{u} \\cdot \\mathbf{v}$`,
                        `$0$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: Since $|\\mathbf{u}| = |\\mathbf{v}|$, the difference $|\\mathbf{u}|^2 - |\\mathbf{v}|^2$ evaluates to what value?`,
                    type: 'short_answer',
                    acceptableAnswers: ['0', 'zero'],
                    expectedAnswerGuidelines: '|u|^2 - |v|^2 = 0, proving the diagonals are perpendicular.'
                }
            ]
        };
    },

    // 12. Cauchy-Schwarz Inequality Vector Proof
    genProofVectorCauchySchwarz() {
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Vectors in the Plane',
            text: `Vector Proof of Cauchy-Schwarz Inequality: $(\\mathbf{u} \\cdot \\mathbf{v})^2 \\le |\\mathbf{u}|^2 |\\mathbf{v}|^2$`,
            steps: [
                {
                    prompt: `Step 1: Recall the geometric definition of the scalar dot product: $\\mathbf{u} \\cdot \\mathbf{v} = |\\mathbf{u}||\\mathbf{v}|\\cos(\\theta)$, where $\\theta$ is the angle between $\\mathbf{u}$ and $\\mathbf{v}$. Square both sides: $(\\mathbf{u} \\cdot \\mathbf{v})^2 = |\\mathbf{u}|^2 |\\mathbf{v}|^2 \\cos^2(\\theta)$. What is the maximum possible value of $\\cos^2(\\theta)$ for real angles $\\theta$?`,
                    type: 'short_answer',
                    acceptableAnswers: ['1', '1.0', '+1'],
                    expectedAnswerGuidelines: 'For any real angle theta, -1 <= cos(theta) <= 1, so 0 <= cos^2(theta) <= 1.'
                },
                {
                    prompt: `Step 2: Since $\\cos^2(\\theta) \\le 1$, it directly follows that $(\\mathbf{u} \\cdot \\mathbf{v})^2 \\le |\\mathbf{u}|^2 |\\mathbf{v}|^2$. Under what geometric condition does equality hold?`,
                    type: 'mcq',
                    options: [
                        `When $\\mathbf{u}$ and $\\mathbf{v}$ are parallel/collinear ($\\theta = 0$ or $\\pi$)`,
                        `When $\\mathbf{u}$ and $\\mathbf{v}$ are perpendicular ($\\theta = \\frac{\\pi}{2}$)`,
                        `When $|\\mathbf{u}| = |\\mathbf{v}| = 1$`,
                        `Never`
                    ],
                    ansIndex: 0
                }
            ]
        };
    },

    // 13. Semicircle Angle Vector Proof (Thales' Theorem)
    genProofVectorThalesSemicircle() {
        const visual = SvgBuilder.circleTemplate(`
            ${SvgBuilder.line({x: -70, y: 0}, {x: 70, y: 0}, '#6366f1')}
            ${SvgBuilder.line({x: -70, y: 0}, {x: 20, y: -67.08}, '#818cf8')}
            ${SvgBuilder.line({x: 70, y: 0}, {x: 20, y: -67.08}, '#818cf8')}
            ${SvgBuilder.dot({x: 0, y: 0}, 'O', {x: 0, y: 15})}
            ${SvgBuilder.dot({x: -70, y: 0}, 'A', {x: -12, y: 0})}
            ${SvgBuilder.dot({x: 70, y: 0}, 'B', {x: 12, y: 0})}
            ${SvgBuilder.dot({x: 20, y: -67.08}, 'P', {x: 0, y: -12}, '#ec4899')}
        `);
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Vectors in the Plane',
            text: `Vector Proof: Angle Subtended in a Semicircle is a Right Angle`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Let the centre of the circle of radius $r$ be the origin $O$. The diameter endpoints are $\\vec{OA} = -\\mathbf{r}$ and $\\vec{OB} = +\\mathbf{r}$. For any point $P$ on the circumference, position vector is $\\mathbf{p}$ with $|\\mathbf{p}| = r$. Express $\\vec{PA}$ and $\\vec{PB}$ in terms of $\\mathbf{p}$ and $\\mathbf{r}$.`,
                    type: 'mcq',
                    options: [
                        `$\\vec{PA} = -\\mathbf{r} - \\mathbf{p}$ and $\\vec{PB} = \\mathbf{r} - \\mathbf{p}$`,
                        `$\\vec{PA} = \\mathbf{p} - \\mathbf{r}$ and $\\vec{PB} = \\mathbf{p} + \\mathbf{r}$`,
                        `$\\vec{PA} = 2\\mathbf{r}$ and $\\vec{PB} = 2\\mathbf{p}$`,
                        `$\\vec{PA} = -\\mathbf{p}$ and $\\vec{PB} = \\mathbf{p}$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: Take the dot product $\\vec{PA} \\cdot \\vec{PB} = (-\\mathbf{p} - \\mathbf{r}) \\cdot (-\\mathbf{p} + \\mathbf{r}) = |\\mathbf{p}|^2 - |\\mathbf{r}|^2$. Since $|\\mathbf{p}| = r$ and $|\\mathbf{r}| = r$, what is the result?`,
                    type: 'short_answer',
                    acceptableAnswers: ['0', 'zero'],
                    expectedAnswerGuidelines: '|p|^2 - |r|^2 = r^2 - r^2 = 0, proving PA is perpendicular to PB (angle APB = 90 deg).'
                }
            ]
        };
    },

    // 14. Varignon's Parallelogram Vector Proof
    genProofVectorVarignon() {
        const visual = SvgBuilder.planeTemplate(`
            ${SvgBuilder.path([{x: -80, y: -40}, {x: 40, y: -70}, {x: 80, y: 40}, {x: -40, y: 70}], true, '#64748b')}
            ${SvgBuilder.path([{x: -20, y: -55}, {x: 60, y: -15}, {x: 20, y: 55}, {x: -60, y: 15}], true, '#818cf8', 'rgba(99,102,241,0.15)')}
            ${SvgBuilder.dot({x: -20, y: -55}, 'P', {x: 0, y: -10})}
            ${SvgBuilder.dot({x: 60, y: -15}, 'Q', {x: 12, y: 0})}
            ${SvgBuilder.dot({x: 20, y: 55}, 'R', {x: 0, y: 12})}
            ${SvgBuilder.dot({x: -60, y: 15}, 'S', {x: -12, y: 0})}
        `);
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Vectors in the Plane',
            text: `Vector Proof of Varignon's Theorem: Midpoints of Any Quadrilateral Form a Parallelogram`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Let the vertices of quadrilateral $ABCD$ have vectors $\\mathbf{a}, \\mathbf{b}, \\mathbf{c}, \\mathbf{d}$. The midpoints of sides $AB$ and $BC$ are $P = \\frac{\\mathbf{a}+\\mathbf{b}}{2}$ and $Q = \\frac{\\mathbf{b}+\\mathbf{c}}{2}$. Find vector $\\vec{PQ} = Q - P$.`,
                    type: 'mcq',
                    options: [
                        `$\\vec{PQ} = \\frac{\\mathbf{c} - \\mathbf{a}}{2}$`,
                        `$\\vec{PQ} = \\frac{\\mathbf{b} - \\mathbf{a}}{2}$`,
                        `$\\vec{PQ} = \\frac{\\mathbf{c} + \\mathbf{a}}{2}$`,
                        `$\\vec{PQ} = \\mathbf{c} - \\mathbf{a}$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: Similarly, midpoints of $CD$ and $DA$ are $R = \\frac{\\mathbf{c}+\\mathbf{d}}{2}$ and $S = \\frac{\\mathbf{d}+\\mathbf{a}}{2}$. Vector $\\vec{SR} = R - S = \\frac{\\mathbf{c} - \\mathbf{a}}{2}$. Since $\\vec{PQ} = \\vec{SR}$, what geometric conclusion follows?`,
                    type: 'mcq',
                    options: [
                        `Opposite sides are equal and parallel, so PQRS is always a parallelogram`,
                        `PQRS is always a square`,
                        `PQRS is a trapezoid only`,
                        `PQRS is equilateral`
                    ],
                    ansIndex: 0
                }
            ]
        };
    },

    // =========================================================
    // SECTION C: CIRCLE & GEOMETRIC PROOFS WITH ASYMPTOTE DIAGRAMS (6 PROOFS)
    // =========================================================

    // 15. Alternate Segment Theorem Rigorous Proof
    genProofGeomAlternateSegment() {
        const pA = SvgBuilder.polarToCartesian(100, 270);
        const pB = SvgBuilder.polarToCartesian(100, 140);
        const pC = SvgBuilder.polarToCartesian(100, 40);
        const pD = SvgBuilder.polarToCartesian(100, 90);
        const visual = SvgBuilder.circleTemplate(`
            ${SvgBuilder.line({x: -120, y: pA.y}, {x: 120, y: pA.y}, '#ec4899', 2)}
            ${SvgBuilder.path([pA, pB, pC], true, '#818cf8')}
            ${SvgBuilder.line(pA, pD, '#94a3b8', 1.5, '4,4')}
            ${SvgBuilder.line(pB, pD, '#94a3b8', 1.5, '4,4')}
            ${SvgBuilder.dot(pA, 'A (Tangent Point)', {x: 0, y: 15})}
            ${SvgBuilder.dot(pB, 'B', {x: -15, y: -10})}
            ${SvgBuilder.dot(pC, 'C', {x: 15, y: -10})}
            ${SvgBuilder.dot(pD, 'D (Diameter)', {x: 0, y: -15})}
        `);
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Geometry',
            text: `Rigorous Proof of the Alternate Segment Theorem`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Construct diameter $AD$ through centre $O$. Tangent line $TA$ meets radius $OA$ at what angle?`,
                    type: 'short_answer',
                    acceptableAnswers: ['90', '90°', '90 deg'],
                    expectedAnswerGuidelines: 'Radius to tangent point is perpendicular: angle TAD = 90 deg.'
                },
                {
                    prompt: `Step 2: Since $AD$ is a diameter, angle in semicircle $\\angle ABD = 90^\\circ$. In right $\\triangle ABD$, $\\angle ADB = 90^\\circ - \\angle DAB$. Also $\\angle TAB = 90^\\circ - \\angle DAB$. Therefore $\\angle TAB = \\angle ADB$. By the Angles in Same Segment theorem, $\\angle ADB = \\angle ACB$. What is the final equality?`,
                    type: 'mcq',
                    options: [
                        `$\\angle TAB = \\angle ACB$ (Angle between tangent and chord equals angle in alternate segment)`,
                        `$\\angle TAB = 2\\angle ACB$`,
                        `$\\angle TAB + \\angle ACB = 180^\\circ$`,
                        `$\\angle TAB = 90^\\circ - \\angle ACB$`
                    ],
                    ansIndex: 0
                }
            ]
        };
    },

    // 16. Cyclic Quad Supplementary Angles Proof
    genProofGeomCyclicQuadSupplementary() {
        const pA = SvgBuilder.polarToCartesian(100, 135);
        const pB = SvgBuilder.polarToCartesian(100, 45);
        const pC = SvgBuilder.polarToCartesian(100, 315);
        const pD = SvgBuilder.polarToCartesian(100, 225);
        const pO = { x: 0, y: 0 };
        const visual = SvgBuilder.circleTemplate(`
            ${SvgBuilder.path([pA, pB, pC, pD], true, '#818cf8')}
            ${SvgBuilder.line(pB, pO, '#ec4899', 1.5, '3,3')}
            ${SvgBuilder.line(pD, pO, '#ec4899', 1.5, '3,3')}
            ${SvgBuilder.dot(pO, 'O', {x: 0, y: 15})}
            ${SvgBuilder.dot(pA, 'A', {x: -12, y: -12})}
            ${SvgBuilder.dot(pB, 'B', {x: 12, y: -12})}
            ${SvgBuilder.dot(pC, 'C', {x: 12, y: 15})}
            ${SvgBuilder.dot(pD, 'D', {x: -12, y: 15})}
        `);
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Geometry',
            text: `Proof: Opposite Angles of a Cyclic Quadrilateral are Supplementary`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: In cyclic quadrilateral $ABCD$, connect $B$ and $D$ to centre $O$. The minor arc $BCD$ subtends central angle $\\angle BOD = 2\\angle BAD$. The major arc $BAD$ subtends reflex central angle $\\text{reflex } \\angle BOD = 2\\angle BCD$. What is the sum of central angle and reflex central angle?`,
                    type: 'short_answer',
                    acceptableAnswers: ['360', '360°', '360 deg'],
                    expectedAnswerGuidelines: 'Angles around a point sum to 360 degrees.'
                },
                {
                    prompt: `Step 2: Since $2\\angle BAD + 2\\angle BCD = 360^\\circ$, dividing by $2$ proves $\\angle BAD + \\angle BCD = ?$`,
                    type: 'short_answer',
                    acceptableAnswers: ['180', '180°', '180 deg'],
                    expectedAnswerGuidelines: 'Opposite angles sum to 180 degrees (supplementary).'
                }
            ]
        };
    },

    // 17. Intersecting Chords Theorem Similarity Proof
    genProofGeomIntersectingChordsProof() {
        const visual = SvgBuilder.circleTemplate(`
            ${SvgBuilder.line({x: -80, y: -30}, {x: 70, y: 40}, '#818cf8', 2)}
            ${SvgBuilder.line({x: -60, y: 50}, {x: 50, y: -60}, '#818cf8', 2)}
            ${SvgBuilder.line({x: -80, y: -30}, {x: -60, y: 50}, '#ec4899', 1.5, '3,3')}
            ${SvgBuilder.line({x: 70, y: 40}, {x: 50, y: -60}, '#ec4899', 1.5, '3,3')}
            ${SvgBuilder.dot({x: 0, y: 0}, 'P', {x: 0, y: -10}, '#f8fafc')}
            ${SvgBuilder.dot({x: -80, y: -30}, 'A', {x: -12, y: 0})}
            ${SvgBuilder.dot({x: 70, y: 40}, 'B', {x: 12, y: 0})}
            ${SvgBuilder.dot({x: -60, y: 50}, 'C', {x: -12, y: 10})}
            ${SvgBuilder.dot({x: 50, y: -60}, 'D', {x: 12, y: -10})}
        `);
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Geometry',
            text: `Proof of Intersecting Chords Theorem ($PA \\cdot PB = PC \\cdot PD$)`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Consider chords $AB$ and $CD$ intersecting at interior point $P$. Connect $AC$ and $DB$. In $\\triangle PAC$ and $\\triangle PDB$, $\\angle APC = \\angle DPB$ (vertically opposite). Why is $\\angle PAC = \\angle PDB$?`,
                    type: 'mcq',
                    options: [
                        `Angles subtended by the same arc BC in the same segment are equal`,
                        `Alternate interior angles`,
                        `Corresponding angles on parallel chords`,
                        `Complementary angles`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: By AA similarity, $\\triangle PAC \\sim \\triangle PDB$. Equating corresponding side ratios $\\frac{PA}{PD} = \\frac{PC}{PB}$. Cross-multiplying gives what fundamental product?`,
                    type: 'short_answer',
                    acceptableAnswers: ['PA*PB=PC*PD', 'PA.PB=PC.PD', 'PA PB = PC PD'],
                    expectedAnswerGuidelines: 'PA * PB = PC * PD (Intersecting Chords Theorem)'
                }
            ]
        };
    },

    // 18. Tangent-Secant Power of Point Proof
    genProofGeomTangentSecantProof() {
        const visual = SvgBuilder.circleTemplate(`
            ${SvgBuilder.line({x: -110, y: 60}, {x: 0, y: -100}, '#ec4899', 2)}
            ${SvgBuilder.line({x: -110, y: 60}, {x: 95, y: 30}, '#818cf8', 2)}
            ${SvgBuilder.line({x: 0, y: -100}, {x: -30, y: 48}, '#94a3b8', 1.5, '3,3')}
            ${SvgBuilder.line({x: 0, y: -100}, {x: 95, y: 30}, '#94a3b8', 1.5, '3,3')}
            ${SvgBuilder.dot({x: -110, y: 60}, 'P', {x: -12, y: 0})}
            ${SvgBuilder.dot({x: 0, y: -100}, 'T', {x: 0, y: -12}, '#ec4899')}
            ${SvgBuilder.dot({x: -30, y: 48}, 'A', {x: 0, y: 15})}
            ${SvgBuilder.dot({x: 95, y: 30}, 'B', {x: 12, y: 0})}
        `);
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Geometry',
            text: `Proof of Tangent-Secant Theorem ($PT^2 = PA \\cdot PB$)`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: From external point $P$, tangent $PT$ touches the circle at $T$ and secant $PAB$ cuts the circle at $A$ and $B$. In $\\triangle PTA$ and $\\triangle PBT$, $\\angle P$ is shared. By the Alternate Segment Theorem, $\\angle PTA = \\angle PBT$. Therefore:`,
                    type: 'mcq',
                    options: [
                        `$\\triangle PTA \\sim \\triangle PBT$ (by AA similarity)`,
                        `$\\triangle PTA \\cong \\triangle PBT$ (congruent)`,
                        `$PT = PA$`,
                        `$\\angle PAT = 90^\\circ$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: From the similarity ratio $\\frac{PT}{PB} = \\frac{PA}{PT}$, cross-multiplying yields:`,
                    type: 'short_answer',
                    acceptableAnswers: ['PT^2=PA*PB', 'PT^2 = PA . PB', 'PT^2=PA PB'],
                    expectedAnswerGuidelines: 'PT^2 = PA * PB'
                }
            ]
        };
    },

    // 19. Ptolemy's Theorem for Cyclic Quadrilaterals
    genProofGeomPtolemy() {
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Geometry',
            text: `Proof of Ptolemy's Theorem for Cyclic Quadrilateral $ABCD$`,
            steps: [
                {
                    prompt: `Step 1: For a convex cyclic quadrilateral $ABCD$ with diagonals $AC$ and $BD$, construct point $K$ on diagonal $AC$ such that $\\angle ABK = \\angle DBC$. Using similar triangles $\\triangle ABK \\sim \\triangle DBC$, what is the relation for $AK \\cdot BD$?`,
                    type: 'mcq',
                    options: [
                        `$AK \\cdot BD = AB \\cdot CD$`,
                        `$AK \\cdot BD = BC \\cdot AD$`,
                        `$AK \\cdot BD = AC^2$`,
                        `$AK \\cdot BD = AB + CD$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: Similarly, $\\triangle KBC \\sim \\triangle ABD$ gives $KC \\cdot BD = BC \\cdot AD$. Adding both equations $(AK + KC) \\cdot BD = AC \\cdot BD$. What is Ptolemy's final identity?`,
                    type: 'mcq',
                    options: [
                        `$AC \\cdot BD = AB \\cdot CD + BC \\cdot AD$ (Product of diagonals equals sum of products of opposite sides)`,
                        `$AC \\cdot BD = AB \\cdot BC + CD \\cdot DA$`,
                        `$AC^2 + BD^2 = AB^2 + BC^2 + CD^2 + DA^2$`,
                        `$AC \\cdot BD = \\frac{1}{2}(AB \\cdot CD)$`
                    ],
                    ansIndex: 0
                }
            ]
        };
    },

    // 20. Simson's Line Collinearity Proof
    genProofGeomSimsonsLine() {
        const visual = SvgBuilder.circleTemplate(`
            ${SvgBuilder.path([{x: -70, y: 50}, {x: 70, y: 50}, {x: 10, y: -70}], true, '#64748b')}
            ${SvgBuilder.dot({x: -70, y: 50}, 'A')}
            ${SvgBuilder.dot({x: 70, y: 50}, 'B')}
            ${SvgBuilder.dot({x: 10, y: -70}, 'C')}
            ${SvgBuilder.dot({x: -50, y: -55}, 'P (Circumcircle)', {x: -15, y: -10}, '#ec4899')}
            ${SvgBuilder.line({x: -80, y: -20}, {x: 40, y: 55}, '#ec4899', 2, '2,2')}
        `);
        return {
            type: 'multi_step',
            isProof: true,
            topic: 'Geometry',
            text: `Proof of Simson's Line: Projections of Circumcircle Point onto Triangle Sides are Collinear`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Let $P$ lie on the circumcircle of $\\triangle ABC$. Drop perpendiculars from $P$ to the three sides (or extensions), meeting them at $X, Y, Z$. Because each projection angle is $90^\\circ$, four cyclic quadrilaterals are formed around $P$. What connects the perpendicular feet?`,
                    type: 'mcq',
                    options: [
                        `The three feet X, Y, Z lie on a single straight line called the Simson line`,
                        `The three feet form an equilateral triangle`,
                        `The three feet are vertices of a cyclic quadrilateral`,
                        `The three feet concur at the circumcentre`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: If $P$ did not lie on the circumcircle, would the three feet $X, Y, Z$ still be collinear?`,
                    type: 'mcq',
                    options: [
                        `No, collinearity holds if and only if P lies on the circumcircle`,
                        `Yes, they are collinear for any arbitrary point P`
                    ],
                    ansIndex: 0
                }
            ]
        };
    }
};
