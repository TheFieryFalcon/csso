// ---------------------------------------------------------
// GEMINI 3.7 FLASH API INTEGRATION FOR PROOF PARSING
// ---------------------------------------------------------

const LOCAL_STORAGE_KEY_GEMINI_KEY = 'csso_gemini_api_key';

export function getGeminiApiKey() {
    return localStorage.getItem(LOCAL_STORAGE_KEY_GEMINI_KEY) || '';
}

export function setGeminiApiKey(key) {
    if (key && key.trim()) {
        localStorage.setItem(LOCAL_STORAGE_KEY_GEMINI_KEY, key.trim());
    } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_GEMINI_KEY);
    }
}

/**
 * Validates a student's proof step input using Gemini 3.7 Flash.
 * Returns { isCorrect: boolean, score: number, feedback: string, errorType?: string }
 */
export async function evaluateProofStepWithGemini({
    problemContext,
    stepPrompt,
    studentAnswer,
    expectedAnswerGuidelines,
    acceptableAnswers
}) {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        // Fallback to local heuristic rule matcher
        return fallbackLocalProofEvaluator(studentAnswer, acceptableAnswers);
    }

    const systemInstruction = `You are an expert WACE ATAR Mathematics Methods and Specialist examiner.
Your task is to strictly and accurately evaluate a student's mathematical proof step or algebraic argument.
Analyze the student's reasoning, algebraic transformations, and mathematical justifications.

Evaluate if the response is mathematically sound, logically valid, and meets the criteria for this specific proof step.

You MUST respond strictly in valid JSON matching this schema:
{
  "isCorrect": boolean,
  "score": number (between 0.0 and 1.0),
  "feedback": string (concise explanation of why it is correct or what was missing/erroneous),
  "canonicalForm": string (canonical simplified expression or LaTeX string)
}`;

    const prompt = `Problem Context:
${problemContext}

Proof Step Prompt:
${stepPrompt}

Expected Solution Criteria / Reference:
${expectedAnswerGuidelines || (acceptableAnswers ? acceptableAnswers.join(' OR ') : 'Standard mathematical proof')}

Student's Submitted Step:
"""
${studentAnswer}
"""

Evaluate the student's submission now.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `${systemInstruction}\n\n${prompt}` }]
                    }
                ],
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.1
                }
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.warn("Gemini API Error:", errData);
            return fallbackLocalProofEvaluator(studentAnswer, acceptableAnswers);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
            return fallbackLocalProofEvaluator(studentAnswer, acceptableAnswers);
        }

        const parsed = JSON.parse(rawText);
        return {
            isCorrect: Boolean(parsed.isCorrect),
            score: typeof parsed.score === 'number' ? parsed.score : (parsed.isCorrect ? 1.0 : 0.0),
            feedback: parsed.feedback || (parsed.isCorrect ? '✅ Step logically sound!' : '❌ Step needs revision.'),
            canonicalForm: parsed.canonicalForm || '',
            isAI: true
        };
    } catch (err) {
        console.warn("Gemini evaluation request failed:", err);
        return fallbackLocalProofEvaluator(studentAnswer, acceptableAnswers);
    }
}

/**
 * Heuristic fallback matcher for offline / unauthenticated gameplay
 */
export function fallbackLocalProofEvaluator(studentAnswer, acceptableAnswers) {
    if (!studentAnswer) return { isCorrect: false, score: 0, feedback: "Please enter an answer.", isAI: false };
    if (!acceptableAnswers || acceptableAnswers.length === 0) return { isCorrect: true, score: 1, feedback: "Step accepted.", isAI: false };

    const cleanInput = studentAnswer.trim().toLowerCase().replace(/\s+/g, '').replace(/[\$\(\)]/g, '');
    const isMatch = acceptableAnswers.some(ans => {
        const cleanAns = ans.toString().trim().toLowerCase().replace(/\s+/g, '').replace(/[\$\(\)]/g, '');
        return cleanInput === cleanAns || cleanInput.includes(cleanAns) || cleanAns.includes(cleanInput);
    });

    return {
        isCorrect: isMatch,
        score: isMatch ? 1.0 : 0.0,
        feedback: isMatch ? "✅ Step verified." : "❌ Step does not match expected proof criteria.",
        isAI: false
    };
}
