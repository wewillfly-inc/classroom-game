// ============================================================
// renderer.js - Colorful Manga Classroom Scene Renderer
// 1024x768 resolution, inspired by 1960s shojo manga
// ============================================================

const Renderer = (() => {
    const GAME_W = 1024;
    const GAME_H = 768;

    // Layout constants (scaled for higher res)
    const BOARD_Y = 25;
    const BOARD_H = 90;
    const BOARD_W = 380;

    const TEACHER_W = 80;
    const TEACHER_H = 128;

    // Dynamic grid layout
    let GRID_COLS = 4;
    let GRID_ROWS = 5;
    let CELL_W = 150;
    let CELL_H = 100;
    let GRID_START_X = 160;
    let GRID_START_Y = 215;

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
        Sprites.initPatterns(ctx);
        resize();
        window.addEventListener('resize', resize);
    }

    function setGridSize(cols, rows) {
        GRID_COLS = cols;
        GRID_ROWS = rows;

        const maxGridW = GAME_W - 160;
        const maxGridH = GAME_H - 245;

        CELL_W = Math.min(150, Math.floor(maxGridW / cols));
        CELL_H = Math.min(100, Math.floor(maxGridH / rows));

        GRID_START_X = Math.floor((GAME_W - cols * CELL_W) / 2);
        GRID_START_Y = 215;
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
        return { x: pos.x + CELL_W / 2, y: pos.y + CELL_H / 2 };
    }

    // ================================================================
    //  BACKGROUND (colorful manga classroom)
    // ================================================================
    function drawBackground() {
        const C = Sprites.C;
        const P = Sprites.patterns;

        // Paper base
        ctx.fillStyle = C.paper;
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Floor with warm wood screentone
        ctx.fillStyle = P.floor || C.floorWood;
        ctx.fillRect(0, 190, GAME_W, GAME_H - 190);

        // Floor board lines
        ctx.strokeStyle = C.floorWoodDk;
        ctx.lineWidth = 0.5;
        for (let fy = 200; fy < GAME_H; fy += 35) {
            ctx.beginPath();
            ctx.moveTo(0, fy);
            ctx.lineTo(GAME_W, fy);
            ctx.stroke();
        }

        // Back wall (warm cream)
        ctx.fillStyle = P.wallTone || C.wallCream;
        ctx.fillRect(0, 0, GAME_W, 190);

        // Wall-floor border
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 190);
        ctx.lineTo(GAME_W, 190);
        ctx.stroke();

        // Wainscoting
        ctx.fillStyle = C.wallCreamDk;
        ctx.fillRect(0, 165, GAME_W, 25);
        ctx.strokeStyle = C.inkSoft;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 165); ctx.lineTo(GAME_W, 165); ctx.stroke();
        // Wainscoting detail line
        ctx.strokeStyle = C.deskFront;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, 175); ctx.lineTo(GAME_W, 175); ctx.stroke();

        // Side wall strips
        ctx.fillStyle = C.wallCreamDk;
        ctx.fillRect(0, 0, 12, GAME_H);
        ctx.fillRect(GAME_W - 12, 0, 12, GAME_H);
        ctx.strokeStyle = C.inkSoft;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(12, 0); ctx.lineTo(12, GAME_H); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(GAME_W - 12, 0); ctx.lineTo(GAME_W - 12, GAME_H); ctx.stroke();

        // Windows (left wall) - blue sky!
        for (let wy = 230; wy < 640; wy += 170) {
            drawColorWindow(14, wy, 56, 90);
        }
        // Windows (right wall)
        for (let wy = 230; wy < 640; wy += 170) {
            drawColorWindow(GAME_W - 70, wy, 56, 90);
        }

        // Clock
        drawMangaClock(GAME_W - 140, 50);

        // Poster
        drawMangaPoster(90, 35, 60, 80);
    }

    // Colorful window with blue sky
    function drawColorWindow(x, y, w, h) {
        const C = Sprites.C;
        const P = Sprites.patterns;

        // Sky blue glass
        ctx.fillStyle = C.windowSky;
        ctx.fillRect(x, y, w, h);

        // Upper sky (lighter)
        ctx.fillStyle = '#a8d8f0';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x, y, w, h * 0.35);
        ctx.globalAlpha = 1.0;

        // Lower sky (slightly darker)
        ctx.fillStyle = C.windowSkyDk;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
        ctx.globalAlpha = 1.0;

        // Subtle cloud hint
        ctx.fillStyle = C.white;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.ellipse(x + w * 0.3, y + h * 0.25, 10, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.5, y + h * 0.22, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Frame (warm wood)
        ctx.strokeStyle = C.windowFrame;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        // Cross divider
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + w, y + h / 2);
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w / 2, y + h);
        ctx.stroke();

        // Ink outline
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);

        // Light reflection
        ctx.strokeStyle = C.white;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 5);
        ctx.lineTo(x + 14, y + 24);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // Clock
    function drawMangaClock(cx, cy) {
        const C = Sprites.C;
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hour marks
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * 17, cy + Math.sin(a) * 17);
            ctx.lineTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20);
            ctx.stroke();
        }

        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy - 14);
        ctx.stroke();
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 10, cy + 4);
        ctx.stroke();

        ctx.fillStyle = C.accentRed;
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Poster
    function drawMangaPoster(x, y, w, h) {
        const C = Sprites.C;

        ctx.fillStyle = '#fff8e8';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);

        // Flower decoration
        Sprites.drawFlower(ctx, x + w / 2, y + 25, 10, 0.6);

        // Text
        ctx.fillStyle = C.accentRed;
        ctx.font = `bold 12px ${FONT_BODY}`;
        ctx.fillText('ABC', x + 12, y + 55);
        ctx.fillStyle = C.shirtBlue;
        ctx.fillText('123', x + 12, y + 70);
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
        const ty = 55;

        if (teacherState === 'facing_board' || teacherState === 'warning') {
            Sprites.drawTeacherBack(ctx, tx, ty, TEACHER_W, TEACHER_H, frame);
        } else {
            Sprites.drawTeacherFront(ctx, tx, ty, TEACHER_W, TEACHER_H, frame);
        }

        if (teacherState === 'warning') {
            Sprites.drawWarningBubble(ctx, GAME_W / 2, ty - 5, 28, frame);
        }
    }

    // ================================================================
    //  GRID
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
                    ctx.strokeStyle = Sprites.C.inkLight;
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = 0.25;
                    const ecx = pos.x + CELL_W / 2;
                    const ecy = pos.y + CELL_H - 20;
                    ctx.beginPath();
                    ctx.moveTo(ecx - 7, ecy - 5);
                    ctx.lineTo(ecx + 7, ecy + 5);
                    ctx.moveTo(ecx + 7, ecy - 5);
                    ctx.lineTo(ecx - 7, ecy + 5);
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }

                if (cell.isNerd) {
                    const center = getCellCenter(col, row);
                    Sprites.drawNerdStar(ctx, center.x, pos.y + 12, 20);
                }

                if (cell.isDunce) {
                    const center = getCellCenter(col, row);
                    Sprites.drawDunceMarker(ctx, center.x, pos.y + 14, 16, frame);
                }

                if (col === noteCol && row === noteRow) {
                    const hx = pos.x + CELL_W / 2 - 26;
                    const hy = pos.y + CELL_H - 50;
                    Sprites.drawHighlight(ctx, hx, hy, 52, 46, frame);
                }
            }
        }
    }

    // ================================================================
    //  NOTE IN TRANSIT
    // ================================================================
    function drawNoteInTransit(fromCol, fromRow, toCol, toRow, progress, frame) {
        const from = getCellCenter(fromCol, fromRow);
        const to = getCellCenter(toCol, toRow);

        const nx = from.x + (to.x - from.x) * progress;
        const ny = from.y + (to.y - from.y) * progress;
        const arcHeight = -35;
        const arc = arcHeight * Math.sin(progress * Math.PI);
        const noteY = ny + arc;

        // Motion trail
        const dx = (to.x - from.x);
        const dy = (to.y - from.y);
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        Sprites.drawMotionTrail(ctx, nx, noteY - 16, dx / len, dy / len, 24);

        // Shadow
        ctx.fillStyle = 'rgba(26, 21, 16, 0.12)';
        ctx.beginPath();
        ctx.ellipse(nx, ny + 12, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        Sprites.drawNote(ctx, nx, noteY - 16, 24);
    }

    // ================================================================
    //  NOTE ON DESK
    // ================================================================
    function drawNoteOnDesk(col, row) {
        const pos = getCellPos(col, row);
        const cx = pos.x + CELL_W / 2 + 20;
        const cy = pos.y + CELL_H - 38;
        Sprites.drawNote(ctx, cx, cy, 20);
    }

    // ================================================================
    //  TIMER
    // ================================================================
    function drawTimer(timeLeft, maxTime) {
        const C = Sprites.C;
        const x = GAME_W - 125;
        const y = 18;
        const ratio = timeLeft / maxTime;

        // Panel
        ctx.fillStyle = C.white;
        Sprites.roundRectPath(ctx, x - 8, y - 6, 120, 44, 5);
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Timer text
        ctx.fillStyle = timeLeft <= 10 ? C.accentRed : C.ink;
        ctx.font = `bold 22px ${FONT_UI}`;
        ctx.textAlign = 'right';
        ctx.fillText(Math.ceil(timeLeft) + 's', GAME_W - 18, y + 20);

        // Timer bar
        const barW = 85;
        ctx.fillStyle = C.paperDark;
        ctx.fillRect(x, y + 28, barW, 6);
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y + 28, barW, 6);

        if (ratio > 0.3) {
            ctx.fillStyle = C.green;
        } else {
            ctx.fillStyle = C.accentRed;
        }
        ctx.fillRect(x + 1, y + 29, (barW - 2) * ratio, 4);

        // Low-time sweat drop
        if (timeLeft <= 10) {
            ctx.fillStyle = '#88bbee';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(x - 16, y + 6);
            ctx.quadraticCurveTo(x - 20, y + 18, x - 16, y + 24);
            ctx.quadraticCurveTo(x - 12, y + 18, x - 16, y + 6);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        ctx.textAlign = 'left';
    }

    // ================================================================
    //  FLAGS
    // ================================================================
    function drawFlagItaly(ctx, x, y, w, h) {
        const sw = Math.floor(w / 3);
        ctx.fillStyle = '#009246'; ctx.fillRect(x, y, sw, h);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x + sw, y, sw, h);
        ctx.fillStyle = '#CE2B37'; ctx.fillRect(x + sw * 2, y, w - sw * 2, h);
    }

    function drawFlagUK(ctx, x, y, w, h) {
        ctx.fillStyle = '#012169'; ctx.fillRect(x, y, w, h);
        ctx.save();
        ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + w, y + h);
        ctx.moveTo(x + w, y); ctx.lineTo(x, y + h);
        ctx.stroke();
        ctx.strokeStyle = '#C8102E'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + w, y + h);
        ctx.moveTo(x + w, y); ctx.lineTo(x, y + h);
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
        ctx.fillStyle = '#000000'; ctx.fillRect(x, y, w, sh);
        ctx.fillStyle = '#DD0000'; ctx.fillRect(x, y + sh, w, sh);
        ctx.fillStyle = '#FFCC00'; ctx.fillRect(x, y + sh * 2, w, h - sh * 2);
    }

    // ================================================================
    //  MANGA PANEL BORDER
    // ================================================================
    function drawMangaPanel(x, y, w, h, lineW) {
        ctx.strokeStyle = Sprites.C.ink;
        ctx.lineWidth = lineW || 3;
        ctx.strokeRect(x, y, w, h);
    }

    // ================================================================
    //  TITLE SCREEN
    // ================================================================
    function drawTitleScreen(frame) {
        const C = Sprites.C;

        ctx.fillStyle = 'rgba(248, 244, 232, 0.88)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Double panel border
        drawMangaPanel(25, 25, GAME_W - 50, GAME_H - 50, 4);
        drawMangaPanel(30, 30, GAME_W - 60, GAME_H - 60, 1.5);

        // Speed lines behind title
        Sprites.drawSpeedLines(ctx, GAME_W / 2, 210, 35, 220, 45, 0.07, 1);

        // Flowers
        Sprites.drawFlower(ctx, 120, 195, 14, 0.4);
        Sprites.drawFlower(ctx, GAME_W - 120, 195, 12, 0.35);
        Sprites.drawFlower(ctx, 180, 240, 9, 0.25);
        Sprites.drawFlower(ctx, GAME_W - 180, 240, 9, 0.25);

        // Title
        ctx.fillStyle = C.ink;
        ctx.font = `48px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.08;
        ctx.fillText(I18n.t('title'), GAME_W / 2 + 3, 222);
        ctx.globalAlpha = 1.0;
        ctx.fillText(I18n.t('title'), GAME_W / 2, 220);

        // Decorative underline with gold accent
        ctx.strokeStyle = C.accentGold;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 180, 232);
        ctx.lineTo(GAME_W / 2 + 180, 232);
        ctx.stroke();

        // Sparkles
        ctx.fillStyle = C.accentGold;
        Sprites.drawSparkle4pt(ctx, GAME_W / 2 - 200, 210, 6);
        Sprites.drawSparkle4pt(ctx, GAME_W / 2 + 200, 210, 6);

        // Subtitle
        ctx.fillStyle = C.inkSoft;
        ctx.font = `italic 17px ${FONT_BODY}`;
        ctx.fillText(I18n.t('subtitle'), GAME_W / 2, 260);

        // Instructions
        ctx.fillStyle = C.ink;
        ctx.font = `15px ${FONT_BODY}`;
        const instructions = [
            I18n.t('instr1'), I18n.t('instr2'), '',
            I18n.t('instr3'), I18n.t('instr4'), '',
            I18n.t('instr5'),
        ];
        let iy = 310;
        for (const line of instructions) {
            ctx.fillText(line, GAME_W / 2, iy);
            iy += 24;
        }

        // Language flags
        const flagW = 46, flagH = 30;
        const langY = 560;
        const current = I18n.languages.indexOf(I18n.getLanguage());
        const langX = [GAME_W / 2 - 90, GAME_W / 2, GAME_W / 2 + 90];
        const drawFlagFns = [drawFlagItaly, drawFlagUK, drawFlagGermany];
        for (let i = 0; i < 3; i++) {
            const fx = langX[i] - flagW / 2;
            const fy = langY - flagH / 2;
            drawFlagFns[i](ctx, fx, fy, flagW, flagH);
            ctx.strokeStyle = C.ink;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(fx, fy, flagW, flagH);
            if (i === current) {
                ctx.strokeStyle = C.accentGold;
                ctx.lineWidth = 3;
                ctx.strokeRect(fx - 3, fy - 3, flagW + 6, flagH + 6);
                ctx.fillStyle = C.accentGold;
                Sprites.drawSparkle4pt(ctx, fx - 10, fy - 10, 5);
                Sprites.drawSparkle4pt(ctx, fx + flagW + 10, fy - 10, 5);
            }
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = C.inkLight;
        ctx.font = `13px ${FONT_UI}`;
        ctx.fillText('\u2190 \u2192', GAME_W / 2, langY + flagH / 2 + 18);

        // Start prompt
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 24px ${FONT_TITLE}`;
            ctx.fillText(I18n.t('pressSpaceContinue'), GAME_W / 2, 650);
        }

        ctx.textAlign = 'left';
    }

    // ================================================================
    //  SETTINGS SCREEN
    // ================================================================
    function drawSettingsScreen(settingsRow, gridChoice, timeChoice, sleepChoice, frame) {
        const C = Sprites.C;

        ctx.fillStyle = 'rgba(248, 244, 232, 0.93)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);
        drawMangaPanel(25, 25, GAME_W - 50, GAME_H - 50, 4);

        // Title
        ctx.fillStyle = C.ink;
        ctx.font = `38px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('chooseDifficulty'), GAME_W / 2, 90);

        ctx.strokeStyle = C.accentGold;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 200, 98);
        ctx.lineTo(GAME_W / 2 + 200, 98);
        ctx.stroke();

        // Grid row
        const gridLabels = ['3 x 4', '5 x 4', '5 x 5'];
        const gridDescs = [I18n.t('gridEasy'), I18n.t('gridMedium'), I18n.t('gridHard')];
        const rowY1 = 190;
        ctx.fillStyle = settingsRow === 0 ? C.ink : C.inkLight;
        ctx.font = `bold 17px ${FONT_UI}`;
        ctx.fillText(I18n.t('grid'), GAME_W / 2, rowY1 - 25);
        drawOptionRow(gridLabels, gridDescs, gridChoice, rowY1, settingsRow === 0, frame);

        // Time row
        const timeLabels = ['20s', '40s', '60s'];
        const timeDescs = [I18n.t('timeChallenge'), I18n.t('timeNormal'), I18n.t('timeRelaxed')];
        const rowY2 = 355;
        ctx.fillStyle = settingsRow === 1 ? C.ink : C.inkLight;
        ctx.font = `bold 17px ${FONT_UI}`;
        ctx.fillText(I18n.t('time'), GAME_W / 2, rowY2 - 25);
        drawOptionRow(timeLabels, timeDescs, timeChoice, rowY2, settingsRow === 1, frame);

        // Sleepers row
        const sleepLabels = ['3', '5', '7'];
        const sleepDescs = [I18n.t('sleepFew'), I18n.t('sleepMedium'), I18n.t('sleepMany')];
        const rowY3 = 520;
        ctx.fillStyle = settingsRow === 2 ? C.ink : C.inkLight;
        ctx.font = `bold 17px ${FONT_UI}`;
        ctx.fillText(I18n.t('sleepers'), GAME_W / 2, rowY3 - 25);
        drawOptionRow(sleepLabels, sleepDescs, sleepChoice, rowY3, settingsRow === 2, frame);

        // Nav hint
        ctx.fillStyle = C.inkLight;
        ctx.font = `14px ${FONT_UI}`;
        ctx.fillText(I18n.t('navHint'), GAME_W / 2, 630);

        // Start prompt
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 24px ${FONT_TITLE}`;
            ctx.fillText(I18n.t('pressSpacePlay'), GAME_W / 2, 690);
        }

        ctx.textAlign = 'left';
    }

    function drawOptionRow(labels, descriptions, selected, y, isActiveRow, frame) {
        const C = Sprites.C;
        const spacing = 230;
        const startX = GAME_W / 2 - spacing;

        for (let i = 0; i < 3; i++) {
            const cx = startX + i * spacing;
            const isSelected = (i === selected);
            const boxW = 160;
            const boxH = 80;
            const bx = cx - boxW / 2;
            const by = y - boxH / 2;

            if (isSelected && isActiveRow) {
                ctx.fillStyle = '#fff8e0';
                ctx.fillRect(bx - 4, by - 4, boxW + 8, boxH + 8);
                ctx.strokeStyle = C.accentGold;
                ctx.lineWidth = 3;
                ctx.strokeRect(bx - 4, by - 4, boxW + 8, boxH + 8);
                ctx.fillStyle = C.accentGold;
                Sprites.drawSparkle4pt(ctx, bx - 10, by - 10, 5);
                Sprites.drawSparkle4pt(ctx, bx + boxW + 10, by - 10, 5);
            } else if (isSelected) {
                ctx.fillStyle = C.paperDark;
                ctx.fillRect(bx, by, boxW, boxH);
                ctx.strokeStyle = C.ink;
                ctx.lineWidth = 2;
                ctx.strokeRect(bx, by, boxW, boxH);
            } else {
                ctx.fillStyle = C.paper;
                ctx.fillRect(bx, by, boxW, boxH);
                ctx.strokeStyle = C.inkLight;
                ctx.lineWidth = 1;
                ctx.strokeRect(bx, by, boxW, boxH);
            }

            ctx.fillStyle = isSelected ? C.ink : C.inkLight;
            ctx.font = isSelected ? `bold 24px ${FONT_UI}` : `22px ${FONT_UI}`;
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], cx, y + 4);

            ctx.fillStyle = isSelected ? C.inkSoft : C.inkLight;
            ctx.font = `13px ${FONT_BODY}`;
            ctx.fillText(descriptions[i], cx, y + 26);
        }

        if (isActiveRow) {
            const leftX = startX - spacing / 2 - 15;
            const rightX = startX + 2 * spacing + spacing / 2 + 15;
            ctx.fillStyle = C.accentGold;
            ctx.font = `22px ${FONT_UI}`;
            ctx.textAlign = 'center';
            if (Math.floor(frame / 20) % 2 === 0) {
                ctx.fillText('\u25C4', leftX, y + 6);
                ctx.fillText('\u25BA', rightX, y + 6);
            }
        }

        ctx.textAlign = 'left';
    }

    // ================================================================
    //  GAME OVER SCREEN
    // ================================================================
    function drawGameOverScreen(reason, frame) {
        const C = Sprites.C;

        ctx.fillStyle = 'rgba(248, 244, 232, 0.82)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Speed lines
        Sprites.drawSpeedLines(ctx, GAME_W / 2, 300, 50, 500, 65, 0.1, 1.5);

        // Panel
        drawMangaPanel(60, 140, GAME_W - 120, 350, 5);
        ctx.fillStyle = C.paper;
        ctx.fillRect(65, 145, GAME_W - 130, 340);

        // Red tint accent
        ctx.fillStyle = C.accentRed;
        ctx.globalAlpha = 0.08;
        ctx.fillRect(65, 145, GAME_W - 130, 340);
        ctx.globalAlpha = 1.0;

        // Title
        ctx.fillStyle = C.accentRed;
        ctx.font = `58px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.08;
        ctx.fillText(I18n.t('caught'), GAME_W / 2 + 3, 302);
        ctx.globalAlpha = 1.0;
        ctx.fillText(I18n.t('caught'), GAME_W / 2, 300);

        // Underline
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 140, 312);
        ctx.lineTo(GAME_W / 2 + 140, 312);
        ctx.stroke();

        // Reason
        ctx.fillStyle = C.ink;
        ctx.font = `19px ${FONT_BODY}`;
        if (reason === 'caught') {
            ctx.fillText(I18n.t('caughtReasonTeacher'), GAME_W / 2, 355);
        } else {
            ctx.fillText(I18n.t('caughtReasonTime'), GAME_W / 2, 355);
        }

        // Anger marks
        drawAngerMark(ctx, GAME_W / 2 - 190, 230, 12);
        drawAngerMark(ctx, GAME_W / 2 + 190, 230, 12);

        // Retry
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 22px ${FONT_TITLE}`;
            ctx.fillText(I18n.t('pressSpaceRetry'), GAME_W / 2, 440);
        }

        ctx.textAlign = 'left';
    }

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
    //  WIN SCREEN
    // ================================================================
    function drawWinScreen(timeLeft, frame) {
        const C = Sprites.C;

        ctx.fillStyle = 'rgba(248, 244, 232, 0.87)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Light burst
        Sprites.drawSpeedLines(ctx, GAME_W / 2, 270, 25, 400, 55, 0.05, 0.8);

        // Panel
        drawMangaPanel(60, 110, GAME_W - 120, 400, 5);
        ctx.fillStyle = C.paper;
        ctx.fillRect(65, 115, GAME_W - 130, 390);

        // Flowers
        Sprites.drawFlower(ctx, 140, 170, 18, 0.5);
        Sprites.drawFlower(ctx, GAME_W - 140, 170, 15, 0.45);
        Sprites.drawFlower(ctx, 120, 420, 12, 0.35);
        Sprites.drawFlower(ctx, GAME_W - 120, 420, 16, 0.45);
        Sprites.drawFlower(ctx, GAME_W / 2 - 230, 310, 10, 0.3);
        Sprites.drawFlower(ctx, GAME_W / 2 + 230, 310, 10, 0.3);

        // Title
        ctx.fillStyle = C.accentGold;
        ctx.font = `58px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.08;
        ctx.fillText(I18n.t('promoted'), GAME_W / 2 + 3, 282);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = C.ink;
        ctx.fillText(I18n.t('promoted'), GAME_W / 2, 280);

        // Gold underline
        ctx.strokeStyle = C.accentGold;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 150, 292);
        ctx.lineTo(GAME_W / 2 + 150, 292);
        ctx.stroke();

        // Win message
        ctx.fillStyle = C.inkSoft;
        ctx.font = `19px ${FONT_BODY}`;
        ctx.fillText(I18n.t('winMessage'), GAME_W / 2, 335);

        // Time left
        ctx.fillStyle = C.ink;
        ctx.font = `bold 26px ${FONT_UI}`;
        ctx.fillText(I18n.t('timeLeft') + Math.ceil(timeLeft) + 's', GAME_W / 2, 380);

        // Animated sparkles (colorful!)
        Sprites.drawSparkles(ctx, GAME_W / 2, 420, 300, frame, 14);

        // Extra sparkle row
        for (let i = 0; i < 10; i++) {
            const sx = 120 + i * 80 + Math.sin(frame * 0.05 + i) * 22;
            const sy = 440 + Math.cos(frame * 0.07 + i * 0.5) * 18;
            ctx.fillStyle = i % 3 === 0 ? C.accentGold : i % 3 === 1 ? C.accentPink : C.accentTeal;
            ctx.globalAlpha = 0.35 + Math.sin(frame * 0.08 + i) * 0.15;
            Sprites.drawSparkle4pt(ctx, sx, sy, 5 + Math.sin(frame * 0.06 + i * 2) * 2.5);
        }
        ctx.globalAlpha = 1.0;

        // Continue prompt
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 22px ${FONT_TITLE}`;
            ctx.fillText(I18n.t('pressSpaceAgain'), GAME_W / 2, 490);
        }

        ctx.textAlign = 'left';
    }

    // ================================================================
    //  DANGER OVERLAY
    // ================================================================
    function drawDangerOverlay(frame) {
        const C = Sprites.C;

        const alpha = 0.04 + Math.sin(frame * 0.15) * 0.02;
        ctx.fillStyle = `rgba(208, 56, 56, ${alpha})`;
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Edge hatching
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.06 + Math.sin(frame * 0.2) * 0.03;
        for (let i = 0; i < GAME_W; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 4, 18);
            ctx.stroke();
        }
        for (let i = 0; i < GAME_W; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, GAME_H);
            ctx.lineTo(i + 4, GAME_H - 18);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        // Warning text
        const textAlpha = 0.5 + Math.sin(frame * 0.2) * 0.3;
        ctx.globalAlpha = textAlpha;
        ctx.fillStyle = C.accentRed;
        ctx.font = `bold 16px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('teacherWatching'), GAME_W / 2, GAME_H - 18);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  TEACHER INDICATOR BAR
    // ================================================================
    function drawTeacherIndicator(teacherState, frame) {
        const C = Sprites.C;
        const barH = 7;
        const y = 190;

        if (teacherState === 'facing_board') {
            ctx.fillStyle = C.green;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(0, y, GAME_W, barH);
            ctx.globalAlpha = 1.0;
        } else if (teacherState === 'warning') {
            const flash = Math.floor(frame / 5) % 2 === 0;
            ctx.fillStyle = flash ? C.yellow : C.accentGold;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(0, y, GAME_W, barH);
            ctx.globalAlpha = 1.0;
        } else {
            const flash = Math.floor(frame / 8) % 2 === 0;
            ctx.fillStyle = flash ? C.accentRed : '#801818';
            ctx.globalAlpha = flash ? 0.7 : 0.5;
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
        FONT_TITLE,
        FONT_BODY,
        FONT_UI,
    };
})();
