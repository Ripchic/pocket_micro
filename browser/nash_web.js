import {NashTable} from '../scripts/nash_table.js';

const presets = {
    preset1: [
        [[3, 2], [1, 4]],
        [[2, 2], [4, 1]]
    ],
    preset2: [
        [[2, 2], [0, 3]],
        [[3, 1], [1, 1]]
    ]
    ,
    preset3: [
        [[3, 3], [1, 1]],
        [[1, 1], [2, 2]]
    ],
    preset4: [
        [[1, 3], [5, 3]],
        [[1, 8], [5, 8]]
    ],
};

class Nash_browser_game {
    constructor(x, y, tableInput, tableContainer) {
        this.tableInput = tableInput;
        this.tableContainer = tableContainer;
        this.nash_game = new NashTable(x, y);
        this.steps = [];
        this.maxSteps = 0;
        this.isPaused = false;
        this.currentStep = 0;

        this.isAnimating = false;
        this.animationTimeout = null; // Property to store timeout ID

        // Button event listeners
        this.setupButtonListeners();
        console.log("constructor");
    }

    setupButtonListeners() {
        document.getElementById('previous').addEventListener('click', () => this.previousStep());
        document.getElementById('next').addEventListener('click', () => this.nextStep());
        document.getElementById('play').addEventListener('click', () => this.toggleStartPause());
        const slider = document.getElementById('slider');
        slider.oninput = (event) => {
            this.currentStep = parseInt(event.target.value);
            this.calculateMidTable();
            document.getElementById("sliderValue").textContent = this.currentStep;
        };
    }

    /**
     * Updates the colors of the cells in the table based on the current step of the game.
     */
    calculateMidTable() {
        // Create a temporary table with the same dimensions as the game table
        const tempTable = Array(this.nash_game.x).fill().map(() => Array(this.nash_game.y).fill().map(() => [0, 0]));

        // Iterate through the steps array until the temporary step is equal to the current step
        for (let tempStep = 0; tempStep < this.currentStep; tempStep++) {
            const step = this.steps[tempStep];
            tempTable[step.row][step.col][step.id] = step.color;
        }

        // Update the background color of each cell in the game table
        for (let i = 0; i < this.nash_game.x; i++) {
            for (let j = 0; j < this.nash_game.y; j++) {
                const cell1 = document.getElementById(`cell-${i}-${j}-0`);
                cell1.style.backgroundColor = this.getColor(tempTable[i][j][0]);
                const cell2 = document.getElementById(`cell-${i}-${j}-1`);
                cell2.style.backgroundColor = this.getColor(tempTable[i][j][1]);
            }
        }
    }

    // generate table to input user data based on the number of strategies of each player
    generate_table(x, y) {
        console.log("generate_table");
        if (isNaN(x) || isNaN(y) || x < 1 || y < 1) {
            alert('Please enter valid numbers for both players strategies.');
            return;
        }
        this.tableInput.innerHTML = '';
        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.createTBody();
        let row = thead.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = 'Player 1 \\ Player 2';
        for (let i = 0; i < y; i++) {
            cell = row.insertCell();
            cell.innerHTML = `Strategy ${i + 1}`;
        }
        for (let i = 0; i < x; i++) {
            row = tbody.insertRow();
            for (let j = 0; j <= y; j++) {
                cell = row.insertCell();
                if (j === 0) {
                    cell.innerHTML = `Strategy ${i + 1}`;
                } else {
                    const inputId = `cell-${i}-${j - 1}`;
                    cell.innerHTML = `<input type='text' id='${inputId}'/>`;
                }
            }
        }
        this.tableInput.appendChild(table);
    }

    // read cell from the table and return an array with the two values
    read_cell(i, j) {
        let str = document.getElementById(`cell-${i}-${j}`).value;
        if (str.includes('/')) {
            const parts = str.split('/');
            const int1 = parseInt(parts[0], 10);
            const int2 = parseInt(parts[1], 10);
            return [int1, int2];
        } else if (str.includes(';')) {
            const parts = str.split(';');
            const int1 = parseInt(parts[0], 10);
            const int2 = parseInt(parts[1], 10);
            return [int1, int2];
        } else {
            return alert('Please enter a valid string with a comma or a slash as separator');
        }
    }

    // generate the results table with the values from the input table
    generate_results_table() {
        console.log('generate_results_table');
        this.tableContainer.innerHTML = '';

        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.createTBody();

        let row = thead.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = 'Player 1 \\ Player 2';
        for (let i = 0; i < this.nash_game.y; i++) {
            cell = row.insertCell();
            cell.colSpan = 2; // Span two columns
            cell.innerHTML = `Strategy ${i + 1}`;
            cell.id = `Str ${i + 1}-0`;
        }

        for (let i = 0; i < this.nash_game.x; i++) {
            let row = tbody.insertRow();
            for (let j = 0; j < this.nash_game.y; j++) {
                if (j === 0) {
                    let cell = row.insertCell();
                    cell.innerHTML = `Strategy ${i + 1}`;
                    cell.id = `Str ${i + 1}-1`;
                }
                const values = this.read_cell(i, j);
                let cell1 = row.insertCell();
                cell1.innerHTML = values[0];
                cell1.id = `cell-${i}-${j}-0`;

                let cell2 = row.insertCell();
                cell2.innerHTML = values[1];
                cell2.id = `cell-${i}-${j}-1`;
            }
        }

        this.tableContainer.appendChild(table);
    }


    // calculate stes aka the color of each cell
    // 0 = white, 1 = grey, 2 = yellow, 3 = blue, 4 = green
    calculate_steps() {
        console.log('calculate_steps');
        this.steps = [];
        for (let col = 0; col < this.nash_game.y; col++) {
            let max_values = this.read_cell(0, col);
            let max_ids = [0];
            for (let row = 0; row < this.nash_game.x; row++) {
                console.log(`row: ${row}, col: ${col},`);
                const values = this.read_cell(row, col);
                if (values[0] > max_values[0]) {
                    max_values[0] = values[0];
                    max_ids = [row];
                } else if (values[0] === max_values[0]) {
                    max_ids.push(row);
                }
                this.steps.push({row: row, col: col, id: 0, color: 1});

            }

            for (let j of max_ids) {
                this.steps.push({row: j, col: col, id: 0, color: 2});
                this.nash_game.optimal_choice[j][col][0] = 1;

            }
            for (let j = 0; j < this.nash_game.x; j++) {
                if (!max_ids.includes(j)) {
                    this.steps.push({row: j, col: col, id: 0, color: 0});
                }
            }
        }

        for (let i = 0; i < this.nash_game.x; i++) {
            let max_values = this.read_cell(i, 0);
            let max_ids = [0];
            for (let j = 0; j < this.nash_game.y; j++) {
                console.log(`row: ${i}, col: ${j},`);
                const values = this.read_cell(i, j);
                if (values[1] > max_values[1]) {
                    max_values[1] = values[1];
                    max_ids = [j];
                } else if (values[1] === max_values[1]) {
                    max_ids.push(j);
                }
                this.steps.push({row: i, col: j, id: 1, color: 1});

            }
            for (let j of max_ids) {
                this.steps.push({row: i, col: j, id: 1, color: 3});
                this.nash_game.optimal_choice[i][j][1] = 1;

            }
            for (let j = 0; j < this.nash_game.y; j++) {
                if (!max_ids.includes(j)) {
                    this.steps.push({row: i, col: j, id: 1, color: 0});
                }
            }
        }

        for (let i = 0; i < this.nash_game.x; i++) {
            for (let j = 0; j < this.nash_game.y; j++) {
                if (this.nash_game.optimal_choice[i][j][0] === 1 && this.nash_game.optimal_choice[i][j][1] === 1) {
                    this.nash_game.valid_x[i] = 1;
                    this.nash_game.valid_y[j] = 1;
                    this.steps.push({row: i, col: j, id: 0, color: 4});
                    this.steps.push({row: i, col: j, id: 1, color: 4});
                }
            }
        }
    }

    // Update data according to the number of steps
    update_data() {
        this.maxSteps = this.steps.length;
        this.currentStep = 0;
        let slider = document.getElementById('slider');
        this.isPaused = false;
        slider.max = this.maxSteps;
        slider.value = this.currentStep;
    }


    // iterate over the steps
    iterateSteps() {
        if (this.currentStep < this.maxSteps && !this.isPaused) {
            this.updateStep();
            this.currentStep++;
            this.animationTimeout = setTimeout(() => this.iterateSteps(), 500); // Continue to the next step after 500 ms
        } else {
            this.isAnimating = false; // Reset the flag when animation ends or is paused
            clearTimeout(this.animationTimeout); // Ensure no lingering timeout calls
        }
    }


    // toggle between start and pause
    toggleStartPause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.iterateSteps();
        }
    }

    // go to the next step
    nextStep() {
        if (this.currentStep < this.maxSteps) {
            this.currentStep++;
            this.calculateMidTable();
            document.getElementById("slider").value = this.currentStep;
            document.getElementById("sliderValue").innerHTML = this.currentStep;
        }
    }

    // go to the previous step
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.calculateMidTable();
            document.getElementById("slider").value = this.currentStep;
            document.getElementById("sliderValue").innerHTML = this.currentStep;
        }
    }

    // update the step
    updateStep() {
        const step = this.steps[this.currentStep];
        const cell = document.getElementById(`cell-${step.row}-${step.col}-${step.id}`);
        cell.style.backgroundColor = this.getColor(step.color);
        document.getElementById("sliderValue").innerHTML = this.currentStep;
        document.getElementById("slider").value = this.currentStep;
    }

    // get the color based on the number
    getColor(color) {
        switch (color) {
            case 0:
                return 'white';
            case 1:
                return 'grey';
            case 2:
                return 'yellow';
            case 3:
                return '#00b4ff';
            case 4:
                return 'green';
        }
    }

    // print the optimal choices
    print_optimal() {
        for (let i = 0; i < this.nash_game.x; i++) {
            let line = '';
            for (let j = 0; j < this.nash_game.y; j++) {
                line += this.nash_game.optimal_choice[i][j][0] + ',' + this.nash_game.optimal_choice[i][j][1] + ' ';
            }
            console.log(line);
        }
    }

    mark_nash() {
        for (let i = 0; i < this.nash_game.x; i++) {
            for (let j = 0; j < this.nash_game.y; j++) {
                if (this.nash_game.optimal_choice[i][j][0] === 1 && this.nash_game.optimal_choice[i][j][1] === 1) {
                    this.nash_game.valid_x[i] = 1;
                    this.nash_game.valid_y[j] = 1;
                    document.getElementById(`cell-${i}-${j}-0`).style.backgroundColor = 'green';
                    document.getElementById(`cell-${i}-${j}-1`).style.backgroundColor = 'green';

                }
            }
        }
    }

    loadPresetInput(preset) {
        for (let i = 0; i < preset.length; i++) {
            for (let j = 0; j < preset[0].length; j++) {
                const values = preset[i][j];
                document.getElementById(`cell-${i}-${j}`).value = `${values[0]}/${values[1]}`;
            }
        }
    }
}

let game = NaN;

document.getElementById("generateTable").addEventListener("click", () => {
    let x = parseInt(document.getElementById('player1Strategies').value, 10);
    let y = parseInt(document.getElementById('player2Strategies').value, 10);
    let tableInput = document.getElementById('tableInput');
    let tableContainer = document.getElementById('tableContainer');
    game = new Nash_browser_game(x, y, tableInput, tableContainer);
    game.generate_table(x, y);
});

document.getElementById("runNash").addEventListener("click", () => {
    if (game.isAnimating) {
        clearTimeout(game.animationTimeout); // Clear the ongoing timeout if animation is in progress
    }
    game.isAnimating = true;
    game.isPaused = false;
    game.currentStep = 0;
    game.generate_results_table();
    game.calculate_steps();
    game.update_data();
    console.log("Animation restarted from the beginning.");
    game.iterateSteps(); // Run the animation
});

function setupGameWithPreset(preset) {
    let x = preset.length;
    let y = preset[0].length;
    document.getElementById('player1Strategies').value = x;
    document.getElementById('player2Strategies').value = y;
    let tableInput = document.getElementById('tableInput');
    let tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    if (game.isAnimating) {
        clearTimeout(game.animationTimeout); // Clear the ongoing timeout if animation is in progress
    }
    game = new Nash_browser_game(x, y, tableInput, tableContainer);
    game.generate_table(x, y);
    game.loadPresetInput(preset);
}

const presetButtons = {
    'preset1': presets.preset1,
    'preset2': presets.preset2,
    'preset3': presets.preset3,
    'preset4': presets.preset4
};

Object.entries(presetButtons).forEach(([presetId, presetData]) => {
    document.getElementById(presetId).addEventListener('click', () => {
        setupGameWithPreset(presetData);
    });
});
