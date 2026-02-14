// ============================================================
// game.js - Game State Machine, Timer, Win/Lose Logic
// ============================================================

const Game = (() => {
    // Game states: 'title', 'settings', 'playing', 'gameover', 'win'
    let state = 'title';
    let gameOverReason = ''; // 'caught' or 'timeout'

    // Timer
    let MAX_TIME = 60; // seconds (configurable via settings)
    let timeLeft = MAX_TIME;

    // Animation frame counter
    let frame = 0;

    // Sleeper shuffle timer
    const SHUFFLE_INTERVAL = 3.0; // seconds
    let shuffleTimer = SHUFFLE_INTERVAL;

    // ---- Settings / Difficulty ----
    const SETTINGS_ROWS = 3; // grid, time, sleepers

    // Grid size options: [cols, rows]
    const GRID_OPTIONS = [
        { cols: 3, rows: 4, label: '3x4' },
        { cols: 5, rows: 4, label: '5x4' },
        { cols: 5, rows: 5, label: '5x5' },
    ];
    // Time options (seconds)
    const TIME_OPTIONS = [20, 40, 60];
    // Sleeper count options
    const SLEEP_OPTIONS = [3, 5, 7];

    let settingsRow = 0;    // 0 = grid, 1 = time, 2 = sleepers
    let gridChoice = 0;     // index into GRID_OPTIONS
    let timeChoice = 2;     // index into TIME_OPTIONS (default: 60s)
    let sleepChoice = 0;    // index into SLEEP_OPTIONS (default: 3)

    function init() {
        state = 'title';
        frame = 0;
        I18n.init();
        // Default settings
        settingsRow = 0;
        gridChoice = 0;
        timeChoice = 2;
        sleepChoice = 0;
    }

    // Track previous teacher state for sound triggers
    let prevTeacherState = 'facing_board';

    function startGame() {
        // Apply settings
        const gridOpt = GRID_OPTIONS[gridChoice];
        MAX_TIME = TIME_OPTIONS[timeChoice];
        const sleepCount = SLEEP_OPTIONS[sleepChoice];

        // Configure renderer for the chosen grid size
        Renderer.setGridSize(gridOpt.cols, gridOpt.rows);

        state = 'playing';
        timeLeft = MAX_TIME;
        frame = 0;
        shuffleTimer = SHUFFLE_INTERVAL;
        prevTeacherState = 'facing_board';
        Grid.init(gridOpt.cols, gridOpt.rows, sleepCount);
        Teacher.init();
        SFX.ensureResumed();
        SFX.playStart();
    }

    // Return to settings screen (used by Escape key and mobile back button)
    function goToSettings() {
        if (state === 'playing' || state === 'gameover' || state === 'win') {
            state = 'settings';
        }
    }

    function update(dt) {
        frame++;

        // Escape key returns to settings from gameplay / result screens
        if (Input.wasJustPressed('Escape')) {
            goToSettings();
        }

        switch (state) {
            case 'title':
                if (Input.wasJustPressed('ArrowLeft')) {
                    const langs = I18n.languages;
                    const idx = (langs.indexOf(I18n.getLanguage()) + langs.length - 1) % langs.length;
                    I18n.setLanguage(langs[idx]);
                }
                if (Input.wasJustPressed('ArrowRight')) {
                    const langs = I18n.languages;
                    const idx = (langs.indexOf(I18n.getLanguage()) + 1) % langs.length;
                    I18n.setLanguage(langs[idx]);
                }
                if (Input.wasSpacePressed()) {
                    state = 'settings';
                    SFX.ensureResumed();
                }
                break;

            case 'settings':
                updateSettings();
                break;

            case 'playing':
                updatePlaying(dt);
                break;

            case 'gameover':
            case 'win':
                if (Input.wasSpacePressed()) {
                    // Go back to settings instead of directly restarting
                    state = 'settings';
                }
                break;
        }
    }

    function updateSettings() {
        // Navigate between rows (grid / time / sleepers)
        if (Input.wasJustPressed('ArrowUp')) {
            settingsRow = (settingsRow + SETTINGS_ROWS - 1) % SETTINGS_ROWS;
        }
        if (Input.wasJustPressed('ArrowDown')) {
            settingsRow = (settingsRow + 1) % SETTINGS_ROWS;
        }

        // Navigate options within current row
        if (Input.wasJustPressed('ArrowLeft')) {
            if (settingsRow === 0) {
                gridChoice = (gridChoice + 2) % 3;
            } else if (settingsRow === 1) {
                timeChoice = (timeChoice + 2) % 3;
            } else {
                sleepChoice = (sleepChoice + 2) % 3;
            }
        }
        if (Input.wasJustPressed('ArrowRight')) {
            if (settingsRow === 0) {
                gridChoice = (gridChoice + 1) % 3;
            } else if (settingsRow === 1) {
                timeChoice = (timeChoice + 1) % 3;
            } else {
                sleepChoice = (sleepChoice + 1) % 3;
            }
        }

        // Start game
        if (Input.wasSpacePressed()) {
            startGame();
        }
    }

    // Handle touch on settings screen (option tap or PLAY button)
    function handleSettingsTouch(hit) {
        if (!hit) return;
        if (hit.type === 'play') {
            startGame();
            return;
        }
        if (hit.type === 'gridOption') {
            gridChoice = hit.index;
            settingsRow = 0;
        } else if (hit.type === 'timeOption') {
            timeChoice = hit.index;
            settingsRow = 1;
        } else if (hit.type === 'sleepOption') {
            sleepChoice = hit.index;
            settingsRow = 2;
        }
    }

    function updatePlaying(dt) {
        // Update timer
        timeLeft -= dt;
        if (timeLeft <= 0) {
            timeLeft = 0;
            state = 'gameover';
            gameOverReason = 'timeout';
            SFX.playGameOver();
            return;
        }

        // Update teacher
        const teacherState = Teacher.update(dt, timeLeft, MAX_TIME);

        // Sound triggers for teacher state changes
        if (teacherState !== prevTeacherState) {
            if (teacherState === 'warning') SFX.playWarning();
            else if (teacherState === 'facing_students') SFX.playDanger();
            else if (teacherState === 'facing_board' && prevTeacherState === 'facing_students') SFX.playSafe();
            prevTeacherState = teacherState;
        }

        // Sleeper shuffle every SHUFFLE_INTERVAL seconds
        shuffleTimer -= dt;
        if (shuffleTimer <= 0) {
            shuffleTimer += SHUFFLE_INTERVAL;
            Grid.shuffleSleepers();
        }

        // Update note transit
        const transitResult = Grid.updateTransit(dt);
        if (transitResult === 'arrived') {
            SFX.playArrive();
        }

        // Check if caught: teacher facing students while note is in transit
        if (Teacher.isFacingStudents() && Grid.isNoteInTransit()) {
            state = 'gameover';
            gameOverReason = 'caught';
            SFX.playGameOver();
            return;
        }

        // Handle input: try to pass the note
        const dir = Input.getArrowDirection();
        if (dir && !Grid.isNoteInTransit()) {
            const passed = Grid.tryPass(dir.dc, dir.dr);
            if (passed) {
                SFX.playPass();
            } else {
                SFX.playBlocked();
            }
        }

        // Check win condition
        if (Grid.isNoteAtDunce()) {
            state = 'win';
            SFX.playWin();
            return;
        }
    }

    function render() {
        Renderer.clear();
        Renderer.drawBackground();
        Renderer.drawBlackboard();

        switch (state) {
            case 'title':
                Renderer.drawTeacher(Teacher.getState(), frame);
                Renderer.drawGrid(Grid.getGrid(), -1, -1, frame);
                Renderer.drawTitleScreen(frame);
                break;

            case 'settings':
                Renderer.drawTeacher(Teacher.getState(), frame);
                Renderer.drawGrid(Grid.getGrid(), -1, -1, frame);
                Renderer.drawSettingsScreen(settingsRow, gridChoice, timeChoice, sleepChoice, frame);
                break;

            case 'playing':
                renderPlaying();
                break;

            case 'gameover':
                renderPlaying(); // draw the scene behind
                Renderer.drawGameOverScreen(gameOverReason, frame);
                break;

            case 'win':
                renderPlaying(); // draw the scene behind
                Renderer.drawWinScreen(timeLeft, frame);
                break;
        }
        Renderer.updateAndDrawAmbient(state);
    }

    function renderPlaying() {
        const notePos = Grid.getNotePos();
        const teacherState = Teacher.getState();

        // Draw teacher
        Renderer.drawTeacher(teacherState, frame);

        // Draw teacher state indicator bar
        Renderer.drawTeacherIndicator(teacherState, frame);

        // Draw grid with students
        Renderer.drawGrid(Grid.getGrid(), notePos.col, notePos.row, frame);

        // Draw note
        if (Grid.isNoteInTransit()) {
            const info = Grid.getTransitInfo();
            Renderer.drawNoteInTransit(
                info.fromCol, info.fromRow,
                info.toCol, info.toRow,
                info.progress, frame
            );
        } else {
            Renderer.drawNoteOnDesk(notePos.col, notePos.row);
        }

        // Danger overlay when teacher is facing students
        if (teacherState === 'facing_students') {
            Renderer.drawDangerOverlay(frame);
        }

        // Draw timer
        Renderer.drawTimer(timeLeft, MAX_TIME);

        // Draw direction hints (subtle arrows around the current note holder)
        if (!Grid.isNoteInTransit() && state === 'playing') {
            drawDirectionHints(notePos.col, notePos.row);
        }
    }

    // Draw manga-style ink arrow indicators for valid moves
    function drawDirectionHints(col, row) {
        const ctx = Renderer.getCtx();
        const center = Renderer.getCellCenter(col, row);
        const grid = Grid.getGrid();
        const C = Sprites.C;

        const dirs = [
            { dc: 0, dr: -1, ox: 0, oy: -55, angle: -Math.PI / 2 },
            { dc: 0, dr: 1, ox: 0, oy: 55, angle: Math.PI / 2 },
            { dc: -1, dr: 0, ox: -58, oy: 0, angle: Math.PI },
            { dc: 1, dr: 0, ox: 58, oy: 0, angle: 0 },
        ];

        for (const d of dirs) {
            const nc = col + d.dc;
            const nr = row + d.dr;
            if (nc >= 0 && nc < Grid.COLS && nr >= 0 && nr < Grid.ROWS) {
                if (grid[nr][nc].state === 'writing') {
                    const ax = center.x + d.ox;
                    const ay = center.y + d.oy;
                    // Draw ink arrow
                    ctx.save();
                    ctx.translate(ax, ay);
                    ctx.rotate(d.angle);
                    ctx.strokeStyle = C.ink;
                    ctx.lineWidth = 1.5;
                    ctx.lineCap = 'round';
                    ctx.globalAlpha = 0.35;
                    // Arrow shaft
                    ctx.beginPath();
                    ctx.moveTo(-6, 0);
                    ctx.lineTo(6, 0);
                    ctx.stroke();
                    // Arrow head
                    ctx.beginPath();
                    ctx.moveTo(3, -3);
                    ctx.lineTo(7, 0);
                    ctx.lineTo(3, 3);
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                    ctx.restore();
                }
            }
        }
    }

    function getState() { return state; }
    function getFrame() { return frame; }
    function getTimeLeft() { return timeLeft; }

    return {
        init,
        update,
        render,
        getState,
        getFrame,
        getTimeLeft,
        goToSettings,
        handleSettingsTouch,
    };
})();
