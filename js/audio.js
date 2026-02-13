// ============================================================
// audio.js - Simple Sound Effects using Web Audio API
// ============================================================

const SFX = (() => {
    let audioCtx = null;
    let enabled = true;

    function init() {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            enabled = false;
        }
    }

    // Ensure audio context is resumed (browsers require user interaction)
    function ensureResumed() {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTone(freq, duration, type, volume) {
        if (!enabled || !audioCtx) return;
        ensureResumed();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type || 'square';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(volume || 0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    // Note pass sound (whoosh)
    function playPass() {
        playTone(300, 0.15, 'sine', 0.08);
        setTimeout(() => playTone(400, 0.1, 'sine', 0.06), 50);
    }

    // Note arrives sound
    function playArrive() {
        playTone(500, 0.1, 'square', 0.06);
    }

    // Warning sound (teacher about to turn)
    function playWarning() {
        playTone(800, 0.15, 'square', 0.12);
        setTimeout(() => playTone(600, 0.15, 'square', 0.1), 150);
    }

    // Teacher turns around (danger!)
    function playDanger() {
        playTone(200, 0.3, 'sawtooth', 0.1);
    }

    // Teacher turns back (safe)
    function playSafe() {
        playTone(400, 0.15, 'sine', 0.06);
        setTimeout(() => playTone(500, 0.15, 'sine', 0.06), 100);
    }

    // Game over sound
    function playGameOver() {
        playTone(400, 0.2, 'square', 0.15);
        setTimeout(() => playTone(300, 0.2, 'square', 0.12), 200);
        setTimeout(() => playTone(200, 0.4, 'square', 0.1), 400);
    }

    // Win sound
    function playWin() {
        playTone(400, 0.15, 'square', 0.1);
        setTimeout(() => playTone(500, 0.15, 'square', 0.1), 150);
        setTimeout(() => playTone(600, 0.15, 'square', 0.1), 300);
        setTimeout(() => playTone(800, 0.3, 'square', 0.12), 450);
    }

    // Invalid move (blocked)
    function playBlocked() {
        playTone(150, 0.1, 'square', 0.05);
    }

    // Start game
    function playStart() {
        playTone(300, 0.1, 'square', 0.08);
        setTimeout(() => playTone(400, 0.1, 'square', 0.08), 100);
        setTimeout(() => playTone(500, 0.15, 'square', 0.1), 200);
    }

    return {
        init,
        ensureResumed,
        playPass,
        playArrive,
        playWarning,
        playDanger,
        playSafe,
        playGameOver,
        playWin,
        playBlocked,
        playStart,
    };
})();
