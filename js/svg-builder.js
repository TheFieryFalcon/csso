// ---------------------------------------------------------
// DYNAMIC MATHEMATICAL SVG GENERATION ENGINE
// Generates mathematically precise circle geometry, vectors,
// polygons, and function plots dynamically from coordinates & angles.
// ---------------------------------------------------------

/**
 * Core Geometric & Vector Math Utilities
 */
export const GeoMath = {
    degToRad(deg) {
        return (deg * Math.PI) / 180.0;
    },
    radToDeg(rad) {
        return (rad * 180.0) / Math.PI;
    },
    polar(r, deg, center = { x: 0, y: 0 }) {
        const rad = GeoMath.degToRad(deg);
        return {
            x: center.x + r * Math.cos(rad),
            y: center.y - r * Math.sin(rad) // Invert for SVG
        };
    },
    distance(p1, p2) {
        return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    },
    midpoint(p1, p2, t = 0.5) {
        return {
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t
        };
    },
    angle(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = -(p2.y - p1.y);
        let deg = GeoMath.radToDeg(Math.atan2(dy, dx));
        if (deg < 0) deg += 360;
        return deg;
    },
    lineIntersection(p1, p2, p3, p4) {
        const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
        if (Math.abs(d) < 1e-9) return null;
        const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
        return {
            x: p1.x + t * (p2.x - p1.x),
            y: p1.y + t * (p2.y - p1.y)
        };
    },
    perpendicularProjection(pA, pB, pP) {
        const dx = pB.x - pA.x;
        const dy = pB.y - pA.y;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return { ...pA };
        const u = ((pP.x - pA.x) * dx + (pP.y - pA.y) * dy) / lenSq;
        return {
            x: pA.x + u * dx,
            y: pA.y + u * dy
        };
    },
    tangentLineAt(circleCenter, r, angleDeg, length = 90) {
        const pT = GeoMath.polar(r, angleDeg, circleCenter);
        const rad = GeoMath.degToRad(angleDeg + 90);
        const half = length / 2;
        return {
            point: pT,
            p1: { x: pT.x + half * Math.cos(rad), y: pT.y - half * Math.sin(rad) },
            p2: { x: pT.x - half * Math.cos(rad), y: pT.y + half * Math.sin(rad) }
        };
    }
};

/**
 * Universal SVG Elements Builder
 */
export const SvgBuilder = {
    createCanvas(content, width = 280, height = 260) {
        return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner select-none mx-auto block">
            <defs>
                <marker id="arrow-indigo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#818cf8"/>
                </marker>
                <marker id="arrow-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#34d399"/>
                </marker>
                <marker id="arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#fb7185"/>
                </marker>
                <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#fbbf24"/>
                </marker>
                <radialGradient id="circleBgGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.12"/>
                    <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
                </radialGradient>
            </defs>
            <g transform="translate(${width / 2}, ${height / 2})">
                ${content}
            </g>
        </svg>
        `;
    },

    dot(p, label = '', offset = { x: 0, y: -10 }, color = '#f8fafc', radius = 3.5) {
        if (!p) return '';
        return `
            <circle cx="${p.x}" cy="${p.y}" r="${radius}" fill="${color}" stroke="#0f172a" stroke-width="1.5"/>
            ${label ? `<text x="${p.x + offset.x}" y="${p.y + offset.y}" font-family="JetBrains Mono" font-size="11" font-weight="600" fill="${color}" text-anchor="middle">${label}</text>` : ''}
        `;
    },

    line(p1, p2, color = '#818cf8', width = 1.75, dash = '') {
        if (!p1 || !p2) return '';
        const dashAttr = dash ? `stroke-dasharray="${dash}"` : '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${dashAttr}/>`;
    },

    vector(p1, p2, color = '#818cf8', width = 2, marker = 'arrow-indigo') {
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" marker-end="url(#${marker})"/>`;
    },

    polygon(points, color = '#818cf8', fill = 'none', width = 1.75) {
        if (!points || points.length === 0) return '';
        const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return `<path d="${d}" stroke="${color}" stroke-width="${width}" fill="${fill}" stroke-linejoin="round"/>`;
    },

    text(p, text, color = '#f8fafc', size = 11, weight = '500') {
        if (!p) return '';
        return `<text x="${p.x}" y="${p.y}" font-family="JetBrains Mono" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="middle" dominant-baseline="central">${text}</text>`;
    },

    rightAngle(vertex, p1, p2, size = 10, color = '#94a3b8') {
        if (!vertex || !p1 || !p2) return '';
        const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
        const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
        const len1 = Math.hypot(v1.x, v1.y);
        const len2 = Math.hypot(v2.x, v2.y);
        if (len1 === 0 || len2 === 0) return '';
        const u1 = { x: (v1.x / len1) * size, y: (v1.y / len1) * size };
        const u2 = { x: (v2.x / len2) * size, y: (v2.y / len2) * size };
        const pA = { x: vertex.x + u1.x, y: vertex.y + u1.y };
        const pB = { x: vertex.x + u1.x + u2.x, y: vertex.y + u1.y + u2.y };
        const pC = { x: vertex.x + u2.x, y: vertex.y + u2.y };
        return `<path d="M ${pA.x} ${pA.y} L ${pB.x} ${pB.y} L ${pC.x} ${pC.y}" stroke="${color}" stroke-width="1.25" fill="none"/>`;
    },

    angleArc(vertex, p1, p2, radius = 22, label = '', color = '#cbd5e1') {
        if (!vertex || !p1 || !p2) return '';
        const a1 = GeoMath.angle(vertex, p1);
        const a2 = GeoMath.angle(vertex, p2);
        let diff = (a2 - a1) % 360;
        if (diff < 0) diff += 360;

        const arcStart = GeoMath.polar(radius, a1, vertex);
        const arcEnd = GeoMath.polar(radius, a1 + (diff > 180 ? diff - 360 : diff), vertex);
        const sweep = diff > 180 ? 0 : 1;
        const midAngle = a1 + (diff > 180 ? (diff - 360) / 2 : diff / 2);
        const labelPos = GeoMath.polar(radius + 12, midAngle, vertex);

        return `
            <path d="M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 0 ${sweep} ${arcEnd.x} ${arcEnd.y}" stroke="${color}" stroke-width="1.25" fill="none"/>
            ${label ? `<text x="${labelPos.x}" y="${labelPos.y}" font-family="JetBrains Mono" font-size="10" fill="${color}" font-weight="600" text-anchor="middle" dominant-baseline="central">${label}</text>` : ''}
        `;
    }
};

/**
 * 1. Dynamic Circle Theorem Diagram Generator
 */
export function buildDynamicCircleDiagram({
    radius = 95,
    points = [], // [{ id: 'A', angle: 45, label: 'A', offset: {x, y} }]
    chords = [], // [['A', 'B', '#818cf8', strokeWidth, dash]]
    tangents = [], // [{ pointId: 'T', length: 110, color: '#fb7185', label: 'T' }]
    polygons = [], // [{ points: ['A', 'B', 'C'], fill: 'rgba(...)', stroke: '#818cf8' }]
    angles = [], // [{ vertex: 'P', p1: 'A', p2: 'B', label: 'θ', radius: 20 }]
    rightAngles = [], // [{ vertex: 'T', p1: 'O', p2: 'P' }]
    showCenter = true,
    centerLabel = 'O',
    customElements = ''
} = {}) {
    const pMap = {};
    const center = { x: 0, y: 0 };
    pMap['O'] = center;

    points.forEach(pt => {
        pMap[pt.id] = GeoMath.polar(radius, pt.angle, center);
    });

    let svgBody = `
        <circle cx="0" cy="0" r="${radius}" fill="url(#circleBgGlow)" stroke="#6366f1" stroke-width="2" />
    `;

    // Render Polygons
    polygons.forEach(poly => {
        const pts = poly.points.map(id => pMap[id]).filter(Boolean);
        svgBody += SvgBuilder.polygon(pts, poly.stroke || '#818cf8', poly.fill || 'none', poly.width || 1.75);
    });

    // Render Chords
    chords.forEach(c => {
        const p1 = pMap[c[0]];
        const p2 = pMap[c[1]];
        if (p1 && p2) {
            svgBody += SvgBuilder.line(p1, p2, c[2] || '#818cf8', c[3] || 1.75, c[4] || '');
        }
    });

    // Render Tangents
    tangents.forEach(t => {
        const pt = points.find(p => p.id === t.pointId);
        if (pt) {
            const tLine = GeoMath.tangentLineAt(center, radius, pt.angle, t.length || 100);
            svgBody += SvgBuilder.line(tLine.p1, tLine.p2, t.color || '#fb7185', 2);
            if (t.label) {
                svgBody += SvgBuilder.text(tLine.p1, t.label, t.color || '#fb7185');
            }
        }
    });

    // Render Right Angles
    rightAngles.forEach(ra => {
        const v = pMap[ra.vertex];
        const p1 = pMap[ra.p1];
        const p2 = pMap[ra.p2];
        if (v && p1 && p2) {
            svgBody += SvgBuilder.rightAngle(v, p1, p2, ra.size || 10, ra.color || '#94a3b8');
        }
    });

    // Render Angle Arcs
    angles.forEach(a => {
        const v = pMap[a.vertex];
        const p1 = pMap[a.p1];
        const p2 = pMap[a.p2];
        if (v && p1 && p2) {
            svgBody += SvgBuilder.angleArc(v, p1, p2, a.radius || 20, a.label || '', a.color || '#cbd5e1');
        }
    });

    // Render Dots & Labels
    if (showCenter) {
        svgBody += SvgBuilder.dot(center, centerLabel, { x: 8, y: 10 }, '#fbbf24');
    }
    points.forEach(pt => {
        const p = pMap[pt.id];
        if (p) {
            const off = pt.offset || { x: (p.x / radius) * 14, y: (p.y / radius) * 14 };
            svgBody += SvgBuilder.dot(p, pt.label || pt.id, off, pt.color || '#ffffff');
        }
    });

    svgBody += customElements;
    return SvgBuilder.createCanvas(svgBody);
}

/**
 * 2. Dynamic Vector Diagram Generator
 */
export function buildDynamicVectorDiagram({
    vectors = [], // [{ from: {x,y}, to: {x,y}, label: 'u', color: '#818cf8', marker: 'arrow-indigo' }]
    polygons = [], // [{ points: [{x,y}, ...], stroke: '#818cf8', fill: '...' }]
    dots = [], // [{ x, y, label, offset, color }]
    customElements = '',
    width = 280,
    height = 260
} = {}) {
    let svgBody = `
        <!-- Coordinate Reference Axes -->
        <line x1="-120" y1="0" x2="120" y2="0" stroke="#334155" stroke-width="1.25" stroke-dasharray="3,3"/>
        <line x1="0" y1="-110" x2="0" y2="110" stroke="#334155" stroke-width="1.25" stroke-dasharray="3,3"/>
    `;

    polygons.forEach(poly => {
        svgBody += SvgBuilder.polygon(poly.points, poly.stroke || '#818cf8', poly.fill || 'none', poly.width || 1.75);
    });

    vectors.forEach(v => {
        const from = v.from || { x: 0, y: 0 };
        const to = v.to || { x: 50, y: 50 };
        svgBody += SvgBuilder.vector(from, to, v.color || '#818cf8', v.width || 2, v.marker || 'arrow-indigo');
        if (v.label) {
            const mid = GeoMath.midpoint(from, to, 0.55);
            const off = v.labelOffset || { x: 0, y: -10 };
            svgBody += SvgBuilder.text({ x: mid.x + off.x, y: mid.y + off.y }, v.label, v.color || '#818cf8', 12, '700');
        }
    });

    dots.forEach(d => {
        svgBody += SvgBuilder.dot(d, d.label || '', d.offset || { x: 0, y: -10 }, d.color || '#ffffff');
    });

    svgBody += customElements;
    return SvgBuilder.createCanvas(svgBody, width, height);
}

/**
 * 3. Dynamic Cartesian Function Curve Plotter
 */
export function buildDynamicFunctionPlot({
    fn = (x) => x * x,
    xDomain = [-3, 3],
    yDomain = [-2, 8],
    samples = 60,
    plotColor = '#818cf8',
    shading = null,
    points = [],
    width = 280,
    height = 240
} = {}) {
    const scaleX = (width - 60) / (xDomain[1] - xDomain[0]);
    const scaleY = (height - 60) / (yDomain[1] - yDomain[0]);

    const toSvg = (x, y) => ({
        x: (x - (xDomain[0] + xDomain[1]) / 2) * scaleX,
        y: -((y - (yDomain[0] + yDomain[1]) / 2) * scaleY)
    });

    const step = (xDomain[1] - xDomain[0]) / samples;
    const curvePoints = [];
    for (let x = xDomain[0]; x <= xDomain[1] + 1e-6; x += step) {
        const y = fn(x);
        curvePoints.push(toSvg(x, y));
    }

    let svgBody = `
        <line x1="${-(width/2) + 20}" y1="${toSvg(0,0).y}" x2="${(width/2) - 20}" y2="${toSvg(0,0).y}" stroke="#475569" stroke-width="1.5"/>
        <line x1="${toSvg(0,0).x}" y1="${-(height/2) + 20}" x2="${toSvg(0,0).x}" y2="${(height/2) - 20}" stroke="#475569" stroke-width="1.5"/>
    `;

    if (shading) {
        const shadePts = [];
        shadePts.push(toSvg(shading.from, 0));
        for (let x = shading.from; x <= shading.to + 1e-6; x += step) {
            shadePts.push(toSvg(x, fn(x)));
        }
        shadePts.push(toSvg(shading.to, 0));
        svgBody += SvgBuilder.polygon(shadePts, 'none', shading.fill || 'rgba(99,102,241,0.25)', 0);
    }

    let pathD = curvePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    svgBody += `<path d="${pathD}" stroke="${plotColor}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;

    points.forEach(pt => {
        const pos = toSvg(pt.x, pt.y);
        svgBody += SvgBuilder.dot(pos, pt.label || '', pt.offset || { x: 0, y: -10 }, pt.color || '#34d399');
    });

    return SvgBuilder.createCanvas(svgBody, width, height);
}

// ---------------------------------------------------------
// COMPATIBILITY CONVENIENCE THEOREM HELPERS (FULLY DYNAMIC)
// ---------------------------------------------------------
export function svgCircleTheorem(type = 'alt_segment', params = {}) {
    if (type === 'alt_segment') {
        const a1 = params.angleA ?? 270;
        const a2 = params.angleB ?? 50;
        const a3 = params.angleC ?? 140;
        return buildDynamicCircleDiagram({
            points: [
                { id: 'A', angle: a1, label: 'A' },
                { id: 'B', angle: a2, label: 'B' },
                { id: 'C', angle: a3, label: 'C' }
            ],
            tangents: [{ pointId: 'A', length: 110, color: '#fb7185', label: 'T' }],
            polygons: [{ points: ['A', 'B', 'C'], fill: 'rgba(99,102,241,0.1)', stroke: '#818cf8' }],
            angles: [
                { vertex: 'C', p1: 'A', p2: 'B', label: 'θ', radius: 22 }
            ],
            showCenter: false
        });
    } else if (type === 'chords') {
        const p1 = GeoMath.polar(95, 210);
        const p2 = GeoMath.polar(95, 30);
        const p3 = GeoMath.polar(95, 130);
        const p4 = GeoMath.polar(95, 330);
        const intersection = GeoMath.lineIntersection(p1, p2, p3, p4) || { x: 5, y: 10 };
        return buildDynamicCircleDiagram({
            points: [
                { id: 'A', angle: 210, label: 'A' },
                { id: 'B', angle: 30, label: 'B' },
                { id: 'C', angle: 130, label: 'C' },
                { id: 'D', angle: 330, label: 'D' }
            ],
            chords: [
                ['A', 'B', '#818cf8', 2],
                ['C', 'D', '#ec4899', 2]
            ],
            customElements: SvgBuilder.dot(intersection, 'P', { x: 10, y: 10 }, '#fbbf24'),
            showCenter: false
        });
    } else if (type === 'cyclic_quad' || type === 'ptolemy') {
        return buildDynamicCircleDiagram({
            points: [
                { id: 'A', angle: params.a1 ?? 50, label: 'A' },
                { id: 'B', angle: params.a2 ?? 130, label: 'B' },
                { id: 'C', angle: params.a3 ?? 220, label: 'C' },
                { id: 'D', angle: params.a4 ?? 310, label: 'D' }
            ],
            polygons: [{ points: ['A', 'B', 'C', 'D'], fill: 'rgba(129,140,248,0.1)', stroke: '#818cf8' }],
            chords: [
                ['A', 'C', '#ec4899', 1.5, '3,3'],
                ['B', 'D', '#ec4899', 1.5, '3,3']
            ],
            showCenter: false
        });
    } else if (type === 'tangent_secant') {
        const pT = GeoMath.polar(95, 90);
        const pA = GeoMath.polar(95, 200);
        const pB = GeoMath.polar(95, 280);
        const pP = { x: 130, y: 45 };
        return buildDynamicCircleDiagram({
            points: [
                { id: 'T', angle: 90, label: 'T' },
                { id: 'A', angle: 200, label: 'A' },
                { id: 'B', angle: 280, label: 'B' }
            ],
            customElements: `
                ${SvgBuilder.line(pP, pT, '#fb7185', 2)}
                ${SvgBuilder.line(pP, pA, '#818cf8', 2)}
                ${SvgBuilder.dot(pP, 'P', { x: 12, y: 10 }, '#fbbf24')}
            `,
            showCenter: false
        });
    } else if (type === 'simson') {
        const pA = GeoMath.polar(95, 110);
        const pB = GeoMath.polar(95, 220);
        const pC = GeoMath.polar(95, 340);
        const pP = GeoMath.polar(95, 40);

        const pX = GeoMath.perpendicularProjection(pB, pC, pP);
        const pY = GeoMath.perpendicularProjection(pC, pA, pP);
        const pZ = GeoMath.perpendicularProjection(pA, pB, pP);

        return buildDynamicCircleDiagram({
            points: [
                { id: 'A', angle: 110, label: 'A' },
                { id: 'B', angle: 220, label: 'B' },
                { id: 'C', angle: 340, label: 'C' },
                { id: 'P', angle: 40, label: 'P', color: '#fbbf24' }
            ],
            polygons: [{ points: ['A', 'B', 'C'], fill: 'rgba(99,102,241,0.08)', stroke: '#818cf8' }],
            customElements: `
                ${SvgBuilder.line(pP, pX, '#64748b', 1.25, '2,2')}
                ${SvgBuilder.line(pP, pY, '#64748b', 1.25, '2,2')}
                ${SvgBuilder.line(pP, pZ, '#64748b', 1.25, '2,2')}
                ${SvgBuilder.line(pZ, pX, '#34d399', 2)}
                ${SvgBuilder.dot(pX, 'X', { x: 8, y: 8 }, '#34d399', 3)}
                ${SvgBuilder.dot(pY, 'Y', { x: 8, y: 8 }, '#34d399', 3)}
                ${SvgBuilder.dot(pZ, 'Z', { x: 8, y: 8 }, '#34d399', 3)}
            `,
            showCenter: false
        });
    }
    return buildDynamicCircleDiagram();
}

export function svgVectorProofDiagram(type = 'apollonius', params = {}) {
    if (type === 'apollonius') {
        const pA = { x: 0, y: -70 };
        const pB = { x: -80, y: 50 };
        const pC = { x: 80, y: 50 };
        const pD = GeoMath.midpoint(pB, pC);
        return buildDynamicVectorDiagram({
            polygons: [{ points: [pA, pB, pC], stroke: '#818cf8', fill: 'rgba(99,102,241,0.08)' }],
            vectors: [
                { from: pA, to: pD, label: 'm (median)', color: '#ec4899', marker: 'arrow-rose' }
            ],
            dots: [
                { x: pA.x, y: pA.y, label: 'A' },
                { x: pB.x, y: pB.y, label: 'B' },
                { x: pC.x, y: pC.y, label: 'C' },
                { x: pD.x, y: pD.y, label: 'D (Midpoint)', color: '#fbbf24', offset: { x: 0, y: 14 } }
            ]
        });
    } else if (type === 'centroid') {
        const pA = { x: -20, y: -70 };
        const pB = { x: -85, y: 50 };
        const pC = { x: 85, y: 50 };
        const pD = GeoMath.midpoint(pB, pC);
        const pE = GeoMath.midpoint(pA, pC);
        const pF = GeoMath.midpoint(pA, pB);
        const pG = { x: (pA.x + pB.x + pC.x) / 3, y: (pA.y + pB.y + pC.y) / 3 };
        return buildDynamicVectorDiagram({
            polygons: [{ points: [pA, pB, pC], stroke: '#818cf8', fill: 'none' }],
            customElements: `
                ${SvgBuilder.line(pA, pD, '#64748b', 1.5, '2,2')}
                ${SvgBuilder.line(pB, pE, '#64748b', 1.5, '2,2')}
                ${SvgBuilder.line(pC, pF, '#64748b', 1.5, '2,2')}
            `,
            dots: [
                { x: pA.x, y: pA.y, label: 'A' },
                { x: pB.x, y: pB.y, label: 'B' },
                { x: pC.x, y: pC.y, label: 'C' },
                { x: pG.x, y: pG.y, label: 'G (2:1 Centroid)', color: '#fbbf24', offset: { x: 10, y: -10 } }
            ]
        });
    } else if (type === 'rhombus') {
        const pO = { x: -50, y: 40 };
        const pU = { x: 20, y: 40 };
        const pV = { x: -20, y: -30 };
        const pUV = { x: 50, y: -30 };
        return buildDynamicVectorDiagram({
            polygons: [{ points: [pO, pU, pUV, pV], stroke: '#818cf8', fill: 'rgba(129,140,248,0.1)' }],
            customElements: `
                ${SvgBuilder.line(pO, pUV, '#ec4899', 2)}
                ${SvgBuilder.line(pU, pV, '#34d399', 2)}
            `,
            dots: [
                { x: pO.x, y: pO.y, label: 'O' },
                { x: pU.x, y: pU.y, label: 'u' },
                { x: pV.x, y: pV.y, label: 'v' },
                { x: pUV.x, y: pUV.y, label: 'u+v' }
            ]
        });
    } else if (type === 'quad') {
        const pA = { x: -75, y: -45 };
        const pB = { x: 45, y: -65 };
        const pC = { x: 85, y: 55 };
        const pD = { x: -55, y: 65 };
        const pP = GeoMath.midpoint(pA, pB);
        const pQ = GeoMath.midpoint(pB, pC);
        const pR = GeoMath.midpoint(pC, pD);
        const pS = GeoMath.midpoint(pD, pA);
        return buildDynamicVectorDiagram({
            polygons: [
                { points: [pA, pB, pC, pD], stroke: '#64748b', fill: 'none', width: 1.25 },
                { points: [pP, pQ, pR, pS], stroke: '#818cf8', fill: 'rgba(129,140,248,0.15)', width: 2 }
            ],
            dots: [
                { x: pP.x, y: pP.y, label: 'P' },
                { x: pQ.x, y: pQ.y, label: 'Q' },
                { x: pR.x, y: pR.y, label: 'R' },
                { x: pS.x, y: pS.y, label: 'S' }
            ]
        });
    }
    return buildDynamicVectorDiagram();
}

export function svgCircleAngles(angle = 45) {
    const aA = 150;
    const aB = 230;
    const aP = 20;
    return buildDynamicCircleDiagram({
        points: [
            { id: 'A', angle: aA, label: 'A' },
            { id: 'B', angle: aB, label: 'B' },
            { id: 'P', angle: aP, label: 'P' }
        ],
        chords: [
            ['A', 'O', '#6366f1', 2],
            ['B', 'O', '#6366f1', 2],
            ['A', 'P', '#ec4899', 2],
            ['B', 'P', '#ec4899', 2]
        ],
        angles: [
            { vertex: 'P', p1: 'A', p2: 'B', label: `${angle}°`, radius: 24, color: '#ec4899' },
            { vertex: 'O', p1: 'A', p2: 'B', label: `${2 * angle}°`, radius: 20, color: '#6366f1' }
        ],
        showCenter: true,
        centerLabel: 'O'
    });
}
