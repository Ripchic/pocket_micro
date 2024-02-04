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
                line += this.nash_game.table[i][j][0] + ',' + this.nash_game.table[i][j][1] + ' ';
            }
            console.log(line);
        }
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


}

let [x, y] = prompt('Enter the size of the table cols and rows separated with space: ').split(' ').map(Number);
console.log(x, y);
let game = new Nash_console_game(x, y);
game.set_table_input(game.read_file());
game.print_table();