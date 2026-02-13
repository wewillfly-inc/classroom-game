// ============================================================
// renderer.js - Classroom Scene Renderer
// ============================================================

const Renderer = (() => {
    const GAME_W = 800;
    const GAME_H = 600;

    // Layout constants
    const BOARD_Y = 20;
    const BOARD_H = 70;
    const BOARD_W = 300;

    const TEACHER_W = 64;
    const TEACHER_H = 100;

    // Dynamic grid layout (recalculated by setGridSize)
    let GRID_COLS = 4;
    let GRID_ROWS = 5;
    let CELL_W = 120;
    let CELL_H = 80;
    let GRID_START_X = 160;
    let GRID_START_Y = 175;

    let canvas, ctx;
    let scale = 1;
    let offsetX = 0, offsetY = 0;

    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
    }

    // Recalculate grid layout for a given grid size
    function setGridSize(cols, rows) {
        GRID_COLS = cols;
        GRID_ROWS = rows;

        // Available area for the grid
        const maxGridW = GAME_W - 140; // 70px margin each side
        const maxGridH = GAME_H - 195; // 175 top + 20 bottom

        // Compute cell size to fit, capped at a nice sprite-friendly max
        CELL_W = Math.min(120, Math.floor(maxGridW / cols));
        CELL_H = Math.min(80, Math.floor(maxGridH / rows));

        // Center the grid
        GRID_START_X = Math.floor((GAME_W - cols * CELL_W) / 2);
        GRID_START_Y = 175;
    }

    function resize() {
        const windowW = window.innerWidth;
        const windowH = window.innerHeight;
        const ratio = GAME_W / GAME_H;

        let w, h;
        if (windowW / windowH > ratio) {
            h = windowH;
            w = h * ratio;
        } else {
            w = windowW;
            h = w / ratio;
        }

        canvas.width = GAME_W;
        canvas.height = GAME_H;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        scale = w / GAME_W;
        offsetX = (windowW - w) / 2;
        offsetY = (windowH - h) / 2;

        // Disable smoothing for pixel art
        ctx.imageSmoothingEnabled = false;
    }

    // Get the pixel position of a grid cell (top-left of the cell area)
    function getCellPos(col, row) {
        return {
            x: GRID_START_X + col * CELL_W,
            y: GRID_START_Y + row * CELL_H,
        };
    }

    // Get the center of a grid cell
    function getCellCenter(col, row) {
        const pos = getCellPos(col, row);
        return {
            x: pos.x + CELL_W / 2,
            y: pos.y + CELL_H / 2,
        };
    }

    // ---- Background: floor, walls, windows ----
    function drawBackground() {
        // Floor
        ctx.fillStyle = Sprites.C.floorTile;
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Floor tile pattern
        ctx.fillStyle = Sprites.C.floorTileDk;
        for (let ty = 0; ty < GAME_H; ty += 40) {
            for (let tx = 0; tx < GAME_W; tx += 40) {
                if ((tx / 40 + ty / 40) % 2 === 0) {
                    ctx.fillRect(tx, ty, 40, 40);
                }
            }
        }

        // Back wall (where blackboard is)
        ctx.fillStyle = Sprites.C.wallColor;
        ctx.fillRect(0, 0, GAME_W, 150);
        // Wall base line
        ctx.fillStyle = Sprites.C.wallColorDk;
        ctx.fillRect(0, 145, GAME_W, 5);
        // Wainscoting
        ctx.fillStyle = Sprites.C.deskFront;
        ctx.fillRect(0, 130, GAME_W, 15);

        // Left wall hint (perspective)
        ctx.fillStyle = Sprites.C.wallColorDk;
        ctx.fillRect(0, 0, 8, GAME_H);

        // Right wall hint
        ctx.fillRect(GAME_W - 8, 0, 8, GAME_H);

        // Windows on the left wall
        for (let wy = 180; wy < 500; wy += 140) {
            // Window frame
            ctx.fillStyle = Sprites.C.windowFrame;
            ctx.fillRect(10, wy, 50, 80);
            // Glass
            ctx.fillStyle = Sprites.C.windowBlue;
            ctx.fillRect(14, wy + 4, 42, 72);
            // Cross divider
            ctx.fillStyle = Sprites.C.windowFrame;
            ctx.fillRect(14, wy + 38, 42, 4);
            ctx.fillRect(33, wy + 4, 4, 72);
            // Sky highlight
            ctx.fillStyle = Sprites.C.windowBlueDk;
            ctx.fillRect(14, wy + 42, 42, 34);
        }

        // Windows on right wall
        for (let wy = 180; wy < 500; wy += 140) {
            ctx.fillStyle = Sprites.C.windowFrame;
            ctx.fillRect(GAME_W - 60, wy, 50, 80);
            ctx.fillStyle = Sprites.C.windowBlue;
            ctx.fillRect(GAME_W - 56, wy + 4, 42, 72);
            ctx.fillStyle = Sprites.C.windowFrame;
            ctx.fillRect(GAME_W - 56, wy + 38, 42, 4);
            ctx.fillRect(GAME_W - 37, wy + 4, 4, 72);
            ctx.fillStyle = Sprites.C.windowBlueDk;
            ctx.fillRect(GAME_W - 56, wy + 42, 42, 34);
        }

        // Clock on wall
        const clockX = GAME_W - 120;
        const clockY = 40;
        ctx.fillStyle = Sprites.C.white;
        ctx.beginPath();
        ctx.arc(clockX, clockY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = Sprites.C.black;
        ctx.lineWidth = 2;
        ctx.stroke();
        // Clock hands
        ctx.beginPath();
        ctx.moveTo(clockX, clockY);
        ctx.lineTo(clockX, clockY - 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clockX, clockY);
        ctx.lineTo(clockX + 8, clockY + 3);
        ctx.stroke();

        // Poster on wall (left side)
        ctx.fillStyle = '#e8d080';
        ctx.fillRect(80, 30, 50, 65);
        ctx.strokeStyle = Sprites.C.deskFront;
        ctx.lineWidth = 2;
        ctx.strokeRect(80, 30, 50, 65);
        ctx.fillStyle = Sprites.C.red;
        ctx.font = '10px monospace';
        ctx.fillText('ABC', 90, 60);
        ctx.fillStyle = Sprites.C.shirtBlue;
        ctx.fillText('123', 90, 78);
    }

    // ---- Blackboard ----
    function drawBlackboard() {
        const bx = (GAME_W - BOARD_W) / 2;
        Sprites.drawBlackboard(ctx, bx, BOARD_Y, BOARD_W, BOARD_H);
    }

    // ---- Teacher ----
    function drawTeacher(teacherState, frame) {
        const tx = (GAME_W - TEACHER_W) / 2;
        const ty = 45;

        if (teacherState === 'facing_board' || teacherState === 'warning') {
            Sprites.drawTeacherBack(ctx, tx, ty, TEACHER_W, TEACHER_H, frame);
        } else {
            Sprites.drawTeacherFront(ctx, tx, ty, TEACHER_W, TEACHER_H, frame);
        }

        // Warning bubble
        if (teacherState === 'warning') {
            Sprites.drawWarningBubble(ctx, GAME_W / 2, ty - 5, 24, frame);
        }
    }

    // ---- Grid of desks + students ----
    function drawGrid(grid, noteCol, noteRow, frame) {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const pos = getCellPos(col, row);
                const cell = grid[row][col];

                // Draw desk always
                Sprites.drawDesk(ctx, pos.x, pos.y, CELL_W, CELL_H);

                // Draw student based on state
                if (cell.state === 'writing') {
                    Sprites.drawStudentWriting(ctx, pos.x, pos.y, CELL_W, CELL_H, col, row, frame);
                } else if (cell.state === 'sleeping') {
                    Sprites.drawStudentSleeping(ctx, pos.x, pos.y, CELL_W, CELL_H, col, row, frame);
                }
                // 'empty' = just the desk with a visible empty indicator
                if (cell.state === 'empty') {
                    // Draw a subtle "empty" indicator on the chair
                    ctx.fillStyle = 'rgba(0,0,0,0.08)';
                    ctx.fillRect(pos.x + CELL_W / 2 - 12, pos.y + CELL_H - 24, 24, 16);
                }

                // Nerd star (above the student's head)
                if (cell.isNerd) {
                    const center = getCellCenter(col, row);
                    Sprites.drawNerdStar(ctx, center.x, pos.y + 10, 18);
                }

                // Dunce marker (crying bubble above the student's head)
                if (cell.isDunce) {
                    const center = getCellCenter(col, row);
                    Sprites.drawDunceMarker(ctx, center.x, pos.y + 12, 14, frame);
                }

                // Highlight current note holder (glow around the desk area)
                if (col === noteCol && row === noteRow) {
                    const hx = pos.x + CELL_W / 2 - 22;
                    const hy = pos.y + CELL_H - 44;
                    Sprites.drawHighlight(ctx, hx, hy, 44, 40, frame);
                }
            }
        }
    }

    // ---- Note in transit animation ----
    function drawNoteInTransit(fromCol, fromRow, toCol, toRow, progress, frame) {
        const from = getCellCenter(fromCol, fromRow);
        const to = getCellCenter(toCol, toRow);

        // Lerp position
        const nx = from.x + (to.x - from.x) * progress;
        const ny = from.y + (to.y - from.y) * progress;

        // Arc upward for a "toss" effect
        const arcHeight = -30;
        const arc = arcHeight * Math.sin(progress * Math.PI);
        const noteY = ny + arc;

        // Shadow on the ground
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(nx, ny + 10, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw the note (large when in flight for visibility)
        Sprites.drawNote(ctx, nx, noteY - 15, 22);
    }

    // ---- Note sitting on desk (when held by a student) ----
    function drawNoteOnDesk(col, row) {
        const pos = getCellPos(col, row);
        const cx = pos.x + CELL_W / 2 + 18;
        const cy = pos.y + CELL_H - 32;
        Sprites.drawNote(ctx, cx, cy, 18);
    }

    // ---- Timer ----
    function drawTimer(timeLeft, maxTime) {
        const x = GAME_W - 100;
        const y = 20;
        const ratio = timeLeft / maxTime;

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(x - 5, y - 5, 95, 35);

        // Timer text
        ctx.fillStyle = timeLeft <= 10 ? Sprites.C.red : Sprites.C.white;
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'right';
        const secs = Math.ceil(timeLeft);
        ctx.fillText(secs + 's', GAME_W - 15, y + 18);

        // Timer bar
        const barW = 70;
        ctx.fillStyle = Sprites.C.darkGray;
        ctx.fillRect(x, y + 25, barW, 4);
        ctx.fillStyle = ratio > 0.3 ? Sprites.C.green : Sprites.C.red;
        ctx.fillRect(x, y + 25, barW * ratio, 4);

        ctx.textAlign = 'left';
    }

    // ---- Pixel-art flag helpers ----
    function drawFlagItaly(ctx, x, y, w, h) {
        const sw = Math.floor(w / 3);
        ctx.fillStyle = '#009246';
        ctx.fillRect(x, y, sw, h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + sw, y, sw, h);
        ctx.fillStyle = '#CE2B37';
        ctx.fillRect(x + sw * 2, y, w - sw * 2, h);
    }

    function drawFlagUK(ctx, x, y, w, h) {
        // Blue background
        ctx.fillStyle = '#012169';
        ctx.fillRect(x, y, w, h);

        // Clip to flag bounds so diagonals don't overflow
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();

        // White diagonals (St Andrew's cross)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y + h);
        ctx.moveTo(x + w, y);
        ctx.lineTo(x, y + h);
        ctx.stroke();

        // Red diagonals (thinner, on top)
        ctx.strokeStyle = '#C8102E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y + h);
        ctx.moveTo(x + w, y);
        ctx.lineTo(x, y + h);
        ctx.stroke();

        ctx.restore();

        // White cross (St George's cross, wide)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y + Math.floor(h / 2) - 4, w, 8);
        ctx.fillRect(x + Math.floor(w / 2) - 5, y, 10, h);

        // Red cross (narrower, on top)
        ctx.fillStyle = '#C8102E';
        ctx.fillRect(x, y + Math.floor(h / 2) - 2, w, 4);
        ctx.fillRect(x + Math.floor(w / 2) - 3, y, 6, h);
    }

    function drawFlagGermany(ctx, x, y, w, h) {
        const sh = Math.floor(h / 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, w, sh);
        ctx.fillStyle = '#DD0000';
        ctx.fillRect(x, y + sh, w, sh);
        ctx.fillStyle = '#FFCC00';
        ctx.fillRect(x, y + sh * 2, w, h - sh * 2);
    }

    // ---- Title Screen ----
    function drawTitleScreen(frame) {
        // Darken background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Title
        ctx.fillStyle = Sprites.C.yellow;
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('title'), GAME_W / 2, 180);

        // Subtitle
        ctx.fillStyle = Sprites.C.white;
        ctx.font = '16px monospace';
        ctx.fillText(I18n.t('subtitle'), GAME_W / 2, 220);

        // Instructions
        ctx.font = '14px monospace';
        const instructions = [
            I18n.t('instr1'),
            I18n.t('instr2'),
            '',
            I18n.t('instr3'),
            I18n.t('instr4'),
            '',
            I18n.t('instr5'),
        ];
        let iy = 270;
        for (const line of instructions) {
            ctx.fillText(line, GAME_W / 2, iy);
            iy += 22;
        }

        // Language selector: pixel-art flags (Italy, UK, Germany)
        const flagW = 42, flagH = 28;
        const langY = 455;
        const current = I18n.languages.indexOf(I18n.getLanguage());
        const langX = [GAME_W / 2 - 80, GAME_W / 2, GAME_W / 2 + 80];
        const drawFlagFns = [drawFlagItaly, drawFlagUK, drawFlagGermany];
        for (let i = 0; i < 3; i++) {
            const fx = langX[i] - flagW / 2;
            const fy = langY - flagH / 2;
            drawFlagFns[i](ctx, fx, fy, flagW, flagH);
            // Dark outline on all flags
            ctx.strokeStyle = 'rgba(0,0,0,0.6)';
            ctx.lineWidth = 1;
            ctx.strokeRect(fx, fy, flagW, flagH);
            // Yellow highlight on selected flag
            if (i === current) {
                ctx.strokeStyle = Sprites.C.yellow;
                ctx.lineWidth = 3;
                ctx.strokeRect(fx - 2, fy - 2, flagW + 4, flagH + 4);
            }
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '12px monospace';
        ctx.fillText('← →', GAME_W / 2, langY + flagH / 2 + 16);

        // Start prompt (blinking)
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = Sprites.C.yellow;
            ctx.font = 'bold 20px monospace';
            ctx.fillText(I18n.t('pressSpaceContinue'), GAME_W / 2, 530);
        }

        ctx.textAlign = 'left';
    }

    // ---- Settings / Difficulty Selection Screen ----
    function drawSettingsScreen(settingsRow, gridChoice, timeChoice, sleepChoice, frame) {
        // Darken background
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Title
        ctx.fillStyle = Sprites.C.yellow;
        ctx.font = 'bold 30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('chooseDifficulty'), GAME_W / 2, 80);

        // ---- Grid size row ----
        const gridLabels = ['3 x 4', '5 x 4', '5 x 5'];
        const gridDescriptions = [I18n.t('gridEasy'), I18n.t('gridMedium'), I18n.t('gridHard')];
        const rowY1 = 160;

        ctx.fillStyle = settingsRow === 0 ? Sprites.C.yellow : Sprites.C.gray;
        ctx.font = 'bold 16px monospace';
        ctx.fillText(I18n.t('grid'), GAME_W / 2, rowY1 - 22);

        drawOptionRow(gridLabels, gridDescriptions, gridChoice, rowY1, settingsRow === 0, frame);

        // ---- Time row ----
        const timeLabels = ['20s', '40s', '60s'];
        const timeDescriptions = [I18n.t('timeChallenge'), I18n.t('timeNormal'), I18n.t('timeRelaxed')];
        const rowY2 = 295;

        ctx.fillStyle = settingsRow === 1 ? Sprites.C.yellow : Sprites.C.gray;
        ctx.font = 'bold 16px monospace';
        ctx.fillText(I18n.t('time'), GAME_W / 2, rowY2 - 22);

        drawOptionRow(timeLabels, timeDescriptions, timeChoice, rowY2, settingsRow === 1, frame);

        // ---- Sleepers row ----
        const sleepLabels = ['3', '5', '7'];
        const sleepDescriptions = [I18n.t('sleepFew'), I18n.t('sleepMedium'), I18n.t('sleepMany')];
        const rowY3 = 430;

        ctx.fillStyle = settingsRow === 2 ? Sprites.C.yellow : Sprites.C.gray;
        ctx.font = 'bold 16px monospace';
        ctx.fillText(I18n.t('sleepers'), GAME_W / 2, rowY3 - 22);

        drawOptionRow(sleepLabels, sleepDescriptions, sleepChoice, rowY3, settingsRow === 2, frame);

        // Navigation hint
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('navHint'), GAME_W / 2, 510);

        // Start prompt (blinking)
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = Sprites.C.yellow;
            ctx.font = 'bold 20px monospace';
            ctx.fillText(I18n.t('pressSpacePlay'), GAME_W / 2, 555);
        }

        ctx.textAlign = 'left';
    }

    // Helper: draw a row of 3 selectable options
    function drawOptionRow(labels, descriptions, selected, y, isActiveRow, frame) {
        const spacing = 200;
        const startX = GAME_W / 2 - spacing;

        for (let i = 0; i < 3; i++) {
            const cx = startX + i * spacing;
            const isSelected = (i === selected);

            // Box
            const boxW = 140;
            const boxH = 70;
            const bx = cx - boxW / 2;
            const by = y - boxH / 2;

            if (isSelected && isActiveRow) {
                // Selected + active row: bright border with pulse
                const pulse = Math.sin(frame * 0.1) * 0.15 + 0.85;
                ctx.fillStyle = `rgba(240, 208, 32, ${0.2 * pulse})`;
                ctx.fillRect(bx - 3, by - 3, boxW + 6, boxH + 6);
                ctx.strokeStyle = Sprites.C.yellow;
                ctx.lineWidth = 3;
                ctx.strokeRect(bx - 3, by - 3, boxW + 6, boxH + 6);
            } else if (isSelected) {
                // Selected but not active row: dimmer highlight
                ctx.fillStyle = 'rgba(240, 208, 32, 0.1)';
                ctx.fillRect(bx, by, boxW, boxH);
                ctx.strokeStyle = 'rgba(240, 208, 32, 0.5)';
                ctx.lineWidth = 2;
                ctx.strokeRect(bx, by, boxW, boxH);
            } else {
                // Not selected
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.fillRect(bx, by, boxW, boxH);
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.lineWidth = 1;
                ctx.strokeRect(bx, by, boxW, boxH);
            }

            // Label text
            ctx.fillStyle = isSelected ? Sprites.C.white : Sprites.C.gray;
            ctx.font = isSelected ? 'bold 22px monospace' : '20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], cx, y + 2);

            // Description below
            ctx.fillStyle = isSelected ? Sprites.C.yellow : 'rgba(255,255,255,0.3)';
            ctx.font = '12px monospace';
            ctx.fillText(descriptions[i], cx, y + 22);
        }

        // Draw arrow indicators for active row
        if (isActiveRow) {
            const leftX = startX - spacing / 2 - 10;
            const rightX = startX + 2 * spacing + spacing / 2 + 10;
            ctx.fillStyle = Sprites.C.yellow;
            ctx.font = '20px monospace';
            ctx.textAlign = 'center';
            if (Math.floor(frame / 20) % 2 === 0) {
                ctx.fillText('◄', leftX, y + 4);
                ctx.fillText('►', rightX, y + 4);
            }
        }

        ctx.textAlign = 'left';
    }

    // ---- Game Over Screen ----
    function drawGameOverScreen(reason, frame) {
        ctx.fillStyle = 'rgba(100,0,0,0.75)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        ctx.fillStyle = Sprites.C.red;
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('caught'), GAME_W / 2, 240);

        ctx.fillStyle = Sprites.C.white;
        ctx.font = '18px monospace';
        if (reason === 'caught') {
            ctx.fillText(I18n.t('caughtReasonTeacher'), GAME_W / 2, 290);
        } else {
            ctx.fillText(I18n.t('caughtReasonTime'), GAME_W / 2, 290);
        }

        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = Sprites.C.yellow;
            ctx.font = 'bold 18px monospace';
            ctx.fillText(I18n.t('pressSpaceRetry'), GAME_W / 2, 400);
        }

        ctx.textAlign = 'left';
    }

    // ---- Win Screen ----
    function drawWinScreen(timeLeft, frame) {
        ctx.fillStyle = 'rgba(0,80,0,0.75)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        ctx.fillStyle = Sprites.C.yellow;
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('promoted'), GAME_W / 2, 220);

        ctx.fillStyle = Sprites.C.white;
        ctx.font = '18px monospace';
        ctx.fillText(I18n.t('winMessage'), GAME_W / 2, 270);

        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = Sprites.C.yellow;
        ctx.fillText(I18n.t('timeLeft') + Math.ceil(timeLeft) + 's', GAME_W / 2, 320);

        // Stars celebration
        const starChars = ['★', '✦', '✧'];
        for (let i = 0; i < 8; i++) {
            const sx = 150 + i * 70 + Math.sin(frame * 0.05 + i) * 20;
            const sy = 370 + Math.cos(frame * 0.07 + i * 0.5) * 15;
            ctx.fillStyle = i % 2 === 0 ? Sprites.C.yellow : Sprites.C.white;
            ctx.font = '20px monospace';
            ctx.fillText(starChars[i % 3], sx, sy);
        }

        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = Sprites.C.yellow;
            ctx.font = 'bold 18px monospace';
            ctx.fillText(I18n.t('pressSpaceAgain'), GAME_W / 2, 450);
        }

        ctx.textAlign = 'left';
    }

    // ---- Danger overlay when teacher is facing students ----
    function drawDangerOverlay(frame) {
        const alpha = 0.08 + Math.sin(frame * 0.15) * 0.04;
        ctx.fillStyle = `rgba(200, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // "ATTENTO!" text at top
        ctx.fillStyle = `rgba(255, 50, 50, ${0.6 + Math.sin(frame * 0.2) * 0.3})`;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('teacherWatching'), GAME_W / 2, GAME_H - 15);
        ctx.textAlign = 'left';
    }

    // ---- Teacher state indicator bar at top ----
    function drawTeacherIndicator(teacherState, frame) {
        const barH = 6;
        const y = 150;
        if (teacherState === 'facing_board') {
            ctx.fillStyle = Sprites.C.green;
            ctx.fillRect(0, y, GAME_W, barH);
        } else if (teacherState === 'warning') {
            const flash = Math.floor(frame / 5) % 2 === 0;
            ctx.fillStyle = flash ? Sprites.C.yellow : '#aa8800';
            ctx.fillRect(0, y, GAME_W, barH);
        } else {
            const flash = Math.floor(frame / 8) % 2 === 0;
            ctx.fillStyle = flash ? Sprites.C.red : Sprites.C.darkRed;
            ctx.fillRect(0, y, GAME_W, barH);
        }
    }

    // ---- Clear ----
    function clear() {
        ctx.clearRect(0, 0, GAME_W, GAME_H);
    }

    function getCtx() { return ctx; }

    return {
        GAME_W, GAME_H,
        get GRID_COLS() { return GRID_COLS; },
        get GRID_ROWS() { return GRID_ROWS; },
        get CELL_W() { return CELL_W; },
        get CELL_H() { return CELL_H; },
        get GRID_START_X() { return GRID_START_X; },
        get GRID_START_Y() { return GRID_START_Y; },
        init,
        setGridSize,
        resize,
        clear,
        getCtx,
        getCellPos,
        getCellCenter,
        drawBackground,
        drawBlackboard,
        drawTeacher,
        drawGrid,
        drawNoteInTransit,
        drawNoteOnDesk,
        drawTimer,
        drawTitleScreen,
        drawSettingsScreen,
        drawGameOverScreen,
        drawWinScreen,
        drawDangerOverlay,
        drawTeacherIndicator,
    };
})();
