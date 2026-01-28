// ballWorker.js
console.log('Ball Worker Loaded');
// canvas 參數
// canvas parameters
let canvasWidth = null;
let canvasHeight = null;

// 配置參數
// Config Parameters
const msBetweenUpdates = 16; // 約 60 FPS // about 60 FPS
const maxBallRadius = 50; // 最大球半徑 // maximum ball radius
let canUpdate = false; // 控制是否可以更新 // Control whether to update

// 最大球數量
// Maximum number of balls
const MAX_BALLS = 5000;
// 初始球數量
// Initial number of balls
const numBalls = 1000;
// 球半徑
// ball Radius
const ballRadius = 15;
// 數據導向存儲 -- 8 步幅: [x, y, vx, vy, radius, h, s, v]
// DOP storage -- 8 Stride: [x, y, vx, vy, radius, h, s, v]
const STRIDE = 8;

// 創建 緩衝區 (5000 顆 * 8 欄 * 4 位元組/浮點數 = 160,000 位元組)
// create buffer (5000 balls * 8 fields * 4 bytes/float = 160,000 bytes)
const buffer = new ArrayBuffer(MAX_BALLS * STRIDE * 4);

// 創建 視圖 // create Views
const x = new Float32Array(buffer, 0, MAX_BALLS);
const y = new Float32Array(buffer, MAX_BALLS * 4, MAX_BALLS);
const vx = new Float32Array(buffer, MAX_BALLS * 8, MAX_BALLS);
const vy = new Float32Array(buffer, MAX_BALLS * 12, MAX_BALLS);
const radius = new Float32Array(buffer, MAX_BALLS * 16, MAX_BALLS);
// HSV 顏色元件 // HSV color components
const h = new Float32Array(buffer, MAX_BALLS * 20, MAX_BALLS); // 0-360

const s = new Float32Array(buffer, MAX_BALLS * 24, MAX_BALLS); // 0-100
const v = new Float32Array(buffer, MAX_BALLS * 28, MAX_BALLS); // 0-100

// 目前場上球的實際數量 
// actual number of balls on screen
let activeCount = 0;
// 滑鼠位置
// mouse position
let mouseX = null;
let mouseY = null;

// 創建球的函式
// Function to create balls
function createBalls(i) {
    // 初始化位置和速度
    // Initialize position and velocity
    balls.x[i] = Math.random() * (canvas.width - 2 * ballRadius) + ballRadius;
    balls.y[i] = Math.random() * (canvas.height - 2 * ballRadius) + ballRadius;
    balls.vx[i] = (Math.random() - 0.5) * 4;
    balls.vy[i] = (Math.random() - 0.5) * 4;
    // 初始化半徑
    // Initialize radius
    balls.radius[i] = ballRadius;
    // 使用隨機 HSV 顏色初始化顏色
    // Initialize color with Random HSV color
    balls.h[i] = Math.floor(Math.random() * 361); // 0-360
    balls.s[i] = Math.floor(Math.random() * 40) + 60; // 60-100
    balls.v[i] = Math.floor(Math.random() * 50) + 50; // 50-100
    // 賦予 ID
    // Assign ID
    balls.id = i;
    activeCount++;
}

// 初始化函式
// Initialization function
function init() {
    for (let i = 0; i < numBalls; i++) {
        createBalls(i);
    }
    postMessage({ type: 'initComplete', buffer: buffer, activeCount: activeCount });
}

// 更新函式
// Update function
function update() {
    if (!canUpdate) {
        setTimeout(update, msBetweenUpdates);
        return;
    }
    
    updateBalls();
    postMessage({ type: 'updateComplete', buffer: buffer, activeCount: activeCount });
    setTimeout(update, msBetweenUpdates);
}


function updateBalls() {
    for (let i = 0; i < activeCount; i++) {
        updateBallsPos(i);
        updateBallsRadius(i);
    }
}

function updateBallsPos(i) {
    // 更新球的位置和速度
    // Update ball positions and velocities
    // 更新位置
    x[i] += vx[i];
    y[i] += vy[i];
    // 邊界碰撞檢測
    if (x[i] - radius[i] < 0 || x[i] + radius[i] > canvas.width) {
        vx[i] = -vx[i];
    }
    if (y[i] - radius[i] < 0 || y[i] + radius[i] > canvas.height) {
        vy[i] = -vy[i];
    }
}

function updateBallsRadius() {
    // 與滑鼠的互動
    let isHovering = false;
    if (mouseX !== null && mouseY !== null) {
        const dx = x[i] - mouseX;
        const dy = y[i] - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius[i] && radius[i] < maxBallRadius) {
            // 滑鼠懸停時增加球體尺寸
            // increase ball size on mouse hover
            isHovering = true;
            radius[i] += 0.5;
        }
    }
    if (!isHovering && radius[i] > ballRadius) {
        radius[i] -= 0.5;
    }
}

self.addEventListener('message', (e) => {
    const data = e.data;
    switch (data.type) {
        case 'init':
            canvasWidth = data.width;
            canvasHeight = data.height;
            maxBallRadius = Math.min(canvasWidth, canvasHeight) / 2;
            init();
            break;
        case 'canUpdate':
            canUpdate = true;
            break;
        case 'resize':
            canvasWidth = data.width;
            canvasHeight = data.height;
            maxBallRadius = Math.min(canvasWidth, canvasHeight) / 2;
            break;
        case 'mouseMove':
            mouseX = data.x;
            mouseY = data.y;
            break;  
        case 'mouseLeave':
            mouseX = -999;
            mouseY = -999;
            break;  
        case 'mouseClick':
            if (activeCount < MAX_BALLS) {
                createBalls(activeCount);
            }
            break;
    }
});