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
                    cell.innerHTML = `<input type='text' id='${inputId}' class='strategy-cell' />`; // Use input for strategy cells
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
        console.log(this.nash_game.x);
        this.tableContainer.innerHTML = '';

        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.createTBody();

        let row = thead.insertRow();
        let cell = row.insertCell();
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

                let cell2 = row.insertCell();
                cell2.innerHTML = values[1];
            }
        }

        this.tableContainer.appendChild(table);
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

document.getElementById("runNash").addEventListener("click", () => {
    game.generate_results_table();
});