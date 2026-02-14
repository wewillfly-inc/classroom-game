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

        // ---- On-screen D-pad button handlers ----
        initTouchButtons();

        // ---- Canvas tap = Space (for touch devices) ----
        initCanvasTap();
    }

    // Detect whether this is a phone/tablet (not a touchscreen desktop).
    // Uses media queries: "pointer: coarse" means the primary input is a
    // finger, and "hover: none" means there is no mouse. Together they
    // exclude laptops/desktops that happen to have a touchscreen.
    function detectTouch() {
        const isCoarsePointer = window.matchMedia('(pointer: coarse) and (hover: none)').matches;
        if (isCoarsePointer) {
            enableTouchControls();
        }
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

    // Wire up on-screen D-pad buttons to simulate arrow key presses
    function initTouchButtons() {
        const buttons = document.querySelectorAll('.dpad-btn[data-key]');

        buttons.forEach(btn => {
            const key = btn.getAttribute('data-key');
            if (!key) return;

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

    // Tapping anywhere on the canvas acts as Space (OK / confirm)
    function initCanvasTap() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        canvas.addEventListener('pointerdown', (e) => {
            // Only respond on touch devices
            if (!isTouchDevice) return;
            e.preventDefault();
            if (!keys[' ']) {
                justPressed[' '] = true;
            }
            keys[' '] = true;

            if (typeof SFX !== 'undefined' && SFX.ensureResumed) {
                SFX.ensureResumed();
            }
        });

        canvas.addEventListener('pointerup', (e) => {
            if (!isTouchDevice) return;
            keys[' '] = false;
        });

        canvas.addEventListener('pointercancel', (e) => {
            if (!isTouchDevice) return;
            keys[' '] = false;
        });

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
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
