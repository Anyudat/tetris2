// HTML elements
const CONTAINER = document.getElementById('container');
const TEXT = document.getElementById('text');
const POINTS = document.getElementById('points');
const NEXTSHAPECONTAINER = document.getElementById('nextShapeContainer');
const PLACINGCONTAINER = document.getElementById('placingContainer');
const PAUSEMENU = document.getElementById('pauseMenu');

// cells
const HEIGHT = 20;
const WIDTH = 10;
const borderSize = 2; // pixel
const GAMESPEED = 500;

const colors = ['lightblue', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'];
let shapes = [];
let canRotate = true;
let running = false;
let paused = false;
let gameLoop;

let level = 1;
let points = 0;

let cellSize;
let currentShapeIndex;

let nextShape;
let nextShapeType;
let nextShapeColor;

let placingShape;

// set container size and location
CONTAINER.style.height = window.innerHeight * 0.8 + HEIGHT * borderSize + "px";
CONTAINER.style.width = window.innerHeight * 0.8 * WIDTH / HEIGHT + WIDTH * borderSize + "px";
CONTAINER.style.left = (window.innerWidth - window.innerHeight * 0.8 * WIDTH / HEIGHT - WIDTH * borderSize) / 2 + "px";
CONTAINER.style.top = window.innerHeight * 0.1 - HEIGHT * borderSize / 2 + "px";

PLACINGCONTAINER.style.height = CONTAINER.style.height;
PLACINGCONTAINER.style.width = CONTAINER.style.width;
PLACINGCONTAINER.style.left = CONTAINER.style.left;
PLACINGCONTAINER.style.top = CONTAINER.style.top;

// put text on the side
TEXT.style.left = (window.innerWidth + CONTAINER.clientWidth) / 2 + (window.innerWidth - CONTAINER.clientWidth) / 8 + "px";
TEXT.style.width = (window.innerWidth - CONTAINER.clientWidth) / 4 + "px";
TEXT.style.top = CONTAINER.style.top;

cellSize = CONTAINER.clientWidth / WIDTH;

// next shape container's size and location
NEXTSHAPECONTAINER.style.left = "0px";
NEXTSHAPECONTAINER.style.top = "0px";
NEXTSHAPECONTAINER.style.width = 4 * cellSize + "px";
NEXTSHAPECONTAINER.style.height = 4 * cellSize + "px";

cellSize = parseFloat(CONTAINER.clientWidth / WIDTH);

let SHAPECOORDS = {
    'i': [[0, 0], [0, cellSize], [0, 2 * cellSize], [0, 3 * cellSize]],
    'o': [[0, 0], [0, cellSize], [cellSize, 0], [cellSize, cellSize]],
    's': [[0, 0], [0, cellSize], [cellSize, 0], [-cellSize, cellSize]],
    'z': [[0, 0], [0, cellSize], [-cellSize, 0], [cellSize, cellSize]],
    'l': [[0, 0], [0, cellSize], [0, 2 * cellSize], [cellSize, 2 * cellSize]],
    'j': [[0, 0], [0, cellSize], [0, 2 * cellSize], [-cellSize, 2 * cellSize]],
    't': [[0, cellSize], [0, 0], [-cellSize, 0], [cellSize, 0]],
};

function createShape(shapeType, color, x = 5, y = 1, container = CONTAINER) {
    let shape = {};
    shape['cells'] = [];
    for (i = 0; i < 4; i++) {
        currCell = document.createElement('div');
        currCell.classList.add('cell');
        currCell.style.width = cellSize - borderSize + "px";
        currCell.style.height = cellSize - borderSize + "px";
        currCell.style.backgroundColor = color;
        currCell.style.left = x * cellSize + SHAPECOORDS[shapeType][i][0] + "px";
        currCell.style.top = y * cellSize + SHAPECOORDS[shapeType][i][1] + "px";

        shape['cells'][i] = {};
        shape['cells'][i]['coords'] = [];

        shape['cells'][i]['div'] = currCell;
        shape['cells'][i]['coords'][0] = x + SHAPECOORDS[shapeType][i][0] / cellSize;
        shape['cells'][i]['coords'][1] = y + SHAPECOORDS[shapeType][i][1] / cellSize;
        shape['type'] = shapeType;
        shape['color'] = color;

        container.appendChild(currCell);
    }
    return shape;
}

function createNextShape() {
    while (NEXTSHAPECONTAINER.firstChild) {
        NEXTSHAPECONTAINER.removeChild(NEXTSHAPECONTAINER.lastChild);
    }
    nextShapeType = Object.keys(SHAPECOORDS)[Math.round(Math.random() * (Object.keys(SHAPECOORDS).length - 1))];
    nextShapeColor = colors[Math.round(Math.random() * (colors.length - 1))];
    let nextShapeX = parseFloat(NEXTSHAPECONTAINER.style.left.slice(0, NEXTSHAPECONTAINER.style.left.length - 2)) / cellSize;
    let nextShapeY = parseFloat(NEXTSHAPECONTAINER.style.top.slice(0, NEXTSHAPECONTAINER.style.top.length - 2)) / cellSize;
    nextShape = createShape(nextShapeType, nextShapeColor, nextShapeX + 2, nextShapeY, NEXTSHAPECONTAINER);
}

function createPlacingShape(){
    while (PLACINGCONTAINER.firstChild){
        PLACINGCONTAINER.removeChild(PLACINGCONTAINER.lastChild);
    }
    let type = shapes[currentShapeIndex]['type'];
    let color = shapes[currentShapeIndex]['color'];
    placingShape = createShape(type, color, shapes[currentShapeIndex]['cells'][type == 't' ? 1 : 0]['coords'][0], shapes[currentShapeIndex]['cells'][type == 't' ? 1 : 0]['coords'][1], PLACINGCONTAINER);
}

function updatePlacingShape(){
    let currentCoords = [];
    let lowestCoords = [];

    for (i = 0; i < shapes[currentShapeIndex]['cells'].length; i++){
        currentCoords.push([shapes[currentShapeIndex]['cells'][i]['coords'][0],shapes[currentShapeIndex]['cells'][i]['coords'][1]]);
    }

    while (!shapeCollision('down', 'up')){
        lowestCoords = [];
        for (j = 0; j < shapes[currentShapeIndex]['cells'].length; j++){
            lowestCoords.push(shapes[currentShapeIndex]['cells'][j]['coords']);
        }
        moveShape('down');
    }

    for (k = 0; k < currentCoords.length; k++){
        shapes[currentShapeIndex]['cells'][k]['coords'] = currentCoords[k];
        shapes[currentShapeIndex]['cells'][k]['div'].style.left = shapes[currentShapeIndex]['cells'][k]['coords'][0] * cellSize + "px";
        shapes[currentShapeIndex]['cells'][k]['div'].style.top = shapes[currentShapeIndex]['cells'][k]['coords'][1] * cellSize + "px";

        placingShape['cells'][k]['div'].style.left = lowestCoords[k][0] * cellSize + "px";
        placingShape['cells'][k]['div'].style.top = lowestCoords[k][1] * cellSize + "px";
        placingShape['cells'][k]['div'].style.backgroundColor = shapes[currentShapeIndex]['color'];
    }
}

function placeShapeImmediately(){
    while(!shapeCollision('down', 'up')){
        moveShape('down');
    }
}

shapes.push(createShape(Object.keys(SHAPECOORDS)[Math.round(Math.random() * (Object.keys(SHAPECOORDS).length - 1))], colors[Math.round(Math.random() * (colors.length - 1))]));
currentShapeIndex = 0;
createNextShape();
createPlacingShape();
updatePlacingShape();

window.addEventListener('keydown', (event) => {
    // run the game
    if (event.key == ' ') {
        if (!running) {
            running = true;
            game();
        }
    }

    // keybinds
    if (running && !paused) {
        let canMoveLeft = true;
        let canMoveRight = true;

        if (event.key == 'Escape'){
            paused = true;
            PAUSEMENU.style.display = 'block';
        }

        if (event.key == 'ArrowDown' || event.key == 's'){
            placeShapeImmediately();
        }

        if (event.key == 'ArrowLeft' || event.key == 'a') {
            for (i = 0; i < shapes[currentShapeIndex]['cells'].length; i++) {
                if (shapes[currentShapeIndex]['cells'][i]['coords'][0] - 1 < 0) {
                    canMoveLeft = false;
                }
            }
            if (canMoveLeft && !shapeCollision('left', 'right')) {
                moveShape('left');
                updatePlacingShape();
            }
        }

        if (event.key == 'ArrowRight' || event.key == 'd') {
            for (j = 0; j < shapes[currentShapeIndex]['cells'].length; j++) {
                if (shapes[currentShapeIndex]['cells'][j]['coords'][0] + 1 >= CONTAINER.clientWidth) {
                    canMoveRight = false;
                }
            }
            if (canMoveRight && !shapeCollision('right', 'left')) {
                moveShape('right');
                updatePlacingShape();
            }
        }

        if ((event.key == 'e' || event.key == 'ArrowUp') && canRotate) {
            rotateShape(false);
            if (shapeCollides()) {
                rotateShape(true);
            } else { // slow down rotation so there are no helicopters
                canRotate = false;
                setTimeout(() => {
                    canRotate = true;
                }, 200);
            }
            updatePlacingShape();
        }
    }
    else if (running && paused && event.key == 'Escape'){
        paused = false;
        PAUSEMENU.style.display = 'none';
    }
});

function moveShape(direction) {
    for (i = 0; i < shapes[currentShapeIndex]['cells'].length; i++) {
        let directions = {
            'down': 1,
            'up': -1,
            'left': -1,
            'right': 1
        };
        if (direction == 'down' || direction == 'up') {
            shapes[currentShapeIndex]['cells'][i]['coords'][1] += directions[direction];
            shapes[currentShapeIndex]['cells'][i]['div'].style.top = shapes[currentShapeIndex]['cells'][i]['coords'][1] * cellSize + "px";
        }
        else {
            shapes[currentShapeIndex]['cells'][i]['coords'][0] += directions[direction];
            shapes[currentShapeIndex]['cells'][i]['div'].style.left = shapes[currentShapeIndex]['cells'][i]['coords'][0] * cellSize + "px";
        }
    }
}

function rotateShape(backwards) {
    // pivot cell for rotating is at index 1
    if (shapes[currentShapeIndex]['type'] != 'o') {

        let pivotX = shapes[currentShapeIndex]['cells'][1]['coords'][0];
        let pivotY = shapes[currentShapeIndex]['cells'][1]['coords'][1];

        for (i = 0; i < shapes[currentShapeIndex]['cells'].length; i++) {
            let x = shapes[currentShapeIndex]['cells'][i]['coords'][0];
            let y = shapes[currentShapeIndex]['cells'][i]['coords'][1];

            x -= pivotX;
            y -= pivotY;

            let tmp = x;

            if (shapes[currentShapeIndex]['type'] == 'i') {
                x = y;
                y = tmp;
            }
            else if (backwards){
                x = y;
                y = -tmp;
            }
            else {
                x = -y;
                y = tmp;
            }

            x += pivotX;
            y += pivotY;

            shapes[currentShapeIndex]['cells'][i]['coords'][0] = x;
            shapes[currentShapeIndex]['cells'][i]['coords'][1] = y;
            shapes[currentShapeIndex]['cells'][i]['div'].style.left = x * cellSize + "px";
            shapes[currentShapeIndex]['cells'][i]['div'].style.top = y * cellSize + "px";
        }
    }
}

function checkFullLine() {
    // check after collision check so no impossible positions
    let coords = {};
    fullLines = [];
    for (i = 0; i < shapes.length; i++) {
        for (j = 0; j < shapes[i]['cells'].length; j++) {
            let y = shapes[i]['cells'][j]['coords'][1];

            if (!(y in coords)) {
                coords[y] = 1;
            } else {
                coords[y]++;
            }

            if (coords[y] == WIDTH) {
                fullLines.push(y);
            }
        }
    }
    return fullLines;
}

function clearLines(lines) {
    let perfectClearPoints = { 1: 800, 2: 1200, 3: 1800, 4: 2000 };
    let lineClearPoints = { 1: 100, 2: 300, 3: 500, 4: 800 };
    let lastLine = 0;

    // perfect line clears  
    if (lines.length * WIDTH == shapes.length * shapes[0]['cells'].length) {
        points += perfectClearPoints[lines.length];
        points += lineClearPoints[lines.length];
    }

    lines.sort().reverse();

    for (i = 0; i < lines.length; i++) {
        for (j = shapes.length - 1; j >= 0; j--) {
            for (k = shapes[j]['cells'].length - 1; k >= 0; k--) {
                if (shapes[j]['cells'][k]['coords'][1] == lines[i]) {
                    CONTAINER.removeChild(shapes[j]['cells'][k]['div']);
                    shapes[j]['cells'].splice(k, 1);
                }
            }
            if (shapes[j]['cells'].length == 0) {
                shapes.splice(j, 1);
            }
        }
    }

    lines.reverse();

    for (a = 0; a < lines.length; a++) {
        if (a > 0 && lines[a - 1] + 1 != lines[a]) { // 19 17 16
            points += lineClearPoints[a];
            lastLine = a;
        }
        else if (a == lines.length - 1) {
            points += lineClearPoints[a - lastLine + 1];
        }
        for (b = 0; b < shapes.length; b++) {
            for (c = 0; c < shapes[b]['cells'].length; c++) {
                if (shapes[b]['cells'][c]['coords'][1] < lines[a]) {
                    shapes[b]['cells'][c]['coords'][1]++;
                    shapes[b]['cells'][c]['div'].style.top = shapes[b]['cells'][c]['coords'][1] * cellSize + "px";
                }
            }
        }
    }

    POINTS.textContent = points;
}

function shapeCollision(movingDirection, oppositeDirection) {

    // collision with the bottom of the screen
    for (i = 0; i < shapes[currentShapeIndex]['cells'].length; i++) {
        if (shapes[currentShapeIndex]['cells'][i]['coords'][1] >= HEIGHT - 1) {
            return true;
        }
    }

    // collision with other shapes
    moveShape(movingDirection); // move shape
    let collision = shapeCollides();
    moveShape(oppositeDirection);
    return collision;
}

function shapeCollides() {
    let coords = {};
    for (j = 0; j < shapes.length; j++) {
        for (k = 0; k < shapes[j]['cells'].length; k++) {
            if (shapes[j]['cells'][k]['coords'][0] < 0 || shapes[j]['cells'][k]['coords'][0] >= WIDTH) {
                return true;
            }

            if (!(`${shapes[j]['cells'][k]['coords'][0]};${shapes[j]['cells'][k]['coords'][1]}` in coords)) {
                coords[`${shapes[j]['cells'][k]['coords'][0]};${shapes[j]['cells'][k]['coords'][1]}`] = 1;
            }
            else {
                return true;
            }
        }
    }
    return false;
}

function game() {
    gameLoop = setInterval(() => {
        // game loop
        if (!paused){
            if (running) {
                currentShapeIndex = shapes.length - 1;
                if (!shapeCollision('down', 'up')) {
                    moveShape('down');
                } else {
                    let fullLines = checkFullLine();
                    if (fullLines.length > 0) {
                        clearLines(fullLines);
                    }
                    shapes.push(createShape(nextShapeType, nextShapeColor));
                    currentShapeIndex = shapes.length - 1;
                    createNextShape();
                    if (shapeCollides()) {
                        running = false;
                    }
                    else{
                        updatePlacingShape();
                    }
                }
            }
            else{
                gameOver();
            }
        }
    }, GAMESPEED);
}

function gameOver() {
    clearInterval(gameLoop);
    alert('You lost!');
    shapes = [];
    points = 0;
    POINTS.textContent = '0';
    while (CONTAINER.firstChild) {
        CONTAINER.removeChild(CONTAINER.lastChild);
    }
    shapes.push(createShape(Object.keys(SHAPECOORDS)[Math.round(Math.random() * (Object.keys(SHAPECOORDS).length - 1))], colors[Math.round(Math.random() * (colors.length - 1))]));
    currentShapeIndex = shapes.length - 1;
    createNextShape();
    createPlacingShape();
    updatePlacingShape();
}