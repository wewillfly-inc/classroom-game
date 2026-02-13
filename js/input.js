// ============================================================
// input.js - Keyboard Input Handling
// ============================================================

const Input = (() => {
    // Track which keys are currently pressed
    const keys = {};
    // Track keys that were just pressed this frame (for single-press actions)
    const justPressed = {};

    function init() {
        window.addEventListener('keydown', (e) => {
            // Prevent default for arrow keys and space to avoid scrolling
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            if (!keys[e.key]) {
                justPressed[e.key] = true;
            }
            keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });
    }

    // Call at the end of each frame to clear just-pressed state
    function endFrame() {
        for (const key in justPressed) {
            delete justPressed[key];
        }
    }

    function isPressed(key) {
        return !!keys[key];
    }

    function wasJustPressed(key) {
        return !!justPressed[key];
    }

    // Returns direction {dc, dr} if an arrow key was just pressed, or null
    function getArrowDirection() {
        if (justPressed['ArrowUp']) return { dc: 0, dr: -1 };
        if (justPressed['ArrowDown']) return { dc: 0, dr: 1 };
        if (justPressed['ArrowLeft']) return { dc: -1, dr: 0 };
        if (justPressed['ArrowRight']) return { dc: 1, dr: 0 };
        return null;
    }

    function wasSpacePressed() {
        return !!justPressed[' '];
    }

    return {
        init,
        endFrame,
        isPressed,
        wasJustPressed,
        getArrowDirection,
        wasSpacePressed,
    };
})();
