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

// konfigurowalne rozmiary
var TREASURE_CHANCE = 0.1;
var MIN_TREASURE_SIZE = 100;
var TREASURE_MARGIN = 10;

var MIN_NONTERMINAL_SIZE = 60;
var MIN_ZONE_SIZE = 250;

var PATH_WIDTH = 50;

var MIN_POND_NODE_SIZE = 150;
var POND_MARGIN = 20;

class Transformation {
    static applyRule(node, grammar) {
        if (node.w < MIN_NONTERMINAL_SIZE || node.h < MIN_NONTERMINAL_SIZE) { 
            if (!grammar.isTerminal(node.type)) {
                grammar.convertToTerminal(node, TYPES.GRASS);
                return true;
            }
            return false;
        }

        const rand = Math.random();

        switch (node.type) {
            case TYPES.ROOT:
                rand > 0.5 
                ? this.splitVerticalWithPath(node, grammar, PATH_WIDTH) 
                : this.splitHorizontalWithPath(node, grammar, PATH_WIDTH);
                return true;

            case TYPES.ZONE:
                if (node.w > MIN_ZONE_SIZE || node.h > MIN_ZONE_SIZE) {
                    node.w > node.h 
                    ? this.split(node, grammar, true, TYPES.ZONE, TYPES.ZONE) 
                    : this.split(node, grammar, false, TYPES.ZONE, TYPES.ZONE);
                } else {
                    grammar.addChild(node, TYPES.PARCEL);    
                }
                return true;

            // TERMINALNE
            case TYPES.PARCEL:
                if (rand < 0.2 && node.w > MIN_POND_NODE_SIZE && node.h > MIN_POND_NODE_SIZE) { // small ponds look bad
                    grammar.embedNode(node, TYPES.POND, POND_MARGIN);
                } 
                else if (rand < 0.45) {
                    grammar.addChild(node, TYPES.FOREST);
                } 
                else if (rand < 0.65) {
                    grammar.addChild(node, TYPES.FLOWER_GARDEN);
                } 
                else {
                    grammar.addChild(node, TYPES.GRASS);
                    if (node.w > MIN_TREASURE_SIZE && node.h > MIN_TREASURE_SIZE && Math.random() < TREASURE_CHANCE) 
                        grammar.embedNode(node, TYPES.TREASURE, TREASURE_MARGIN);
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

    embedNode(parent, type, margin) {
        this.addChild(parent, TYPES.GRASS);
        const node = this.createNode(
            type, 
            parent.x + margin, 
            parent.y + margin, 
            parent.w - margin*2, 
            parent.h - margin*2
        );
        node.processed = true; 
        parent.children.push(node);
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
        return [TYPES.GRASS, TYPES.FOREST, TYPES.POND, TYPES.PATH, TYPES.FLOWER_GARDEN, TYPES.TREASURE].includes(type);
    }
}

function run(ctx) {
    const garden = new GardenGrammar(canvas.width, canvas.height);
    garden.generate();
    ctx.fillStyle = '#8bc34a';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // usuwa przerwy miedzy prosotkatami
    drawGarden(ctx, garden);
}

const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('generateBtn');

btn.addEventListener('click', () => run(ctx));
run(ctx);