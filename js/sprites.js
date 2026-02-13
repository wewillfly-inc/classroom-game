// ============================================================
// sprites.js - Pixel Art Sprite Definitions & Drawing Utilities
// ============================================================

const Sprites = (() => {
    // Color palette (16-bit inspired)
    const C = {
        // Skin
        skin:       '#f5c6a0',
        skinShade:  '#d4a57a',
        // Hair colors
        hairBrown:  '#5c3317',
        hairBlack:  '#2a1a0a',
        hairBlonde: '#d4a937',
        hairRed:    '#8b3a2a',
        // Clothing
        shirtBlue:  '#4a7abc',
        shirtBlueDk:'#3a5a8c',
        shirtRed:   '#c04040',
        shirtRedDk: '#8c2a2a',
        shirtGreen: '#4a9a5a',
        shirtGreenDk:'#3a7a4a',
        shirtYellow:'#d4b040',
        shirtYellowDk:'#a48a30',
        shirtWhite: '#e8e0d0',
        shirtWhiteDk:'#c0b8a8',
        // Desk & furniture
        deskTop:    '#c49a6c',
        deskFront:  '#a07848',
        deskSide:   '#8a6838',
        deskLeg:    '#6a5030',
        chairBack:  '#8a6838',
        chairSeat:  '#a07848',
        // Blackboard
        boardGreen: '#2a5a3a',
        boardGreenLt:'#3a7a4a',
        boardFrame: '#6a5030',
        chalk:      '#e8e8d0',
        // Classroom
        floorTile:  '#c8b898',
        floorTileDk:'#b0a080',
        wallColor:  '#e8dcc8',
        wallColorDk:'#d0c4a8',
        windowBlue: '#88bbdd',
        windowBlueDk:'#6899bb',
        windowFrame:'#b0a080',
        // Note
        noteWhite:  '#f8f8f0',
        noteShadow: '#d0d0c0',
        // UI
        white:      '#ffffff',
        black:      '#000000',
        red:        '#e03030',
        darkRed:    '#a02020',
        green:      '#30a030',
        yellow:     '#f0d020',
        gray:       '#888888',
        darkGray:   '#444444',
        // Teacher
        teacherDress: '#6040a0',
        teacherDressDk: '#4a3080',
        teacherHair: '#5c3317',
        teacherSkin: '#f5c6a0',
        teacherSkinDk: '#d4a57a',
        // Zzz
        zzzColor:   '#8888cc',
    };

    // Shirt color sets for students
    const shirtColors = [
        { main: C.shirtBlue, dark: C.shirtBlueDk },
        { main: C.shirtRed, dark: C.shirtRedDk },
        { main: C.shirtGreen, dark: C.shirtGreenDk },
        { main: C.shirtYellow, dark: C.shirtYellowDk },
        { main: C.shirtWhite, dark: C.shirtWhiteDk },
    ];

    const hairColors = [C.hairBrown, C.hairBlack, C.hairBlonde, C.hairRed];

    // Deterministic "random" based on grid position
    function studentAppearance(col, row) {
        const cols = (typeof Grid !== 'undefined' && Grid.COLS) ? Grid.COLS : 5;
        const idx = row * cols + col;
        return {
            shirt: shirtColors[idx % shirtColors.length],
            hair: hairColors[(idx * 3 + 1) % hairColors.length],
        };
    }

    // Draw a single pixel (scaled block)
    function drawPixel(ctx, x, y, color, scale) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), scale, scale);
    }

    // Fixed pixel scale for all student/desk sprites.
    // s=2 keeps sprites compact so they fit within their grid cells
    // without overlapping neighboring rows.
    const SPRITE_SCALE = 2;

    // ---- DESK (seen from behind, isometric-ish) ----
    // Draws a desk+chair unit at (x,y) top-left, fitting in w x h
    function drawDesk(ctx, x, y, w, h) {
        const s = SPRITE_SCALE;
        const cx = x + w / 2;

        // Chair back
        ctx.fillStyle = C.chairBack;
        ctx.fillRect(cx - 7 * s, y + h - 14 * s, 14 * s, 2 * s);
        // Chair legs
        ctx.fillStyle = C.deskLeg;
        ctx.fillRect(cx - 6 * s, y + h - 12 * s, 2 * s, 6 * s);
        ctx.fillRect(cx + 4 * s, y + h - 12 * s, 2 * s, 6 * s);
        // Chair seat
        ctx.fillStyle = C.chairSeat;
        ctx.fillRect(cx - 7 * s, y + h - 6 * s, 14 * s, 2 * s);

        // Desk top (flat surface, wider)
        ctx.fillStyle = C.deskTop;
        ctx.fillRect(cx - 9 * s, y + h - 20 * s, 18 * s, 3 * s);
        // Desk front face
        ctx.fillStyle = C.deskFront;
        ctx.fillRect(cx - 9 * s, y + h - 17 * s, 18 * s, 3 * s);
        // Desk legs
        ctx.fillStyle = C.deskLeg;
        ctx.fillRect(cx - 8 * s, y + h - 17 * s, 2 * s, 11 * s);
        ctx.fillRect(cx + 6 * s, y + h - 17 * s, 2 * s, 11 * s);
    }

    // ---- STUDENT (seen from behind, writing) ----
    function drawStudentWriting(ctx, x, y, w, h, col, row, frame) {
        const s = SPRITE_SCALE;
        const cx = x + w / 2;
        const { shirt, hair } = studentAppearance(col, row);
        // Slow animation: changes every ~0.5 seconds at 60fps
        const animPhase = Math.floor(frame / 30) % 2;
        const armOffset = animPhase === 0 ? 0 : s;

        // Exercise sheet on desk
        ctx.fillStyle = C.noteWhite;
        ctx.fillRect(cx - 4 * s, y + h - 19 * s, 8 * s, 5 * s);
        ctx.fillStyle = '#ccccbb';
        ctx.fillRect(cx - 3 * s, y + h - 18 * s, 5 * s, s);
        ctx.fillRect(cx - 3 * s, y + h - 16 * s, 4 * s, s);

        // Body/torso (back of shirt)
        ctx.fillStyle = shirt.main;
        ctx.fillRect(cx - 5 * s, y + h - 26 * s, 10 * s, 8 * s);
        // Shirt shading (shoulders)
        ctx.fillStyle = shirt.dark;
        ctx.fillRect(cx - 5 * s, y + h - 26 * s, 2 * s, 8 * s);
        ctx.fillRect(cx + 3 * s, y + h - 26 * s, 2 * s, 8 * s);
        // Collar detail
        ctx.fillStyle = shirt.dark;
        ctx.fillRect(cx - 2 * s, y + h - 26 * s, 4 * s, s);

        // Arms (reaching to desk)
        ctx.fillStyle = shirt.main;
        ctx.fillRect(cx - 7 * s, y + h - 24 * s, 2 * s, 5 * s);
        ctx.fillRect(cx + 5 * s, y + h - 24 * s, 2 * s, 5 * s);
        // Left hand (holding paper)
        ctx.fillStyle = C.skin;
        ctx.fillRect(cx - 7 * s, y + h - 19 * s, 3 * s, 2 * s);
        // Right hand (writing, animated)
        ctx.fillStyle = C.skin;
        ctx.fillRect(cx + 4 * s + armOffset, y + h - 19 * s, 3 * s, 2 * s);
        // Pencil in right hand
        ctx.fillStyle = C.yellow;
        ctx.fillRect(cx + 5 * s + armOffset, y + h - 20 * s, s, 3 * s);
        ctx.fillStyle = '#333';
        ctx.fillRect(cx + 5 * s + armOffset, y + h - 20 * s, s, s);

        // Head (back view - mostly hair)
        ctx.fillStyle = hair;
        ctx.fillRect(cx - 4 * s, y + h - 33 * s, 8 * s, 7 * s);
        // Neck
        ctx.fillStyle = C.skin;
        ctx.fillRect(cx - 2 * s, y + h - 26 * s, 4 * s, s);
        // Ears (skin peeking)
        ctx.fillStyle = C.skin;
        ctx.fillRect(cx - 5 * s, y + h - 30 * s, s, 2 * s);
        ctx.fillRect(cx + 4 * s, y + h - 30 * s, s, 2 * s);
    }

    // ---- STUDENT (sleeping) ----
    function drawStudentSleeping(ctx, x, y, w, h, col, row, frame) {
        const s = SPRITE_SCALE;
        const cx = x + w / 2;
        const { shirt, hair } = studentAppearance(col, row);

        // Body slumped forward
        ctx.fillStyle = shirt.main;
        ctx.fillRect(cx - 5 * s, y + h - 24 * s, 10 * s, 6 * s);
        ctx.fillStyle = shirt.dark;
        ctx.fillRect(cx - 5 * s, y + h - 24 * s, 2 * s, 6 * s);

        // Arms splayed on desk
        ctx.fillStyle = shirt.main;
        ctx.fillRect(cx - 7 * s, y + h - 22 * s, 14 * s, 3 * s);
        ctx.fillStyle = C.skin;
        ctx.fillRect(cx - 8 * s, y + h - 21 * s, 2 * s, 2 * s);
        ctx.fillRect(cx + 6 * s, y + h - 21 * s, 2 * s, 2 * s);

        // Head face-down on desk
        ctx.fillStyle = hair;
        ctx.fillRect(cx - 4 * s, y + h - 24 * s, 8 * s, 5 * s);

        // Draw the ZZZZ speech bubble above the student
        drawSleepBubble(ctx, cx, y + h - 30 * s, frame);
    }

    // ---- SLEEP BUBBLE (ZZZZ speech bubble above sleeping students) ----
    function drawSleepBubble(ctx, x, y, frame) {
        const bob = Math.sin(frame * 0.06) * 2;
        const bw = 40;
        const bh = 22;
        const bx = x - bw / 2;
        const by = y - bh + bob;

        // Bubble background (rounded rect)
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.moveTo(bx + 4, by);
        ctx.lineTo(bx + bw - 4, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + 4);
        ctx.lineTo(bx + bw, by + bh - 4);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - 4, by + bh);
        ctx.lineTo(bx + 4, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - 4);
        ctx.lineTo(bx, by + 4);
        ctx.quadraticCurveTo(bx, by, bx + 4, by);
        ctx.closePath();
        ctx.fill();

        // Bubble border
        ctx.strokeStyle = C.zzzColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bubble tail (pointer down)
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.moveTo(x - 4, by + bh);
        ctx.lineTo(x + 4, by + bh);
        ctx.lineTo(x, by + bh + 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = C.zzzColor;
        ctx.beginPath();
        ctx.moveTo(x - 4, by + bh);
        ctx.lineTo(x, by + bh + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 4, by + bh);
        ctx.lineTo(x, by + bh + 6);
        ctx.stroke();

        // "ZZZZ" text with animated opacity pulse
        const pulse = 0.7 + Math.sin(frame * 0.12) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = C.zzzColor;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ZZZ', x, by + bh / 2);
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // ---- TEACHER (facing blackboard - back to us) ----
    function drawTeacherBack(ctx, x, y, w, h, frame) {
        const s = Math.floor(w / 16);
        const cx = x + w / 2;

        // Dress / body
        ctx.fillStyle = C.teacherDress;
        ctx.fillRect(cx - 5 * s, y + 6 * s, 10 * s, 12 * s);
        ctx.fillStyle = C.teacherDressDk;
        ctx.fillRect(cx - 5 * s, y + 6 * s, 2 * s, 12 * s);
        ctx.fillRect(cx + 3 * s, y + 6 * s, 2 * s, 12 * s);

        // Skirt flare
        ctx.fillStyle = C.teacherDress;
        ctx.fillRect(cx - 6 * s, y + 14 * s, 12 * s, 6 * s);

        // Legs
        ctx.fillStyle = C.teacherSkinDk;
        ctx.fillRect(cx - 3 * s, y + 20 * s, 2 * s, 4 * s);
        ctx.fillRect(cx + 1 * s, y + 20 * s, 2 * s, 4 * s);

        // Shoes
        ctx.fillStyle = C.hairBlack;
        ctx.fillRect(cx - 3 * s, y + 24 * s, 2 * s, s);
        ctx.fillRect(cx + 1 * s, y + 24 * s, 2 * s, s);

        // Arms
        const armAnim = Math.floor(frame / 40) % 2 === 0 ? 0 : s;
        ctx.fillStyle = C.teacherDress;
        ctx.fillRect(cx - 7 * s, y + 7 * s, 2 * s, 6 * s);
        ctx.fillRect(cx + 5 * s, y + 7 * s, 2 * s, 6 * s);
        // Hands (holding chalk)
        ctx.fillStyle = C.teacherSkin;
        ctx.fillRect(cx - 7 * s, y + 4 * s + armAnim, 2 * s, 2 * s);
        ctx.fillRect(cx + 5 * s, y + 6 * s, 2 * s, 2 * s);
        // Chalk in hand
        ctx.fillStyle = C.chalk;
        ctx.fillRect(cx - 7 * s, y + 3 * s + armAnim, 2 * s, s);

        // Hair (back view, long hair)
        ctx.fillStyle = C.teacherHair;
        ctx.fillRect(cx - 4 * s, y, 8 * s, 7 * s);
        ctx.fillRect(cx - 3 * s, y + 7 * s, 6 * s, 3 * s); // hair going down
    }

    // ---- TEACHER (facing students - front view) ----
    function drawTeacherFront(ctx, x, y, w, h, frame) {
        const s = Math.floor(w / 16);
        const cx = x + w / 2;

        // Dress / body
        ctx.fillStyle = C.teacherDress;
        ctx.fillRect(cx - 5 * s, y + 6 * s, 10 * s, 12 * s);
        ctx.fillStyle = C.teacherDressDk;
        ctx.fillRect(cx - 5 * s, y + 14 * s, 10 * s, 2 * s);

        // Skirt flare
        ctx.fillStyle = C.teacherDress;
        ctx.fillRect(cx - 6 * s, y + 14 * s, 12 * s, 6 * s);

        // Legs
        ctx.fillStyle = C.teacherSkinDk;
        ctx.fillRect(cx - 3 * s, y + 20 * s, 2 * s, 4 * s);
        ctx.fillRect(cx + 1 * s, y + 20 * s, 2 * s, 4 * s);

        // Shoes
        ctx.fillStyle = C.hairBlack;
        ctx.fillRect(cx - 3 * s, y + 24 * s, 2 * s, s);
        ctx.fillRect(cx + 1 * s, y + 24 * s, 2 * s, s);

        // Arms crossed / on hips
        ctx.fillStyle = C.teacherDress;
        ctx.fillRect(cx - 7 * s, y + 7 * s, 2 * s, 6 * s);
        ctx.fillRect(cx + 5 * s, y + 7 * s, 2 * s, 6 * s);
        ctx.fillStyle = C.teacherSkin;
        ctx.fillRect(cx - 7 * s, y + 12 * s, 2 * s, 2 * s);
        ctx.fillRect(cx + 5 * s, y + 12 * s, 2 * s, 2 * s);

        // Face
        ctx.fillStyle = C.teacherSkin;
        ctx.fillRect(cx - 3 * s, y + 2 * s, 6 * s, 5 * s);
        // Eyes (stern look)
        ctx.fillStyle = C.black;
        ctx.fillRect(cx - 2 * s, y + 3 * s, s, s);
        ctx.fillRect(cx + 1 * s, y + 3 * s, s, s);
        // Eyebrows (angry)
        ctx.fillRect(cx - 2 * s, y + 2 * s, 2 * s, s);
        ctx.fillRect(cx + 1 * s, y + 2 * s, 2 * s, s);
        // Mouth
        ctx.fillStyle = C.darkRed;
        ctx.fillRect(cx - s, y + 5 * s, 2 * s, s);

        // Hair (front view)
        ctx.fillStyle = C.teacherHair;
        ctx.fillRect(cx - 4 * s, y, 8 * s, 3 * s);
        ctx.fillRect(cx - 4 * s, y + 2 * s, s, 4 * s);
        ctx.fillRect(cx + 3 * s, y + 2 * s, s, 4 * s);
    }

    // ---- WARNING BUBBLE (!) ----
    function drawWarningBubble(ctx, x, y, size, frame) {
        const pulse = Math.sin(frame * 0.2) * 2;
        const bx = x - size / 2;
        const by = y - size - 4 + pulse;

        // Bubble background
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.arc(x, by + size * 0.4, size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Bubble pointer
        ctx.beginPath();
        ctx.moveTo(x - 3, by + size * 0.9);
        ctx.lineTo(x + 3, by + size * 0.9);
        ctx.lineTo(x, by + size * 1.3);
        ctx.closePath();
        ctx.fill();

        // Exclamation mark
        ctx.fillStyle = C.red;
        ctx.font = `bold ${Math.floor(size * 0.8)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', x, by + size * 0.4);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // ---- NOTE (cheat sheet) ----
    // size controls overall scale. Recommend 16-24 for good visibility.
    function drawNote(ctx, x, y, size) {
        const s = Math.max(1, Math.floor(size / 6));
        const pw = 8 * s;   // paper width
        const ph = 6 * s;   // paper height

        // Paper shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x - pw / 2 + 2, y - ph / 2 + 2, pw, ph);

        // Paper
        ctx.fillStyle = C.noteWhite;
        ctx.fillRect(x - pw / 2, y - ph / 2, pw, ph);

        // Paper border
        ctx.strokeStyle = '#ccccaa';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - pw / 2, y - ph / 2, pw, ph);

        // Fold corner
        ctx.fillStyle = C.noteShadow;
        const foldS = Math.max(2, s);
        ctx.fillRect(x + pw / 2 - 2 * foldS, y - ph / 2, 2 * foldS, 2 * foldS);

        // Text lines
        ctx.fillStyle = '#6666aa';
        const lineGap = Math.max(2, Math.floor(ph / 5));
        for (let i = 0; i < 3; i++) {
            const lw = pw * (0.6 + Math.sin(i * 1.5) * 0.2);
            ctx.fillRect(x - pw / 2 + s, y - ph / 2 + s + (i + 1) * lineGap, lw, Math.max(1, s / 2));
        }
    }

    // ---- BLACKBOARD ----
    function drawBlackboard(ctx, x, y, w, h) {
        // Frame
        ctx.fillStyle = C.boardFrame;
        ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
        // Green board
        ctx.fillStyle = C.boardGreen;
        ctx.fillRect(x, y, w, h);
        // Chalk writing (decorative)
        ctx.fillStyle = C.chalk;
        ctx.globalAlpha = 0.6;
        const lineH = Math.floor(h / 6);
        for (let i = 1; i <= 4; i++) {
            const lw = 20 + Math.sin(i * 2.7) * 40 + 30;
            ctx.fillRect(x + 15, y + i * lineH, lw, 2);
        }
        // A math formula
        ctx.globalAlpha = 0.8;
        ctx.font = `${Math.floor(h / 4)}px monospace`;
        ctx.fillText('2+2=?', x + w - 80, y + h / 2);
        ctx.globalAlpha = 1.0;

        // Chalk ledge
        ctx.fillStyle = C.boardFrame;
        ctx.fillRect(x - 4, y + h + 4, w + 8, 6);
        // Chalk pieces
        ctx.fillStyle = C.chalk;
        ctx.fillRect(x + 20, y + h + 3, 12, 4);
        ctx.fillStyle = C.yellow;
        ctx.fillRect(x + 40, y + h + 3, 8, 4);
    }

    // ---- NERD INDICATOR (star above head) ----
    function drawNerdStar(ctx, x, y, size) {
        ctx.fillStyle = C.yellow;
        ctx.font = `${size}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('★', x, y);
        ctx.textAlign = 'left';
    }

    // ---- DUNCE INDICATOR (speech bubble with crying face) ----
    function drawDunceMarker(ctx, x, y, size, frame) {
        const bob = Math.sin(frame * 0.06) * 2;
        const bw = 28;
        const bh = 24;
        const bx = x - bw / 2;
        const by = y - bh + bob;

        // Bubble background (rounded rect approximation)
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.moveTo(bx + 4, by);
        ctx.lineTo(bx + bw - 4, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + 4);
        ctx.lineTo(bx + bw, by + bh - 4);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - 4, by + bh);
        ctx.lineTo(bx + 4, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - 4);
        ctx.lineTo(bx, by + 4);
        ctx.quadraticCurveTo(bx, by, bx + 4, by);
        ctx.closePath();
        ctx.fill();

        // Bubble border
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bubble tail (pointer down)
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.moveTo(x - 4, by + bh);
        ctx.lineTo(x + 4, by + bh);
        ctx.lineTo(x, by + bh + 7);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 4, by + bh);
        ctx.lineTo(x, by + bh + 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 4, by + bh);
        ctx.lineTo(x, by + bh + 7);
        ctx.stroke();

        // Crying face emoji text
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('😢', x, by + bh / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // ---- HIGHLIGHT (current note holder) ----
    function drawHighlight(ctx, x, y, w, h, frame) {
        const alpha = 0.3 + Math.sin(frame * 0.1) * 0.15;
        ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
        ctx.fillRect(x, y, w, h);
    }

    return {
        C,
        drawPixel,
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
    };
})();
