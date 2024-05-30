import {NashTable} from '../scripts/nash_table.js';

// Examples with data for ready presets
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

function deepCopy(arr) {
    return JSON.parse(JSON.stringify(arr));
}

class Nash_browser_game {
    constructor(x, y, tableInput, tableContainer, actions) {
        this.tableInput = tableInput; // To read user data input
        this.tableContainer = tableContainer; // Part on the web page to display final table with animation
        this.actionsContainer = actions; // Container for data with ifo about steps
        this.actions = []; // Storing log of main actions while iteration
        this.nashGame = new NashTable(x, y);
        this.steps = []; // Info about changings in the resulting table
        this.maxSteps = 0;
        this.isPaused = false; // User pause status
        this.currentStep = 0;

        this.isAnimating = false;
        this.animationTimeout = null; // Property to store timeout ID

        // Button event listeners
        this.delay = 500; // Default delay in ms
        this.setupButtonListeners();
    }

    setupButtonListeners() {
        document.getElementById("fillRandom").addEventListener("click", this.fillTableWithRandomValues);

        document.getElementById('previous').addEventListener('click', () => this.previousStep());
        document.getElementById('next').addEventListener('click', () => this.nextStep());
        document.getElementById('play').addEventListener('click', () => {
            this.toggleStartPause();
            document.getElementById('play').textContent = this.isPaused ? 'Resume' : 'Pause';
        });
        const slider = document.getElementById('slider');
        slider.oninput = (event) => {
            this.currentStep = parseInt(event.target.value);
            this.updateStep();
            document.getElementById("sliderValue").value = this.currentStep;
        };
        document.getElementById('sliderValue').addEventListener('change', (event) => {
            let num = parseInt(event.target.value);
            if (num < 0 || num >= this.maxSteps) {
                this.currentStep = 0;
            } else {
                this.currentStep = num;
            }
            this.updateStep();
            document.getElementById("slider").value = this.currentStep;
        });
        const speedSlider = document.getElementById('speedSlider');
        const speedValueText = document.getElementById('speedValueText');
        speedSlider.oninput = (event) => {
            this.delay = parseInt(event.target.value);
            speedValueText.textContent = `${this.delay} ms`;
        };
    }

    generateTable(x, y) {
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

    readCell(i, j) {
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

    updateData() {
        this.maxSteps = this.steps.length;
        this.currentStep = 0;
        let slider = document.getElementById('slider');
        this.isPaused = false;
        slider.max = this.maxSteps - 1;
        slider.value = this.currentStep;
        this.actionsContainer.innerHTML = '';
    }

    generateResultsTable() {
        this.tableContainer.innerHTML = '';

        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.createTBody();

        let row = thead.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = 'Player 1 \\ Player 2';
        for (let i = 0; i < this.nashGame.y; i++) {
            cell = row.insertCell();
            cell.colSpan = 2; // Span two columns
            cell.innerHTML = `Strategy ${i + 1}`;
            cell.id = `Str ${i + 1}-0`;
        }

        for (let i = 0; i < this.nashGame.x; i++) {
            let row = tbody.insertRow();
            for (let j = 0; j < this.nashGame.y; j++) {
                if (j === 0) {
                    let cell = row.insertCell();
                    cell.innerHTML = `Strategy ${i + 1}`;
                    cell.id = `Str ${i + 1}-1`;
                }
                const values = this.readCell(i, j);
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


    calculateSteps() {
        this.steps = [];
        this.actions = [];
        let temp_table = Array(this.nashGame.x).fill().map(() => Array(this.nashGame.y).fill().map(() => ['', '']));
        this.steps.push(deepCopy(temp_table));

        this.actions.push('Action I: Find optimal strategies for player 1:');
        for (let col = 0; col < this.nashGame.y; col++) {
            this.actions.push(`Step ${2 * col + 1 + col}: Fix strategy ${col + 1} for P2 and compare outcomes of P1`);
            let max_values = this.readCell(0, col);
            let max_ids = [0];
            for (let row = 0; row < this.nashGame.x; row++) {
                const values = this.readCell(row, col);
                if (values[0] > max_values[0]) {
                    max_values[0] = values[0];
                    max_ids = [row];
                } else if (values[0] === max_values[0]) {
                    max_ids.push(row);
                }
                temp_table[row][col][0] = 'grey';
            }
            this.steps.push(deepCopy(temp_table));

            this.actions.push(`Step ${3 * col + 2}-${3 * col + 3}: The best strategy/ies for P1 are:`);
            for (let j = 0; j < this.nashGame.x; j++) {
                if (max_ids.includes(j)) {
                    temp_table[j][col][0] = 'yellow';
                    this.nashGame.optimal_choice[j][col][0] = 1;
                    this.actions.push(`${j + 1}`);
                }
            }
            this.steps.push(deepCopy(temp_table));

            for (let j = 0; j < this.nashGame.x; j++) {
                if (!max_ids.includes(j)) {
                    temp_table[j][col][0] = '';
                }
            }
            this.steps.push(deepCopy(temp_table));
        }
        this.actions.push(`Action II : Find optimal strategies for player 2:`);
        for (let i = 0; i < this.nashGame.x; i++) {
            this.actions.push(`Step ${3 * (this.nashGame.y - 1) + 4 + 3 * i}: Fix strategy ${i + 1} for P1 and compare outcomes of P2`);
            let max_values = this.readCell(i, 0);
            let max_ids = [0];
            for (let j = 0; j < this.nashGame.y; j++) {
                const values = this.readCell(i, j);
                if (values[1] > max_values[1]) {
                    max_values[1] = values[1];
                    max_ids = [j];
                } else if (values[1] === max_values[1]) {
                    max_ids.push(j);
                }
                temp_table[i][j][1] = 'grey';
            }
            this.steps.push(deepCopy(temp_table));


            this.actions.push(`Step ${3 * (this.nashGame.y - 1) + 5 + 3 * i}-${3 * (this.nashGame.y - 1) + 6 + 3 * i}: The best strategy/ies for P2 are:`);
            for (let j = 0; j < this.nashGame.y; j++) {
                if (max_ids.includes(j)) {
                    temp_table[i][j][1] = 'magenta';
                    this.nashGame.optimal_choice[i][j][1] = 1;
                    this.actions.push(`${j + 1}`);
                }
            }
            this.steps.push(deepCopy(temp_table));

            for (let j = 0; j < this.nashGame.y; j++) {
                if (!max_ids.includes(j)) {
                    temp_table[i][j][1] = '';
                }
            }
            this.steps.push(deepCopy(temp_table));
        }

        this.actions.push(`Step ${this.steps.length}: Observe strategies forming Nash Equilibrium:`);
        let numNash = 0;
        for (let i = 0; i < this.nashGame.x; i++) {
            for (let j = 0; j < this.nashGame.y; j++) {
                if (this.nashGame.optimal_choice[i][j][0] === 1 && this.nashGame.optimal_choice[i][j][1] === 1) {
                    this.nashGame.valid_x[i] = 1;
                    this.nashGame.valid_y[j] = 1;
                    temp_table[i][j][0] = '#53e553';
                    temp_table[i][j][1] = '#53e553';
                    this.actions.push(`P1: ${i + 1}; P2: ${j + 1}`);
                    numNash++;
                }
            }
        }
        if (!numNash) {
            this.actions.push('No Nash Equilibrium');
        }
        this.steps.push(deepCopy(temp_table));
    }

    iterateSteps() {
        if (this.currentStep < this.maxSteps && !this.isPaused) {
            this.updateStep();
            this.currentStep++;
            this.animationTimeout = setTimeout(() => this.iterateSteps(), this.delay); // Use the delay value from the slider
        } else {
            this.isAnimating = false; // Reset the flag when animation ends or is paused
            clearTimeout(this.animationTimeout); // Ensure no lingering timeout calls
        }
    }

    toggleStartPause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.iterateSteps();
        }
    }


    /*
    * Move to the next step
    */
    nextStep() {
        if (this.currentStep < this.maxSteps) {
            this.currentStep++;
            this.updateStep();
            document.getElementById("slider").value = this.currentStep;
            document.getElementById("sliderValue").value = this.currentStep;
        }
    }

    /*
    * Move to the previous step
    */
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStep();
            document.getElementById("slider").value = this.currentStep;
            document.getElementById("sliderValue").value = this.currentStep;
        }
    }

    /*
    * Update according to the current step
    */
    updateStep() {
        const step_colors = this.steps[this.currentStep];
        for (let i = 0; i < this.nashGame.x; i++) {
            for (let j = 0; j < this.nashGame.y; j++) {
                const cell1 = document.getElementById(`cell-${i}-${j}-0`);
                cell1.style.backgroundColor = step_colors[i][j][0];
                const cell2 = document.getElementById(`cell-${i}-${j}-1`);
                cell2.style.backgroundColor = step_colors[i][j][1];

            }
        }
        document.getElementById("sliderValue").value = this.currentStep;
        document.getElementById("slider").value = this.currentStep;
    }

    loadPresetInput(preset) {
        for (let i = 0; i < preset.length; i++) {
            for (let j = 0; j < preset[0].length; j++) {
                const values = preset[i][j];
                document.getElementById(`cell-${i}-${j}`).value = `${values[0]}/${values[1]}`;
            }
        }
    }

    fillTableWithRandomValues() {
        if (!game) {
            alert("Please generate a table first!");
            return;
        }
        const x = parseInt(document.getElementById('player1Strategies').value, 10);
        const y = parseInt(document.getElementById('player2Strategies').value, 10);

        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                const cellValue1 = Math.floor(Math.random() * 10); // Random number for Player 1
                const cellValue2 = Math.floor(Math.random() * 10); // Random number for Player 2
                document.getElementById(`cell-${i}-${j}`).value = `${cellValue1}/${cellValue2}`;
            }
        }
    }

    updateActions(action) {
        let actionElement = document.createElement('div');
        actionElement.textContent = action;
        this.actionsContainer.appendChild(actionElement);
        this.actionsContainer.scrollTop = this.actionsContainer.scrollHeight; // Scroll to the bottom of the container
    }
}

let game = NaN;

document.getElementById("generateTable").addEventListener("click", () => {
    let x = parseInt(document.getElementById('player1Strategies').value, 10);
    let y = parseInt(document.getElementById('player2Strategies').value, 10);
    let tableInput = document.getElementById('tableInput');
    let tableContainer = document.getElementById('tableContainer');
    let actions = document.getElementById('actions');
    game = new Nash_browser_game(x, y, tableInput, tableContainer, actions);
    game.generateTable(x, y);
});

document.getElementById("runNash").addEventListener("click", () => {
    if (game.isAnimating) {
        clearTimeout(game.animationTimeout); // Clear the ongoing timeout if animation is in progress
    }
    game.isAnimating = true;
    game.isPaused = false;
    game.currentStep = 0;
    game.generateResultsTable();
    game.calculateSteps();
    game.updateData();
    game.iterateSteps(); // Run the animation
    game.actions.forEach(action => game.updateActions(action));
});

function setupGameWithPreset(preset) {
    let x = preset.length;
    let y = preset[0].length;
    document.getElementById('player1Strategies').value = x;
    document.getElementById('player2Strategies').value = y;
    let tableInput = document.getElementById('tableInput');
    let tableContainer = document.getElementById('tableContainer');
    let actions = document.getElementById('actions');
    tableContainer.innerHTML = '';
    if (game.isAnimating) {
        clearTimeout(game.animationTimeout); // Clear the ongoing timeout if animation is in progress
    }
    game = new Nash_browser_game(x, y, tableInput, tableContainer, actions);
    game.generateTable(x, y);
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

