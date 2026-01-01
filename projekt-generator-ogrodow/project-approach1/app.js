import { TYPES } from './constants.js';
import { drawNode } from './draw.js';

class GraphNode {
    constructor(type, x, y, w, h) {
        this.type = type;
        this.x = x; this.y =  y; this.w = w; this.h = h;
        this.children = [];
        this.processed = false;
    }
}

function transform(node){
    if (node.processed)
        return [];
    const rng = Math.random()
    const isVerticalSplit = Math.random() > 0.5 ? true : false;
    
    let newChildren = [];
    switch (node.type){
        case TYPES.ROOT:
            const rootOptions = [TYPES.FLOWER_GARDEN, TYPES.FOREST, TYPES.FOUNTAIN, TYPES.POND]
            const rootChosen = pickUniqueItems(rootOptions, 4);
            newChildren = splitFour(node, ...rootChosen)
            break;
        case TYPES.FLOWER_GARDEN_RED:
        case TYPES.FLOWER_GARDEN_PINK:
        case TYPES.FLOWER_GARDEN_ORANGE:
        case TYPES.FLOWER_GARDEN_BLUE:
        case TYPES.FLOWER_GARDEN_PURPLE:
        case TYPES.FLOWER_GARDEN:
            const flowerOptions = [TYPES.FLOWER_GARDEN_BLUE, TYPES.FLOWER_GARDEN_ORANGE, TYPES.FLOWER_GARDEN_PINK, TYPES.FLOWER_GARDEN_PURPLE, TYPES.FLOWER_GARDEN_RED]
            const flowerChosen = pickUniqueItems(flowerOptions, 2);
            newChildren = splitTwo(node, isVerticalSplit, ...flowerChosen)
            break;
        case TYPES.FOREST_T1:
        case TYPES.FOREST_T2:
        case TYPES.FOREST_T3:
        case TYPES.FOREST_T4:            
        case TYPES.FOREST:
            const forestOptions = [TYPES.FOREST_T1, TYPES.FOREST_T2, TYPES.FOREST_T3, TYPES.FOREST_T4, TYPES.POND, TYPES.FLOWER_GARDEN_BLUE]
            const forrestChosen = pickUniqueItems(forestOptions, 2);
            newChildren = splitTwo(node, isVerticalSplit, ...forrestChosen)
            break;
        case TYPES.POND:
            const pondOptions = [TYPES.POND, TYPES.FOREST_T1]
            const pondChosen = pickUniqueItems(pondOptions, 2);
            newChildren = splitTwo(node, isVerticalSplit, ...pondChosen)
            break;
    }

    node.processed = true; 
    return newChildren;
}

function pickUniqueItems(list, count) {
    const pool = [...list];
    const selection = [];
    
    const safeCount = Math.min(count, pool.length);

    for (let i = 0; i < safeCount; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        selection.push(pool[randomIndex]);
        pool.splice(randomIndex, 1);
    }
    
    return selection;
}

function splitFour(node, t1, t2, t3, t4) {
    const wHalf = node.w / 2; 
    const hHalf = node.h / 2;
    const c1 = new GraphNode(t1, node.x, node.y, wHalf, hHalf);
    const c2 = new GraphNode(t2, node.x + wHalf, node.y, wHalf, hHalf);
    const c3 = new GraphNode(t3, node.x, node.y + hHalf, wHalf, hHalf);
    const c4 = new GraphNode(t4, node.x + wHalf, node.y + hHalf, wHalf, hHalf);
    node.children.push(c1, c2, c3, c4); 
    return [c1, c2, c3, c4]; 
}

function splitTwo(node, isVertical, t1, t2) {
        const ratio = 0.3 + Math.random() * 0.4;
        let child1, child2;
        if (isVertical) {
            const w1 = node.w * ratio;
            child1 = new GraphNode(t1, node.x, node.y, w1, node.h)
            child2 = new GraphNode(t2, node.x + w1, node.y, node.w - w1, node.h)

        } else {
            const h1 = node.h * ratio;
            child1 = new GraphNode(t1, node.x, node.y, node.w, h1)
            child2 = new GraphNode(t2, node.x, node.y + h1, node.w, node.h - h1)
        }
        node.children.push(child1, child2);
        return [child1, child2];
    }

class GardenGrammar {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.root = new GraphNode(TYPES.ROOT, 0, 0, width, height);
        this.activeNodes = [this.root];
    }

    generate(maxSteps) {
            let step = 0;
            while (step < maxSteps && this.activeNodes.length > 0) {
                let nextBatch = [];
                this.activeNodes.forEach(node => {
                    const createdNodes = transform(node);
                    if (createdNodes && createdNodes.length > 0) {
                        nextBatch.push(...createdNodes);
                    }
                });

                this.activeNodes = nextBatch;
                step++;
            }
        }
}

const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('generateBtn');

function drawGarden(grammar) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#8bc34a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawNode(ctx, grammar.root);
}

function run() {
    const garden = new GardenGrammar(canvas.width, canvas.height);
    garden.generate(6);
    drawGarden(garden);
}

btn.addEventListener('click', run);
run();