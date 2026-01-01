import { TYPES, COLORS } from './constants.js';

export function drawGarden(ctx, grammar) {
    const grassPattern = TextureGenerator.getGrass(ctx);
    const waterPattern = TextureGenerator.getWater(ctx);
    const stonePattern = TextureGenerator.getStone(ctx);

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const terminals = grammar.nodes.filter(n => grammar.isTerminal(n.type));

    terminals.sort((a, b) => (b.w * b.h) - (a.w * a.h));
    
    terminals.forEach(node => {
        ctx.save();
        ctx.translate(node.x, node.y);

        switch (node.type) {
            case TYPES.GRASS:
            case TYPES.FOREST:
            case TYPES.FLOWER_GARDEN:
            case TYPES.TREASURE:
                ctx.fillStyle = grassPattern;
                ctx.fillRect(0, 0, node.w, node.h);
                break;
            
            case TYPES.PATH:
                ctx.fillStyle = stonePattern;
                ctx.fillRect(0, 0, node.w, node.h);
                ctx.strokeStyle = '#90a4ae';
                ctx.lineWidth = 1;
                ctx.strokeRect(0, 0, node.w, node.h);
                break;

            case TYPES.POND:
                ctx.fillStyle = waterPattern;
                ctx.strokeStyle = '#81d4fa';
                ctx.lineWidth = 4;

                ctx.beginPath();
                
                ctx.moveTo(node.w * 0.5, node.h * 0.05);

                ctx.bezierCurveTo(
                    node.w * 0.9, node.h * 0.05, 
                    node.w * 0.95, node.h * 0.2, 
                    node.w * 0.95, node.h * 0.5 
                );

                ctx.bezierCurveTo(
                    node.w * 0.95, node.h * 0.8, 
                    node.w * 0.8, node.h * 0.95, 
                    node.w * 0.5, node.h * 0.95
                );

                ctx.bezierCurveTo(
                    node.w * 0.2, node.h * 0.95, 
                    node.w * 0.05, node.h * 0.8, 
                    node.w * 0.05, node.h * 0.5
                );

                ctx.bezierCurveTo(
                    node.w * 0.05, node.h * 0.2, 
                    node.w * 0.1, node.h * 0.05, 
                    node.w * 0.5, node.h * 0.05
                );

                ctx.fill();
                ctx.stroke();
                break;
        }
        ctx.restore();
    });

    terminals.forEach(node => {
        ctx.save();
        ctx.translate(node.x, node.y);
        drawDetails(ctx, node);
        ctx.restore();
    });
}

const TextureGenerator = {
    createPattern: (ctx, width, height, drawFn) => {
        const tCanvas = document.createElement('canvas');
        tCanvas.width = width;
        tCanvas.height = height;
        const tCtx = tCanvas.getContext('2d');
        drawFn(tCtx, width, height);
        return ctx.createPattern(tCanvas, 'repeat');
    },

    getGrass: (ctx) => TextureGenerator.createPattern(ctx, 30, 30, (c, w, h) => {
        c.fillStyle = '#8bc34a'; 
        c.fillRect(0, 0, w, h);
        c.fillStyle = '#689f38'; 
        c.beginPath(); c.arc(Math.random()*w, Math.random()*h, 2, 0, Math.PI*2); c.fill();
        c.beginPath(); c.arc(Math.random()*w, Math.random()*h, 1.5, 0, Math.PI*2); c.fill();
    }),

    getWater: (ctx) => TextureGenerator.createPattern(ctx, 40, 40, (c, w, h) => {
        c.fillStyle = '#4fc3f7'; 
        c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(0, 20); c.bezierCurveTo(10, 10, 30, 30, 40, 20);
        c.stroke();
    }),

    getStone: (ctx) => TextureGenerator.createPattern(ctx, 20, 20, (c, w, h) => {
        c.fillStyle = '#cfd8dc'; 
        c.fillRect(0, 0, w, h);
        c.strokeStyle = '#b0bec5';
        c.strokeRect(0, 0, w, h);
        c.fillStyle = '#90a4ae';
        c.fillRect(Math.random()*20, Math.random()*20, 2, 2);
    })
};


function drawDetails(ctx, node) {
    const area = node.w * node.h;
    if (area <= 0) return;

    if (node.type === TYPES.FOREST) {
        const treeCount = Math.floor(area / 1800); 
        for(let i=0; i<treeCount; i++) {
            const x = Math.random() * node.w;
            const y = Math.random() * node.h;
            const r = 10 + Math.random() * 12;

            ctx.fillStyle = 'rgba(0,0,0,0.2)'; 
            ctx.beginPath(); ctx.arc(x+4, y+4, r, 0, Math.PI*2); ctx.fill();

            ctx.fillStyle = '#2e7d32'; 
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = '#4caf50'; 
            ctx.beginPath(); ctx.arc(x-3, y-3, r*0.4, 0, Math.PI*2); ctx.fill();
        }
    }

    if (node.type === TYPES.FLOWER_GARDEN) {
        const flowerCount = Math.floor(area / 300);
        const colors = ['#e91e63', '#ffeb3b', '#ff5722', '#9c27b0'];
        for(let i=0; i<flowerCount; i++) {
            const x = Math.random() * node.w;
            const y = Math.random() * node.h;
            
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.beginPath(); 
            ctx.arc(x, y, 3 + Math.random()*2, 0, Math.PI*2); 
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
        }
    }

    if (node.type === TYPES.TREASURE) {
        const cx = node.w / 2;
        const cy = node.h / 2;
        const size = Math.min(node.w, node.h) * 0.4;
        const w = size;
        const h = size * 0.6; 

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(cx - w/2 + 2, cy - h/2 + 2, w, h);

        ctx.fillStyle = '#8d6e63'; 
        ctx.fillRect(cx - w/2, cy - h/2, w, h);

        ctx.fillStyle = '#ffb300';
        const bandW = w * 0.15;
        ctx.fillRect(cx - w/2 + bandW, cy - h/2, bandW, h); 
        ctx.fillRect(cx + w/2 - bandW*2, cy - h/2, bandW, h); 

        ctx.fillStyle = '#3e2723';
        ctx.beginPath(); ctx.arc(cx, cy, w * 0.05, 0, Math.PI*2); ctx.fill();

        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - w/2, cy - h/2, w, h);
    }
}