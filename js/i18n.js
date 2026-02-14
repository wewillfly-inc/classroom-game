// ============================================================
// i18n.js - Translations (Italian, English, German)
// ============================================================

const I18n = (() => {
    const STORAGE_KEY = 'classroomGameLang';

    const strings = {
        it: {
            title: 'PASSA IL BIGLIETTINO!',
            subtitle: 'Un gioco di furbizia scolastica',
            instr1: 'Usa le FRECCE per passare il bigliettino',
            instr2: 'dal secchione (★) al somaro (😢)',
            instr3: 'Attento! Quando la maestra si gira...',
            instr4: 'il bigliettino NON deve essere in volo!',
            instr5: 'Consegna il bigliettino prima che scada il tempo!',
            pressSpaceContinue: 'Premi SPAZIO per continuare',
            touchContinue: 'Tocca lo schermo per continuare',
            chooseDifficulty: 'SCEGLI LA DIFFICOLTÀ',
            grid: 'GRIGLIA',
            time: 'TEMPO',
            sleepers: 'DORMIGLIONI',
            gridEasy: 'Facile',
            gridMedium: 'Medio',
            gridHard: 'Difficile',
            timeChallenge: 'Sfida',
            timeNormal: 'Normale',
            timeRelaxed: 'Rilassato',
            sleepFew: 'Pochi',
            sleepMedium: 'Medio',
            sleepMany: 'Tanti',
            navHint: '← → scegli opzione   ↑ ↓ cambia riga',
            pressSpacePlay: 'Premi SPAZIO per giocare!',
            touchPlay: 'Tocca lo schermo per giocare!',
            caught: 'BECCATO!',
            caughtReasonTeacher: 'La maestra ha visto il bigliettino!',
            caughtReasonTime: 'Il tempo è scaduto!',
            pressSpaceRetry: 'Premi SPAZIO per riprovare',
            touchRetry: 'Tocca lo schermo per riprovare',
            promoted: 'PROMOSSO!',
            winMessage: 'Il bigliettino è arrivato al somaro!',
            timeLeft: 'Tempo rimasto: ',
            pressSpaceAgain: 'Premi SPAZIO per giocare ancora',
            touchAgain: 'Tocca lo schermo per giocare ancora',
            teacherWatching: 'LA MAESTRA TI GUARDA!',
        },
        en: {
            title: 'PASS THE NOTE!',
            subtitle: 'A game of schoolyard cunning',
            instr1: 'Use the ARROW KEYS to pass the note',
            instr2: 'from the nerd (★) to the dunce (😢)',
            instr3: 'Watch out! When the teacher turns around...',
            instr4: 'the note must NOT be in the air!',
            instr5: 'Deliver the note before time runs out!',
            pressSpaceContinue: 'Press SPACE to continue',
            touchContinue: 'Touch the screen to continue',
            chooseDifficulty: 'CHOOSE DIFFICULTY',
            grid: 'GRID',
            time: 'TIME',
            sleepers: 'SLEEPERS',
            gridEasy: 'Easy',
            gridMedium: 'Medium',
            gridHard: 'Hard',
            timeChallenge: 'Challenge',
            timeNormal: 'Normal',
            timeRelaxed: 'Relaxed',
            sleepFew: 'Few',
            sleepMedium: 'Medium',
            sleepMany: 'Many',
            navHint: '← → choose option   ↑ ↓ change row',
            pressSpacePlay: 'Press SPACE to play!',
            touchPlay: 'Touch the screen to play!',
            caught: 'CAUGHT!',
            caughtReasonTeacher: 'The teacher saw the note!',
            caughtReasonTime: "Time's up!",
            pressSpaceRetry: 'Press SPACE to try again',
            touchRetry: 'Touch the screen to try again',
            promoted: 'PASSED!',
            winMessage: 'The note reached the dunce!',
            timeLeft: 'Time left: ',
            pressSpaceAgain: 'Press SPACE to play again',
            touchAgain: 'Touch the screen to play again',
            teacherWatching: 'THE TEACHER IS WATCHING!',
        },
        de: {
            title: 'GIB DEN ZETTEL WEITER!',
            subtitle: 'Ein Spiel um Schulhof-Schlauheit',
            instr1: 'Nutze die PFEILTASTEN, um den Zettel weiterzugeben',
            instr2: 'vom Streber (★) zum Taugenichts (😢)',
            instr3: 'Vorsicht! Wenn die Lehrerin sich umdreht...',
            instr4: 'darf der Zettel NICHT in der Luft sein!',
            instr5: 'Gib den Zettel ab, bevor die Zeit abläuft!',
            pressSpaceContinue: 'Drücke LEERTASTE zum Weitergehen',
            touchContinue: 'Bildschirm berühren zum Weitergehen',
            chooseDifficulty: 'SCHWIERIGKEIT WÄHLEN',
            grid: 'RASTER',
            time: 'ZEIT',
            sleepers: 'SCHLAFMÜTZEN',
            gridEasy: 'Leicht',
            gridMedium: 'Mittel',
            gridHard: 'Schwer',
            timeChallenge: 'Herausforderung',
            timeNormal: 'Normal',
            timeRelaxed: 'Entspannt',
            sleepFew: 'Wenige',
            sleepMedium: 'Mittel',
            sleepMany: 'Viele',
            navHint: '← → Option wählen   ↑ ↓ Zeile wechseln',
            pressSpacePlay: 'Drücke LEERTASTE zum Spielen!',
            touchPlay: 'Bildschirm berühren zum Spielen!',
            caught: 'ERWISCHT!',
            caughtReasonTeacher: 'Die Lehrerin hat den Zettel gesehen!',
            caughtReasonTime: 'Die Zeit ist abgelaufen!',
            pressSpaceRetry: 'Drücke LEERTASTE zum erneuten Versuch',
            touchRetry: 'Bildschirm berühren zum erneuten Versuch',
            promoted: 'BESTANDEN!',
            winMessage: 'Der Zettel ist beim Taugenichts angekommen!',
            timeLeft: 'Verbleibende Zeit: ',
            pressSpaceAgain: 'Drücke LEERTASTE um nochmal zu spielen',
            touchAgain: 'Bildschirm berühren um nochmal zu spielen',
            teacherWatching: 'DIE LEHRERIN SCHAUT ZU!',
        },
    };

    let currentLang = 'it';

    function init() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && strings[saved]) currentLang = saved;
            if (typeof document !== 'undefined') {
                document.documentElement.lang = currentLang === 'de' ? 'de' : currentLang === 'en' ? 'en' : 'it';
                const titles = { it: 'Passa il Bigliettino!', en: 'Pass the Note!', de: 'Gib den Zettel weiter!' };
                document.title = titles[currentLang] || titles.en;
            }
        } catch (_) {}
    }

    function setLanguage(lang) {
        if (strings[lang]) {
            currentLang = lang;
            try {
                localStorage.setItem(STORAGE_KEY, lang);
            } catch (_) {}
            if (typeof document !== 'undefined') {
                document.documentElement.lang = lang === 'it' ? 'it' : lang === 'de' ? 'de' : 'en';
                const titles = { it: 'Passa il Bigliettino!', en: 'Pass the Note!', de: 'Gib den Zettel weiter!' };
                if (document.title !== undefined) document.title = titles[lang] || titles.en;
            }
        }
    }

    function getLanguage() {
        return currentLang;
    }

    function t(key) {
        const lang = strings[currentLang];
        return (lang && lang[key]) || strings.it[key] || key;
    }

    init();

    return { t, setLanguage, getLanguage, init, languages: ['it', 'en', 'de'] };
})();
