// Stałe
const MONDRIAN_COLORS = {
    RED: '#D40920',
    BLUE: '#1255A2',
    YELLOW: '#F7D842',
    WHITE: '#FFFFFF',
    BLACK: '#000000'
};

const MARKER_STATE = {
    ACTIVE: 'A',
    INACTIVE: 'I'
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const IN_CANVAS_PADDING = 10;

// Globals powiazane z logika
let nextRectangleId = 0;
let nextRuleId = 0;

class Rectangle {
    constructor(x, y, width, height, markerState, color) {
        this.id = nextRectangleId++;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.markerState = markerState; 
        this.color = color;
    }

    contains(px, py) {
        return px >= this.x && px <= this.x + this.width &&
               py >= this.y && py <= this.y + this.height;
    }

    draw(ctx, isSelected) {
        ctx.strokeStyle = MONDRIAN_COLORS.BLACK;
        ctx.lineWidth = 5;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (isSelected) {
            ctx.strokeStyle = '#ff0000'; 
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        }
    }
}

class Transformation {
    constructor(name, transformFunction) {
        this.id = nextRuleId++;
        this.name = name;
        this.transformFunction = transformFunction;
    }

    apply(rect) {
        return this.transformFunction(rect);
    }
}

class ShapeGrammar {
    constructor(rules) {
        this.rectangles = [];
        this.rules = rules;
    }

    // Ustaw startowy prostokąt (ksztalt startowy)
    initialize() {
        nextRectangleId = 0;
        this.rectangles = [new Rectangle(IN_CANVAS_PADDING, IN_CANVAS_PADDING,
            CANVAS_WIDTH - IN_CANVAS_PADDING * 2, CANVAS_HEIGHT - IN_CANVAS_PADDING * 2,
            MARKER_STATE.ACTIVE,
            MONDRIAN_COLORS.WHITE)];
    }

    applyRule(rectId, ruleId) {
        const ruleToApply = this.rules.find(r => r.id === ruleId);
        const rectIndex = this.rectangles.findIndex(r => r.id === rectId);

        const rectToReplace = this.rectangles[rectIndex];
        const newRects = ruleToApply.apply(rectToReplace);
        this.rectangles.splice(rectIndex, 1, ...newRects); // remove z podmianka, unpack na koncu koniec
    }

    getClickedRect(clickX, clickY) {
        for (let i = 0; i < this.rectangles.length; i++) {
            const rect = this.rectangles[i];
            if (rect.contains(clickX, clickY)) {
                return rect;
            }
        }
        return null;
    }
}

// TODO: mozna by to wydzielic w jakies klaski 
const rules = [
    new Transformation('Podziel pionowo (50/50)', (rect) => [
        new Rectangle(rect.x, rect.y, rect.width * 0.5, rect.height, MARKER_STATE.ACTIVE, MONDRIAN_COLORS.WHITE),
        new Rectangle(rect.x + rect.width * 0.5, rect.y, rect.width * 0.5, rect.height, MARKER_STATE.ACTIVE, MONDRIAN_COLORS.WHITE)
    ]),
    new Transformation('Podziel poziomo (30/70)', (rect) => [
        new Rectangle(rect.x, rect.y, rect.width, rect.height * 0.3, MARKER_STATE.ACTIVE, MONDRIAN_COLORS.WHITE),
        new Rectangle(rect.x, rect.y + rect.height * 0.3, rect.width, rect.height * 0.7, MARKER_STATE.ACTIVE, MONDRIAN_COLORS.WHITE)
    ]),
    new Transformation('Wypełnij (Czerwony)', (rect) => [
        new Rectangle(rect.x, rect.y, rect.width, rect.height, MARKER_STATE.INACTIVE, MONDRIAN_COLORS.RED)]),
    new Transformation('Wypełnij (Niebieski)', (rect) => [
        new Rectangle(rect.x, rect.y, rect.width, rect.height, MARKER_STATE.INACTIVE, MONDRIAN_COLORS.BLUE)]),
    new Transformation('Wypełnij (Żółty)', (rect) => [
        new Rectangle(rect.x, rect.y, rect.width, rect.height, MARKER_STATE.INACTIVE, MONDRIAN_COLORS.YELLOW)]),
    new Transformation('Wypełnij (Biały)', (rect) => [
        new Rectangle(rect.x, rect.y, rect.width, rect.height, MARKER_STATE.INACTIVE, MONDRIAN_COLORS.WHITE)])];

const shapeGrammar = new ShapeGrammar(rules);

const canvas = document.getElementById('mainCanvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');
const rulesListDiv = document.getElementById('rules-list');
const resetButton = document.getElementById('reset-button');

let selectedRectId = null; // ID aktualnie klikniętego prostokąta

// Narysuj aktualny stan
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapeGrammar.rectangles.forEach(rect => {
        rect.draw(ctx, rect.id === selectedRectId);
    });
}

// Odpowiada za stan panelu po lewej, daje wejscie do triggerowania regul
function updateRulesPanel(selectedRect) {
    rulesListDiv.innerHTML = ''; // wyczysc stan
    if (selectedRect && selectedRect.markerState === MARKER_STATE.ACTIVE) {
        shapeGrammar.rules.forEach(rule => {
            const button = document.createElement('button');
            button.innerText = rule.name;
            button.onclick = () => {
                shapeGrammar.applyRule(selectedRect.id, rule.id);
                selectedRectId = null;
                updateRulesPanel(null);
                draw();
            };
            rulesListDiv.appendChild(button);
        });
    } else if (selectedRect) {
        rulesListDiv.innerHTML = '<p>Do tego prostokąta nie można już zastosować żandych reguł.</p>';
    } else {
        rulesListDiv.innerHTML = '<p>Kliknij na dowolny biały prostokąt na płótnie, aby zobaczyć reguły, które można do niego zastosować.</p>';
    }
}

// Klikniecia uzytkownika po canvasie
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const clickedRect = shapeGrammar.getClickedRect(x, y);
    selectedRectId = clickedRect ? clickedRect.id : null;
    updateRulesPanel(clickedRect);
    draw();
}
canvas.addEventListener('click', handleCanvasClick);

// Ustaw poczatkowy stan GUI i logiki
function initialize() {
    shapeGrammar.initialize();
    selectedRectId = null;
    updateRulesPanel(null);
    draw();
}
resetButton.addEventListener('click', initialize);
initialize();

