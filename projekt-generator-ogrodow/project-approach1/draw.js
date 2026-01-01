import { TYPES, COLORS } from './constants.js';

export function drawNode(ctx, node) {
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => drawNode(ctx, child)); 
        return; 
    }

    ctx.save();
    ctx.translate(node.x, node.y);
    
    if (node.type.startsWith('FOREST')) {
        drawForest(ctx, node);
    }
    else if (node.type.startsWith('FLOWER_GARDEN')) {
        drawFlowerBed(ctx, node);
    }
    else if (node.type.startsWith('POND') || node.type.startsWith('FLOWER_POND')) {
        drawPond(ctx, node);
    }
    else if (node.type === TYPES.PATH) {
        drawPath(ctx, node); 
    }
    else if (node.type === TYPES.BENCH || node.type === TYPES.FOUNTAINT_BENCH_T1) {
        drawBench(ctx, node); 
    }
    else if (node.type === TYPES.FOUNTAIN) {
        ctx.fillStyle = COLORS.GRASS; 
        ctx.fillRect(0, 0, node.w + 1, node.h + 1);
        drawFountain(ctx, node);
    }
    else {
        ctx.fillStyle = COLORS[node.type] || '#8bc34a';
        ctx.fillRect(0, 0, node.w + 1, node.h + 1);
    }

    ctx.restore();
}

function drawPath(ctx, node) {
    ctx.fillStyle = COLORS.PATH || '#cfd8dc';
    ctx.fillRect(0, 0, node.w + 1, node.h + 1);

    ctx.fillStyle = '#b0bec5'; 
    const density = 0.5; 
    const count = (node.w * node.h) / 50 * density;

    for(let i=0; i<count; i++) {
        const x = Math.random() * node.w;
        const y = Math.random() * node.h;
        const s = 1 + Math.random() * 2; 
        ctx.fillRect(x, y, s, s);
    }
}

function drawBench(ctx, node) {
    ctx.fillStyle = COLORS.GRASS;
    ctx.fillRect(0, 0, node.w + 1, node.h + 1);

    if (node.type === TYPES.FOUNTAINT_BENCH_T1) {
        ctx.fillStyle = '#b0bec5'; 
        ctx.fillRect(node.w * 0.1, node.h * 0.1, node.w * 0.8, node.h * 0.8);
    }

    ctx.fillStyle = COLORS.BENCH || '#795548';
    
    const bw = Math.min(node.w * 0.8, 50); 
    const bh = Math.min(node.h * 0.4, 20); 
    const bx = (node.w - bw) / 2;
    const by = (node.h - bh) / 2;

    ctx.fillRect(bx, by, bw, bh);

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(bx, by + bh * 0.2, bw, 2);
    ctx.fillRect(bx, by + bh * 0.5, bw, 2);
    ctx.fillRect(bx, by + bh * 0.8, bw, 2);
}

function drawFlowerBed(ctx, node) {
    const density = 1.5; 
    const flowerSize = 4;

    ctx.fillStyle = COLORS.GRASS;
    ctx.fillRect(0, 0, node.w + 1, node.h + 1); 

    const area = node.w * node.h;
    const count = Math.floor((area / 400) * density);

    ctx.fillStyle = COLORS[node.type];

    for(let i = 0; i < count; i++) {
        const x = Math.random() * node.w;
        const y = Math.random() * node.h;
        const r = (flowerSize * 0.5) + Math.random() * (flowerSize * 0.5);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawForest(ctx, node) {
    const density = 0.8; 
    const treeBaseSize = 25; 
    
    ctx.fillStyle = COLORS.GRASS;
    ctx.fillRect(0, 0, node.w + 1, node.h + 1);

    const area = node.w * node.h;
    const count = Math.floor((area / (treeBaseSize * treeBaseSize)) * density); 
    const safeCount = Math.max(count, 3); 

    let trees = [];
    for(let i = 0; i < safeCount; i++) {
        trees.push({
            x: Math.random() * node.w,
            y: Math.random() * node.h,
            scale: 0.8 + Math.random() * 0.4 
        });
    }

    trees.sort((a, b) => a.y - b.y);

    trees.forEach(t => {
        drawSingleTree(ctx, node.type, t.x, t.y, treeBaseSize * t.scale);
    });
}

function drawSingleTree(ctx, type, cx, cy, size) {
    ctx.fillStyle = '#5d4037'; 
    const trunkW = size * 0.25;
    const trunkH = size * 1.5; 
    ctx.fillRect(cx - trunkW/2, cy - trunkH, trunkW, trunkH);

    const baseColor = COLORS[type];
    ctx.fillStyle = baseColor
    
    const canopyY = cy - trunkH * 0.8; 

    if (type === TYPES.FOREST_T3) { 
        ctx.beginPath();
        ctx.moveTo(cx - size, canopyY + size * 0.5); 
        ctx.lineTo(cx + size, canopyY + size * 0.5); 
        ctx.lineTo(cx, canopyY - size * 1.2);        
        ctx.fill();
    }
    else if (type === TYPES.FOREST_T2) { 
        const r = size * 0.6;
        ctx.beginPath();
        ctx.arc(cx - r*0.5, canopyY + r*0.2, r, 0, Math.PI*2);
        ctx.arc(cx + r*0.5, canopyY + r*0.2, r, 0, Math.PI*2);
        ctx.arc(cx, canopyY - r*0.5, r, 0, Math.PI*2);        
        ctx.fill();
    }
    else if (type === TYPES.FOREST_T4) { 
        ctx.beginPath();
        ctx.ellipse(cx, canopyY - size * 0.2, size * 0.5, size * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    else { 
        ctx.beginPath();
        ctx.arc(cx, canopyY - size * 0.2, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(cx - size*0.3, canopyY - size*0.5, size*0.3, 0, Math.PI*2);
        ctx.fill();
    }
}

function drawFountain(ctx, node) {
    const cx = node.w / 2;
    const cy = node.h / 2;
    const size = Math.min(node.w, node.h) * 0.35;

    ctx.fillStyle = '#b0bec5'; 
    ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#03a9f4'; 
    ctx.beginPath(); ctx.arc(cx, cy, size * 0.85, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#e1f5fe'; 
    ctx.beginPath(); ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const dropDist = size * 0.5;
    const dropSize = size * 0.1; 

    ctx.beginPath(); ctx.arc(cx, cy - dropDist, dropSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy + dropDist, dropSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx - dropDist, cy, dropSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + dropDist, cy, dropSize, 0, Math.PI * 2); ctx.fill();
}

function drawPond(ctx, node) {
    ctx.fillStyle = COLORS.GRASS;
    ctx.fillRect(0, 0, node.w + 1, node.h + 1); // +1 fix

    const cx = node.w / 2;
    const cy = node.h / 2;
    const maxRadius = Math.min(node.w, node.h) * 0.45;
    const minRadius = maxRadius * 0.75; 

    const numPoints = 8;
    let points = [];
    for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints;
        const r = minRadius + Math.random() * (maxRadius - minRadius);
        points.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r
        });
    }

    ctx.fillStyle = COLORS[node.type];
    ctx.beginPath();
    
    const p0 = points[0];
    const pLast = points[points.length - 1];
    ctx.moveTo((p0.x + pLast.x) / 2, (p0.y + pLast.y) / 2);

    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const nextP = points[(i + 1) % points.length];
        const midX = (p.x + nextP.x) / 2;
        const midY = (p.y + nextP.y) / 2;
        ctx.quadraticCurveTo(p.x, p.y, midX, midY);
    }
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    for(let i=0; i<3; i++) {
        const rx = cx + (Math.random() * maxRadius * 0.5) - (maxRadius * 0.25);
        const ry = cy + (Math.random() * maxRadius * 0.5) - (maxRadius * 0.25);
        const len = 5 + Math.random() * 10;
        
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + len, ry); ctx.stroke();
    }

    if(node.type === TYPES.FLOWER_POND_T1 || node.type === TYPES.FLOWER_POND_T2) {
        ctx.fillStyle = '#4caf50'; 
        const lx = cx + (Math.random() * 10) - 5;
        const ly = cy + (Math.random() * 10) - 5;
        
        ctx.beginPath(); ctx.arc(lx, ly, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'pink';
        ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI*2); ctx.fill();
    }
}