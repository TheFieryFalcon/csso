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
    planeTemplate(content, size = 260, xRange = [-5, 5], yRange = [-5, 5]) {
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
