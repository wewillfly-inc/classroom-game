// ============================================================
// grid.js - Dynamic Desk Grid, Student States, Note Management
// ============================================================

const Grid = (() => {
    // Dynamic grid dimensions (set via init)
    let COLS = 4;
    let ROWS = 5;

    // Cell states: 'writing', 'sleeping', 'empty'
    // Special flags: isNerd (start), isDunce (goal)

    let grid = [];  // grid[row][col]
    let noteCol = 0;
    let noteRow = 0;

    // Note transit state
    let noteInTransit = false;
    let transitFromCol = 0;
    let transitFromRow = 0;
    let transitToCol = 0;
    let transitToRow = 0;
    let transitProgress = 0; // 0 to 1
    const TRANSIT_DURATION = 1.0; // seconds

    // Nerd and Dunce positions
    let nerdCol = 0, nerdRow = 0;
    let dunceCol = 0, dunceRow = 0;

    // How many sleepers to maintain (set via init, used by shuffle)
    let targetSleepCount = 3;

    function init(cols, rows, sleepCount) {
        if (cols !== undefined && rows !== undefined) {
            COLS = cols;
            ROWS = rows;
        }
        if (sleepCount !== undefined) {
            targetSleepCount = sleepCount;
        }

        grid = [];
        for (let r = 0; r < ROWS; r++) {
            grid[r] = [];
            for (let c = 0; c < COLS; c++) {
                grid[r][c] = {
                    state: 'writing',
                    isNerd: false,
                    isDunce: false,
                };
            }
        }

        // Place nerd at back-left (closest to player)
        // and dunce at front-right (closest to teacher)
        nerdCol = 0;
        nerdRow = ROWS - 1;
        dunceCol = COLS - 1;
        dunceRow = 0;

        grid[nerdRow][nerdCol].isNerd = true;
        grid[dunceRow][dunceCol].isDunce = true;

        // Empty desks first: scale with grid size (~15% of available cells)
        const availableCells = COLS * ROWS - 2; // minus nerd and dunce
        const emptyCount = Math.max(1, Math.floor(availableCells * 0.15) + Math.floor(Math.random() * 2));
        placeEmpty(emptyCount);

        // Place sleeping students (exact count from settings)
        // Uses path-safe placement to guarantee both exact count AND valid path
        placeSleepersPathSafe(targetSleepCount, nerdCol, nerdRow);

        // Note starts at the nerd
        noteCol = nerdCol;
        noteRow = nerdRow;
        noteInTransit = false;
        transitProgress = 0;
    }

    // Place empty desks one at a time, verifying after each that a
    // permanent path (ignoring sleepers, which change) still exists
    // from nerd to dunce. This guarantees empty desks never box anyone in.
    function placeEmpty(count) {
        // Collect candidate cells
        const candidates = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!grid[r][c].isNerd && !grid[r][c].isDunce && grid[r][c].state === 'writing') {
                    candidates.push({ r, c });
                }
            }
        }
        shuffleArray(candidates);

        let placed = 0;
        for (const cell of candidates) {
            if (placed >= count) break;

            // Tentatively make this desk empty
            grid[cell.r][cell.c].state = 'empty';

            // Check that a path still exists through all non-empty cells
            // (writing + sleeping + nerd + dunce are passable; only 'empty' blocks)
            if (hasPathThroughNonEmpty(nerdCol, nerdRow)) {
                placed++;
            } else {
                // Would block the path permanently — undo
                grid[cell.r][cell.c].state = 'writing';
            }
        }
    }

    // BFS that treats ANY non-empty cell as passable.
    // Used to validate empty desk placement (since sleepers are temporary,
    // only empty desks are permanent obstacles).
    function hasPathThroughNonEmpty(startCol, startRow) {
        const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
        const queue = [{ col: startCol, row: startRow }];
        visited[startRow][startCol] = true;

        while (queue.length > 0) {
            const { col, row } = queue.shift();
            if (col === dunceCol && row === dunceRow) return true;

            const dirs = [
                { dc: 0, dr: -1 },
                { dc: 0, dr: 1 },
                { dc: -1, dr: 0 },
                { dc: 1, dr: 0 },
            ];

            for (const { dc, dr } of dirs) {
                const nc = col + dc;
                const nr = row + dr;
                if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && !visited[nr][nc]) {
                    // Any non-empty cell is passable
                    if (grid[nr][nc].state !== 'empty') {
                        visited[nr][nc] = true;
                        queue.push({ col: nc, row: nr });
                    }
                }
            }
        }
        return false;
    }

    // BFS to check if a path exists from a start position to the dunce
    // through 'writing' students only (used during gameplay for sleeper placement)
    function hasPathFrom(startCol, startRow) {
        const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
        const queue = [{ col: startCol, row: startRow }];
        visited[startRow][startCol] = true;

        while (queue.length > 0) {
            const { col, row } = queue.shift();
            if (col === dunceCol && row === dunceRow) return true;

            const dirs = [
                { dc: 0, dr: -1 },
                { dc: 0, dr: 1 },
                { dc: -1, dr: 0 },
                { dc: 1, dr: 0 },
            ];

            for (const { dc, dr } of dirs) {
                const nc = col + dc;
                const nr = row + dr;
                if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && !visited[nr][nc]) {
                    if (grid[nr][nc].state === 'writing') {
                        visited[nr][nc] = true;
                        queue.push({ col: nc, row: nr });
                    }
                }
            }
        }
        return false;
    }

    // Fisher-Yates shuffle helper
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Place exactly `count` sleepers while guaranteeing a valid path
    // from (fromCol, fromRow) to the dunce.
    // Tries each candidate one by one; if placing it breaks the path, skips it.
    function placeSleepersPathSafe(count, fromCol, fromRow) {
        // Collect eligible cells
        const eligible = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c].state !== 'writing') continue;
                if (grid[r][c].isNerd || grid[r][c].isDunce) continue;
                if (c === fromCol && r === fromRow) continue;
                eligible.push({ r, c });
            }
        }
        shuffleArray(eligible);

        let placed = 0;
        for (const cell of eligible) {
            if (placed >= count) break;

            // Tentatively put this student to sleep
            grid[cell.r][cell.c].state = 'sleeping';

            // Check if path still exists
            if (hasPathFrom(fromCol, fromRow)) {
                // Path OK — keep this one asleep
                placed++;
            } else {
                // Path broken — wake them back up
                grid[cell.r][cell.c].state = 'writing';
            }
        }
    }

    // Shuffle sleepers: wake all current sleepers, then put exactly
    // targetSleepCount students to sleep in new random positions.
    // Guarantees: exact count preserved AND valid path always exists.
    // Protected cells: nerd, dunce, note holder, transit destination.
    function shuffleSleepers() {
        // 1. Wake all current sleepers
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c].state === 'sleeping') {
                    grid[r][c].state = 'writing';
                }
            }
        }

        // 2. Collect eligible cells (writing, not protected)
        const eligible = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c].state !== 'writing') continue;
                if (grid[r][c].isNerd || grid[r][c].isDunce) continue;
                if (c === noteCol && r === noteRow) continue;
                if (noteInTransit && c === transitToCol && r === transitToRow) continue;
                eligible.push({ r, c });
            }
        }
        shuffleArray(eligible);

        // 3. Place sleepers one by one, verifying path after each
        let placed = 0;
        for (const cell of eligible) {
            if (placed >= targetSleepCount) break;

            grid[cell.r][cell.c].state = 'sleeping';

            if (hasPathFrom(noteCol, noteRow)) {
                placed++;
            } else {
                grid[cell.r][cell.c].state = 'writing';
            }
        }
    }

    // Try to start passing the note in a direction
    // Returns true if the pass started, false if blocked
    function tryPass(dc, dr) {
        if (noteInTransit) return false;

        const nc = noteCol + dc;
        const nr = noteRow + dr;

        // Bounds check
        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) return false;

        // Must be a writing student (awake)
        if (grid[nr][nc].state !== 'writing') return false;

        // Start transit
        noteInTransit = true;
        transitFromCol = noteCol;
        transitFromRow = noteRow;
        transitToCol = nc;
        transitToRow = nr;
        transitProgress = 0;

        return true;
    }

    // Update note transit (called each frame)
    // Returns: 'transit', 'arrived', or 'idle'
    function updateTransit(dt) {
        if (!noteInTransit) return 'idle';

        transitProgress += dt / TRANSIT_DURATION;
        if (transitProgress >= 1) {
            transitProgress = 1;
            noteInTransit = false;
            noteCol = transitToCol;
            noteRow = transitToRow;
            return 'arrived';
        }
        return 'transit';
    }

    function isNoteInTransit() {
        return noteInTransit;
    }

    function isNoteAtDunce() {
        return noteCol === dunceCol && noteRow === dunceRow && !noteInTransit;
    }

    function getNotePos() {
        return { col: noteCol, row: noteRow };
    }

    // Returns adjacent cells that can receive the note (writing students)
    function getValidPassTargets() {
        const targets = [];
        const dirs = [
            { dc: 0, dr: -1 },
            { dc: 0, dr: 1 },
            { dc: -1, dr: 0 },
            { dc: 1, dr: 0 },
        ];
        for (const { dc, dr } of dirs) {
            const nc = noteCol + dc;
            const nr = noteRow + dr;
            if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && grid[nr][nc].state === 'writing') {
                targets.push({ col: nc, row: nr, dc, dr });
            }
        }
        return targets;
    }

    function getTransitInfo() {
        return {
            fromCol: transitFromCol,
            fromRow: transitFromRow,
            toCol: transitToCol,
            toRow: transitToRow,
            progress: transitProgress,
        };
    }

    function getGrid() {
        return grid;
    }

    function getCols() { return COLS; }
    function getRows() { return ROWS; }

    return {
        get COLS() { return COLS; },
        get ROWS() { return ROWS; },
        init,
        shuffleSleepers,
        tryPass,
        updateTransit,
        isNoteInTransit,
        isNoteAtDunce,
        getNotePos,
        getValidPassTargets,
        getTransitInfo,
        getGrid,
        getCols,
        getRows,
    };
})();
