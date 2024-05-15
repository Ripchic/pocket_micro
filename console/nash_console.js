import {NashTable} from '../scripts/nash_table.js';
import promptSync from 'prompt-sync';

const prompt = promptSync();
import fs from 'fs';

class Nash_console_game {
    constructor(x, y) {
        this.nash_game = new NashTable(x, y);
    }

    print_table() {
        // Print the content of the table
        for (let i = 0; i < this.nash_game.x; i++) {
            let line = '';
            for (let j = 0; j < this.nash_game.y; j++) {
                line += this.nash_game.get_value(i, j, 0) + ',' + this.nash_game.get_value(i, j, 0) + ' ';
            }
            console.log(line);
        }
        console.log('-'.repeat(20));
    }

    print_stats() {
        // Print the optimal strategies for both players
        let X_optimal = 'Player 1: |';
        let Y_optimal = 'Player 2: |';
        for (let i = 0; i < this.nash_game.x; i++) {
            X_optimal += this.nash_game.valid_x[i] + '|'
        }
        for (let i = 0; i < this.nash_game.y; i++) {
            Y_optimal += this.nash_game.valid_y[i] + '|'
        }
        console.log(X_optimal);
        console.log(Y_optimal);

    }

    set_table_input(inputString) {
        const rows = inputString.split('\n');
        // Loop through each row and column, and fill the table
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i].split(' ');
            for (let j = 0; j < row.length; j++) {
                const values = row[j].split(',');
                this.nash_game.set_value(i, j, 0, Number(values[0]));
                this.nash_game.set_value(i, j, 1, Number(values[1]));
            }
        }
    }

    read_file() {
        let file = '../data_sample/nash_data.txt';
        let data = fs.readFileSync(file);
        console.log("Successfully read file");
        return data.toString();
    }

    print_optimal() {
        for (let i = 0; i < this.nash_game.x; i++) {
            let line = '';
            for (let j = 0; j < this.nash_game.y; j++) {
                line += this.nash_game.optimal_choice[i][j][0] + ',' + this.nash_game.optimal_choice[i][j][1] + ' ';
            }
            console.log(line);
        }
        console.log('-'.repeat(20));
    }

    play() {
        // Iterate over the table and find the optimal strategies for 1st player
        let max_val = 0;
        let max_ids = [];
        for (let col = 0; col < this.nash_game.y; col++) {
            max_val = this.nash_game.get_value(0, col, 0);
            max_ids = [0];
            for (let row = 1; row < this.nash_game.x; row++) {
                if (this.nash_game.get_value(row, col, 0) > max_val) {
                    max_val = this.nash_game.get_value(row, col, 0);
                    max_ids = [row];
                } else if (this.nash_game.get_value(row, col, 0) === max_val) {
                    max_ids.push(row);
                }
            }
            for (let row of max_ids) {
                this.nash_game.optimal_choice[row][col][0] = 1;
            }
            this.print_optimal();
        }
        // do the same for the 2nd player
        for (let row = 0; row < this.nash_game.x; row++) {
            max_val = this.nash_game.get_value(row, 0, 1);
            max_ids = [0];
            for (let col = 1; col < this.nash_game.y; col++) {
                if (this.nash_game.get_value(row, col, 1) > max_val) {
                    max_val = this.nash_game.get_value(row, col, 1);
                    max_ids = [col];
                } else if (this.nash_game.get_value(row, col, 1) === max_val) {
                    max_ids.push(col);
                }
            }
            for (let col of max_ids) {
                this.nash_game.optimal_choice[row][col][1] = 1;
            }
            this.print_optimal();
        }
        // iterate over the optimal strategies and find the Nash equilibrium
        let nash = []
        for (let i = 0; i < this.nash_game.x; i++) {
            for (let j = 0; j < this.nash_game.y; j++) {
                if (this.nash_game.optimal_choice[i][j][0] === 1 && this.nash_game.optimal_choice[i][j][1] === 1) {
                    this.nash_game.valid_x[i] = 1;
                    this.nash_game.valid_y[j] = 1;
                    nash.push([i + 1, j + 1]);
                }
            }
        }
        console.log('Nash equilibrium at: ', nash);

        this.print_stats();
    }

}

let [x, y] = prompt('Enter the size of the table rows and columns separated with space: ').split(' ').map(Number);
console.log(x, y);
let game = new Nash_console_game(x, y);
game.set_table_input(game.read_file());
game.print_table();
console.log("Players possible strategies:");
game.print_stats();
console.log("-".repeat(20));
console.log("Game started");
console.log("Log of optimal strategies: ");
game.play();