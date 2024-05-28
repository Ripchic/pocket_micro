export class NashTable {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.table_values = Array(x).fill().map(() => Array(y).fill().map(() => ['', '']));
        this.optimal_choice = Array(x).fill().map(() => Array(y).fill().map(() => [0, 0]));
        this.valid_x = Array(x).fill().map(() => 0);
        this.valid_y = Array(y).fill().map(() => 0);
    }

    setValue(i, j, id, value) {
        this.table_values[i][j][id] = value;
    }
    getValue(i, j, id) {
        return this.table_values[i][j][id];
    }
}