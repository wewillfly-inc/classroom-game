// ============================================================
// sprites.js - Colorful Manga Sprite Definitions & Drawing Utilities
// Inspired by 1960s shojo manga (Attack No.1 / Mila, Superstar)
// ============================================================

const Sprites = (() => {
    // ---- Colorful Manga Palette ----
    const C = {
        // Ink (outlines)
        ink:          '#1a1510',
        inkSoft:      '#3a3530',
        inkLight:     '#6a6055',
        // Paper
        paper:        '#f8f4e8',
        paperDark:    '#ece4d0',
        paperWarm:    '#f5edd8',
        // Screentone base tones
        tone1:        '#e8e0d0',
        tone2:        '#d0c8b0',
        tone3:        '#a89880',
        tone4:        '#807060',
        tone5:        '#504840',
        // Skin
        skin:         '#fce0c8',
        skinShade:    '#e8c8a8',
        blush:        '#f0a8a0',
        // Hair colors
        hairBlack:    '#1a1510',
        hairBrown:    '#6a3820',
        hairBlonde:   '#d4a840',
        hairAuburn:   '#8b3a2a',
        hairDarkBlue: '#2a3058',
        // Shirt colors
        shirtBlue:    '#5088c8',
        shirtBlueDk:  '#3868a0',
        shirtRed:     '#d05050',
        shirtRedDk:   '#a83030',
        shirtGreen:   '#50a860',
        shirtGreenDk: '#388848',
        shirtYellow:  '#e0c040',
        shirtYellowDk:'#b89828',
        shirtPink:    '#e07898',
        shirtPinkDk:  '#c05878',
        shirtOrange:  '#e09040',
        shirtOrangeDk:'#c07028',
        // Teacher
        teacherDress:   '#7050b8',
        teacherDressDk: '#5838a0',
        teacherDressLt: '#9070d0',
        // Desk & furniture
        deskTop:    '#d0a870',
        deskFront:  '#b08850',
        deskLeg:    '#8a6838',
        chairBack:  '#9a7848',
        chairSeat:  '#b89060',
        // Blackboard
        boardGreen:   '#2a6040',
        boardGreenLt: '#3a8050',
        boardFrame:   '#7a6038',
        chalk:        '#f0f0e0',
        chalkYellow:  '#f0e080',
        // Classroom
        floorWood:    '#d0b888',
        floorWoodDk:  '#b8a070',
        wallCream:    '#f5ece0',
        wallCreamDk:  '#e0d4c0',
        windowSky:    '#90c8e8',
        windowSkyDk:  '#6898c0',
        windowFrame:  '#c0a878',
        // Accents
        accentRed:    '#d03838',
        accentPink:   '#f0a8b0',
        accentGold:   '#d4a030',
        accentTeal:   '#40a0a0',
        // UI
        white:        '#ffffff',
        black:        '#000000',
        green:        '#30a840',
        red:          '#e04040',
        yellow:       '#f0d030',
        // Zzz
        zzzColor:     '#8888cc',
    };

    // ---- Screentone Pattern System ----
    let patternsCtx = null;
    const patterns = {};

    function createDotPattern(ctx, dotRadius, spacing, dotColor, bgColor) {
        const tile = document.createElement('canvas');
        tile.width = spacing;
        tile.height = spacing;
        const tc = tile.getContext('2d');
        if (bgColor) {
            tc.fillStyle = bgColor;
            tc.fillRect(0, 0, spacing, spacing);
        }
        tc.fillStyle = dotColor;
        tc.beginPath();
        tc.arc(spacing / 2, spacing / 2, dotRadius, 0, Math.PI * 2);
        tc.fill();
        return ctx.createPattern(tile, 'repeat');
    }

    function createLinePattern(ctx, lineW, spacing, angle, color, bgColor) {
        const size = spacing * 2;
        const tile = document.createElement('canvas');
        tile.width = size;
        tile.height = size;
        const tc = tile.getContext('2d');
        if (bgColor) {
            tc.fillStyle = bgColor;
            tc.fillRect(0, 0, size, size);
        }
        tc.strokeStyle = color;
        tc.lineWidth = lineW;
        tc.save();
        tc.translate(size / 2, size / 2);
        tc.rotate(angle);
        tc.translate(-size / 2, -size / 2);
        for (let i = -size; i < size * 2; i += spacing) {
            tc.beginPath();
            tc.moveTo(i, -size);
            tc.lineTo(i, size * 2);
            tc.stroke();
        }
        tc.restore();
        return ctx.createPattern(tile, 'repeat');
    }

    function createCrossHatchPattern(ctx, lineW, spacing, color, bgColor) {
        const tile = document.createElement('canvas');
        tile.width = spacing;
        tile.height = spacing;
        const tc = tile.getContext('2d');
        if (bgColor) {
            tc.fillStyle = bgColor;
            tc.fillRect(0, 0, spacing, spacing);
        }
        tc.strokeStyle = color;
        tc.lineWidth = lineW;
        tc.beginPath();
        tc.moveTo(0, 0);
        tc.lineTo(spacing, spacing);
        tc.moveTo(spacing, 0);
        tc.lineTo(0, spacing);
        tc.stroke();
        return ctx.createPattern(tile, 'repeat');
    }

    function initPatterns(ctx) {
        if (patternsCtx === ctx) return;
        patternsCtx = ctx;

        // Generic screentones
        patterns.dotLight   = createDotPattern(ctx, 0.8, 6, C.inkLight, C.paper);
        patterns.dotMedium  = createDotPattern(ctx, 1.0, 5, C.inkSoft, C.paper);
        patterns.dotDark    = createDotPattern(ctx, 1.2, 4, C.ink, C.paperDark);
        patterns.crossLight = createCrossHatchPattern(ctx, 0.4, 6, C.inkLight, C.paper);
        patterns.crossDark  = createCrossHatchPattern(ctx, 0.5, 5, C.inkSoft, C.paperDark);

        // Colored shirt patterns (manga screentone + color)
        patterns.shirtBlue    = createDotPattern(ctx, 0.7, 5, C.shirtBlueDk, C.shirtBlue);
        patterns.shirtRed     = createLinePattern(ctx, 0.5, 4, Math.PI / 4, C.shirtRedDk, C.shirtRed);
        patterns.shirtGreen   = createCrossHatchPattern(ctx, 0.4, 5, C.shirtGreenDk, C.shirtGreen);
        patterns.shirtYellow  = createDotPattern(ctx, 0.6, 6, C.shirtYellowDk, C.shirtYellow);
        patterns.shirtPink    = createLinePattern(ctx, 0.5, 5, -Math.PI / 4, C.shirtPinkDk, C.shirtPink);
        patterns.shirtOrange  = createDotPattern(ctx, 0.7, 4, C.shirtOrangeDk, C.shirtOrange);

        // Teacher dress
        patterns.teacherDress = createDotPattern(ctx, 0.8, 4, C.teacherDressDk, C.teacherDress);

        // Wood grain
        patterns.woodGrain = createLinePattern(ctx, 0.3, 3, 0, C.deskLeg, C.deskTop);
        patterns.woodGrainDk = createLinePattern(ctx, 0.4, 3, 0, C.deskLeg, C.deskFront);

        // Floor
        patterns.floor = createLinePattern(ctx, 0.3, 4, 0, C.floorWoodDk, C.floorWood);

        // Board
        patterns.boardFill = createDotPattern(ctx, 1.0, 3.5, '#1a3020', C.boardGreen);

        // Wall
        patterns.wallTone = createDotPattern(ctx, 0.4, 8, C.wallCreamDk, C.wallCream);

        // Window sky
        patterns.skyTone = createDotPattern(ctx, 0.5, 6, C.windowSkyDk, C.windowSky);
    }

    // Shirt pattern sets for diverse students
    const shirtPatternKeys = ['shirtBlue', 'shirtRed', 'shirtGreen', 'shirtYellow', 'shirtPink', 'shirtOrange'];
    const shirtSolidColors = [
        { main: C.shirtBlue, dark: C.shirtBlueDk },
        { main: C.shirtRed, dark: C.shirtRedDk },
        { main: C.shirtGreen, dark: C.shirtGreenDk },
        { main: C.shirtYellow, dark: C.shirtYellowDk },
        { main: C.shirtPink, dark: C.shirtPinkDk },
        { main: C.shirtOrange, dark: C.shirtOrangeDk },
    ];
    const hairFills = [C.hairBlack, C.hairBrown, C.hairBlonde, C.hairAuburn, C.hairDarkBlue];

    // Increased scale for portrait layout with large cells
    const SPRITE_SCALE = 4.0;

    function studentAppearance(col, row) {
        const cols = (typeof Grid !== 'undefined' && Grid.COLS) ? Grid.COLS : 5;
        const idx = row * cols + col;
        return {
            shirtPattern: shirtPatternKeys[idx % shirtPatternKeys.length],
            shirtSolid: shirtSolidColors[idx % shirtSolidColors.length],
            hair: hairFills[(idx * 3 + 1) % hairFills.length],
            hairStyle: idx % 4, // 0=straight, 1=wavy, 2=short, 3=ponytail
        };
    }

    // ---- Helpers ----
    function inkStroke(ctx, width) {
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = width || 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    function roundRectPath(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // ================================================================
    //  DESK
    // ================================================================
    function drawDesk(ctx, x, y, w, h) {
        const s = SPRITE_SCALE;
        const cx = x + w / 2;

        // Chair back bar
        ctx.fillStyle = C.chairBack;
        ctx.fillRect(cx - 7 * s, y + h - 14 * s, 14 * s, 2 * s);
        inkStroke(ctx, 1.2);
        ctx.strokeRect(cx - 7 * s, y + h - 14 * s, 14 * s, 2 * s);

        // Chair legs
        inkStroke(ctx, 1.2);
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, y + h - 12 * s);
        ctx.lineTo(cx - 6 * s, y + h - 6 * s);
        ctx.moveTo(cx + 5 * s, y + h - 12 * s);
        ctx.lineTo(cx + 5 * s, y + h - 6 * s);
        ctx.stroke();

        // Chair seat
        ctx.fillStyle = C.chairSeat;
        ctx.fillRect(cx - 7 * s, y + h - 6 * s, 14 * s, 2 * s);
        inkStroke(ctx, 1);
        ctx.strokeRect(cx - 7 * s, y + h - 6 * s, 14 * s, 2 * s);

        // Desk top surface
        ctx.fillStyle = patterns.woodGrain || C.deskTop;
        ctx.fillRect(cx - 9 * s, y + h - 20 * s, 18 * s, 3 * s);
        inkStroke(ctx, 1.5);
        ctx.strokeRect(cx - 9 * s, y + h - 20 * s, 18 * s, 3 * s);

        // Desk front panel
        ctx.fillStyle = patterns.woodGrainDk || C.deskFront;
        ctx.fillRect(cx - 9 * s, y + h - 17 * s, 18 * s, 3 * s);
        inkStroke(ctx, 1);
        ctx.strokeRect(cx - 9 * s, y + h - 17 * s, 18 * s, 3 * s);

        // Desk legs
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.moveTo(cx - 8 * s, y + h - 17 * s);
        ctx.lineTo(cx - 8 * s, y + h - 6 * s);
        ctx.moveTo(cx + 7 * s, y + h - 17 * s);
        ctx.lineTo(cx + 7 * s, y + h - 6 * s);
        ctx.stroke();
    }

    // ================================================================
    //  STUDENT WRITING (back view, colorful manga)
    // ================================================================
    function drawStudentWriting(ctx, x, y, w, h, col, row, frame) {
        const s = SPRITE_SCALE;
        const cx = x + w / 2;
        const app = studentAppearance(col, row);
        const animPhase = Math.floor(frame / 30) % 2;
        const armOff = animPhase === 0 ? 0 : s;

        // Exercise sheet on desk
        ctx.fillStyle = C.white;
        ctx.fillRect(cx - 4 * s, y + h - 19 * s, 8 * s, 5 * s);
        inkStroke(ctx, 0.5);
        ctx.strokeRect(cx - 4 * s, y + h - 19 * s, 8 * s, 5 * s);
        // Pencil lines on paper
        ctx.strokeStyle = C.inkLight;
        ctx.lineWidth = 0.5;
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - 3 * s, y + h - (18.5 - i) * s);
            ctx.lineTo(cx + 2 * s, y + h - (18.5 - i) * s);
            ctx.stroke();
        }

        // Body / torso (colored shirt with screentone)
        ctx.fillStyle = patterns[app.shirtPattern] || app.shirtSolid.main;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, y + h - 18 * s);
        ctx.lineTo(cx - 5 * s, y + h - 25 * s);
        ctx.quadraticCurveTo(cx - 5 * s, y + h - 26 * s, cx - 3 * s, y + h - 26 * s);
        ctx.lineTo(cx + 3 * s, y + h - 26 * s);
        ctx.quadraticCurveTo(cx + 5 * s, y + h - 26 * s, cx + 5 * s, y + h - 25 * s);
        ctx.lineTo(cx + 5 * s, y + h - 18 * s);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 1.5);
        ctx.stroke();

        // Collar (V-neck)
        ctx.strokeStyle = app.shirtSolid.dark;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * s, y + h - 26 * s);
        ctx.lineTo(cx, y + h - 24 * s);
        ctx.lineTo(cx + 2 * s, y + h - 26 * s);
        ctx.stroke();

        // Arms
        ctx.fillStyle = app.shirtSolid.main;
        // Left arm
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, y + h - 24 * s);
        ctx.quadraticCurveTo(cx - 7 * s, y + h - 22 * s, cx - 7 * s, y + h - 19 * s);
        ctx.lineTo(cx - 5.5 * s, y + h - 19 * s);
        ctx.quadraticCurveTo(cx - 5.5 * s, y + h - 22 * s, cx - 4 * s, y + h - 24 * s);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 1.2);
        ctx.stroke();
        // Right arm (animated)
        ctx.fillStyle = app.shirtSolid.main;
        ctx.beginPath();
        ctx.moveTo(cx + 5 * s, y + h - 24 * s);
        ctx.quadraticCurveTo(cx + 7 * s, y + h - 22 * s, cx + 5 * s + armOff, y + h - 19 * s);
        ctx.lineTo(cx + 4 * s + armOff, y + h - 19 * s);
        ctx.quadraticCurveTo(cx + 5.5 * s, y + h - 22 * s, cx + 4 * s, y + h - 24 * s);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 1.2);
        ctx.stroke();

        // Hands
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx - 6.5 * s, y + h - 18.5 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 0.8);
        ctx.stroke();
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx + 5 * s + armOff, y + h - 18.5 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pencil
        ctx.strokeStyle = C.accentGold;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + 5 * s + armOff, y + h - 20 * s);
        ctx.lineTo(cx + 5 * s + armOff + s, y + h - 17 * s);
        ctx.stroke();
        // Pencil tip
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + 5 * s + armOff + s, y + h - 17.5 * s);
        ctx.lineTo(cx + 5 * s + armOff + s * 0.5, y + h - 16.5 * s);
        ctx.stroke();

        // Neck
        ctx.fillStyle = C.skin;
        ctx.fillRect(cx - 1.5 * s, y + h - 27 * s, 3 * s, 2 * s);

        // Head (oval, back view)
        ctx.fillStyle = app.hair;
        ctx.beginPath();
        ctx.ellipse(cx, y + h - 30 * s, 5 * s, 5.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1.5);
        ctx.stroke();

        // Ears
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx - 5 * s, y + h - 29 * s, 1.3 * s, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 0.8);
        ctx.stroke();
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx + 5 * s, y + h - 29 * s, 1.3 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hair strands (manga flowing lines, varied by style)
        inkStroke(ctx, 1);
        const hairLen = app.hairStyle === 2 ? 3 : (app.hairStyle === 3 ? 8 : (app.hairStyle === 1 ? 7 : 6));
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * 2 * s, y + h - 35 * s);
            if (app.hairStyle === 1) {
                // Wavy
                ctx.bezierCurveTo(
                    cx + (i * 2 + 1.5) * s, y + h - 32 * s,
                    cx + (i * 2 - 1.5) * s, y + h - 29 * s,
                    cx + i * 2.5 * s, y + h - (35 - hairLen) * s + hairLen * s
                );
            } else if (app.hairStyle === 3) {
                // Ponytail: strands converge to one side
                ctx.quadraticCurveTo(
                    cx + (i + 3) * 2 * s, y + h - 28 * s,
                    cx + 6 * s, y + h - (35 - hairLen) * s + hairLen * s
                );
            } else {
                // Straight flowing
                ctx.quadraticCurveTo(
                    cx + i * 2.5 * s, y + h - 30 * s,
                    cx + i * 2.2 * s, y + h - (35 - hairLen) * s + hairLen * s
                );
            }
            ctx.stroke();
        }

        // Ponytail ribbon
        if (app.hairStyle === 3) {
            ctx.fillStyle = C.accentRed;
            ctx.beginPath();
            ctx.arc(cx + 6 * s, y + h - 27 * s, 1.5 * s, 0, Math.PI * 2);
            ctx.fill();
            inkStroke(ctx, 0.6);
            ctx.stroke();
        }

        // Hair highlight shine
        ctx.strokeStyle = C.white;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(cx - 1 * s, y + h - 34 * s);
        ctx.quadraticCurveTo(cx, y + h - 31 * s, cx + s, y + h - 28 * s);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  STUDENT SLEEPING (colorful manga)
    // ================================================================
    function drawStudentSleeping(ctx, x, y, w, h, col, row, frame) {
        const s = SPRITE_SCALE;
        const cx = x + w / 2;
        const app = studentAppearance(col, row);

        // Body slumped forward
        ctx.fillStyle = patterns[app.shirtPattern] || app.shirtSolid.main;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, y + h - 18 * s);
        ctx.lineTo(cx - 5 * s, y + h - 23 * s);
        ctx.quadraticCurveTo(cx, y + h - 25 * s, cx + 5 * s, y + h - 23 * s);
        ctx.lineTo(cx + 5 * s, y + h - 18 * s);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 1.5);
        ctx.stroke();

        // Arms splayed
        ctx.fillStyle = app.shirtSolid.main;
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, y + h - 22 * s);
        ctx.quadraticCurveTo(cx - 8 * s, y + h - 20 * s, cx - 8 * s, y + h - 19 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 5 * s, y + h - 22 * s);
        ctx.quadraticCurveTo(cx + 8 * s, y + h - 20 * s, cx + 8 * s, y + h - 19 * s);
        ctx.stroke();

        // Hands
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx - 8 * s, y + h - 18.5 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 0.8);
        ctx.stroke();
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx + 8 * s, y + h - 18.5 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head face-down (hair spread)
        ctx.fillStyle = app.hair;
        ctx.beginPath();
        ctx.ellipse(cx, y + h - 22 * s, 6 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1.5);
        ctx.stroke();

        // Hair spread detail
        inkStroke(ctx, 0.8);
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * 2 * s, y + h - 25 * s);
            ctx.quadraticCurveTo(cx + i * 3 * s, y + h - 22 * s, cx + i * 3 * s, y + h - 19 * s);
            ctx.stroke();
        }

        drawSleepBubble(ctx, cx, y + h - 30 * s, frame);
    }

    // ================================================================
    //  SLEEP BUBBLE (cloud style with Zzz)
    // ================================================================
    function drawSleepBubble(ctx, x, y, frame) {
        const bob = Math.sin(frame * 0.06) * 2;
        const bw = 40;
        const bh = 22;
        const bx = x - bw / 2 + 10;
        const by = y - bh + bob - 4;

        // Cloud bubble
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.arc(bx + 8, by + 10, 11, 0, Math.PI * 2);
        ctx.arc(bx + 22, by + 8, 12, 0, Math.PI * 2);
        ctx.arc(bx + 34, by + 11, 10, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1.2);
        ctx.beginPath();
        ctx.arc(bx + 8, by + 10, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx + 22, by + 8, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx + 34, by + 11, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Cloud tail dots
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.arc(bx + 2, by + bh + 3, 3.5, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 0.8);
        ctx.stroke();
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.arc(bx - 2, by + bh + 9, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // "Zzz" in purple
        const pulse = 0.7 + Math.sin(frame * 0.12) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = C.zzzColor;
        ctx.font = 'bold italic 14px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Zzz', bx + 21, by + 10);
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // ================================================================
    //  TEACHER BACK (facing blackboard)
    // ================================================================
    function drawTeacherBack(ctx, x, y, w, h, frame) {
        const s = Math.floor(w / 16);
        const cx = x + w / 2;

        // Legs
        ctx.fillStyle = C.skin;
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.moveTo(cx - 3 * s, y + 20 * s);
        ctx.lineTo(cx - 3 * s, y + 24 * s);
        ctx.lineTo(cx - 1 * s, y + 24 * s);
        ctx.lineTo(cx - 1 * s, y + 20 * s);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 1 * s, y + 20 * s);
        ctx.lineTo(cx + 1 * s, y + 24 * s);
        ctx.lineTo(cx + 3 * s, y + 24 * s);
        ctx.lineTo(cx + 3 * s, y + 20 * s);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Shoes
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.ellipse(cx - 2 * s, y + 24.5 * s, 2 * s, s * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 2 * s, y + 24.5 * s, 2 * s, s * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dress (purple A-line)
        ctx.fillStyle = patterns.teacherDress || C.teacherDress;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, y + 7 * s);
        ctx.lineTo(cx - 6 * s, y + 20 * s);
        ctx.lineTo(cx + 6 * s, y + 20 * s);
        ctx.lineTo(cx + 4 * s, y + 7 * s);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 2);
        ctx.stroke();

        // Belt
        ctx.fillStyle = C.teacherDressDk;
        ctx.fillRect(cx - 4.5 * s, y + 11.5 * s, 9 * s, 1.5 * s);
        inkStroke(ctx, 1);
        ctx.strokeRect(cx - 4.5 * s, y + 11.5 * s, 9 * s, 1.5 * s);

        // Arms
        const armAnim = Math.floor(frame / 40) % 2 === 0 ? 0 : s;
        // Left arm (reaching up)
        ctx.fillStyle = C.teacherDressLt;
        inkStroke(ctx, 2);
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, y + 8 * s);
        ctx.quadraticCurveTo(cx - 8 * s, y + 6 * s, cx - 7 * s, y + 4 * s + armAnim);
        ctx.stroke();
        // Right arm
        ctx.beginPath();
        ctx.moveTo(cx + 4 * s, y + 8 * s);
        ctx.quadraticCurveTo(cx + 7 * s, y + 10 * s, cx + 6 * s, y + 13 * s);
        ctx.stroke();

        // Hands
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx - 7 * s, y + 4 * s + armAnim, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1);
        ctx.stroke();
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx + 6 * s, y + 13 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Chalk piece
        ctx.fillStyle = C.chalk;
        ctx.beginPath();
        ctx.moveTo(cx - 7.5 * s, y + 2.5 * s + armAnim);
        ctx.lineTo(cx - 6.5 * s, y + 2.5 * s + armAnim);
        ctx.lineTo(cx - 6.8 * s, y + 1 * s + armAnim);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 0.6);
        ctx.stroke();

        // Head (back view)
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.ellipse(cx, y + 4 * s, 3.5 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Long dark hair (full head + flowing down back)
        ctx.fillStyle = C.hairBlack;
        ctx.beginPath();
        ctx.ellipse(cx, y + 3.5 * s, 4.2 * s, 4.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair cascade
        ctx.beginPath();
        ctx.moveTo(cx - 3.8 * s, y + 6 * s);
        ctx.quadraticCurveTo(cx - 4.5 * s, y + 12 * s, cx - 3 * s, y + 15 * s);
        ctx.lineTo(cx + 3 * s, y + 15 * s);
        ctx.quadraticCurveTo(cx + 4.5 * s, y + 12 * s, cx + 3.8 * s, y + 6 * s);
        ctx.closePath();
        ctx.fill();

        // Hair strand lines
        ctx.strokeStyle = C.tone5;
        ctx.lineWidth = 0.8;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * 1.2 * s, y + 1 * s);
            ctx.bezierCurveTo(
                cx + i * 1.6 * s, y + 6 * s,
                cx + i * 1.3 * s, y + 10 * s,
                cx + i * 1.4 * s, y + 15 * s
            );
            ctx.stroke();
        }

        // Hair outline
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.ellipse(cx, y + 3.5 * s, 4.2 * s, 4.5 * s, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Hair shine
        ctx.strokeStyle = '#5050a0';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.moveTo(cx - s, y + 1 * s);
        ctx.quadraticCurveTo(cx + 0.5 * s, y + 4 * s, cx - 0.5 * s, y + 7 * s);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  TEACHER FRONT (facing students - shojo eyes)
    // ================================================================
    function drawTeacherFront(ctx, x, y, w, h, frame) {
        const s = Math.floor(w / 16);
        const cx = x + w / 2;

        // Legs
        ctx.fillStyle = C.skin;
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.moveTo(cx - 3 * s, y + 20 * s);
        ctx.lineTo(cx - 3 * s, y + 24 * s);
        ctx.lineTo(cx - 1 * s, y + 24 * s);
        ctx.lineTo(cx - 1 * s, y + 20 * s);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 1 * s, y + 20 * s);
        ctx.lineTo(cx + 1 * s, y + 24 * s);
        ctx.lineTo(cx + 3 * s, y + 24 * s);
        ctx.lineTo(cx + 3 * s, y + 20 * s);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Shoes
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.ellipse(cx - 2 * s, y + 24.5 * s, 2 * s, s * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 2 * s, y + 24.5 * s, 2 * s, s * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dress body
        ctx.fillStyle = patterns.teacherDress || C.teacherDress;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, y + 7 * s);
        ctx.lineTo(cx - 6 * s, y + 20 * s);
        ctx.lineTo(cx + 6 * s, y + 20 * s);
        ctx.lineTo(cx + 4 * s, y + 7 * s);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 2);
        ctx.stroke();

        // Belt
        ctx.fillStyle = C.teacherDressDk;
        ctx.fillRect(cx - 4.5 * s, y + 11.5 * s, 9 * s, 1.5 * s);
        inkStroke(ctx, 1);
        ctx.strokeRect(cx - 4.5 * s, y + 11.5 * s, 9 * s, 1.5 * s);

        // Arms crossed
        ctx.fillStyle = C.teacherDressLt;
        inkStroke(ctx, 2);
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, y + 8 * s);
        ctx.quadraticCurveTo(cx - 7 * s, y + 10 * s, cx - 5 * s, y + 13 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * s, y + 8 * s);
        ctx.quadraticCurveTo(cx + 7 * s, y + 10 * s, cx + 5 * s, y + 13 * s);
        ctx.stroke();

        // Hands
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx - 5 * s, y + 13 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1);
        ctx.stroke();
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx + 5 * s, y + 13 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Neck
        ctx.fillStyle = C.skin;
        ctx.fillRect(cx - 1.5 * s, y + 5.5 * s, 3 * s, 2 * s);

        // Face
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.ellipse(cx, y + 3.5 * s, 3.5 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1.5);
        ctx.stroke();

        // BIG MANGA EYES
        drawMangaEye(ctx, cx - 2 * s, y + 3.5 * s, s * 1.7, true, '#5040a0');
        drawMangaEye(ctx, cx + 2 * s, y + 3.5 * s, s * 1.7, false, '#5040a0');

        // Eyebrows (stern)
        inkStroke(ctx, 2);
        ctx.beginPath();
        ctx.moveTo(cx - 3.5 * s, y + 1.5 * s);
        ctx.lineTo(cx - 1 * s, y + 2 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 3.5 * s, y + 1.5 * s);
        ctx.lineTo(cx + 1 * s, y + 2 * s);
        ctx.stroke();

        // Nose
        inkStroke(ctx, 1);
        ctx.beginPath();
        ctx.moveTo(cx, y + 4 * s);
        ctx.lineTo(cx - 0.3 * s, y + 4.8 * s);
        ctx.stroke();

        // Mouth
        ctx.strokeStyle = C.accentRed;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 1.2 * s, y + 5.5 * s);
        ctx.quadraticCurveTo(cx, y + 5.2 * s, cx + 1.2 * s, y + 5.5 * s);
        ctx.stroke();

        // Blush marks
        ctx.strokeStyle = C.accentPink;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - 3.5 * s + i * 0.7 * s, y + 4 * s);
            ctx.lineTo(cx - 3 * s + i * 0.7 * s, y + 5 * s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 2 * s + i * 0.7 * s, y + 4 * s);
            ctx.lineTo(cx + 2.5 * s + i * 0.7 * s, y + 5 * s);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        // Hair (front view, dark with purple tint)
        ctx.fillStyle = C.hairBlack;
        // Top
        ctx.beginPath();
        ctx.ellipse(cx, y + 1.5 * s, 4.5 * s, 3 * s, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        // Side strands
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, y + 2 * s);
        ctx.quadraticCurveTo(cx - 5 * s, y + 5 * s, cx - 4.5 * s, y + 8 * s);
        ctx.lineTo(cx - 3.5 * s, y + 8 * s);
        ctx.quadraticCurveTo(cx - 3.5 * s, y + 5 * s, cx - 3.5 * s, y + 2 * s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * s, y + 2 * s);
        ctx.quadraticCurveTo(cx + 5 * s, y + 5 * s, cx + 4.5 * s, y + 8 * s);
        ctx.lineTo(cx + 3.5 * s, y + 8 * s);
        ctx.quadraticCurveTo(cx + 3.5 * s, y + 5 * s, cx + 3.5 * s, y + 2 * s);
        ctx.closePath();
        ctx.fill();

        // Hair outline
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.ellipse(cx, y + 1.5 * s, 4.5 * s, 3 * s, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        // Bangs detail
        inkStroke(ctx, 1);
        ctx.beginPath();
        ctx.moveTo(cx - 2 * s, y); ctx.quadraticCurveTo(cx - 1.5 * s, y + 2.5 * s, cx - 2 * s, y + 2.5 * s); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, y - 0.5 * s); ctx.quadraticCurveTo(cx + 0.5 * s, y + 2 * s, cx, y + 3 * s); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 2 * s, y); ctx.quadraticCurveTo(cx + 1.5 * s, y + 2.5 * s, cx + 2 * s, y + 2.5 * s); ctx.stroke();

        // Hair shine (purple tinted)
        ctx.strokeStyle = '#7060c0';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(cx - s, y + 0.5 * s, 2.2 * s, -0.3, 0.8);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  MANGA EYE (with colored iris)
    // ================================================================
    function drawMangaEye(ctx, ex, ey, size, isLeft, irisColor) {
        const color = irisColor || '#5040a0';

        // Eye white
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.ellipse(ex, ey, size * 1.1, size * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1.5);
        ctx.stroke();

        // Iris (colored!)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(ex, ey + size * 0.1, size * 0.75, size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        // Iris darker ring
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Iris gradient effect (lighter center)
        ctx.fillStyle = C.white;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.ellipse(ex, ey - size * 0.1, size * 0.5, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Pupil
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.ellipse(ex, ey + size * 0.15, size * 0.35, size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Star reflection (signature shojo highlight!)
        ctx.fillStyle = C.white;
        const sx = ex + (isLeft ? -size * 0.25 : size * 0.25);
        const sy = ey - size * 0.2;
        drawSparkle4pt(ctx, sx, sy, size * 0.35);

        // Secondary highlight
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.arc(ex + (isLeft ? size * 0.2 : -size * 0.2), ey + size * 0.3, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Upper eyelash (bold)
        inkStroke(ctx, 2);
        ctx.beginPath();
        ctx.ellipse(ex, ey - size * 0.1, size * 1.2, size * 0.7, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        // Lash spikes
        inkStroke(ctx, 1.2);
        const ld = isLeft ? -1 : 1;
        for (let i = 0; i < 3; i++) {
            const a = Math.PI + (i - 1) * 0.3 + ld * 0.2;
            ctx.beginPath();
            ctx.moveTo(ex + Math.cos(a) * size * 1.1, ey - size * 0.1 + Math.sin(a) * size * 0.6);
            ctx.lineTo(ex + Math.cos(a) * size * 1.6, ey - size * 0.1 + Math.sin(a) * size * 1.0);
            ctx.stroke();
        }
    }

    // ================================================================
    //  WARNING BUBBLE (jagged manga burst)
    // ================================================================
    function drawWarningBubble(ctx, x, y, size, frame) {
        const pulse = Math.sin(frame * 0.2) * 2;
        const by = y - size - 4 + pulse;
        const r = size * 0.8;

        // Jagged burst
        ctx.fillStyle = C.white;
        ctx.beginPath();
        const spikes = 10;
        for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2 - Math.PI / 2;
            const outerR = r * (1.0 + (i % 2) * 0.5);
            ctx.lineTo(x + Math.cos(angle) * outerR, by + r * 0.4 + Math.sin(angle) * outerR);
        }
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 2);
        ctx.stroke();

        // Tail
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.moveTo(x - 3, by + r * 1.2);
        ctx.lineTo(x + 3, by + r * 1.2);
        ctx.lineTo(x, by + r * 1.7);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.moveTo(x - 3, by + r * 1.2);
        ctx.lineTo(x, by + r * 1.7);
        ctx.lineTo(x + 3, by + r * 1.2);
        ctx.stroke();

        // Red exclamation
        ctx.fillStyle = C.accentRed;
        ctx.font = `bold ${Math.floor(size * 0.9)}px 'Bangers', Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', x, by + r * 0.4);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // ================================================================
    //  NOTE (manga-style folded letter with heart)
    // ================================================================
    function drawNote(ctx, x, y, size) {
        const s = Math.max(1, Math.floor(size / 6));
        const pw = 8 * s;
        const ph = 6 * s;

        // Shadow
        ctx.fillStyle = 'rgba(26, 21, 16, 0.15)';
        ctx.fillRect(x - pw / 2 + 2, y - ph / 2 + 2, pw, ph);

        // Paper
        ctx.fillStyle = '#fffff0';
        ctx.fillRect(x - pw / 2, y - ph / 2, pw, ph);
        inkStroke(ctx, 1.2);
        ctx.strokeRect(x - pw / 2, y - ph / 2, pw, ph);

        // Fold corner
        ctx.fillStyle = C.paperDark;
        const foldS = Math.max(2, s);
        ctx.beginPath();
        ctx.moveTo(x + pw / 2 - 2 * foldS, y - ph / 2);
        ctx.lineTo(x + pw / 2, y - ph / 2);
        ctx.lineTo(x + pw / 2, y - ph / 2 + 2 * foldS);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 0.8);
        ctx.stroke();

        // Squiggly text lines
        ctx.strokeStyle = '#7070b0';
        ctx.lineWidth = 0.8;
        const lineGap = Math.max(2, Math.floor(ph / 5));
        for (let i = 0; i < 3; i++) {
            const ly = y - ph / 2 + s + (i + 1) * lineGap;
            const lx = x - pw / 2 + s;
            const lw = pw * (0.5 + Math.sin(i * 1.5) * 0.15);
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.quadraticCurveTo(lx + lw * 0.3, ly - 1, lx + lw * 0.5, ly + 0.5);
            ctx.quadraticCurveTo(lx + lw * 0.7, ly + 1.5, lx + lw, ly);
            ctx.stroke();
        }

        // Heart
        if (size >= 16) {
            ctx.fillStyle = C.accentPink;
            ctx.globalAlpha = 0.7;
            const hx = x + pw / 2 - 3.5 * s;
            const hy = y + ph / 2 - 2.5 * s;
            ctx.beginPath();
            ctx.moveTo(hx, hy + 1.5);
            ctx.bezierCurveTo(hx - 3, hy - 2, hx - 5, hy + 1, hx, hy + 4);
            ctx.bezierCurveTo(hx + 5, hy + 1, hx + 3, hy - 2, hx, hy + 1.5);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    // ================================================================
    //  BLACKBOARD (green with chalk - colorful)
    // ================================================================
    function drawBlackboard(ctx, x, y, w, h) {
        // Frame (warm wood)
        ctx.fillStyle = C.boardFrame;
        ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
        inkStroke(ctx, 2);
        ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);

        // Green board
        ctx.fillStyle = patterns.boardFill || C.boardGreen;
        ctx.fillRect(x, y, w, h);
        inkStroke(ctx, 1.5);
        ctx.strokeRect(x, y, w, h);

        // Chalk writing
        ctx.strokeStyle = C.chalk;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        const lineH = Math.floor(h / 6);
        for (let i = 1; i <= 4; i++) {
            const lw = 20 + Math.sin(i * 2.7) * 40 + 30;
            ctx.beginPath();
            ctx.moveTo(x + 15, y + i * lineH);
            ctx.quadraticCurveTo(x + 15 + lw * 0.3, y + i * lineH - 2, x + 15 + lw, y + i * lineH + 1);
            ctx.stroke();
        }

        // Colored chalk formula
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = C.chalkYellow;
        ctx.font = `${Math.floor(h / 3.5)}px Georgia, serif`;
        ctx.fillText('2+2=?', x + w - 100, y + h / 2 + 4);
        ctx.globalAlpha = 1.0;

        // Chalk ledge
        ctx.fillStyle = C.boardFrame;
        ctx.fillRect(x - 5, y + h + 5, w + 10, 7);
        inkStroke(ctx, 1);
        ctx.strokeRect(x - 5, y + h + 5, w + 10, 7);

        // Chalk pieces (colored!)
        ctx.fillStyle = C.chalk;
        roundRectPath(ctx, x + 20, y + h + 6, 14, 5, 1);
        ctx.fill();
        inkStroke(ctx, 0.5);
        ctx.stroke();
        ctx.fillStyle = C.chalkYellow;
        roundRectPath(ctx, x + 42, y + h + 6, 10, 5, 1);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = C.accentPink;
        roundRectPath(ctx, x + 60, y + h + 6, 8, 5, 1);
        ctx.fill();
        ctx.stroke();
    }

    // ================================================================
    //  NERD STAR (golden sparkle cluster)
    // ================================================================
    function drawNerdStar(ctx, x, y, size) {
        ctx.fillStyle = C.accentGold;
        drawSparkle4pt(ctx, x, y, size * 0.5);
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = C.yellow;
        drawSparkle4pt(ctx, x - size * 0.5, y - size * 0.2, size * 0.22);
        drawSparkle4pt(ctx, x + size * 0.4, y - size * 0.3, size * 0.28);
        drawSparkle4pt(ctx, x + size * 0.3, y + size * 0.3, size * 0.17);
        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  DUNCE MARKER (manga crying face)
    // ================================================================
    function drawDunceMarker(ctx, x, y, size, frame) {
        const bob = Math.sin(frame * 0.06) * 2;
        const bw = 30;
        const bh = 26;
        const bx = x - bw / 2;
        const by = y - bh + bob;

        // Rounded bubble
        ctx.fillStyle = C.white;
        roundRectPath(ctx, bx, by, bw, bh, 5);
        ctx.fill();
        inkStroke(ctx, 1.2);
        ctx.stroke();

        // Tail
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.moveTo(x - 4, by + bh);
        ctx.lineTo(x + 4, by + bh);
        ctx.lineTo(x, by + bh + 7);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 1);
        ctx.beginPath();
        ctx.moveTo(x - 4, by + bh);
        ctx.lineTo(x, by + bh + 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 4, by + bh);
        ctx.lineTo(x, by + bh + 7);
        ctx.stroke();

        // Crying face
        const fcx = x;
        const fcy = by + bh / 2;

        // Closed crying eyes
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.arc(fcx - 5, fcy - 2, 3.5, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(fcx + 5, fcy - 2, 3.5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Blue tear drops
        ctx.fillStyle = '#6688cc';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(fcx - 5, fcy + 1);
        ctx.quadraticCurveTo(fcx - 7, fcy + 5, fcx - 5, fcy + 7);
        ctx.quadraticCurveTo(fcx - 3, fcy + 5, fcx - 5, fcy + 1);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(fcx + 5, fcy + 1);
        ctx.quadraticCurveTo(fcx + 3, fcy + 5, fcx + 5, fcy + 7);
        ctx.quadraticCurveTo(fcx + 7, fcy + 5, fcx + 5, fcy + 1);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Open mouth
        inkStroke(ctx, 1);
        ctx.beginPath();
        ctx.ellipse(fcx, fcy + 5, 3, 2.2, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // ================================================================
    //  HIGHLIGHT (golden manga emphasis)
    // ================================================================
    function drawHighlight(ctx, x, y, w, h, frame) {
        const ccx = x + w / 2;
        const ccy = y + h / 2;
        const alpha = 0.2 + Math.sin(frame * 0.1) * 0.1;
        const count = 14;

        ctx.strokeStyle = C.accentGold;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = alpha;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const innerR = Math.max(w, h) * 0.35;
            const outerR = Math.max(w, h) * 0.58;
            ctx.beginPath();
            ctx.moveTo(ccx + Math.cos(angle) * innerR, ccy + Math.sin(angle) * innerR);
            ctx.lineTo(ccx + Math.cos(angle) * outerR, ccy + Math.sin(angle) * outerR);
            ctx.stroke();
        }

        // Soft golden glow
        ctx.fillStyle = `rgba(212, 160, 48, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(ccx, ccy, w * 0.4, h * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  MANGA EFFECT HELPERS
    // ================================================================

    function drawSparkle4pt(ctx, sx, sy, size) {
        ctx.beginPath();
        ctx.moveTo(sx, sy - size);
        ctx.lineTo(sx + size * 0.2, sy - size * 0.2);
        ctx.lineTo(sx + size, sy);
        ctx.lineTo(sx + size * 0.2, sy + size * 0.2);
        ctx.lineTo(sx, sy + size);
        ctx.lineTo(sx - size * 0.2, sy + size * 0.2);
        ctx.lineTo(sx - size, sy);
        ctx.lineTo(sx - size * 0.2, sy - size * 0.2);
        ctx.closePath();
        ctx.fill();
    }

    function drawSpeedLines(ctx, cx, cy, innerR, outerR, count, alpha, lineW) {
        ctx.save();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = lineW || 1;
        ctx.globalAlpha = alpha || 0.3;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + (i * 0.618);
            const iR = innerR + Math.sin(i * 3.7) * innerR * 0.3;
            const oR = outerR + Math.sin(i * 2.3) * outerR * 0.15;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * iR, cy + Math.sin(angle) * iR);
            ctx.lineTo(cx + Math.cos(angle) * oR, cy + Math.sin(angle) * oR);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawSparkles(ctx, x, y, size, frame, count) {
        const n = count || 5;
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * Math.PI * 2 + frame * 0.02;
            const dist = size * (0.5 + Math.sin(frame * 0.03 + i * 1.5) * 0.3);
            const sx = x + Math.cos(angle) * dist;
            const sy = y + Math.sin(angle) * dist;
            const sz = size * 0.1 * (0.6 + Math.sin(frame * 0.05 + i) * 0.4);
            ctx.fillStyle = i % 2 === 0 ? C.accentGold : C.accentPink;
            ctx.globalAlpha = 0.35 + Math.sin(frame * 0.06 + i * 0.8) * 0.2;
            drawSparkle4pt(ctx, sx, sy, sz);
        }
        ctx.globalAlpha = 1.0;
    }

    function drawFlower(ctx, x, y, size, alpha) {
        ctx.globalAlpha = alpha || 0.4;
        ctx.fillStyle = C.accentPink;
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.ellipse(
                x + Math.cos(a) * size * 0.5,
                y + Math.sin(a) * size * 0.5,
                size * 0.4, size * 0.25, a, 0, Math.PI * 2
            );
            ctx.fill();
        }
        ctx.fillStyle = C.yellow;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    function drawMotionTrail(ctx, x, y, dx, dy, size) {
        ctx.strokeStyle = C.inkLight;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.3;
        for (let i = 1; i <= 4; i++) {
            const tx = x - dx * i * 5;
            const ty = y - dy * i * 5;
            ctx.beginPath();
            ctx.moveTo(tx - size * 0.35, ty);
            ctx.lineTo(tx + size * 0.35, ty);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
    }

    return {
        C,
        patterns,
        initPatterns,
        drawDesk,
        drawStudentWriting,
        drawStudentSleeping,
        drawTeacherBack,
        drawTeacherFront,
        drawWarningBubble,
        drawNote,
        drawBlackboard,
        drawNerdStar,
        drawDunceMarker,
        drawHighlight,
        studentAppearance,
        drawSpeedLines,
        drawSparkles,
        drawSparkle4pt,
        drawFlower,
        drawMotionTrail,
        drawMangaEye,
        roundRectPath,
    };
})();
