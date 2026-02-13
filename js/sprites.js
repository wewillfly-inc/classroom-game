// ============================================================
// sprites.js - Manga Style Sprite Definitions & Drawing Utilities
// Inspired by 1960s shojo manga (Attack No.1 / Mila, Superstar)
// ============================================================

const Sprites = (() => {
    // ---- Manga Color Palette (warm monochrome + red accent) ----
    const C = {
        // Ink
        ink:          '#1a1510',
        inkSoft:      '#3a3530',
        inkLight:     '#6a6055',
        // Paper
        paper:        '#f5f0e0',
        paperDark:    '#e8e0c8',
        paperWarm:    '#f0e8d0',
        // Screentone shades (warm gray)
        tone1:        '#e0d8c8',
        tone2:        '#c8c0a8',
        tone3:        '#a09880',
        tone4:        '#787060',
        tone5:        '#504840',
        // Accent
        accentRed:    '#c83030',
        accentPink:   '#e8a8a8',
        // Functional
        white:        '#ffffff',
        black:        '#000000',
        // Character
        skin:         '#f0d8c0',
        skinShade:    '#d8c0a0',
        blush:        '#e8b0a0',
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

    // Initialize all screentone patterns (call after canvas context is ready)
    function initPatterns(ctx) {
        if (patternsCtx === ctx) return;
        patternsCtx = ctx;

        // Dot screentones at different densities
        patterns.dotLight   = createDotPattern(ctx, 0.8, 6, C.inkLight, C.paper);
        patterns.dotMedium  = createDotPattern(ctx, 1.0, 5, C.inkSoft, C.paper);
        patterns.dotDark    = createDotPattern(ctx, 1.2, 4, C.ink, C.paperDark);
        patterns.dotVDark   = createDotPattern(ctx, 1.5, 4, C.ink, C.tone3);

        // Line patterns for clothing variety
        patterns.horzLines  = createLinePattern(ctx, 0.6, 4, 0, C.inkLight, C.paper);
        patterns.diagLines  = createLinePattern(ctx, 0.6, 5, Math.PI / 4, C.inkSoft, C.paper);
        patterns.vertLines  = createLinePattern(ctx, 0.6, 4, Math.PI / 2, C.inkLight, C.paper);

        // Cross-hatch
        patterns.crossLight = createCrossHatchPattern(ctx, 0.4, 6, C.inkLight, C.paper);
        patterns.crossDark  = createCrossHatchPattern(ctx, 0.5, 5, C.inkSoft, C.paperDark);

        // Wood grain (horizontal lines for desks)
        patterns.woodGrain  = createLinePattern(ctx, 0.3, 3, 0, C.tone3, C.tone1);

        // Floor
        patterns.floor      = createLinePattern(ctx, 0.4, 5, Math.PI / 6, C.tone3, C.paperDark);

        // Dark solid for blackboard
        patterns.boardFill  = createDotPattern(ctx, 1.4, 3.5, C.ink, C.tone5);
    }

    // Shirt pattern sets for student variety
    const shirtPatternKeys = ['dotLight', 'horzLines', 'diagLines', 'crossLight', 'dotMedium'];
    const hairFills = [C.ink, C.tone4, C.tone5, C.ink]; // black, brown-ish, dark, black

    const SPRITE_SCALE = 2;

    // Deterministic appearance from grid position
    function studentAppearance(col, row) {
        const cols = (typeof Grid !== 'undefined' && Grid.COLS) ? Grid.COLS : 5;
        const idx = row * cols + col;
        return {
            shirtPattern: shirtPatternKeys[idx % shirtPatternKeys.length],
            hair: hairFills[(idx * 3 + 1) % hairFills.length],
            hairStyle: idx % 3, // 0 = straight, 1 = wavy, 2 = short
        };
    }

    // ---- Helper: Set ink stroke style ----
    function inkStroke(ctx, width) {
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = width || 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    // ---- Helper: Rounded rectangle path ----
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
    //  DESK (seen from behind, line art with screentone)
    // ================================================================
    function drawDesk(ctx, x, y, w, h) {
        const s = SPRITE_SCALE;
        const cx = x + w / 2;

        // Chair back (thin horizontal bar)
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.moveTo(cx - 7 * s, y + h - 14 * s);
        ctx.lineTo(cx + 7 * s, y + h - 14 * s);
        ctx.stroke();

        // Chair vertical supports
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, y + h - 14 * s);
        ctx.lineTo(cx - 5 * s, y + h - 12 * s);
        ctx.moveTo(cx + 5 * s, y + h - 14 * s);
        ctx.lineTo(cx + 5 * s, y + h - 12 * s);
        ctx.stroke();

        // Chair legs
        inkStroke(ctx, 1);
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, y + h - 12 * s);
        ctx.lineTo(cx - 6 * s, y + h - 6 * s);
        ctx.moveTo(cx + 5 * s, y + h - 12 * s);
        ctx.lineTo(cx + 5 * s, y + h - 6 * s);
        ctx.stroke();

        // Chair seat
        ctx.fillStyle = patterns.dotLight || C.tone1;
        ctx.fillRect(cx - 7 * s, y + h - 6 * s, 14 * s, 2 * s);
        inkStroke(ctx, 1);
        ctx.strokeRect(cx - 7 * s, y + h - 6 * s, 14 * s, 2 * s);

        // Desk top surface
        ctx.fillStyle = patterns.woodGrain || C.tone1;
        ctx.fillRect(cx - 9 * s, y + h - 20 * s, 18 * s, 3 * s);
        inkStroke(ctx, 1.5);
        ctx.strokeRect(cx - 9 * s, y + h - 20 * s, 18 * s, 3 * s);

        // Desk front panel
        ctx.fillStyle = patterns.dotMedium || C.tone2;
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
    //  STUDENT WRITING (back view, manga style)
    // ================================================================
    function drawStudentWriting(ctx, x, y, w, h, col, row, frame) {
        const s = SPRITE_SCALE;
        const cx = x + w / 2;
        const app = studentAppearance(col, row);
        const animPhase = Math.floor(frame / 30) % 2;
        const armOff = animPhase === 0 ? 0 : s;

        // Exercise sheet on desk
        ctx.fillStyle = C.paper;
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

        // Body / torso (curved manga shape)
        ctx.fillStyle = patterns[app.shirtPattern] || C.tone1;
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

        // Collar line (V-neck manga style)
        inkStroke(ctx, 1);
        ctx.beginPath();
        ctx.moveTo(cx - 2 * s, y + h - 26 * s);
        ctx.lineTo(cx, y + h - 24 * s);
        ctx.lineTo(cx + 2 * s, y + h - 26 * s);
        ctx.stroke();

        // Arms reaching to desk
        inkStroke(ctx, 1.5);
        // Left arm
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, y + h - 24 * s);
        ctx.quadraticCurveTo(cx - 7 * s, y + h - 22 * s, cx - 7 * s, y + h - 19 * s);
        ctx.stroke();
        // Right arm (animated)
        ctx.beginPath();
        ctx.moveTo(cx + 5 * s, y + h - 24 * s);
        ctx.quadraticCurveTo(cx + 7 * s, y + h - 22 * s, cx + 5 * s + armOff, y + h - 19 * s);
        ctx.stroke();

        // Hands
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx - 7 * s, y + h - 18.5 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 0.8);
        ctx.stroke();
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx + 5 * s + armOff, y + h - 18.5 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pencil in right hand
        inkStroke(ctx, 1);
        ctx.beginPath();
        ctx.moveTo(cx + 5 * s + armOff, y + h - 20 * s);
        ctx.lineTo(cx + 5 * s + armOff + s, y + h - 17 * s);
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

        // Ears (skin peeking on sides)
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx - 5 * s, y + h - 29 * s, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 0.8);
        ctx.stroke();
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(cx + 5 * s, y + h - 29 * s, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Flowing hair strands (key manga element)
        inkStroke(ctx, 1);
        const hairLen = app.hairStyle === 2 ? 3 : (app.hairStyle === 1 ? 7 : 6);
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * 2 * s, y + h - 35 * s);
            if (app.hairStyle === 1) {
                // Wavy hair
                ctx.bezierCurveTo(
                    cx + (i * 2 + 1) * s, y + h - (32) * s,
                    cx + (i * 2 - 1) * s, y + h - (29) * s,
                    cx + i * 2.5 * s, y + h - (35 - hairLen) * s + hairLen * s
                );
            } else {
                // Straight flowing
                ctx.quadraticCurveTo(
                    cx + i * 2.5 * s, y + h - (30) * s,
                    cx + i * 2.2 * s, y + h - (35 - hairLen) * s + hairLen * s
                );
            }
            ctx.stroke();
        }

        // Hair highlight (white streak -- manga shine)
        ctx.strokeStyle = C.white;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(cx - 1 * s, y + h - 34 * s);
        ctx.quadraticCurveTo(cx, y + h - 31 * s, cx + s, y + h - 28 * s);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  STUDENT SLEEPING (manga style)
    // ================================================================
    function drawStudentSleeping(ctx, x, y, w, h, col, row, frame) {
        const s = SPRITE_SCALE;
        const cx = x + w / 2;
        const app = studentAppearance(col, row);

        // Body slumped forward
        ctx.fillStyle = patterns[app.shirtPattern] || C.tone1;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, y + h - 18 * s);
        ctx.lineTo(cx - 5 * s, y + h - 23 * s);
        ctx.quadraticCurveTo(cx, y + h - 25 * s, cx + 5 * s, y + h - 23 * s);
        ctx.lineTo(cx + 5 * s, y + h - 18 * s);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 1.5);
        ctx.stroke();

        // Arms splayed on desk
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

        // Head face-down on desk (hair spread)
        ctx.fillStyle = app.hair;
        ctx.beginPath();
        ctx.ellipse(cx, y + h - 22 * s, 6 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1.5);
        ctx.stroke();

        // Hair spread detail lines
        inkStroke(ctx, 0.8);
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * 2 * s, y + h - 25 * s);
            ctx.quadraticCurveTo(cx + i * 3 * s, y + h - 22 * s, cx + i * 3 * s, y + h - 19 * s);
            ctx.stroke();
        }

        // ZZZ sleep bubble
        drawSleepBubble(ctx, cx, y + h - 30 * s, frame);
    }

    // ================================================================
    //  SLEEP BUBBLE (manga cloud style)
    // ================================================================
    function drawSleepBubble(ctx, x, y, frame) {
        const bob = Math.sin(frame * 0.06) * 2;
        const bw = 38;
        const bh = 20;
        const bx = x - bw / 2 + 10;
        const by = y - bh + bob - 4;

        // Cloud-shaped bubble (overlapping circles)
        ctx.fillStyle = C.paper;
        ctx.beginPath();
        ctx.arc(bx + 8, by + 10, 10, 0, Math.PI * 2);
        ctx.arc(bx + 20, by + 8, 11, 0, Math.PI * 2);
        ctx.arc(bx + 30, by + 11, 9, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1.2);
        ctx.beginPath();
        ctx.arc(bx + 8, by + 10, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx + 20, by + 8, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx + 30, by + 11, 9, 0, Math.PI * 2);
        ctx.stroke();

        // Small trailing circles (cloud tail)
        ctx.fillStyle = C.paper;
        ctx.beginPath();
        ctx.arc(bx + 2, by + bh + 3, 3, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 0.8);
        ctx.stroke();
        ctx.fillStyle = C.paper;
        ctx.beginPath();
        ctx.arc(bx - 2, by + bh + 8, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // "ZZZ" text with brush-like feel
        const pulse = 0.7 + Math.sin(frame * 0.12) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = C.ink;
        ctx.font = 'bold italic 13px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Zzz', bx + 19, by + 10);
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // ================================================================
    //  TEACHER BACK (facing blackboard - manga style)
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
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 1 * s, y + 20 * s);
        ctx.lineTo(cx + 1 * s, y + 24 * s);
        ctx.lineTo(cx + 3 * s, y + 24 * s);
        ctx.lineTo(cx + 3 * s, y + 20 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shoes
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.ellipse(cx - 2 * s, y + 24.5 * s, 2 * s, s * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 2 * s, y + 24.5 * s, 2 * s, s * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dress / body (A-line manga teacher dress)
        ctx.fillStyle = patterns.dotDark || C.tone4;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, y + 7 * s);
        ctx.lineTo(cx - 6 * s, y + 20 * s);
        ctx.lineTo(cx + 6 * s, y + 20 * s);
        ctx.lineTo(cx + 4 * s, y + 7 * s);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 2);
        ctx.stroke();

        // Waist belt
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.moveTo(cx - 4.5 * s, y + 12 * s);
        ctx.lineTo(cx + 4.5 * s, y + 12 * s);
        ctx.stroke();

        // Arms
        const armAnim = Math.floor(frame / 40) % 2 === 0 ? 0 : s;
        inkStroke(ctx, 2);
        // Left arm (reaching up with chalk)
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, y + 8 * s);
        ctx.quadraticCurveTo(cx - 8 * s, y + 6 * s, cx - 7 * s, y + 4 * s + armAnim);
        ctx.stroke();
        // Right arm (at side)
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

        // Chalk
        ctx.fillStyle = C.paper;
        inkStroke(ctx, 0.8);
        ctx.beginPath();
        ctx.moveTo(cx - 7 * s - s, y + 3 * s + armAnim);
        ctx.lineTo(cx - 7 * s + s, y + 3 * s + armAnim);
        ctx.lineTo(cx - 7 * s + 0.5 * s, y + 1.5 * s + armAnim);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Head (back view oval)
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.ellipse(cx, y + 4 * s, 3.5 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Long flowing hair (signature manga teacher look)
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.ellipse(cx, y + 3.5 * s, 4 * s, 4.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair flowing down back
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.moveTo(cx - 3.5 * s, y + 6 * s);
        ctx.quadraticCurveTo(cx - 4 * s, y + 12 * s, cx - 2.5 * s, y + 14 * s);
        ctx.lineTo(cx + 2.5 * s, y + 14 * s);
        ctx.quadraticCurveTo(cx + 4 * s, y + 12 * s, cx + 3.5 * s, y + 6 * s);
        ctx.closePath();
        ctx.fill();

        // Hair strand detail lines
        ctx.strokeStyle = C.tone5;
        ctx.lineWidth = 0.8;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * 1.2 * s, y + 1 * s);
            ctx.bezierCurveTo(
                cx + i * 1.5 * s, y + 6 * s,
                cx + i * 1.3 * s, y + 10 * s,
                cx + i * 1.4 * s, y + 14 * s
            );
            ctx.stroke();
        }

        // Hair outline
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.ellipse(cx, y + 3.5 * s, 4 * s, 4.5 * s, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Manga hair shine highlight
        ctx.strokeStyle = C.white;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.moveTo(cx - s, y + 1 * s);
        ctx.quadraticCurveTo(cx + 0.5 * s, y + 4 * s, cx - 0.5 * s, y + 7 * s);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  TEACHER FRONT (facing students - manga shojo style)
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
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 1 * s, y + 20 * s);
        ctx.lineTo(cx + 1 * s, y + 24 * s);
        ctx.lineTo(cx + 3 * s, y + 24 * s);
        ctx.lineTo(cx + 3 * s, y + 20 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shoes
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.ellipse(cx - 2 * s, y + 24.5 * s, 2 * s, s * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 2 * s, y + 24.5 * s, 2 * s, s * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dress body (A-line)
        ctx.fillStyle = patterns.dotDark || C.tone4;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, y + 7 * s);
        ctx.lineTo(cx - 6 * s, y + 20 * s);
        ctx.lineTo(cx + 6 * s, y + 20 * s);
        ctx.lineTo(cx + 4 * s, y + 7 * s);
        ctx.closePath();
        ctx.fill();
        inkStroke(ctx, 2);
        ctx.stroke();

        // Waist belt
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.moveTo(cx - 4.5 * s, y + 12 * s);
        ctx.lineTo(cx + 4.5 * s, y + 12 * s);
        ctx.stroke();

        // Arms crossed
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

        // Face (oval)
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.ellipse(cx, y + 3.5 * s, 3.5 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1.5);
        ctx.stroke();

        // ---- BIG MANGA EYES (the centerpiece!) ----
        drawMangaEye(ctx, cx - 2 * s, y + 3.5 * s, s * 1.6, true, frame);
        drawMangaEye(ctx, cx + 2 * s, y + 3.5 * s, s * 1.6, false, frame);

        // Eyebrows (stern, angled)
        inkStroke(ctx, 2);
        ctx.beginPath();
        ctx.moveTo(cx - 3.5 * s, y + 1.5 * s);
        ctx.lineTo(cx - 1 * s, y + 2 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 3.5 * s, y + 1.5 * s);
        ctx.lineTo(cx + 1 * s, y + 2 * s);
        ctx.stroke();

        // Small nose (just a line)
        inkStroke(ctx, 1);
        ctx.beginPath();
        ctx.moveTo(cx, y + 4 * s);
        ctx.lineTo(cx - 0.3 * s, y + 4.8 * s);
        ctx.stroke();

        // Mouth (stern thin line)
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.moveTo(cx - 1.2 * s, y + 5.5 * s);
        ctx.quadraticCurveTo(cx, y + 5.2 * s, cx + 1.2 * s, y + 5.5 * s);
        ctx.stroke();

        // Blush marks (diagonal lines on cheeks)
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

        // Hair (front view, framing face)
        ctx.fillStyle = C.ink;
        // Top hair mass
        ctx.beginPath();
        ctx.ellipse(cx, y + 1.5 * s, 4.5 * s, 3 * s, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        // Side hair strands (left)
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, y + 2 * s);
        ctx.quadraticCurveTo(cx - 5 * s, y + 5 * s, cx - 4.5 * s, y + 8 * s);
        ctx.lineTo(cx - 3.5 * s, y + 8 * s);
        ctx.quadraticCurveTo(cx - 3.5 * s, y + 5 * s, cx - 3.5 * s, y + 2 * s);
        ctx.closePath();
        ctx.fill();
        // Side hair strands (right)
        ctx.beginPath();
        ctx.moveTo(cx + 4 * s, y + 2 * s);
        ctx.quadraticCurveTo(cx + 5 * s, y + 5 * s, cx + 4.5 * s, y + 8 * s);
        ctx.lineTo(cx + 3.5 * s, y + 8 * s);
        ctx.quadraticCurveTo(cx + 3.5 * s, y + 5 * s, cx + 3.5 * s, y + 2 * s);
        ctx.closePath();
        ctx.fill();

        // Hair outline and strand details
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.ellipse(cx, y + 1.5 * s, 4.5 * s, 3 * s, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        // Bangs detail
        inkStroke(ctx, 1);
        ctx.beginPath();
        ctx.moveTo(cx - 2 * s, y + 0 * s);
        ctx.quadraticCurveTo(cx - 1.5 * s, y + 2.5 * s, cx - 2 * s, y + 2.5 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, y - 0.5 * s);
        ctx.quadraticCurveTo(cx + 0.5 * s, y + 2 * s, cx, y + 3 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 2 * s, y + 0 * s);
        ctx.quadraticCurveTo(cx + 1.5 * s, y + 2.5 * s, cx + 2 * s, y + 2.5 * s);
        ctx.stroke();

        // Hair shine
        ctx.strokeStyle = C.white;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx - s, y + 0.5 * s, 2 * s, -0.3, 0.8);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  MANGA EYE (reusable big shojo eye)
    // ================================================================
    function drawMangaEye(ctx, ex, ey, size, isLeft, frame) {
        // Outer eye shape (large oval)
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.ellipse(ex, ey, size * 1.1, size * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1.5);
        ctx.stroke();

        // Iris (large, takes up most of the eye)
        ctx.fillStyle = patterns.dotVDark || C.tone4;
        ctx.beginPath();
        ctx.ellipse(ex, ey + size * 0.1, size * 0.75, size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        inkStroke(ctx, 1);
        ctx.stroke();

        // Pupil
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.ellipse(ex, ey + size * 0.15, size * 0.35, size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Star reflection (signature shojo manga highlight)
        ctx.fillStyle = C.white;
        const sx = ex + (isLeft ? -size * 0.25 : size * 0.25);
        const sy = ey - size * 0.2;
        drawSparkle4pt(ctx, sx, sy, size * 0.35);

        // Small secondary highlight
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.arc(ex + (isLeft ? size * 0.2 : -size * 0.2), ey + size * 0.3, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Upper eyelash (bold curved line)
        inkStroke(ctx, 2);
        ctx.beginPath();
        ctx.ellipse(ex, ey - size * 0.1, size * 1.2, size * 0.7, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        // Eyelash spikes (2-3 short lines radiating up)
        inkStroke(ctx, 1.2);
        const lashDir = isLeft ? -1 : 1;
        for (let i = 0; i < 3; i++) {
            const a = Math.PI + (i - 1) * 0.3 + lashDir * 0.2;
            ctx.beginPath();
            ctx.moveTo(ex + Math.cos(a) * size * 1.1, ey - size * 0.1 + Math.sin(a) * size * 0.6);
            ctx.lineTo(
                ex + Math.cos(a) * size * 1.6,
                ey - size * 0.1 + Math.sin(a) * size * 1.0
            );
            ctx.stroke();
        }
    }

    // ================================================================
    //  WARNING BUBBLE (manga jagged explosion style)
    // ================================================================
    function drawWarningBubble(ctx, x, y, size, frame) {
        const pulse = Math.sin(frame * 0.2) * 2;
        const by = y - size - 4 + pulse;
        const r = size * 0.8;

        // Jagged manga explosion shape
        ctx.fillStyle = C.paper;
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

        // Tail pointer
        ctx.fillStyle = C.paper;
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

        // Bold exclamation mark
        ctx.fillStyle = C.ink;
        ctx.font = `bold ${Math.floor(size * 0.9)}px 'Bangers', Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', x, by + r * 0.4);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // ================================================================
    //  NOTE (manga-style folded letter)
    // ================================================================
    function drawNote(ctx, x, y, size) {
        const s = Math.max(1, Math.floor(size / 6));
        const pw = 8 * s;
        const ph = 6 * s;

        // Shadow
        ctx.fillStyle = 'rgba(26, 21, 16, 0.15)';
        ctx.fillRect(x - pw / 2 + 2, y - ph / 2 + 2, pw, ph);

        // Paper
        ctx.fillStyle = C.paper;
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

        // Handwritten-style squiggly lines
        ctx.strokeStyle = C.inkLight;
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

        // Small heart on the note (manga touch)
        if (size >= 18) {
            ctx.fillStyle = C.accentPink;
            ctx.globalAlpha = 0.6;
            const hx = x + pw / 2 - 3 * s;
            const hy = y + ph / 2 - 2 * s;
            ctx.beginPath();
            ctx.moveTo(hx, hy + 1);
            ctx.bezierCurveTo(hx - 2, hy - 2, hx - 4, hy + 1, hx, hy + 3);
            ctx.bezierCurveTo(hx + 4, hy + 1, hx + 2, hy - 2, hx, hy + 1);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    // ================================================================
    //  BLACKBOARD (ink outline + dark screentone)
    // ================================================================
    function drawBlackboard(ctx, x, y, w, h) {
        // Outer frame
        ctx.fillStyle = patterns.woodGrain || C.tone3;
        ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
        inkStroke(ctx, 2);
        ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);

        // Board surface
        ctx.fillStyle = patterns.boardFill || C.tone5;
        ctx.fillRect(x, y, w, h);
        inkStroke(ctx, 1.5);
        ctx.strokeRect(x, y, w, h);

        // Chalk writing (decorative, white strokes)
        ctx.strokeStyle = C.paperWarm;
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

        // Math formula
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = C.paper;
        ctx.font = `${Math.floor(h / 4)}px Georgia, serif`;
        ctx.fillText('2+2=?', x + w - 85, y + h / 2 + 2);
        ctx.globalAlpha = 1.0;

        // Chalk ledge
        ctx.fillStyle = patterns.woodGrain || C.tone3;
        ctx.fillRect(x - 5, y + h + 5, w + 10, 6);
        inkStroke(ctx, 1);
        ctx.strokeRect(x - 5, y + h + 5, w + 10, 6);

        // Chalk pieces
        ctx.fillStyle = C.paper;
        roundRectPath(ctx, x + 20, y + h + 5, 12, 4, 1);
        ctx.fill();
        inkStroke(ctx, 0.5);
        ctx.stroke();
        ctx.fillStyle = C.paperWarm;
        roundRectPath(ctx, x + 40, y + h + 5, 8, 4, 1);
        ctx.fill();
        ctx.stroke();
    }

    // ================================================================
    //  NERD INDICATOR (manga sparkle cluster)
    // ================================================================
    function drawNerdStar(ctx, x, y, size) {
        ctx.fillStyle = C.ink;
        // Main sparkle
        drawSparkle4pt(ctx, x, y, size * 0.5);
        // Smaller surrounding sparkles
        ctx.globalAlpha = 0.6;
        drawSparkle4pt(ctx, x - size * 0.5, y - size * 0.2, size * 0.2);
        drawSparkle4pt(ctx, x + size * 0.4, y - size * 0.3, size * 0.25);
        drawSparkle4pt(ctx, x + size * 0.3, y + size * 0.3, size * 0.15);
        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  DUNCE MARKER (manga crying face bubble)
    // ================================================================
    function drawDunceMarker(ctx, x, y, size, frame) {
        const bob = Math.sin(frame * 0.06) * 2;
        const bw = 28;
        const bh = 24;
        const bx = x - bw / 2;
        const by = y - bh + bob;

        // Rounded bubble
        ctx.fillStyle = C.paper;
        roundRectPath(ctx, bx, by, bw, bh, 5);
        ctx.fill();
        inkStroke(ctx, 1.2);
        ctx.stroke();

        // Bubble tail
        ctx.fillStyle = C.paper;
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

        // Manga crying face (drawn, not emoji)
        const fcx = x;
        const fcy = by + bh / 2;

        // Eyes (closed, curved lines - crying squint)
        inkStroke(ctx, 1.5);
        ctx.beginPath();
        ctx.arc(fcx - 5, fcy - 2, 3, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(fcx + 5, fcy - 2, 3, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Tear drops
        ctx.fillStyle = C.inkLight;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(fcx - 5, fcy + 1);
        ctx.quadraticCurveTo(fcx - 6, fcy + 5, fcx - 5, fcy + 7);
        ctx.quadraticCurveTo(fcx - 4, fcy + 5, fcx - 5, fcy + 1);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(fcx + 5, fcy + 1);
        ctx.quadraticCurveTo(fcx + 4, fcy + 5, fcx + 5, fcy + 7);
        ctx.quadraticCurveTo(fcx + 6, fcy + 5, fcx + 5, fcy + 1);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Mouth (open crying)
        inkStroke(ctx, 1);
        ctx.beginPath();
        ctx.ellipse(fcx, fcy + 5, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // ================================================================
    //  HIGHLIGHT (manga emphasis lines radiating outward)
    // ================================================================
    function drawHighlight(ctx, x, y, w, h, frame) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const alpha = 0.25 + Math.sin(frame * 0.1) * 0.1;
        const count = 12;

        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1;
        ctx.globalAlpha = alpha;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const innerR = Math.max(w, h) * 0.35;
            const outerR = Math.max(w, h) * 0.55;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
            ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
    }

    // ================================================================
    //  MANGA EFFECT HELPERS
    // ================================================================

    // 4-pointed sparkle star
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

    // Speed lines radiating from center
    function drawSpeedLines(ctx, cx, cy, innerR, outerR, count, alpha, lineW) {
        ctx.save();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = lineW || 1;
        ctx.globalAlpha = alpha || 0.3;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + (i * 0.618); // golden-ratio spacing for natural feel
            const iR = innerR + Math.sin(i * 3.7) * innerR * 0.3;
            const oR = outerR + Math.sin(i * 2.3) * outerR * 0.15;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * iR, cy + Math.sin(angle) * iR);
            ctx.lineTo(cx + Math.cos(angle) * oR, cy + Math.sin(angle) * oR);
            ctx.stroke();
        }

        ctx.restore();
    }

    // Animated sparkles / flower petals
    function drawSparkles(ctx, x, y, size, frame, count) {
        const n = count || 5;
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * Math.PI * 2 + frame * 0.02;
            const dist = size * (0.5 + Math.sin(frame * 0.03 + i * 1.5) * 0.3);
            const sx = x + Math.cos(angle) * dist;
            const sy = y + Math.sin(angle) * dist;
            const sz = size * 0.1 * (0.6 + Math.sin(frame * 0.05 + i) * 0.4);

            ctx.fillStyle = C.ink;
            ctx.globalAlpha = 0.3 + Math.sin(frame * 0.06 + i * 0.8) * 0.2;
            drawSparkle4pt(ctx, sx, sy, sz);
        }
        ctx.globalAlpha = 1.0;
    }

    // Simple flower decoration (5 petals)
    function drawFlower(ctx, x, y, size, alpha) {
        ctx.globalAlpha = alpha || 0.4;
        ctx.fillStyle = C.accentPink;
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.ellipse(
                x + Math.cos(a) * size * 0.5,
                y + Math.sin(a) * size * 0.5,
                size * 0.4, size * 0.25,
                a, 0, Math.PI * 2
            );
            ctx.fill();
        }
        // Center
        ctx.fillStyle = C.paperWarm;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    // Motion trail for note in transit
    function drawMotionTrail(ctx, x, y, dx, dy, size) {
        ctx.strokeStyle = C.inkLight;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.3;
        for (let i = 1; i <= 4; i++) {
            const tx = x - dx * i * 4;
            const ty = y - dy * i * 4;
            ctx.beginPath();
            ctx.moveTo(tx - size * 0.3, ty);
            ctx.lineTo(tx + size * 0.3, ty);
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
        // New manga effects
        drawSpeedLines,
        drawSparkles,
        drawSparkle4pt,
        drawFlower,
        drawMotionTrail,
        drawMangaEye,
        roundRectPath,
    };
})();
