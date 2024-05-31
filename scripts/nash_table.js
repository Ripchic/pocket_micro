/**
 * NashTable class represents a table used in Nash equilibrium computations for 2 players.
 * It contains the table values, optimal choices, and valid x and y values.
 */
export class NashTable {
    /**
     * Constructs a new instance of NashTable.
     * Initializes the table values, optimal choices, and valid x and y values.
     *
     * @param {number} x - The number of rows in the table.
     * @param {number} y - The number of columns in the table.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // table_values[i][j] = [value1, value2] represents the value of player 1 and player 2 at cell (i, j).
        this.table_values = Array(x).fill().map(() => Array(y).fill().map(() => ['', '']));
        // optimal_choice[i][j] marks if the cell (i, j) is an optimal choice for player 1 or player 2.
        this.optimal_choice = Array(x).fill().map(() => Array(y).fill().map(() => [0, 0]));
        this.valid_x = Array(x).fill().map(() => 0);
        this.valid_y = Array(y).fill().map(() => 0);
    }

    /**
     * Sets the value at the specified index in the table
     *
     * @param {number} i - The row index.
     * @param {number} j - The column index.
     * @param {number} id - The id to set value: (0 for player 1, 1 for player 2).
     * @param {any} value - The value to set.
     */
    setValue(i, j, id, value) {
        this.table_values[i][j][id] = value;
    }

    /**
     * Gets the value at the specified index in the table.
     *
     * @param {number} i - The row index.
     * @param {number} j - The column index.
     * @param {number} id - The id to get value: (0 for player 1, 1 for player 2).
     * @returns {any} The value at the specified index.
     */
    getValue(i, j, id) {
        return this.table_values[i][j][id];
    }
}