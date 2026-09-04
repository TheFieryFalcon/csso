// ---------------------------------------------------------
// MATHEMATICAL ELO RATING SYSTEM
// Implements standard FIDE pairwise Elo calculations for 1v1,
// multi-player lobbies, and solo performance runs.
// ---------------------------------------------------------

export const ELO_CONFIG = {
    DEFAULT_RATING: 1200,
    PROVISIONAL_MATCH_THRESHOLD: 15,
    K_FACTOR_PROVISIONAL: 40,
    K_FACTOR_STANDARD: 32,
    K_FACTOR_ELITE: 24,
    MIN_RATING: 400,
    MAX_RATING: 3000
};

/**
 * Calculates expected win probability of player A against player B
 * E_A = 1 / (1 + 10^((R_B - R_A) / 400))
 */
export function calculateExpectedScore(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Determines K-factor based on player experience and current rating
 */
export function getKFactor(matchesPlayed = 0, currentRating = 1200) {
    if (matchesPlayed < ELO_CONFIG.PROVISIONAL_MATCH_THRESHOLD) {
        return ELO_CONFIG.K_FACTOR_PROVISIONAL;
    }
    if (currentRating >= 2000) {
        return ELO_CONFIG.K_FACTOR_ELITE;
    }
    return ELO_CONFIG.K_FACTOR_STANDARD;
}

/**
 * Calculates pairwise Elo deltas for 2 players (1v1)
 * @param {number} ratingA - Rating of Player A
 * @param {number} ratingB - Rating of Player B
 * @param {number} actualScoreA - 1 (Win), 0.5 (Draw), 0 (Loss)
 * @param {number} matchesA - Number of matches played by A
 * @param {number} matchesB - Number of matches played by B
 * @returns {{ deltaA: number, deltaB: number, newRatingA: number, newRatingB: number, expectedA: number, expectedB: number }}
 */
export function calculate1v1Elo(ratingA, ratingB, actualScoreA, matchesA = 20, matchesB = 20) {
    const expectedA = calculateExpectedScore(ratingA, ratingB);
    const expectedB = 1 - expectedA;
    const actualScoreB = 1 - actualScoreA;

    const kA = getKFactor(matchesA, ratingA);
    const kB = getKFactor(matchesB, ratingB);

    const rawDeltaA = Math.round(kA * (actualScoreA - expectedA));
    const rawDeltaB = Math.round(kB * (actualScoreB - expectedB));

    const newRatingA = Math.max(ELO_CONFIG.MIN_RATING, Math.min(ELO_CONFIG.MAX_RATING, ratingA + rawDeltaA));
    const newRatingB = Math.max(ELO_CONFIG.MIN_RATING, Math.min(ELO_CONFIG.MAX_RATING, ratingB + rawDeltaB));

    return {
        deltaA: newRatingA - ratingA,
        deltaB: newRatingB - ratingB,
        newRatingA,
        newRatingB,
        expectedA: Math.round(expectedA * 100) / 100,
        expectedB: Math.round(expectedB * 100) / 100
    };
}

/**
 * Calculates multiplayer Elo deltas for N players in a room
 * Uses generalized pairwise sum: Delta_i = (K / (N - 1)) * SUM_{j != i} (S_ij - E_ij)
 * @param {Array<{ uid: string, rating: number, score: number, matchesPlayed?: number }>} players
 * @returns {Record<string, { delta: number, newRating: number, expectedScore: number, actualScore: number }>}
 */
export function calculateMultiplayerElo(players) {
    const N = players.length;
    const results = {};

    if (N <= 1) {
        // Solo run or 1 player remaining
        const p = players[0];
        return {
            [p.uid]: {
                delta: 0,
                newRating: p.rating || ELO_CONFIG.DEFAULT_RATING,
                expectedScore: 1,
                actualScore: 1
            }
        };
    }

    for (let i = 0; i < N; i++) {
        const pI = players[i];
        const rI = pI.rating || ELO_CONFIG.DEFAULT_RATING;
        const kI = getKFactor(pI.matchesPlayed || 20, rI);

        let sumActual = 0;
        let sumExpected = 0;

        for (let j = 0; j < N; j++) {
            if (i === j) continue;
            const pJ = players[j];
            const rJ = pJ.rating || ELO_CONFIG.DEFAULT_RATING;

            // Compute pairwise expected
            const exp = calculateExpectedScore(rI, rJ);
            sumExpected += exp;

            // Compute pairwise actual score based on final in-game points
            if (pI.score > pJ.score) {
                sumActual += 1;
            } else if (pI.score === pJ.score) {
                sumActual += 0.5;
            } else {
                sumActual += 0;
            }
        }

        const normalizedExpected = sumExpected / (N - 1);
        const normalizedActual = sumActual / (N - 1);

        const delta = Math.round(kI * (normalizedActual - normalizedExpected));
        const newRating = Math.max(ELO_CONFIG.MIN_RATING, Math.min(ELO_CONFIG.MAX_RATING, rI + delta));

        results[pI.uid] = {
            delta: newRating - rI,
            newRating,
            expectedScore: Math.round(normalizedExpected * 100) / 100,
            actualScore: Math.round(normalizedActual * 100) / 100
        };
    }

    return results;
}

/**
 * Calculates solo practice Elo adjustment based on target score vs attempts
 */
export function calculateSoloPracticeElo(currentRating, targetScore, answeredCount, correctCount) {
    const accuracy = answeredCount > 0 ? correctCount / answeredCount : 0;
    const k = 16; // Moderate K-factor for solo revision

    // Expected benchmark accuracy for rating
    const benchmarkAccuracy = 0.75;
    const diff = accuracy - benchmarkAccuracy;

    let delta = Math.round(k * diff * 2);
    // Cap solo gain/loss per session
    delta = Math.max(-12, Math.min(16, delta));

    const newRating = Math.max(ELO_CONFIG.MIN_RATING, Math.min(ELO_CONFIG.MAX_RATING, currentRating + delta));
    return {
        delta: newRating - currentRating,
        newRating,
        accuracy: Math.round(accuracy * 100)
    };
}
