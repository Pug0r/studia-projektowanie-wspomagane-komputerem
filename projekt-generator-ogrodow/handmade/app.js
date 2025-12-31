const TYPES = {
    ROOT: 'ROOT', 
    ZONE: 'ZONE', 
    PARCEL: 'PARCEL',
    GRASS: 'GRASS', 
    FLOWER_GARDEN: 'FLOWER_GARDEN',
    FOREST: 'FOREST',
    POND: 'POND', 
    PATH: 'PATH', 
    FOUNTAIN: 'FOUNTAIN', 
    BENCH_AREA: 'BENCH_AREA'
};

const COLORS = {
    GRASS: '#8bc34a', 
    FLOWER_GARDEN: '#e91e63', 
    FOREST: '#2e7d32',
    POND: '#4fc3f7', 
    PATH: '#cfd8dc', 
    PLAZA: '#b0bec5',
    FOUNTAIN: '#81d4fa', 
    BENCH_AREA: '#795548'
};

class GraphNode {
    constructor(type, x, y, w, h) {
        this.type = type;
        this.x = x; this.y =  y; this.w = w; this.h = h;
        this.children = [];
        this.processed = false;
    }
}

function transform(node){
    rng = Math.random()
    
    switch (node.type){
        case TYPES.ROOT:
            if (rng < 0.25)
                split(node, true, TYPES.GRASS, TYPES.POND)
            else if (rng < 0.5)
                split(node, true, TYPES.GRASS, TYPES.FOREST)
            else if (rng < 0.75)
                split(node, true, TYPES.FOUNTAIN, TYPES.FOREST)
            else
                split(node, true, TYPES.POND, TYPES.FLOWER_GARDEN)
            break;
    }

    node.processed = true; 
}

function split(node, isVertical, t1, t2) {
        const ratio = 0.3 + Math.random() * 0.4;
        if (isVertical) {
            const w1 = node.w * ratio;
            node.children.push(new GraphNode(t1, node.x, node.y, w1, node.h))
            node.children.push(new GraphNode(t2, node.x + w1, node.y, node.w - w1, node.h))

        } else {
            const h1 = node.h * ratio;
            node.children.push(new GraphNode(t1, node.x, node.y, node.w, h1))
            node.children.push(new GraphNode(t2, node.x, node.y + h1, node.w, node.h - h1))

        }
    }

class GardenGrammar {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.root = new GraphNode(TYPES.ROOT, 0, 0, width, height);
        this.nodes = [this.root];
    }

    generate(){
        while (this.areAllProcessed(this.nodes) == false){
                this.applyTransformToSubgraph(this.nodes)
        }
    }

    applyTransformToSubgraph(nodes) {
    nodes.forEach(node => {
        transform(node);
        if (node.children && node.children.length > 0) {
            this.applyTransformToSubgraph(node.children);
        }
    });
}

areAllProcessed(nodes) {
    return nodes.every(node => {
        if (!node.processed) 
            return false;
        if (node.children && node.children.length > 0) {
            return this.areAllProcessed(node.children);
        }
        return true;
    });
}
}


const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('generateBtn');

function drawNode(node) {
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => drawNode(child));
        return; 
    }

    ctx.save();
    ctx.translate(node.x, node.y);
    

    ctx.fillStyle = COLORS[node.type] || 'red';

    ctx.fillRect(0, 0, node.w, node.h);
    ctx.restore();
}

function drawGarden(grammar) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawNode(grammar.root);
}

function run() {
    const garden = new GardenGrammar(canvas.width, canvas.height);
    garden.generate();
    drawGarden(garden);
}

btn.addEventListener('click', run);
run();