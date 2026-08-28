// ---------------------------------------------------------
// SVG GEOMETRIC / ASYMPTOTE-STYLE VISUAL BUILDER
// ---------------------------------------------------------
export const SvgBuilder = {
    circleTemplate(content, size = 260) {
        const center = size / 2;
        const r = center - 30;
        return `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
            <defs>
                <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.2"/>
                    <stop offset="100%" stop-color="#a855f7" stop-opacity="0.05"/>
                </linearGradient>
            </defs>
            <circle cx="${center}" cy="${center}" r="${r}" fill="url(#circleGrad)" stroke="#6366f1" stroke-width="2.5" />
            <g transform="translate(${center}, ${center})">
                ${content}
            </g>
        </svg>
        `;
    },
    planeTemplate(content, size = 260) {
        const center = size / 2;
        return `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8"/>
                </marker>
                <marker id="arrow-pink" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ec4899"/>
                </marker>
            </defs>
            <!-- Grid lines -->
            <line x1="20" y1="${center}" x2="${size - 20}" y2="${center}" stroke="#334155" stroke-width="1.5" stroke-dasharray="3,3"/>
            <line x1="${center}" y1="20" x2="${center}" y2="${size - 20}" stroke="#334155" stroke-width="1.5" stroke-dasharray="3,3"/>
            <!-- Content -->
            <g transform="translate(${center}, ${center})">
                ${content}
            </g>
        </svg>
        `;
    },
    polarToCartesian(r, deg) {
        const rad = (deg - 90) * Math.PI / 180.0;
        return {
            x: r * Math.cos(rad),
            y: r * Math.sin(rad)
        };
    },
    dot(p, label = '', offset = {x: 0, y: -10}, color = '#ffffff') {
        return `
            <circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}" stroke="#0f172a" stroke-width="1.5"/>
            ${label ? `<text x="${p.x + offset.x}" y="${p.y + offset.y}" font-family="JetBrains Mono" font-size="12" font-weight="700" fill="${color}" text-anchor="middle">${label}</text>` : ''}
        `;
    },
    line(p1, p2, color = '#818cf8', width = 2, dash = '') {
        const dashAttr = dash ? `stroke-dasharray="${dash}"` : '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${dashAttr}/>`;
    },
    vector(p1, p2, color = '#818cf8', width = 2.5, marker = 'arrow') {
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" marker-end="url(#${marker})"/>`;
    },
    path(points, close = true, color = '#818cf8', fill = 'none', width = 2) {
        if (!points || points.length === 0) return '';
        let d = `M ${points[0].x} ${points[0].y} `;
        for (let i = 1; i < points.length; i++) {
            d += `L ${points[i].x} ${points[i].y} `;
        }
        if (close) d += 'Z';
        return `<path d="${d}" stroke="${color}" stroke-width="${width}" fill="${fill}"/>`;
    },
    text(x, y, str, color = '#f8fafc', size = 11, weight = '600') {
        return `<text x="${x}" y="${y}" font-family="JetBrains Mono" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="middle">${str}</text>`;
    },
    arc(center, radius, startAngle, endAngle, color = '#cbd5e1', width = 1.5) {
        const p1 = SvgBuilder.polarToCartesian(radius, startAngle);
        const p2 = SvgBuilder.polarToCartesian(radius, endAngle);
        const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
        return `<path d="M ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x} ${p2.y}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
    }
};

export function svgCircleTheorem(type = 'alt_segment') {
    const r = 100;
    if (type === 'alt_segment') {
        const pA = SvgBuilder.polarToCartesian(r, 180);
        const pB = SvgBuilder.polarToCartesian(r, 60);
        const pC = SvgBuilder.polarToCartesian(r, 310);
        const tLeft = { x: pA.x - 45, y: pA.y };
        const tRight = { x: pA.x + 45, y: pA.y };
        return SvgBuilder.circleTemplate(`
            ${SvgBuilder.line(tLeft, tRight, '#f43f5e', 2.5)}
            ${SvgBuilder.path([pA, pB, pC], true, '#818cf8', 'rgba(99, 102, 241, 0.1)', 2)}
            ${SvgBuilder.dot(pA, 'A', {x: 0, y: 15})}
            ${SvgBuilder.dot(pB, 'B', {x: 10, y: -5})}
            ${SvgBuilder.dot(pC, 'C', {x: -10, y: -5})}
            ${SvgBuilder.text(tLeft.x - 10, tLeft.y + 4, 'T', '#f43f5e')}
        `);
    } else if (type === 'chords') {
        const pA = SvgBuilder.polarToCartesian(r, 220);
        const pB = SvgBuilder.polarToCartesian(r, 40);
        const pC = SvgBuilder.polarToCartesian(r, 140);
        const pD = SvgBuilder.polarToCartesian(r, 330);
        const pP = { x: 5, y: 10 };
        return SvgBuilder.circleTemplate(`
            ${SvgBuilder.line(pA, pB, '#818cf8', 2)}
            ${SvgBuilder.line(pC, pD, '#ec4899', 2)}
            ${SvgBuilder.dot(pA, 'A')}
            ${SvgBuilder.dot(pB, 'B')}
            ${SvgBuilder.dot(pC, 'C')}
            ${SvgBuilder.dot(pD, 'D')}
            ${SvgBuilder.dot(pP, 'P', {x: 10, y: 10}, '#fbbf24')}
        `);
    } else if (type === 'cyclic_quad' || type === 'ptolemy') {
        const pA = SvgBuilder.polarToCartesian(r, 45);
        const pB = SvgBuilder.polarToCartesian(r, 120);
        const pC = SvgBuilder.polarToCartesian(r, 230);
        const pD = SvgBuilder.polarToCartesian(r, 315);
        return SvgBuilder.circleTemplate(`
            ${SvgBuilder.path([pA, pB, pC, pD], true, '#818cf8', 'rgba(129, 140, 248, 0.1)', 2)}
            ${SvgBuilder.line(pA, pC, '#ec4899', 1.5, '3,3')}
            ${SvgBuilder.line(pB, pD, '#ec4899', 1.5, '3,3')}
            ${SvgBuilder.dot(pA, 'A')}
            ${SvgBuilder.dot(pB, 'B')}
            ${SvgBuilder.dot(pC, 'C')}
            ${SvgBuilder.dot(pD, 'D')}
        `);
    } else if (type === 'tangent_secant') {
        const pT = SvgBuilder.polarToCartesian(r, 90);
        const pA = SvgBuilder.polarToCartesian(r, 200);
        const pB = SvgBuilder.polarToCartesian(r, 270);
        const pP = { x: 130, y: 50 };
        return SvgBuilder.circleTemplate(`
            ${SvgBuilder.line(pP, pT, '#f43f5e', 2)}
            ${SvgBuilder.line(pP, pA, '#818cf8', 2)}
            ${SvgBuilder.dot(pT, 'T')}
            ${SvgBuilder.dot(pA, 'A')}
            ${SvgBuilder.dot(pB, 'B')}
            ${SvgBuilder.dot(pP, 'P', {x: 10, y: 10}, '#fbbf24')}
        `);
    }
    return SvgBuilder.circleTemplate('');
}

export function svgVectorProofDiagram(type = 'apollonius') {
    if (type === 'apollonius') {
        const pA = { x: 0, y: -70 };
        const pB = { x: -80, y: 50 };
        const pC = { x: 80, y: 50 };
        const pD = { x: 0, y: 50 };
        return SvgBuilder.planeTemplate(`
            ${SvgBuilder.path([pA, pB, pC], true, '#818cf8', 'rgba(99, 102, 241, 0.1)', 2)}
            ${SvgBuilder.line(pA, pD, '#ec4899', 2.5)}
            ${SvgBuilder.dot(pA, 'A')}
            ${SvgBuilder.dot(pB, 'B')}
            ${SvgBuilder.dot(pC, 'C')}
            ${SvgBuilder.dot(pD, 'D (Midpoint)', {x: 0, y: 15}, '#fbbf24')}
        `);
    } else if (type === 'centroid') {
        const pA = { x: -20, y: -70 };
        const pB = { x: -80, y: 50 };
        const pC = { x: 80, y: 50 };
        const pD = { x: 0, y: 50 };
        const pE = { x: 30, y: -10 };
        const pF = { x: -50, y: -10 };
        const pG = { x: -6, y: 10 };
        return SvgBuilder.planeTemplate(`
            ${SvgBuilder.path([pA, pB, pC], true, '#818cf8', 'none', 2)}
            ${SvgBuilder.line(pA, pD, '#64748b', 1.5, '2,2')}
            ${SvgBuilder.line(pB, pE, '#64748b', 1.5, '2,2')}
            ${SvgBuilder.line(pC, pF, '#64748b', 1.5, '2,2')}
            ${SvgBuilder.dot(pA, 'A')}
            ${SvgBuilder.dot(pB, 'B')}
            ${SvgBuilder.dot(pC, 'C')}
            ${SvgBuilder.dot(pG, 'G (Centroid)', {x: 10, y: -8}, '#fbbf24')}
        `);
    } else if (type === 'rhombus') {
        const pO = { x: 0, y: 50 };
        const pU = { x: 60, y: 40 };
        const pV = { x: 40, y: -30 };
        const pUV = { x: 100, y: -40 };
        return SvgBuilder.planeTemplate(`
            ${SvgBuilder.path([pO, pU, pUV, pV], true, '#818cf8', 'rgba(129,140,248,0.1)', 2)}
            ${SvgBuilder.line(pO, pUV, '#ec4899', 2)}
            ${SvgBuilder.line(pU, pV, '#10b981', 2)}
            ${SvgBuilder.dot(pO, 'O')}
            ${SvgBuilder.dot(pU, 'u')}
            ${SvgBuilder.dot(pV, 'v')}
            ${SvgBuilder.dot(pUV, 'u+v')}
        `);
    } else if (type === 'quad') {
        const pA = { x: -70, y: -40 };
        const pB = { x: 40, y: -60 };
        const pC = { x: 80, y: 50 };
        const pD = { x: -50, y: 60 };
        const pP = { x: (pA.x + pB.x) / 2, y: (pA.y + pB.y) / 2 };
        const pQ = { x: (pB.x + pC.x) / 2, y: (pB.y + pC.y) / 2 };
        const pR = { x: (pC.x + pD.x) / 2, y: (pC.y + pD.y) / 2 };
        const pS = { x: (pD.x + pA.x) / 2, y: (pD.y + pA.y) / 2 };
        return SvgBuilder.planeTemplate(`
            ${SvgBuilder.path([pA, pB, pC, pD], true, '#64748b', 'none', 1.5)}
            ${SvgBuilder.path([pP, pQ, pR, pS], true, '#818cf8', 'rgba(129,140,248,0.15)', 2.5)}
            ${SvgBuilder.dot(pP, 'P')}
            ${SvgBuilder.dot(pQ, 'Q')}
            ${SvgBuilder.dot(pR, 'R')}
            ${SvgBuilder.dot(pS, 'S')}
        `);
    }
    return SvgBuilder.planeTemplate('');
}

export function svgCircleAngles(angle = 50) {
    const r = 100;
    const pO = { x: 0, y: 0 };
    const pA = SvgBuilder.polarToCartesian(r, 140);
    const pB = SvgBuilder.polarToCartesian(r, 220);
    const pP = SvgBuilder.polarToCartesian(r, 20);
    return SvgBuilder.circleTemplate(`
        ${SvgBuilder.line(pA, pO, '#6366f1', 2)}
        ${SvgBuilder.line(pB, pO, '#6366f1', 2)}
        ${SvgBuilder.line(pA, pP, '#ec4899', 2)}
        ${SvgBuilder.line(pB, pP, '#ec4899', 2)}
        ${SvgBuilder.dot(pO, 'O (Center)', {x: 10, y: 12}, '#fbbf24')}
        ${SvgBuilder.dot(pA, 'A')}
        ${SvgBuilder.dot(pB, 'B')}
        ${SvgBuilder.dot(pP, 'P')}
    `);
}
