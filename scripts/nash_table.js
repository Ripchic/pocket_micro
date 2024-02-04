export class NashTable {
    /*
    * Create table with x rows and y columns
    * */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.table = Array(x).fill().map(() => Array(y).fill().map(() => ['', '']));
    }

    clear() {
        /*
        * Clean the table
        * */
        for (let i = 0; i < this.x; i++) {
            for (let j = 0; j < this.y; j++) {
                this.table[i][j] = ['', ''];
            }
        }
    }

    set_value(i, j, id, value) {
        /*
        * Set value in a table on (i, j) position with id index
         */
        this.table[i][j][id] = value;
    }

    check_empty_cells() {
        /*
        * Check if there are any empty cells
        * */
        for (let i = 0; i < this.x; i++) {
            for (let j = 0; j < this.y; j++) {
                for (let k = 0; k < 2; k++) {
                    if (this.table[i][j][k] === '') {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}