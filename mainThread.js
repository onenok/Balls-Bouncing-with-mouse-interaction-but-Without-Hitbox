document.addEventListener('DOMContentLoaded', () => {
    const ballWorker = new Worker('ballWorker.js');
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    
    let mouseX = null;
    let mouseY = null;
    function init() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        requestAnimationFrame(render);
    }
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ballWorker.postMessage({ type: 'canUpdate' });
        requestAnimationFrame(render);
    }
    ballWorker.onmessage = (e) => {
        const data = e.data;
        switch (data.type) {
            case 'updateComplete':
                const buffer = data.buffer;
                const balls = new Float32Array(buffer);

        }
    }
    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        ballWorker.postMessage({ type: 'mouseMove', x: mouseX, y: mouseY });
    });
    canvas.addEventListener('mouseleave', () => {
        mouseX = -999;
        mouseY = -999;
        ballWorker.postMessage({ type: 'mouseLeave' });
    });
    init();
});