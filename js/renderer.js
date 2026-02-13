// ============================================================
// renderer.js - Manga Style Classroom Scene Renderer
// Inspired by 1960s shojo manga (Attack No.1 / Mila, Superstar)
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

    // Manga fonts
    const FONT_TITLE = "'Bangers', Impact, sans-serif";
    const FONT_BODY = "Georgia, 'Times New Roman', serif";
    const FONT_UI = "'Segoe UI', Arial, sans-serif";

    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        // Initialize screentone patterns
        Sprites.initPatterns(ctx);
        resize();
        window.addEventListener('resize', resize);
    }

    function setGridSize(cols, rows) {
        GRID_COLS = cols;
        GRID_ROWS = rows;

        const maxGridW = GAME_W - 140;
        const maxGridH = GAME_H - 195;

        CELL_W = Math.min(120, Math.floor(maxGridW / cols));
        CELL_H = Math.min(80, Math.floor(maxGridH / rows));

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

        // Smooth lines for manga (not pixel art)
        ctx.imageSmoothingEnabled = true;
    }

    function getCellPos(col, row) {
        return {
            x: GRID_START_X + col * CELL_W,
            y: GRID_START_Y + row * CELL_H,
        };
    }

    function getCellCenter(col, row) {
        const pos = getCellPos(col, row);
        return {
            x: pos.x + CELL_W / 2,
            y: pos.y + CELL_H / 2,
        };
    }

    // ================================================================
    //  BACKGROUND (manga style classroom)
    // ================================================================
    function drawBackground() {
        const C = Sprites.C;
        const P = Sprites.patterns;

        // Paper base
        ctx.fillStyle = C.paper;
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Floor with screentone pattern
        ctx.fillStyle = P.floor || C.paperDark;
        ctx.fillRect(0, 150, GAME_W, GAME_H - 150);

        // Floor board lines (horizontal, evenly spaced)
        ctx.strokeStyle = C.tone2;
        ctx.lineWidth = 0.5;
        for (let fy = 160; fy < GAME_H; fy += 30) {
            ctx.beginPath();
            ctx.moveTo(0, fy);
            ctx.lineTo(GAME_W, fy);
            ctx.stroke();
        }

        // Back wall
        ctx.fillStyle = C.paper;
        ctx.fillRect(0, 0, GAME_W, 150);

        // Wall-floor border (bold ink line)
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(GAME_W, 150);
        ctx.stroke();

        // Wainscoting (light screentone strip)
        ctx.fillStyle = P.dotLight || C.tone1;
        ctx.fillRect(0, 130, GAME_W, 20);
        ctx.strokeStyle = C.inkSoft;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 130);
        ctx.lineTo(GAME_W, 130);
        ctx.stroke();

        // Side walls (ink lines)
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, GAME_H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(GAME_W, 0);
        ctx.lineTo(GAME_W, GAME_H);
        ctx.stroke();

        // Left wall strip
        ctx.fillStyle = P.dotLight || C.tone1;
        ctx.fillRect(0, 0, 10, GAME_H);
        ctx.strokeStyle = C.inkSoft;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(10, GAME_H);
        ctx.stroke();

        // Right wall strip
        ctx.fillStyle = P.dotLight || C.tone1;
        ctx.fillRect(GAME_W - 10, 0, 10, GAME_H);
        ctx.strokeStyle = C.inkSoft;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(GAME_W - 10, 0);
        ctx.lineTo(GAME_W - 10, GAME_H);
        ctx.stroke();

        // Windows on left wall
        for (let wy = 180; wy < 500; wy += 140) {
            drawMangaWindow(12, wy, 48, 75);
        }

        // Windows on right wall
        for (let wy = 180; wy < 500; wy += 140) {
            drawMangaWindow(GAME_W - 60, wy, 48, 75);
        }

        // Clock on wall (manga ink style)
        drawMangaClock(GAME_W - 120, 40);

        // Poster on wall (manga style)
        drawMangaPoster(80, 30, 50, 65);
    }

    // Manga-style window
    function drawMangaWindow(x, y, w, h) {
        const C = Sprites.C;
        const P = Sprites.patterns;

        // Window glass with light screentone
        ctx.fillStyle = P.dotLight || C.tone1;
        ctx.fillRect(x, y, w, h);

        // Sky highlight (upper portion lighter)
        ctx.fillStyle = C.paper;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(x, y, w, h * 0.4);
        ctx.globalAlpha = 1.0;

        // Frame
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Cross divider
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + w, y + h / 2);
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w / 2, y + h);
        ctx.stroke();

        // Light reflection (diagonal line)
        ctx.strokeStyle = C.white;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 4);
        ctx.lineTo(x + 12, y + 20);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // Manga-style clock
    function drawMangaClock(cx, cy) {
        const C = Sprites.C;

        // Clock face
        ctx.fillStyle = C.paper;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hour marks (small lines)
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14);
            ctx.lineTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16);
            ctx.stroke();
        }

        // Hands
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy - 12);
        ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 8, cy + 3);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Manga-style wall poster
    function drawMangaPoster(x, y, w, h) {
        const C = Sprites.C;

        ctx.fillStyle = C.paperWarm;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);

        // Decorative flower on poster
        Sprites.drawFlower(ctx, x + w / 2, y + 22, 8, 0.5);

        // Text lines
        ctx.fillStyle = C.ink;
        ctx.font = `10px ${FONT_BODY}`;
        ctx.fillText('ABC', x + 10, y + 48);
        ctx.fillText('123', x + 10, y + 60);
    }

    // ================================================================
    //  BLACKBOARD
    // ================================================================
    function drawBlackboard() {
        const bx = (GAME_W - BOARD_W) / 2;
        Sprites.drawBlackboard(ctx, bx, BOARD_Y, BOARD_W, BOARD_H);
    }

    // ================================================================
    //  TEACHER
    // ================================================================
    function drawTeacher(teacherState, frame) {
        const tx = (GAME_W - TEACHER_W) / 2;
        const ty = 45;

        if (teacherState === 'facing_board' || teacherState === 'warning') {
            Sprites.drawTeacherBack(ctx, tx, ty, TEACHER_W, TEACHER_H, frame);
        } else {
            Sprites.drawTeacherFront(ctx, tx, ty, TEACHER_W, TEACHER_H, frame);
        }

        if (teacherState === 'warning') {
            Sprites.drawWarningBubble(ctx, GAME_W / 2, ty - 5, 24, frame);
        }
    }

    // ================================================================
    //  GRID (desks + students)
    // ================================================================
    function drawGrid(grid, noteCol, noteRow, frame) {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const pos = getCellPos(col, row);
                const cell = grid[row][col];

                Sprites.drawDesk(ctx, pos.x, pos.y, CELL_W, CELL_H);

                if (cell.state === 'writing') {
                    Sprites.drawStudentWriting(ctx, pos.x, pos.y, CELL_W, CELL_H, col, row, frame);
                } else if (cell.state === 'sleeping') {
                    Sprites.drawStudentSleeping(ctx, pos.x, pos.y, CELL_W, CELL_H, col, row, frame);
                }

                if (cell.state === 'empty') {
                    // Manga-style empty indicator: small X on chair
                    ctx.strokeStyle = Sprites.C.inkLight;
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = 0.3;
                    const ecx = pos.x + CELL_W / 2;
                    const ecy = pos.y + CELL_H - 18;
                    ctx.beginPath();
                    ctx.moveTo(ecx - 6, ecy - 4);
                    ctx.lineTo(ecx + 6, ecy + 4);
                    ctx.moveTo(ecx + 6, ecy - 4);
                    ctx.lineTo(ecx - 6, ecy + 4);
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }

                if (cell.isNerd) {
                    const center = getCellCenter(col, row);
                    Sprites.drawNerdStar(ctx, center.x, pos.y + 10, 18);
                }

                if (cell.isDunce) {
                    const center = getCellCenter(col, row);
                    Sprites.drawDunceMarker(ctx, center.x, pos.y + 12, 14, frame);
                }

                if (col === noteCol && row === noteRow) {
                    const hx = pos.x + CELL_W / 2 - 22;
                    const hy = pos.y + CELL_H - 44;
                    Sprites.drawHighlight(ctx, hx, hy, 44, 40, frame);
                }
            }
        }
    }

    // ================================================================
    //  NOTE IN TRANSIT (with manga speed lines)
    // ================================================================
    function drawNoteInTransit(fromCol, fromRow, toCol, toRow, progress, frame) {
        const from = getCellCenter(fromCol, fromRow);
        const to = getCellCenter(toCol, toRow);

        const nx = from.x + (to.x - from.x) * progress;
        const ny = from.y + (to.y - from.y) * progress;

        const arcHeight = -30;
        const arc = arcHeight * Math.sin(progress * Math.PI);
        const noteY = ny + arc;

        // Motion trail (manga speed lines behind the note)
        const dx = (to.x - from.x);
        const dy = (to.y - from.y);
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        Sprites.drawMotionTrail(ctx, nx, noteY - 15, dx / len, dy / len, 22);

        // Shadow on ground
        ctx.fillStyle = 'rgba(26, 21, 16, 0.15)';
        ctx.beginPath();
        ctx.ellipse(nx, ny + 10, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // The note itself
        Sprites.drawNote(ctx, nx, noteY - 15, 22);
    }

    // ================================================================
    //  NOTE ON DESK
    // ================================================================
    function drawNoteOnDesk(col, row) {
        const pos = getCellPos(col, row);
        const cx = pos.x + CELL_W / 2 + 18;
        const cy = pos.y + CELL_H - 32;
        Sprites.drawNote(ctx, cx, cy, 18);
    }

    // ================================================================
    //  TIMER (manga ink style)
    // ================================================================
    function drawTimer(timeLeft, maxTime) {
        const C = Sprites.C;
        const x = GAME_W - 105;
        const y = 15;
        const ratio = timeLeft / maxTime;

        // Background panel
        ctx.fillStyle = C.paper;
        Sprites.roundRectPath(ctx, x - 5, y - 5, 100, 38, 4);
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Timer text
        ctx.fillStyle = timeLeft <= 10 ? C.accentRed : C.ink;
        ctx.font = `bold 20px ${FONT_UI}`;
        ctx.textAlign = 'right';
        const secs = Math.ceil(timeLeft);
        ctx.fillText(secs + 's', GAME_W - 15, y + 18);

        // Timer bar outline
        const barW = 70;
        ctx.fillStyle = C.paper;
        ctx.fillRect(x, y + 25, barW, 5);
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y + 25, barW, 5);

        // Timer bar fill
        if (ratio > 0.3) {
            ctx.fillStyle = C.ink;
        } else {
            ctx.fillStyle = C.accentRed;
        }
        ctx.fillRect(x + 1, y + 26, (barW - 2) * ratio, 3);

        // Low time warning: manga sweat drop
        if (timeLeft <= 10) {
            ctx.fillStyle = C.inkLight;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(x - 12, y + 5);
            ctx.quadraticCurveTo(x - 15, y + 15, x - 12, y + 20);
            ctx.quadraticCurveTo(x - 9, y + 15, x - 12, y + 5);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        ctx.textAlign = 'left';
    }

    // ================================================================
    //  PIXEL-ART FLAG HELPERS (kept functional, drawn with ink outlines)
    // ================================================================
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
        ctx.fillStyle = '#012169';
        ctx.fillRect(x, y, w, h);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y + h);
        ctx.moveTo(x + w, y);
        ctx.lineTo(x, y + h);
        ctx.stroke();
        ctx.strokeStyle = '#C8102E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y + h);
        ctx.moveTo(x + w, y);
        ctx.lineTo(x, y + h);
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y + Math.floor(h / 2) - 4, w, 8);
        ctx.fillRect(x + Math.floor(w / 2) - 5, y, 10, h);
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

    // ================================================================
    //  MANGA PANEL BORDER (reusable helper)
    // ================================================================
    function drawMangaPanel(x, y, w, h, lineW) {
        ctx.strokeStyle = Sprites.C.ink;
        ctx.lineWidth = lineW || 3;
        ctx.strokeRect(x, y, w, h);
    }

    // ================================================================
    //  TITLE SCREEN (manga style)
    // ================================================================
    function drawTitleScreen(frame) {
        const C = Sprites.C;

        // Overlay with screentone feel
        ctx.fillStyle = 'rgba(245, 240, 224, 0.85)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Manga panel border
        drawMangaPanel(20, 20, GAME_W - 40, GAME_H - 40, 4);
        drawMangaPanel(25, 25, GAME_W - 50, GAME_H - 50, 1.5);

        // Speed lines behind title area
        Sprites.drawSpeedLines(ctx, GAME_W / 2, 170, 30, 180, 40, 0.08, 1);

        // Decorative flowers
        Sprites.drawFlower(ctx, 100, 160, 12, 0.3);
        Sprites.drawFlower(ctx, GAME_W - 100, 160, 10, 0.3);
        Sprites.drawFlower(ctx, 150, 200, 8, 0.2);
        Sprites.drawFlower(ctx, GAME_W - 150, 200, 8, 0.2);

        // Title
        ctx.fillStyle = C.ink;
        ctx.font = `42px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        // Shadow
        ctx.globalAlpha = 0.1;
        ctx.fillText(I18n.t('title'), GAME_W / 2 + 2, 182);
        ctx.globalAlpha = 1.0;
        ctx.fillText(I18n.t('title'), GAME_W / 2, 180);

        // Underline decoration
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 150, 190);
        ctx.lineTo(GAME_W / 2 + 150, 190);
        ctx.stroke();

        // Sparkles around title
        Sprites.drawSparkle4pt(ctx, GAME_W / 2 - 170, 170, 5);
        Sprites.drawSparkle4pt(ctx, GAME_W / 2 + 170, 170, 5);

        // Subtitle
        ctx.fillStyle = C.inkSoft;
        ctx.font = `italic 16px ${FONT_BODY}`;
        ctx.fillText(I18n.t('subtitle'), GAME_W / 2, 218);

        // Instructions
        ctx.fillStyle = C.ink;
        ctx.font = `14px ${FONT_BODY}`;
        const instructions = [
            I18n.t('instr1'),
            I18n.t('instr2'),
            '',
            I18n.t('instr3'),
            I18n.t('instr4'),
            '',
            I18n.t('instr5'),
        ];
        let iy = 262;
        for (const line of instructions) {
            ctx.fillText(line, GAME_W / 2, iy);
            iy += 22;
        }

        // Language selector flags
        const flagW = 42, flagH = 28;
        const langY = 455;
        const current = I18n.languages.indexOf(I18n.getLanguage());
        const langX = [GAME_W / 2 - 80, GAME_W / 2, GAME_W / 2 + 80];
        const drawFlagFns = [drawFlagItaly, drawFlagUK, drawFlagGermany];
        for (let i = 0; i < 3; i++) {
            const fx = langX[i] - flagW / 2;
            const fy = langY - flagH / 2;
            drawFlagFns[i](ctx, fx, fy, flagW, flagH);
            // Ink outline
            ctx.strokeStyle = C.ink;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(fx, fy, flagW, flagH);
            // Selected: bold border
            if (i === current) {
                ctx.strokeStyle = C.ink;
                ctx.lineWidth = 3;
                ctx.strokeRect(fx - 3, fy - 3, flagW + 6, flagH + 6);
                // Sparkles on selected
                ctx.fillStyle = C.ink;
                Sprites.drawSparkle4pt(ctx, fx - 8, fy - 8, 4);
                Sprites.drawSparkle4pt(ctx, fx + flagW + 8, fy - 8, 4);
            }
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = C.inkLight;
        ctx.font = `12px ${FONT_UI}`;
        ctx.fillText('\u2190 \u2192', GAME_W / 2, langY + flagH / 2 + 16);

        // Start prompt (blinking)
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 22px ${FONT_TITLE}`;
            ctx.fillText(I18n.t('pressSpaceContinue'), GAME_W / 2, 530);
        }

        ctx.textAlign = 'left';
    }

    // ================================================================
    //  SETTINGS SCREEN (manga panel style)
    // ================================================================
    function drawSettingsScreen(settingsRow, gridChoice, timeChoice, sleepChoice, frame) {
        const C = Sprites.C;

        // Overlay
        ctx.fillStyle = 'rgba(245, 240, 224, 0.92)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Manga panel border
        drawMangaPanel(20, 20, GAME_W - 40, GAME_H - 40, 4);

        // Title
        ctx.fillStyle = C.ink;
        ctx.font = `34px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('chooseDifficulty'), GAME_W / 2, 75);

        // Underline
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 180, 82);
        ctx.lineTo(GAME_W / 2 + 180, 82);
        ctx.stroke();

        // Grid size row
        const gridLabels = ['3 x 4', '5 x 4', '5 x 5'];
        const gridDescs = [I18n.t('gridEasy'), I18n.t('gridMedium'), I18n.t('gridHard')];
        const rowY1 = 155;
        ctx.fillStyle = settingsRow === 0 ? C.ink : C.inkLight;
        ctx.font = `bold 16px ${FONT_UI}`;
        ctx.fillText(I18n.t('grid'), GAME_W / 2, rowY1 - 22);
        drawOptionRow(gridLabels, gridDescs, gridChoice, rowY1, settingsRow === 0, frame);

        // Time row
        const timeLabels = ['20s', '40s', '60s'];
        const timeDescs = [I18n.t('timeChallenge'), I18n.t('timeNormal'), I18n.t('timeRelaxed')];
        const rowY2 = 290;
        ctx.fillStyle = settingsRow === 1 ? C.ink : C.inkLight;
        ctx.font = `bold 16px ${FONT_UI}`;
        ctx.fillText(I18n.t('time'), GAME_W / 2, rowY2 - 22);
        drawOptionRow(timeLabels, timeDescs, timeChoice, rowY2, settingsRow === 1, frame);

        // Sleepers row
        const sleepLabels = ['3', '5', '7'];
        const sleepDescs = [I18n.t('sleepFew'), I18n.t('sleepMedium'), I18n.t('sleepMany')];
        const rowY3 = 425;
        ctx.fillStyle = settingsRow === 2 ? C.ink : C.inkLight;
        ctx.font = `bold 16px ${FONT_UI}`;
        ctx.fillText(I18n.t('sleepers'), GAME_W / 2, rowY3 - 22);
        drawOptionRow(sleepLabels, sleepDescs, sleepChoice, rowY3, settingsRow === 2, frame);

        // Navigation hint
        ctx.fillStyle = C.inkLight;
        ctx.font = `13px ${FONT_UI}`;
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('navHint'), GAME_W / 2, 505);

        // Start prompt
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 22px ${FONT_TITLE}`;
            ctx.fillText(I18n.t('pressSpacePlay'), GAME_W / 2, 550);
        }

        ctx.textAlign = 'left';
    }

    // Helper: option row with manga panel boxes
    function drawOptionRow(labels, descriptions, selected, y, isActiveRow, frame) {
        const C = Sprites.C;
        const spacing = 200;
        const startX = GAME_W / 2 - spacing;

        for (let i = 0; i < 3; i++) {
            const cx = startX + i * spacing;
            const isSelected = (i === selected);
            const boxW = 140;
            const boxH = 70;
            const bx = cx - boxW / 2;
            const by = y - boxH / 2;

            if (isSelected && isActiveRow) {
                // Active selected: bold manga border with screentone fill
                ctx.fillStyle = Sprites.patterns.dotLight || C.tone1;
                ctx.fillRect(bx - 3, by - 3, boxW + 6, boxH + 6);
                ctx.strokeStyle = C.ink;
                ctx.lineWidth = 3;
                ctx.strokeRect(bx - 3, by - 3, boxW + 6, boxH + 6);
                // Sparkles on corners
                ctx.fillStyle = C.ink;
                Sprites.drawSparkle4pt(ctx, bx - 8, by - 8, 4);
                Sprites.drawSparkle4pt(ctx, bx + boxW + 8, by - 8, 4);
            } else if (isSelected) {
                // Selected but not active
                ctx.fillStyle = C.paperDark;
                ctx.fillRect(bx, by, boxW, boxH);
                ctx.strokeStyle = C.ink;
                ctx.lineWidth = 2;
                ctx.strokeRect(bx, by, boxW, boxH);
            } else {
                // Not selected
                ctx.fillStyle = C.paper;
                ctx.fillRect(bx, by, boxW, boxH);
                ctx.strokeStyle = C.inkLight;
                ctx.lineWidth = 1;
                ctx.strokeRect(bx, by, boxW, boxH);
            }

            // Label
            ctx.fillStyle = isSelected ? C.ink : C.inkLight;
            ctx.font = isSelected ? `bold 22px ${FONT_UI}` : `20px ${FONT_UI}`;
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], cx, y + 2);

            // Description
            ctx.fillStyle = isSelected ? C.inkSoft : C.inkLight;
            ctx.font = `12px ${FONT_BODY}`;
            ctx.fillText(descriptions[i], cx, y + 22);
        }

        // Arrow indicators for active row
        if (isActiveRow) {
            const leftX = startX - spacing / 2 - 10;
            const rightX = startX + 2 * spacing + spacing / 2 + 10;
            ctx.fillStyle = C.ink;
            ctx.font = `20px ${FONT_UI}`;
            ctx.textAlign = 'center';
            if (Math.floor(frame / 20) % 2 === 0) {
                ctx.fillText('\u25C4', leftX, y + 4);
                ctx.fillText('\u25BA', rightX, y + 4);
            }
        }

        ctx.textAlign = 'left';
    }

    // ================================================================
    //  GAME OVER SCREEN (dramatic manga style)
    // ================================================================
    function drawGameOverScreen(reason, frame) {
        const C = Sprites.C;

        // Dark overlay with vignette effect
        ctx.fillStyle = 'rgba(245, 240, 224, 0.8)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Speed lines covering the screen (dramatic manga reveal)
        Sprites.drawSpeedLines(ctx, GAME_W / 2, 240, 40, 400, 60, 0.12, 1.5);

        // Manga panel border
        drawMangaPanel(40, 100, GAME_W - 80, 300, 5);

        // Inner panel
        ctx.fillStyle = C.paper;
        ctx.fillRect(45, 105, GAME_W - 90, 290);

        // Red accent strip at top of panel
        ctx.fillStyle = C.accentRed;
        ctx.globalAlpha = 0.15;
        ctx.fillRect(45, 105, GAME_W - 90, 290);
        ctx.globalAlpha = 1.0;

        // Title text
        ctx.fillStyle = C.ink;
        ctx.font = `52px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        // Shadow
        ctx.globalAlpha = 0.1;
        ctx.fillText(I18n.t('caught'), GAME_W / 2 + 3, 242);
        ctx.globalAlpha = 1.0;
        ctx.fillText(I18n.t('caught'), GAME_W / 2, 240);

        // Underline burst
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 120, 250);
        ctx.lineTo(GAME_W / 2 + 120, 250);
        ctx.stroke();

        // Reason text
        ctx.fillStyle = C.inkSoft;
        ctx.font = `18px ${FONT_BODY}`;
        if (reason === 'caught') {
            ctx.fillText(I18n.t('caughtReasonTeacher'), GAME_W / 2, 290);
        } else {
            ctx.fillText(I18n.t('caughtReasonTime'), GAME_W / 2, 290);
        }

        // Manga anger marks (cross marks in corners)
        drawAngerMark(ctx, GAME_W / 2 - 160, 180, 10);
        drawAngerMark(ctx, GAME_W / 2 + 160, 180, 10);

        // Retry prompt
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 20px ${FONT_TITLE}`;
            ctx.fillText(I18n.t('pressSpaceRetry'), GAME_W / 2, 370);
        }

        ctx.textAlign = 'left';
    }

    // Manga anger mark (cross/vein mark)
    function drawAngerMark(ctx, x, y, size) {
        ctx.strokeStyle = Sprites.C.accentRed;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(x - size, y - size * 0.3);
        ctx.lineTo(x + size, y + size * 0.3);
        ctx.moveTo(x + size * 0.3, y - size);
        ctx.lineTo(x - size * 0.3, y + size);
        ctx.moveTo(x - size * 0.8, y + size * 0.6);
        ctx.lineTo(x + size * 0.8, y - size * 0.6);
        ctx.moveTo(x - size * 0.6, y - size * 0.8);
        ctx.lineTo(x + size * 0.6, y + size * 0.8);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  WIN SCREEN (manga celebration style)
    // ================================================================
    function drawWinScreen(timeLeft, frame) {
        const C = Sprites.C;

        // Light overlay
        ctx.fillStyle = 'rgba(245, 240, 224, 0.85)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Radial light burst (manga revelation effect)
        Sprites.drawSpeedLines(ctx, GAME_W / 2, 220, 20, 350, 50, 0.06, 0.8);

        // Manga panel
        drawMangaPanel(40, 80, GAME_W - 80, 340, 5);
        ctx.fillStyle = C.paper;
        ctx.fillRect(45, 85, GAME_W - 90, 330);

        // Decorative flowers scattered around
        Sprites.drawFlower(ctx, 120, 130, 15, 0.4);
        Sprites.drawFlower(ctx, GAME_W - 120, 130, 12, 0.35);
        Sprites.drawFlower(ctx, 100, 350, 10, 0.3);
        Sprites.drawFlower(ctx, GAME_W - 100, 350, 14, 0.35);
        Sprites.drawFlower(ctx, GAME_W / 2 - 200, 250, 8, 0.25);
        Sprites.drawFlower(ctx, GAME_W / 2 + 200, 250, 8, 0.25);

        // Title
        ctx.fillStyle = C.ink;
        ctx.font = `52px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.08;
        ctx.fillText(I18n.t('promoted'), GAME_W / 2 + 3, 222);
        ctx.globalAlpha = 1.0;
        ctx.fillText(I18n.t('promoted'), GAME_W / 2, 220);

        // Decorative underline
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 130, 230);
        ctx.lineTo(GAME_W / 2 + 130, 230);
        ctx.stroke();

        // Win message
        ctx.fillStyle = C.inkSoft;
        ctx.font = `18px ${FONT_BODY}`;
        ctx.fillText(I18n.t('winMessage'), GAME_W / 2, 268);

        // Time left
        ctx.fillStyle = C.ink;
        ctx.font = `bold 24px ${FONT_UI}`;
        ctx.fillText(I18n.t('timeLeft') + Math.ceil(timeLeft) + 's', GAME_W / 2, 310);

        // Animated sparkles celebration
        Sprites.drawSparkles(ctx, GAME_W / 2, 340, 250, frame, 12);

        // Extra sparkle cluster
        for (let i = 0; i < 8; i++) {
            const sx = 150 + i * 70 + Math.sin(frame * 0.05 + i) * 20;
            const sy = 360 + Math.cos(frame * 0.07 + i * 0.5) * 15;
            ctx.fillStyle = C.ink;
            ctx.globalAlpha = 0.3 + Math.sin(frame * 0.08 + i) * 0.15;
            Sprites.drawSparkle4pt(ctx, sx, sy, 4 + Math.sin(frame * 0.06 + i * 2) * 2);
        }
        ctx.globalAlpha = 1.0;

        // Continue prompt
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 20px ${FONT_TITLE}`;
            ctx.fillText(I18n.t('pressSpaceAgain'), GAME_W / 2, 400);
        }

        ctx.textAlign = 'left';
    }

    // ================================================================
    //  DANGER OVERLAY (manga dramatic tension)
    // ================================================================
    function drawDangerOverlay(frame) {
        const C = Sprites.C;

        // Subtle vignette with ink tone
        const alpha = 0.04 + Math.sin(frame * 0.15) * 0.02;
        ctx.fillStyle = `rgba(200, 48, 48, ${alpha})`;
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Edge vignette lines (manga tension hatching)
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.08 + Math.sin(frame * 0.2) * 0.04;
        // Top edge hatching
        for (let i = 0; i < GAME_W; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 4, 15);
            ctx.stroke();
        }
        // Bottom edge hatching
        for (let i = 0; i < GAME_W; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, GAME_H);
            ctx.lineTo(i + 4, GAME_H - 15);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        // Warning text in manga-style jagged bubble
        const textAlpha = 0.5 + Math.sin(frame * 0.2) * 0.3;
        ctx.globalAlpha = textAlpha;
        ctx.fillStyle = C.ink;
        ctx.font = `bold 15px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('teacherWatching'), GAME_W / 2, GAME_H - 15);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  TEACHER INDICATOR BAR (manga ink style)
    // ================================================================
    function drawTeacherIndicator(teacherState, frame) {
        const C = Sprites.C;
        const barH = 6;
        const y = 150;

        if (teacherState === 'facing_board') {
            // Safe: thin ink line
            ctx.fillStyle = C.ink;
            ctx.globalAlpha = 0.15;
            ctx.fillRect(0, y, GAME_W, barH);
            ctx.globalAlpha = 1.0;
        } else if (teacherState === 'warning') {
            // Warning: hatched pattern
            ctx.fillStyle = Sprites.patterns.crossLight || C.tone2;
            ctx.fillRect(0, y, GAME_W, barH);
            const flash = Math.floor(frame / 5) % 2 === 0;
            if (flash) {
                ctx.fillStyle = C.ink;
                ctx.globalAlpha = 0.3;
                ctx.fillRect(0, y, GAME_W, barH);
                ctx.globalAlpha = 1.0;
            }
        } else {
            // Danger: solid dark with flash
            const flash = Math.floor(frame / 8) % 2 === 0;
            ctx.fillStyle = C.ink;
            ctx.globalAlpha = flash ? 0.8 : 0.5;
            ctx.fillRect(0, y, GAME_W, barH);
            ctx.globalAlpha = 1.0;

            // Red accent line
            ctx.fillStyle = C.accentRed;
            ctx.globalAlpha = flash ? 0.4 : 0.2;
            ctx.fillRect(0, y, GAME_W, barH);
            ctx.globalAlpha = 1.0;
        }
    }

    // ================================================================
    //  CLEAR
    // ================================================================
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
        // Expose font constants for game.js
        FONT_TITLE,
        FONT_BODY,
        FONT_UI,
    };
})();
