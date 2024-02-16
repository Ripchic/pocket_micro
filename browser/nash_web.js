import {NashTable} from '../scripts/nash_table.js';

class Nash_browser_game {
    constructor(x, y, tableInput, tableContainer) {
        this.tableInput = tableInput;
        this.tableContainer = tableContainer;
        this.nash_game = new NashTable(x, y);
        console.log("constructor");
    }

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

    read_cell(i, j) {
        let str = document.getElementById(`cell-${i}-${j}`).value;
        if (str.includes('/')) {
            const parts = str.split('/');
            const int1 = parseInt(parts[0], 10);
            const int2 = parseInt(parts[1], 10);
            return [int1, int2];
        } else if (str.includes(',')) {
            const parts = str.split(',');
            const int1 = parseInt(parts[0], 10);
            const int2 = parseInt(parts[1], 10);
            return [int1, int2];
        } else {
            return alert('Please enter a valid string with a comma or a slash as separator');
        }
    }

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
        }

        for (let i = 0; i < this.nash_game.x; i++) {
            let row = tbody.insertRow();
            for (let j = 0; j < this.nash_game.y; j++) {
                if (j === 0) {
                    let cell = row.insertCell();
                    cell.innerHTML = `Strategy ${i + 1}`;
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

    async find_and_mark_nash_equilibrium() {
        console.log('find_and_mark_nash_equilibrium');

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
                const cell = document.getElementById(`cell-${row}-${col}-0`);
                cell.style.backgroundColor = 'grey';
                await this.sleep(500);
            }

            for (let j of max_ids) {
                const cell = document.getElementById(`cell-${j}-${col}-0`);
                cell.style.backgroundColor = 'yellow';
                this.nash_game.optimal_choice[j][col][0] = 1;
                await this.sleep(500);
            }
            for (let j = 0; j < this.nash_game.x; j++) {
                if (!max_ids.includes(j)) {
                    const cell = document.getElementById(`cell-${j}-${col}-0`);
                    cell.style.backgroundColor = 'white';
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
                const cell = document.getElementById(`cell-${i}-${j}-1`);
                cell.style.backgroundColor = 'grey';
                await this.sleep(500);
            }
            for (let j of max_ids) {
                const cell = document.getElementById(`cell-${i}-${j}-1`);
                cell.style.backgroundColor = '#00b4ff';
                this.nash_game.optimal_choice[i][j][1] = 1;
                await this.sleep(500);
            }
            for (let j = 0; j < this.nash_game.y; j++) {
                if (!max_ids.includes(j)) {
                    const cell = document.getElementById(`cell-${i}-${j}-1`);
                    cell.style.backgroundColor = 'white';
                }
            }
        }
    }

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

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

let game = NaN;
document.getElementById("generateTable").addEventListener("click", () => {
    let x = parseInt(document.getElementById('player1Strategies').value);
    let y = parseInt(document.getElementById('player2Strategies').value);
    let tableInput = document.getElementById('tableInput');
    let tableContainer = document.getElementById('tableContainer');
    game = new Nash_browser_game(x, y, tableInput, tableContainer);
    game.generate_table(x, y);
});

document.getElementById("runNash").addEventListener("click", async () => {
    game.generate_results_table();
    await game.find_and_mark_nash_equilibrium();
    game.print_optimal();
    game.mark_nash();
});
