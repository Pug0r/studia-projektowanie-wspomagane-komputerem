import { TYPES } from './constants.js';
import { drawGarden } from './draw.js';

class GraphNode {
    constructor(type, x, y, w, h) {
        this.type = type;
        this.x = x; this.y =  y; this.w = w; this.h = h;
        this.children = [];
        this.processed = false;
    }
}

class Transformation {
    static applyRule(node, grammar) {
        if (node.w < 60 || node.h < 60) { // safeguard, nie chcemy za malych nodeow
            if (!grammar.isTerminal(node.type)) {
                const finalType = Math.random() < 0.2 ? TYPES.BENCH_AREA : TYPES.GRASS;
                grammar.convertToTerminal(node, finalType);
                return true;
            }
            return false;
        }

        const rand = Math.random();

        switch (node.type) {
            case TYPES.ROOT:
                rand > 0.5 
                ? this.splitVerticalWithPath(node, grammar, 50) 
                : this.splitHorizontalWithPath(node, grammar, 50);
                return true;

            case TYPES.ZONE:
                if (node.w > 250 || node.h > 250) {
                    node.w > node.h 
                    ? this.split(node, grammar, true, TYPES.ZONE, TYPES.ZONE) 
                    : this.split(node, grammar, false, TYPES.ZONE, TYPES.ZONE);
                } else {
                    grammar.addChild(node, TYPES.PARCEL);    
                }
                return true;

            case TYPES.PARCEL:
                if (rand < 0.2 && node.w > 150 && node.h > 150) {
                    this.embed(node, grammar, TYPES.POND, 20);
                } 
                else if (rand < 0.45) {
                    grammar.addChild(node, TYPES.FOREST);
                } 
                else if (rand < 0.65) {
                    node.w > 120 && node.h > 120 ? 
                        (this.embed(node, grammar, TYPES.FOUNTAIN, node.w/2 - 30), node.type = TYPES.FLOWER_GARDEN) : 
                        grammar.addChild(node, TYPES.FLOWER_GARDEN);
                } 
                else {
                    grammar.addChild(node, TYPES.GRASS);
                }
                return true;
        }
        return false;
    }

    static split(p, g, isVertical, t1, t2) {
        const ratio = 0.3 + Math.random() * 0.4;
        if (isVertical) {
            const w1 = p.w * ratio;
            g.addChildren(p, 
                g.createNode(t1, p.x, p.y, w1, p.h),
                g.createNode(t2, p.x + w1, p.y, p.w - w1, p.h)
            );
        } else {
            const h1 = p.h * ratio;
            g.addChildren(p,
                g.createNode(t1, p.x, p.y, p.w, h1),
                g.createNode(t2, p.x, p.y + h1, p.w, p.h - h1)
            );
        }
    }

    static splitVerticalWithPath(p, g, gap) {
        const w1 = (p.w - gap) * (0.2 + Math.random() * 0.6);
        g.addChildren(p,
            g.createNode(TYPES.ZONE, p.x, p.y, w1, p.h),
            g.createNode(TYPES.PATH, p.x + w1, p.y, gap, p.h),
            g.createNode(TYPES.ZONE, p.x + w1 + gap, p.y, p.w - w1 - gap, p.h)
        );
    }

    static splitHorizontalWithPath(p, g, gap) {
        const h1 = (p.h - gap) * (0.2 + Math.random() * 0.6);
        g.addChildren(p,
            g.createNode(TYPES.ZONE, p.x, p.y, p.w, h1),
            g.createNode(TYPES.PATH, p.x, p.y + h1, p.w, gap),
            g.createNode(TYPES.ZONE, p.x, p.y + h1 + gap, p.w, p.h - h1 - gap)
        );
    }

    // "uszczegolawia" pole tj. np. trawa -> trawa - staw
    static embed(p, g, type, margin) {
        p.children.push(g.createNode(TYPES.GRASS, p.x, p.y, p.w, p.h));
        const feat = g.createNode(type, p.x + margin, p.y + margin, p.w - margin*2, p.h - margin*2);
        feat.processed = true;
        p.children.push(feat);
    }
}

class GardenGrammar {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.root = new GraphNode(TYPES.ROOT, 0, 0, width, height);
        this.nodes = [this.root];
    }

    generate() {
        const queue = [this.root];
        while (queue.length > 0) {
            const node = queue.shift();
            if (Transformation.applyRule(node, this)) {
                queue.push(...node.children);
            }
        }
    }

    createNode(type, x, y, w, h) {
        const n = new GraphNode(type, x, y, w, h);
        if (this.isTerminal(type)) n.processed = true;
        this.nodes.push(n);
        return n;
    }

    addChild(parent, type) {
        parent.children.push(this.createNode(type, parent.x, parent.y, parent.w, parent.h));
    }

    addChildren(parent, ...kids) {
        parent.children.push(...kids);
    }

    convertToTerminal(node, terminalType) {
        this.addChild(node, terminalType);
    }

    isTerminal(type) {
        return [TYPES.GRASS, TYPES.FOREST, TYPES.POND, TYPES.PATH, TYPES.FLOWER_GARDEN, TYPES.PLAZA, TYPES.BENCH_AREA].includes(type);
    }
}

function run(ctx) {
    const garden = new GardenGrammar(canvas.width, canvas.height);
    garden.generate();
    drawGarden(ctx, garden);
}

const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('generateBtn');

btn.addEventListener('click', () => run(ctx));
run(ctx);