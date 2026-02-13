// ============================================================
// main.js - Entry Point & Game Loop
// ============================================================

(function () {
    'use strict';

    const canvas = document.getElementById('gameCanvas');

    // Initialize all modules
    Renderer.init(canvas);
    Input.init();
    SFX.init();
    Game.init();

    // Initialize grid and teacher for title screen preview
    Grid.init();
    Teacher.init();

    // Resume audio context on first touch anywhere (mobile requirement)
    window.addEventListener('touchstart', function onFirstTouch() {
        SFX.ensureResumed();
        window.removeEventListener('touchstart', onFirstTouch);
    }, { once: true });

    let lastTime = performance.now();

    function gameLoop(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.1); // delta in seconds, capped
        lastTime = now;

        // Update
        Game.update(dt);

        // Render
        Game.render();

        // Clear input state for next frame
        Input.endFrame();

        requestAnimationFrame(gameLoop);
    }

    // Start the loop
    requestAnimationFrame(gameLoop);
})();
