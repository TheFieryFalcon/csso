// ---------------------------------------------------------
// RIGOROUS PROOFS GENERATOR MODULE
// Contains:
// 1. Procedural Multi-Step Proofs (Deterministic steps)
// 2. Single-Step Long-Answer Proofs (Evaluated via Gemini 3.7 Flash)
// ---------------------------------------------------------
import { svgCircleTheorem, svgVectorProofDiagram, svgCircleAngles } from '../svg-builder.js';

export const proofGenerators = {
    // =========================================================
    // SECTION A: PROCEDURAL MULTI-STEP PROOFS (Deterministic)
    // =========================================================
    genProofTrigTripleAngleCos() {
        return {
            type: 'multi_step',
            topic: 'Trigonometry (Spec)',
            text: `Derive the Triple Angle identity for cosine: $\\cos(3x) = 4\\cos^3(x) - 3\\cos(x)$.`,
            steps: [
                {
                    prompt: `Step 1: Write $\\cos(3x)$ as $\\cos(2x + x)$ and apply the compound angle formula $\\cos(A+B) = \\cos A \\cos B - \\sin A \\sin B$. Which expression is correct?`,
                    type: 'mcq',
                    options: [
                        `$\\cos(2x)\\cos(x) - \\sin(2x)\\sin(x)$`,
                        `$\\cos(2x)\\cos(x) + \\sin(2x)\\sin(x)$`,
                        `$\\cos(3x)\\cos(x) - \\sin(3x)\\sin(x)$`,
                        `$2\\cos(x)\\sin(x) - \\cos(2x)$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: Substitute $\\cos(2x) = 2\\cos^2(x) - 1$ and $\\sin(2x) = 2\\sin(x)\\cos(x)$. Simplify to find the coefficient of $\\cos^3(x)$.`,
                    type: 'short_answer',
                    acceptableAnswers: ['4', 'k=4', '+4']
                }
            ]
        };
    },

    genProofTrigHalfTangent() {
        return {
            type: 'multi_step',
            topic: 'Trigonometry (Spec)',
            text: `Prove the half-angle tangent identity: $\\frac{\\sin(2x)}{1 + \\cos(2x)} = \\tan(x)$.`,
            steps: [
                {
                    prompt: `Step 1: Replace $\\sin(2x)$ with $2\\sin(x)\\cos(x)$ and $\\cos(2x)$ with $2\\cos^2(x) - 1$. What does the denominator $1 + \\cos(2x)$ simplify to?`,
                    type: 'short_answer',
                    acceptableAnswers: ['2cos^2(x)', '2cos^2x', '2*cos(x)^2', '2(cos(x))^2']
                },
                {
                    prompt: `Step 2: Divide numerator by denominator: $\\frac{2\\sin(x)\\cos(x)}{2\\cos^2(x)}$. What single trigonometric ratio remains?`,
                    type: 'short_answer',
                    acceptableAnswers: ['tan(x)', 'tanx', 'tan']
                }
            ]
        };
    },

    genProofVectorApollonius() {
        const visual = svgVectorProofDiagram('apollonius');
        return {
            type: 'multi_step',
            topic: 'Vectors in the Plane',
            text: `Prove Apollonius' Theorem: In $\\triangle ABC$ with median $AD$ to midpoint $D$ of $BC$, $|AB|^2 + |AC|^2 = 2|AD|^2 + 2|BD|^2$.`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Set the origin at midpoint $D$, so $\\mathbf{d} = \\mathbf{0}$. If position vector of $B$ is $\\mathbf{b}$, what is the position vector of $C$?`,
                    type: 'short_answer',
                    acceptableAnswers: ['-b', '-1b', '-\\mathbf{b}']
                },
                {
                    prompt: `Step 2: $|AB|^2 + |AC|^2 = |\\mathbf{b}-\\mathbf{a}|^2 + |-\\mathbf{b}-\\mathbf{a}|^2$. Expand and simplify using dot products. What is the multiplier $k$ in $k(|\\mathbf{a}|^2 + |\\mathbf{b}|^2)$?`,
                    type: 'short_answer',
                    acceptableAnswers: ['2', 'k=2']
                }
            ]
        };
    },

    genProofVectorCentroid() {
        const visual = svgVectorProofDiagram('centroid');
        return {
            type: 'multi_step',
            topic: 'Vectors in the Plane',
            text: `Prove that the medians of $\\triangle ABC$ concur at the centroid $\\mathbf{g} = \\frac{1}{3}(\\mathbf{a} + \\mathbf{b} + \\mathbf{c})$.`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Let $D$ be the midpoint of $BC$. Write its position vector $\\mathbf{d}$ in terms of $\\mathbf{b}$ and $\\mathbf{c}$.`,
                    type: 'mcq',
                    options: [
                        `$\\frac{\\mathbf{b} + \\mathbf{c}}{2}$`,
                        `$\\frac{\\mathbf{b} - \\mathbf{c}}{2}$`,
                        `$\\frac{2\\mathbf{b} + \\mathbf{c}}{3}$`,
                        `$\\mathbf{b} + \\mathbf{c}$`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: The centroid $G$ divides median $AD$ in the ratio $2:1$. Using the section formula $\\mathbf{g} = \\frac{1\\mathbf{a} + 2\\mathbf{d}}{1+2}$, what is the scalar denominator?`,
                    type: 'short_answer',
                    acceptableAnswers: ['3', 'denominator=3']
                }
            ]
        };
    },

    genProofGeomAlternateSegment() {
        const visual = svgCircleTheorem('alt_segment');
        return {
            type: 'multi_step',
            topic: 'Geometry',
            text: `Prove the Alternate Segment Theorem: The angle between a tangent and a chord equals the angle in the alternate segment ($\\angle TAB = \\angle ACB$).`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Construct diameter $AD$ and join $DB$. Since $AD$ is a diameter, what is the value of $\\angle ABD$ in degrees?`,
                    type: 'short_answer',
                    acceptableAnswers: ['90', '90 degrees', '90 deg', 'pi/2']
                },
                {
                    prompt: `Step 2: Since radius $OA \\perp$ tangent $AT$, $\\angle TAB = 90^\\circ - \\angle DAB = \\angle ADB$. Why does $\\angle ADB = \\angle ACB$?`,
                    type: 'mcq',
                    options: [
                        `Angles in the same segment subtended by chord AB are equal`,
                        `Opposite angles of cyclic quadrilateral are supplementary`,
                        `Angle at center is twice angle at circumference`,
                        `Base angles of an isosceles triangle are equal`
                    ],
                    ansIndex: 0
                }
            ]
        };
    },

    genProofGeomIntersectingChords() {
        const visual = svgCircleTheorem('chords');
        return {
            type: 'multi_step',
            topic: 'Geometry',
            text: `Prove the Intersecting Chords Theorem: If chords $AB$ and $CD$ intersect at $P$, then $PA \\cdot PB = PC \\cdot PD$.`,
            visual: visual,
            steps: [
                {
                    prompt: `Step 1: Join $AC$ and $DB$. In triangles $\\triangle PAC$ and $\\triangle PDB$, $\\angle APC = \\angle DPB$ (vertically opposite) and $\\angle PAC = \\angle PDB$. What theorem justifies $\\angle PAC = \\angle PDB$?`,
                    type: 'mcq',
                    options: [
                        `Angles subtended by the same arc BC are equal`,
                        `Alternate interior angles are equal`,
                        `Opposite angles of cyclic quadrilateral sum to 180`,
                        `Exterior angle equals opposite interior angle`
                    ],
                    ansIndex: 0
                },
                {
                    prompt: `Step 2: Since $\\triangle PAC \\sim \\triangle PDB$ by AA similarity, the ratio of sides is $\\frac{PA}{PD} = \\frac{PC}{PB}$. Cross-multiply to give $PA \\cdot PB = ?$`,
                    type: 'short_answer',
                    acceptableAnswers: ['PC*PD', 'PC.PD', 'PCPD', 'PD*PC', 'PD.PC']
                }
            ]
        };
    },

    // =========================================================
    // SECTION B: SINGLE-STEP LONG-ANSWER PROOFS (Gemini AI Evaluated)
    // =========================================================
    genLongProofTrigTripleAngleCos() {
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Prove rigorously that for all real $x$:\n\\[\\cos(3x) = 4\\cos^3(x) - 3\\cos(x)\\]`,
            expectedAnswerGuidelines: `Student must split cos(3x) into cos(2x+x), apply compound angle expansion cos(2x)cos(x) - sin(2x)sin(x), substitute double-angle formulas cos(2x)=2cos^2(x)-1 and sin(2x)=2sin(x)cos(x), replace sin^2(x) with 1-cos^2(x), and simplify algebraically to 4cos^3(x)-3cos(x).`
        };
    },

    genLongProofTrigHalfTangent() {
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Prove rigorously that for all $x \\neq \\frac{\\pi}{2} + k\\pi$ and $x \\neq \\pi + 2k\\pi$:\n\\[\\frac{\\sin(2x)}{1 + \\cos(2x)} = \\tan(x)\\]`,
            expectedAnswerGuidelines: `Student must express sin(2x) as 2sin(x)cos(x), substitute cos(2x) as 2cos^2(x)-1 so that 1+cos(2x) = 2cos^2(x), cancel common factor 2cos(x), and arrive at sin(x)/cos(x) = tan(x).`
        };
    },

    genLongProofTrigSumToProduct() {
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Prove rigorously the sum-to-product identity:\n\\[\\sin(A) + \\sin(B) = 2\\sin\\left(\\frac{A+B}{2}\\right)\\cos\\left(\\frac{A-B}{2}\\right)\\]`,
            expectedAnswerGuidelines: `Student should let u=(A+B)/2 and v=(A-B)/2, write A=u+v and B=u-v, expand sin(u+v)+sin(u-v) using compound angle formulas (sin u cos v + cos u sin v + sin u cos v - cos u sin v = 2 sin u cos v), and substitute back u and v.`
        };
    },

    genLongProofTrigArcSinArcCos() {
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Prove that for all $x \\in [-1, 1]$:\n\\[\\arcsin(x) + \\arccos(x) = \\frac{\\pi}{2}\\]`,
            expectedAnswerGuidelines: `Student must let theta = arcsin(x) with theta in [-pi/2, pi/2], state x = sin(theta) = cos(pi/2 - theta), show pi/2 - theta lies in [0, pi] (the principal domain of arccos), hence arccos(x) = pi/2 - theta = pi/2 - arcsin(x), concluding arcsin(x) + arccos(x) = pi/2.`
        };
    },

    genLongProofTrigRFormula() {
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Trigonometry (Spec)',
            text: `Show that any linear combination $a\\cos(x) + b\\sin(x)$ (with $a, b > 0$) can be written in the form $R\\cos(x - \\alpha)$, and determine exact formulas for $R$ and $\\alpha$.`,
            expectedAnswerGuidelines: `Student must expand R cos(x - alpha) = R cos x cos alpha + R sin x sin alpha, equate coefficients to get R cos alpha = a and R sin alpha = b, square and sum to get R^2(cos^2 alpha + sin^2 alpha) = a^2 + b^2 => R = sqrt(a^2 + b^2), and divide to obtain tan alpha = b/a => alpha = arctan(b/a).`
        };
    },

    genLongProofVectorApollonius() {
        const visual = svgVectorProofDiagram('apollonius');
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Vectors in the Plane',
            text: `Prove Apollonius' Theorem using vectors: For any triangle $\\triangle ABC$ with median $AD$ to the midpoint $D$ of $BC$,\n\\[|AB|^2 + |AC|^2 = 2|AD|^2 + 2|BD|^2\\]`,
            visual: visual,
            expectedAnswerGuidelines: `Student sets origin at midpoint D (or uses position vectors relative to D), setting d=0 so position vector of C is -b (where b is position of B). Then AB = b - a and AC = -b - a. Expanding |AB|^2 + |AC|^2 = (b - a).(b - a) + (-b - a).(-b - a) = (b.b - 2a.b + a.a) + (b.b + 2a.b + a.a) = 2|a|^2 + 2|b|^2 = 2|AD|^2 + 2|BD|^2.`
        };
    },

    genLongProofVectorCentroid() {
        const visual = svgVectorProofDiagram('centroid');
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Vectors in the Plane',
            text: `Prove using vector methods that the three medians of any triangle $\\triangle ABC$ concur at a point $G$, and find the position vector $\\mathbf{g}$ in terms of $\\mathbf{a}, \\mathbf{b}, \\mathbf{c}$.`,
            visual: visual,
            expectedAnswerGuidelines: `Student determines midpoint D of BC as d=(b+c)/2. The point G dividing AD in ratio 2:1 has position vector g = (1*a + 2*d)/(1+2) = (a + 2*(b+c)/2)/3 = (a+b+c)/3. By symmetry, dividing the other two medians BE and CF in ratio 2:1 yields the exact same position vector (a+b+c)/3, proving all three medians are concurrent at G.`
        };
    },

    genLongProofVectorPythagoras() {
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Vectors in the Plane',
            text: `Use vector dot products to prove the Pythagorean Theorem for vectors $\\mathbf{u}$ and $\\mathbf{v}$ that are perpendicular ($\\mathbf{u} \\cdot \\mathbf{v} = 0$).`,
            expectedAnswerGuidelines: `Student calculates the hypotenuse vector magnitude squared |u + v|^2 = (u + v).(u + v) = u.u + 2(u.v) + v.v. Since u and v are perpendicular, u.v = 0, so |u + v|^2 = |u|^2 + |v|^2.`
        };
    },

    genLongProofVectorRhombusDiagonals() {
        const visual = svgVectorProofDiagram('rhombus');
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Vectors in the Plane',
            text: `Prove using vector dot products that the diagonals of any rhombus are perpendicular to each other.`,
            visual: visual,
            expectedAnswerGuidelines: `Let adjacent sides be vectors u and v with equal lengths |u| = |v|. The two diagonals are represented by u + v and u - v (or v - u). Taking their dot product: (u + v).(u - v) = u.u - u.v + v.u - v.v = |u|^2 - |v|^2. Since |u| = |v|, this equals 0, proving the diagonals are perpendicular.`
        };
    },

    genLongProofVectorCauchySchwarz() {
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Vectors in the Plane',
            text: `Prove the Cauchy-Schwarz inequality for any two vectors $\\mathbf{u}, \\mathbf{v} \\in \\mathbb{R}^2$:\n\\[(\\mathbf{u} \\cdot \\mathbf{v})^2 \\le |\\mathbf{u}|^2 |\\mathbf{v}|^2\\]\nand state the condition for equality.`,
            expectedAnswerGuidelines: `Student writes u.v = |u||v|cos(theta). Squaring gives (u.v)^2 = |u|^2|v|^2 cos^2(theta). Since cos^2(theta) <= 1 for all real theta, (u.v)^2 <= |u|^2|v|^2. Equality holds if and only if cos^2(theta) = 1 (i.e. theta = 0 or pi), meaning u and v are linearly dependent / collinear (or one is the zero vector).`
        };
    },

    genLongProofVectorThalesSemicircle() {
        const visual = svgCircleTheorem('alt_segment');
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Vectors in the Plane',
            text: `Use vector methods to prove Thales' Theorem: The angle subtended by a diameter at any point on the circumference of a circle is a right angle ($90^\\circ$).`,
            visual: visual,
            expectedAnswerGuidelines: `Let center of circle be origin O. Diameter AB has position vectors a and -a with |a|=r. Let P on the circumference have position vector p with |p|=r. Vector PA = a - p and PB = -a - p = -(a + p). Compute dot product PA.PB = (a - p).(-(a + p)) = -(a.a - p.p) = -(|a|^2 - |p|^2) = -(r^2 - r^2) = 0. Therefore PA is perpendicular to PB, so angle APB = 90 degrees.`
        };
    },

    genLongProofVectorVarignon() {
        const visual = svgVectorProofDiagram('quad');
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Vectors in the Plane',
            text: `Prove Varignon's Theorem using vectors: The midpoints of the sides of any planar quadrilateral $ABCD$ form a parallelogram.`,
            visual: visual,
            expectedAnswerGuidelines: `Let vertices be a, b, c, d. Midpoints of AB, BC, CD, DA are P=(a+b)/2, Q=(b+c)/2, R=(c+d)/2, S=(d+a)/2. Vector PQ = Q - P = (b+c)/2 - (a+b)/2 = (c-a)/2. Vector SR = R - S = (c+d)/2 - (d+a)/2 = (c-a)/2. Since PQ = SR, opposite sides are equal in length and parallel, proving PQRS is a parallelogram.`
        };
    },

    genLongProofGeomAlternateSegment() {
        const visual = svgCircleTheorem('alt_segment');
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Geometry',
            text: `Give a complete and rigorous geometric proof of the Alternate Segment Theorem: The angle between a tangent to a circle and a chord through the point of contact is equal to the angle subtended by the chord in the alternate segment.`,
            visual: visual,
            expectedAnswerGuidelines: `Student draws tangent TAB at A and chord AC. Constructs diameter AD and joins DC. States radius OA perp tangent TAB, so angle TAB = 90 - angle CAD. Angle ACD = 90 (angle in semicircle). In triangle ACD, angle ADC = 90 - angle CAD = angle TAB. But angle ADC = angle ABC (angles in same segment subtended by arc AC). Hence angle TAB = angle ABC.`
        };
    },

    genLongProofGeomCyclicQuadSupplementary() {
        const visual = svgCircleTheorem('cyclic_quad');
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Geometry',
            text: `Prove rigorously that the opposite angles of any cyclic quadrilateral $ABCD$ sum to $180^\\circ$.`,
            visual: visual,
            expectedAnswerGuidelines: `Let O be center of circumcircle. Join OB and OD. Angle at center BOD (reflex) = 2 * angle BCD. Angle at center BOD (non-reflex) = 2 * angle BAD. Sum of angles around point O is 360, so 2*angle BAD + 2*angle BCD = 360 => angle BAD + angle BCD = 180 degrees. By angle sum of quadrilateral, the other pair also sums to 180.`
        };
    },

    genLongProofGeomIntersectingChords() {
        const visual = svgCircleTheorem('chords');
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Geometry',
            text: `Prove the Intersecting Chords Theorem: If two chords $AB$ and $CD$ of a circle intersect at an internal point $P$, then $PA \\cdot PB = PC \\cdot PD$.`,
            visual: visual,
            expectedAnswerGuidelines: `Join AC and DB. In triangles PAC and PDB: angle APC = angle DPB (vertically opposite angles), angle PAC = angle PDB (angles in same segment subtended by arc BC). By AA similarity, triangle PAC is similar to triangle PDB. Therefore corresponding sides are in proportion: PA/PD = PC/PB. Cross-multiplying yields PA*PB = PC*PD.`
        };
    },

    genLongProofGeomTangentSecant() {
        const visual = svgCircleTheorem('tangent_secant');
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Geometry',
            text: `Prove the Tangent-Secant Theorem (Power of a Point): If from an external point $P$, a tangent $PT$ touches the circle at $T$ and a secant line passes through circle points $A$ and $B$, then $PT^2 = PA \\cdot PB$.`,
            visual: visual,
            expectedAnswerGuidelines: `Join TA and TB. Consider triangles PTA and PBT: angle P is common, angle PTA = angle PBT (Alternate Segment Theorem). Thus triangle PTA is similar to triangle PBT by AA similarity. Therefore PT/PB = PA/PT. Cross-multiplying gives PT^2 = PA*PB.`
        };
    },

    genLongProofGeomPtolemy() {
        const visual = svgCircleTheorem('ptolemy');
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Geometry',
            text: `State and prove Ptolemy's Theorem for a cyclic quadrilateral $ABCD$ with vertices in order:\n\\[AC \\cdot BD = AB \\cdot CD + BC \\cdot AD\\]`,
            visual: visual,
            expectedAnswerGuidelines: `Construct point K on diagonal BD such that angle DAK = angle CAB. Since angle ADK = angle ACB (angles in same segment), triangle ADK is similar to triangle ACB. Thus AK/AB = AD/AC => AK*AC = AB*AD... and similarly for triangle ABK and triangle ACD, BK*AC = BC*AD. Adding both equations gives (AK + BK)*AC = BD*AC = AB*CD + BC*AD.`
        };
    },

    genLongProofGeomAngleAtCenter() {
        const visual = svgCircleAngles(50);
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Geometry',
            text: `Prove that the angle subtended by an arc at the center of a circle is twice the angle subtended by the same arc at any point on the circumference.`,
            visual: visual,
            expectedAnswerGuidelines: `Let arc AB subtend angle AOB at center O and angle APB at circumference point P. Draw diameter POQ. In triangle OAP, OA=OP (radii), so triangle OAP is isosceles and angle OPA = angle OAP. Exterior angle AOQ = angle OPA + angle OAP = 2*angle OPA. Similarly in triangle OBP, exterior angle BOQ = 2*angle OPB. Adding yields angle AOB = angle AOQ + angle BOQ = 2(angle OPA + angle OPB) = 2*angle APB.`
        };
    },

    genLongProofGeomSimsonsLine() {
        const visual = svgCircleTheorem('simson');
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Geometry',
            text: `Prove Simson's Theorem: The feet of the perpendiculars from any point $P$ on the circumcircle of triangle $\\triangle ABC$ to the three sides (or their extensions) are collinear.`,
            visual: visual,
            expectedAnswerGuidelines: `Let projections of P onto BC, CA, AB be X, Y, Z. Construct cyclic quadrilaterals: P, Y, Z, A lie on circle with diameter PA (right angles at Y, Z). P, X, Y, C lie on circle with diameter PC. Using cyclic quad angles, angle PZY = angle PAY = angle PAC = 180 - angle PBC = angle PBX = angle PZX. This proves angle PZY = angle PZX, hence X, Y, Z lie on a single straight line (Simson's Line).`
        };
    },

    genLongProofGeomTangentsFromExternalPoint() {
        return {
            type: 'long_answer_proof',
            isProof: true,
            isLongProof: true,
            topic: 'Geometry',
            text: `Prove that the two tangents drawn to a circle from an external point $P$ are equal in length and subtend equal angles at the center.`,
            expectedAnswerGuidelines: `Let tangents touch circle at T1 and T2 with center O. In triangles OPT1 and OPT2: angle OT1P = angle OT2P = 90 (tangent perp radius), OT1 = OT2 (radii), OP is common hypotenuse. By RHS congruence, triangle OPT1 is congruent to triangle OPT2. Thus PT1 = PT2 (tangents equal in length) and angle T1OP = angle T2OP (subtend equal angles at center).`
        };
    }
};
