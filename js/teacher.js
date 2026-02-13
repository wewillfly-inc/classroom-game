// ============================================================
// teacher.js - Teacher AI: State Machine & Behavior
// ============================================================

const Teacher = (() => {
    // States: 'facing_board', 'warning', 'facing_students'
    let state = 'facing_board';
    let stateTimer = 0; // time remaining in current state (seconds)

    // Timing configuration
    const BASE_BOARD_MIN = 4;   // min seconds facing board
    const BASE_BOARD_MAX = 8;   // max seconds facing board
    const WARNING_DURATION = 1.0; // seconds the "!" shows
    const BASE_STUDENTS_MIN = 2; // min seconds facing students
    const BASE_STUDENTS_MAX = 4; // max seconds facing students

    // Difficulty multiplier (decreases timings as game progresses)
    let difficulty = 1.0; // starts at 1, increases over time

    function init() {
        state = 'facing_board';
        stateTimer = randomBoardTime();
        difficulty = 1.0;
    }

    function randomBoardTime() {
        const min = BASE_BOARD_MIN / difficulty;
        const max = BASE_BOARD_MAX / difficulty;
        return min + Math.random() * (max - min);
    }

    function randomStudentsTime() {
        const min = BASE_STUDENTS_MIN;
        const max = BASE_STUDENTS_MAX + (1 / difficulty); // stays longer when easy
        return min + Math.random() * (max - min);
    }

    // Update the teacher state machine
    // Returns: current state after update
    function update(dt, timeLeft, maxTime) {
        // Ramp difficulty based on time elapsed
        const elapsed = maxTime - timeLeft;
        difficulty = 1 + (elapsed / maxTime) * 1.5; // goes from 1.0 to 2.5

        stateTimer -= dt;

        if (stateTimer <= 0) {
            switch (state) {
                case 'facing_board':
                    // Teacher is about to turn! Show warning first
                    state = 'warning';
                    stateTimer = WARNING_DURATION;
                    break;
                case 'warning':
                    // Now actually turn around
                    state = 'facing_students';
                    stateTimer = randomStudentsTime();
                    break;
                case 'facing_students':
                    // Turn back to board
                    state = 'facing_board';
                    stateTimer = randomBoardTime();
                    break;
            }
        }

        return state;
    }

    function getState() {
        return state;
    }

    function isFacingStudents() {
        return state === 'facing_students';
    }

    function isWarning() {
        return state === 'warning';
    }

    function getTimeInState() {
        return stateTimer;
    }

    return {
        init,
        update,
        getState,
        isFacingStudents,
        isWarning,
        getTimeInState,
    };
})();
