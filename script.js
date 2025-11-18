class Point{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class Rectangle{
    constructor(pointA, pointB, id){
        this.pointA = pointA;
        this.pointB = pointB;
        this.id = id;
        this.color = null;
    }
}

// Html elements
const CANVAS = document.getElementById('main-canvas');
const applyButton = document.getElementById('applyButton');

const tmp = new Set([
    new Rectangle(new Point(100, 200), new Point(300, 300)),
    new Rectangle(new Point(300, 300), new Point(400, 500))
]);

function drawRectanglesFromSet(rectSet) {
    const ctx = CANVAS.getContext('2d');
    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);

    rectSet.forEach(rect => {
        if (rect instanceof Rectangle) {
            const x1 = rect.pointA.x;
            const y1 = rect.pointA.y;
            const x2 = rect.pointB.x;
            const y2 = rect.pointB.y;

            const drawX = Math.min(x1, x2);
            const drawY = Math.min(y1, y2);
            const drawWidth = Math.abs(x1 - x2);
            const drawHeight = Math.abs(y1 - y2);

            ctx.fillStyle = 'blue'; 
            ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
        }
    });
}

function handleApplyClick() {
    console.log('Apply button clicked!');
    drawRectanglesFromSet(tmp); 
}

document.addEventListener('DOMContentLoaded', () => {
    applyButton.addEventListener('click', handleApplyClick);
});
