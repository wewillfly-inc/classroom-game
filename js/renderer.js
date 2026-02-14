// ============================================================
// renderer.js - Colorful Manga Classroom Scene Renderer
// 768x1024 portrait resolution, inspired by 1960s shojo manga
// ============================================================

const Renderer = (() => {
    const GAME_W = 768;
    const GAME_H = 1024;

    // Layout constants (compact top area to maximize grid)
    const BOARD_Y = 10;
    const BOARD_H = 55;
    const BOARD_W = 250;

    const TEACHER_W = 60;
    const TEACHER_H = 100;

    // Dynamic grid layout
    let GRID_COLS = 4;
    let GRID_ROWS = 5;
    let CELL_W = 150;
    let CELL_H = 170;
    let GRID_START_X = 10;
    let GRID_START_Y = 140;

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

        // Use nearly the full canvas (small margins)
        const maxGridW = GAME_W - 16;       // 8px margin each side
        const maxGridH = GAME_H - 140 - 15; // below compact top area, 15px bottom margin

        CELL_W = Math.min(152, Math.floor(maxGridW / cols));
        CELL_H = Math.min(170, Math.floor(maxGridH / rows));

        GRID_START_X = Math.floor((GAME_W - cols * CELL_W) / 2);
        GRID_START_Y = 140;
    }

    function resize() {
        const windowW = window.innerWidth;
        let windowH = window.innerHeight;
        const ratio = GAME_W / GAME_H;

        // On touch devices, reserve space for the on-screen controls
        const controls = document.getElementById('touchControls');
        let controlsH = 0;
        if (controls && controls.offsetHeight > 0 && document.body.classList.contains('has-touch')) {
            controlsH = controls.offsetHeight;
        }
        const availableH = windowH - controlsH;

        let w, h;
        if (windowW / availableH > ratio) {
            h = availableH;
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
        offsetY = (availableH - h) / 2;

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

        // Floor with warm wood screentone (starts right below compact wall)
        ctx.fillStyle = P.floor || C.floorWood;
        ctx.fillRect(0, 130, GAME_W, GAME_H - 130);

        // Floor board lines
        ctx.strokeStyle = C.floorWoodDk;
        ctx.lineWidth = 0.5;
        for (let fy = 140; fy < GAME_H; fy += 35) {
            ctx.beginPath();
            ctx.moveTo(0, fy);
            ctx.lineTo(GAME_W, fy);
            ctx.stroke();
        }

        // Back wall (warm cream) - compact
        ctx.fillStyle = P.wallTone || C.wallCream;
        ctx.fillRect(0, 0, GAME_W, 130);

        // Wall-floor border
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 130);
        ctx.lineTo(GAME_W, 130);
        ctx.stroke();

        // Wainscoting (thin)
        ctx.fillStyle = C.wallCreamDk;
        ctx.fillRect(0, 112, GAME_W, 18);
        ctx.strokeStyle = C.inkSoft;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 112); ctx.lineTo(GAME_W, 112); ctx.stroke();

        // Clock (upper right of wall)
        drawMangaClock(GAME_W - 60, 40);

        // Poster (upper left of wall)
        drawMangaPoster(30, 20, 45, 60);
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
        const ty = 22;

        if (teacherState === 'facing_board' || teacherState === 'warning') {
            Sprites.drawTeacherBack(ctx, tx, ty, TEACHER_W, TEACHER_H, frame);
        } else {
            Sprites.drawTeacherFront(ctx, tx, ty, TEACHER_W, TEACHER_H, frame);
        }

        if (teacherState === 'warning') {
            Sprites.drawWarningBubble(ctx, GAME_W / 2, ty - 5, 22, frame);
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
        const x = GAME_W - 115;
        const y = 8;
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
        ctx.fillText(Math.ceil(timeLeft) + 's', GAME_W - 10, y + 20);

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
        drawMangaPanel(20, 20, GAME_W - 40, GAME_H - 40, 5);
        drawMangaPanel(26, 26, GAME_W - 52, GAME_H - 52, 1.5);

        // Speed lines behind title
        Sprites.drawSpeedLines(ctx, GAME_W / 2, 200, 40, 260, 50, 0.07, 1);

        // Flowers
        Sprites.drawFlower(ctx, 80, 185, 18, 0.5);
        Sprites.drawFlower(ctx, GAME_W - 80, 185, 16, 0.45);
        Sprites.drawFlower(ctx, 140, 240, 12, 0.3);
        Sprites.drawFlower(ctx, GAME_W - 140, 240, 12, 0.3);

        // Title (large!)
        ctx.fillStyle = C.ink;
        ctx.font = `62px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.08;
        ctx.fillText(I18n.t('title'), GAME_W / 2 + 3, 212);
        ctx.globalAlpha = 1.0;
        ctx.fillText(I18n.t('title'), GAME_W / 2, 210);

        // Decorative underline with gold accent
        ctx.strokeStyle = C.accentGold;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 220, 226);
        ctx.lineTo(GAME_W / 2 + 220, 226);
        ctx.stroke();

        // Sparkles
        ctx.fillStyle = C.accentGold;
        Sprites.drawSparkle4pt(ctx, GAME_W / 2 - 240, 200, 8);
        Sprites.drawSparkle4pt(ctx, GAME_W / 2 + 240, 200, 8);

        // Subtitle
        ctx.fillStyle = C.inkSoft;
        ctx.font = `italic 24px ${FONT_BODY}`;
        ctx.fillText(I18n.t('subtitle'), GAME_W / 2, 275);

        // Instructions (larger text, generous spacing)
        ctx.fillStyle = C.ink;
        ctx.font = `20px ${FONT_BODY}`;
        const instructions = [
            I18n.t('instr1'), I18n.t('instr2'), '',
            I18n.t('instr3'), I18n.t('instr4'), '',
            I18n.t('instr5'),
        ];
        let iy = 370;
        for (const line of instructions) {
            ctx.fillText(line, GAME_W / 2, iy);
            iy += 38;
        }

        // Language flags (larger)
        const flagW = 56, flagH = 36;
        const langY = 710;
        const current = I18n.languages.indexOf(I18n.getLanguage());
        const langX = [GAME_W / 2 - 110, GAME_W / 2, GAME_W / 2 + 110];
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
                Sprites.drawSparkle4pt(ctx, fx - 12, fy - 12, 6);
                Sprites.drawSparkle4pt(ctx, fx + flagW + 12, fy - 12, 6);
            }
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = C.inkLight;
        ctx.font = `16px ${FONT_UI}`;
        ctx.fillText('\u2190 \u2192', GAME_W / 2, langY + flagH / 2 + 22);

        // Additional flowers at bottom
        Sprites.drawFlower(ctx, 100, 840, 14, 0.35);
        Sprites.drawFlower(ctx, GAME_W - 100, 840, 14, 0.35);

        // Start prompt (large)
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 30px ${FONT_TITLE}`;
            const promptKey = Input.isTouchActive() ? 'touchContinue' : 'pressSpaceContinue';
            ctx.fillText(I18n.t(promptKey), GAME_W / 2, 920);
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
        drawMangaPanel(20, 20, GAME_W - 40, GAME_H - 40, 4);

        // Title
        ctx.fillStyle = C.ink;
        ctx.font = `44px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.fillText(I18n.t('chooseDifficulty'), GAME_W / 2, 110);

        ctx.strokeStyle = C.accentGold;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 220, 120);
        ctx.lineTo(GAME_W / 2 + 220, 120);
        ctx.stroke();

        // Grid row
        const gridLabels = ['3 x 4', '5 x 4', '5 x 5'];
        const gridDescs = [I18n.t('gridEasy'), I18n.t('gridMedium'), I18n.t('gridHard')];
        const rowY1 = 270;
        ctx.textAlign = 'center';
        ctx.fillStyle = settingsRow === 0 ? C.ink : C.inkLight;
        ctx.font = `bold 22px ${FONT_UI}`;
        ctx.fillText(I18n.t('grid'), GAME_W / 2, rowY1 - 72);
        drawOptionRow(gridLabels, gridDescs, gridChoice, rowY1, settingsRow === 0, frame);

        // Time row
        const timeLabels = ['20s', '40s', '60s'];
        const timeDescs = [I18n.t('timeChallenge'), I18n.t('timeNormal'), I18n.t('timeRelaxed')];
        const rowY2 = 500;
        ctx.textAlign = 'center';
        ctx.fillStyle = settingsRow === 1 ? C.ink : C.inkLight;
        ctx.font = `bold 22px ${FONT_UI}`;
        ctx.fillText(I18n.t('time'), GAME_W / 2, rowY2 - 72);
        drawOptionRow(timeLabels, timeDescs, timeChoice, rowY2, settingsRow === 1, frame);

        // Sleepers row
        const sleepLabels = ['3', '5', '7'];
        const sleepDescs = [I18n.t('sleepFew'), I18n.t('sleepMedium'), I18n.t('sleepMany')];
        const rowY3 = 730;
        ctx.textAlign = 'center';
        ctx.fillStyle = settingsRow === 2 ? C.ink : C.inkLight;
        ctx.font = `bold 22px ${FONT_UI}`;
        ctx.fillText(I18n.t('sleepers'), GAME_W / 2, rowY3 - 72);
        drawOptionRow(sleepLabels, sleepDescs, sleepChoice, rowY3, settingsRow === 2, frame);

        // Nav hint
        ctx.fillStyle = C.inkLight;
        ctx.font = `17px ${FONT_UI}`;
        ctx.fillText(I18n.t('navHint'), GAME_W / 2, 870);

        // Start prompt
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 30px ${FONT_TITLE}`;
            const promptKey = Input.isTouchActive() ? 'touchPlay' : 'pressSpacePlay';
            ctx.fillText(I18n.t(promptKey), GAME_W / 2, 950);
        }

        ctx.textAlign = 'left';
    }

    function drawOptionRow(labels, descriptions, selected, y, isActiveRow, frame) {
        const C = Sprites.C;
        const spacing = 220;
        const startX = GAME_W / 2 - spacing;

        for (let i = 0; i < 3; i++) {
            const cx = startX + i * spacing;
            const isSelected = (i === selected);
            const boxW = 165;
            const boxH = 95;
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
            ctx.font = isSelected ? `bold 28px ${FONT_UI}` : `26px ${FONT_UI}`;
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], cx, y + 6);

            ctx.fillStyle = isSelected ? C.inkSoft : C.inkLight;
            ctx.font = `16px ${FONT_BODY}`;
            ctx.fillText(descriptions[i], cx, y + 32);
        }

        if (isActiveRow) {
            const leftX = startX - spacing / 2 - 15;
            const rightX = startX + 2 * spacing + spacing / 2 + 15;
            ctx.fillStyle = C.accentGold;
            ctx.font = `26px ${FONT_UI}`;
            ctx.textAlign = 'center';
            if (Math.floor(frame / 20) % 2 === 0) {
                ctx.fillText('\u25C4', leftX, y + 8);
                ctx.fillText('\u25BA', rightX, y + 8);
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
        Sprites.drawSpeedLines(ctx, GAME_W / 2, 440, 60, 450, 70, 0.1, 1.5);

        // Panel (large, centered)
        drawMangaPanel(40, 220, GAME_W - 80, 480, 5);
        ctx.fillStyle = C.paper;
        ctx.fillRect(45, 225, GAME_W - 90, 470);

        // Red tint accent
        ctx.fillStyle = C.accentRed;
        ctx.globalAlpha = 0.08;
        ctx.fillRect(45, 225, GAME_W - 90, 470);
        ctx.globalAlpha = 1.0;

        // Title (large)
        ctx.fillStyle = C.accentRed;
        ctx.font = `72px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.08;
        ctx.fillText(I18n.t('caught'), GAME_W / 2 + 3, 422);
        ctx.globalAlpha = 1.0;
        ctx.fillText(I18n.t('caught'), GAME_W / 2, 420);

        // Underline
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 160, 436);
        ctx.lineTo(GAME_W / 2 + 160, 436);
        ctx.stroke();

        // Reason
        ctx.fillStyle = C.ink;
        ctx.font = `24px ${FONT_BODY}`;
        if (reason === 'caught') {
            ctx.fillText(I18n.t('caughtReasonTeacher'), GAME_W / 2, 500);
        } else {
            ctx.fillText(I18n.t('caughtReasonTime'), GAME_W / 2, 500);
        }

        // Anger marks
        drawAngerMark(ctx, GAME_W / 2 - 200, 340, 16);
        drawAngerMark(ctx, GAME_W / 2 + 200, 340, 16);

        // Retry
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 28px ${FONT_TITLE}`;
            const promptKey = Input.isTouchActive() ? 'touchRetry' : 'pressSpaceRetry';
            ctx.fillText(I18n.t(promptKey), GAME_W / 2, 630);
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
        Sprites.drawSpeedLines(ctx, GAME_W / 2, 400, 30, 420, 60, 0.05, 0.8);

        // Panel (large, centered)
        drawMangaPanel(40, 190, GAME_W - 80, 520, 5);
        ctx.fillStyle = C.paper;
        ctx.fillRect(45, 195, GAME_W - 90, 510);

        // Flowers (large)
        Sprites.drawFlower(ctx, 110, 260, 22, 0.55);
        Sprites.drawFlower(ctx, GAME_W - 110, 260, 18, 0.5);
        Sprites.drawFlower(ctx, 90, 610, 16, 0.4);
        Sprites.drawFlower(ctx, GAME_W - 90, 610, 20, 0.5);
        Sprites.drawFlower(ctx, GAME_W / 2 - 220, 450, 12, 0.35);
        Sprites.drawFlower(ctx, GAME_W / 2 + 220, 450, 12, 0.35);

        // Title (large)
        ctx.fillStyle = C.accentGold;
        ctx.font = `72px ${FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.08;
        ctx.fillText(I18n.t('promoted'), GAME_W / 2 + 3, 402);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = C.ink;
        ctx.fillText(I18n.t('promoted'), GAME_W / 2, 400);

        // Gold underline
        ctx.strokeStyle = C.accentGold;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(GAME_W / 2 - 170, 414);
        ctx.lineTo(GAME_W / 2 + 170, 414);
        ctx.stroke();

        // Win message
        ctx.fillStyle = C.inkSoft;
        ctx.font = `24px ${FONT_BODY}`;
        ctx.fillText(I18n.t('winMessage'), GAME_W / 2, 475);

        // Time left
        ctx.fillStyle = C.ink;
        ctx.font = `bold 30px ${FONT_UI}`;
        ctx.fillText(I18n.t('timeLeft') + Math.ceil(timeLeft) + 's', GAME_W / 2, 530);

        // Animated sparkles (colorful!)
        Sprites.drawSparkles(ctx, GAME_W / 2, 580, 300, frame, 16);

        // Extra sparkle row
        for (let i = 0; i < 8; i++) {
            const sx = 70 + i * 90 + Math.sin(frame * 0.05 + i) * 25;
            const sy = 610 + Math.cos(frame * 0.07 + i * 0.5) * 20;
            ctx.fillStyle = i % 3 === 0 ? C.accentGold : i % 3 === 1 ? C.accentPink : C.accentTeal;
            ctx.globalAlpha = 0.35 + Math.sin(frame * 0.08 + i) * 0.15;
            Sprites.drawSparkle4pt(ctx, sx, sy, 6 + Math.sin(frame * 0.06 + i * 2) * 3);
        }
        ctx.globalAlpha = 1.0;

        // Continue prompt
        if (Math.floor(frame / 30) % 2 === 0) {
            ctx.fillStyle = C.ink;
            ctx.font = `bold 28px ${FONT_TITLE}`;
            const promptKey = Input.isTouchActive() ? 'touchAgain' : 'pressSpaceAgain';
            ctx.fillText(I18n.t(promptKey), GAME_W / 2, 680);
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
        const y = 130;

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
