export class NashTable {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.table_values = Array(x).fill().map(() => Array(y).fill().map(() => ['', '']));
        this.optimal_choice = Array(x).fill().map(() => Array(y).fill().map(() => [0, 0]));
        this.valid_x = Array(x).fill().map(() => 0);
        this.valid_y = Array(y).fill().map(() => 0);
    }

    set_value(i, j, id, value) {
        this.table_values[i][j][id] = value;
    }
    get_value(i, j, id) {
        return this.table_values[i][j][id];
    }

    refresh_table_size(x, y) {
        this.x = x;
        this.y = y;
        this.table_values = Array(x).fill().map(() => Array(y).fill().map(() => ['', '']));
        this.optimal_choice = Array(x).fill().map(() => Array(y).fill().map(() => [0, 0]));
        this.valid_x = Array(x).fill().map(() => 0);
        this.valid_y = Array(y).fill().map(() => 0);
    }
}