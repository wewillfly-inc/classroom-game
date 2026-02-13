// ============================================================
// input.js - Keyboard & Touch Input Handling
// ============================================================

const Input = (() => {
    // Track which keys are currently pressed
    const keys = {};
    // Track keys that were just pressed this frame
    const justPressed = {};

    // Whether touch controls are active
    let isTouchDevice = false;

    function init() {
        // ---- Keyboard input ----
        window.addEventListener('keydown', (e) => {
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

        // ---- Touch device detection ----
        detectTouch();

        // ---- On-screen button handlers ----
        initTouchButtons();
    }

    // Detect touch capability and show controls
    function detectTouch() {
        const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (hasTouch) {
            enableTouchControls();
        }
        // Also listen for first touch event as fallback
        window.addEventListener('touchstart', function onFirstTouch() {
            enableTouchControls();
            window.removeEventListener('touchstart', onFirstTouch);
        }, { once: true });
    }

    function enableTouchControls() {
        if (isTouchDevice) return;
        isTouchDevice = true;
        document.body.classList.add('has-touch');
        // Trigger resize so canvas accounts for control area
        if (typeof Renderer !== 'undefined') {
            Renderer.resize();
        }
    }

    // Wire up on-screen buttons to simulate key presses
    function initTouchButtons() {
        const buttons = document.querySelectorAll('.dpad-btn[data-key], .ok-btn[data-key]');

        buttons.forEach(btn => {
            const key = btn.getAttribute('data-key');
            if (!key) return;

            // Use pointer events for immediate response (no 300ms delay)
            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                if (!keys[key]) {
                    justPressed[key] = true;
                }
                keys[key] = true;
                btn.classList.add('pressed');

                // Resume audio on first interaction (mobile requirement)
                if (typeof SFX !== 'undefined' && SFX.ensureResumed) {
                    SFX.ensureResumed();
                }
            });

            btn.addEventListener('pointerup', (e) => {
                e.preventDefault();
                keys[key] = false;
                btn.classList.remove('pressed');
            });

            btn.addEventListener('pointerleave', (e) => {
                keys[key] = false;
                btn.classList.remove('pressed');
            });

            btn.addEventListener('pointercancel', (e) => {
                keys[key] = false;
                btn.classList.remove('pressed');
            });

            // Prevent context menu on long press
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        });
    }

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

    function isTouchActive() {
        return isTouchDevice;
    }

    return {
        init,
        endFrame,
        isPressed,
        wasJustPressed,
        getArrowDirection,
        wasSpacePressed,
        isTouchActive,
    };
})();
