const TYPES = {
    EMPTY: 'EMPTY',
    GRASS: 'GRASS',
    FLOWER: 'FLOWER',
    FOREST: 'FOREST',
    POND: 'POND',
    PATH: 'PATH', 
    BEACH: 'BEACH',
    FOUNTAIN: 'FOUNTAIN',
    BENCH: 'BENCH'
};

CELL_SIZE = 10;
CANVAS_SIZE = 600;
DIMENSION_LENGTH = CANVAS_SIZE / CELL_SIZE; 

const canvas = document.getElementById('gardenCanvas');
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
const ctx = canvas.getContext('2d');
const generateBtn = document.getElementById('generateBtn');

class Transformation {
    constructor(name, transformFunction) {
        this.name = name;
        this.transformFunction = transformFunction;
    }

    canApply(graph, X, Y){
        return this.canApply(graph, X, Y)
    }

    apply(graph, X, Y){
        return this.transformFunction(graph, X, Y);
    }
}


class Vertex {
    constructor(type){
        this.type = type
    }
}

class Graph{
    constructor(height, width){
        this.grid = Array.from({ length: height }, () => 
        Array.from({ length: width }, () => new Vertex(TYPES.EMPTY)));
    }

    getAt(x, y){
        return this.grid[x][y];
    }

}

class CanvasManager{
    constructor(canvas){
        this.ctx = canvas.getContext('2d');
    }

    draw(graph) {

        for (let i = 0; i < DIMENSION_LENGTH; i++) { 
            for (let j = 0; j < DIMENSION_LENGTH; j++) {
                
                const cell = graph.getAt(i, j);
                
                this.drawCell(i, j); 
            }
        }
    }

    drawCell(row, col, color = 'blue') {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        this.ctx.fillStyle = color;

        this.ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        
        this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        this.ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
    }
}



function runGenerator() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const graph = new Graph(DIMENSION_LENGTH, DIMENSION_LENGTH);
    const canvasManager = new CanvasManager(canvas);
    canvasManager.draw(graph);
}


generateBtn.addEventListener('click', runGenerator);