import {NashTable} from '/scripts/nash_table.js';

class Nash_browser_game {
    constructor(x, y, canvas, text) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.text = text;
        this.table = new NashTable(x, y);
        this.cell_size = Math.floor(Math.min(this.canvas.width / this.x, this.canvas.height / this.y));
        this.draw();
    }

    draw() {
        this.context.fillStyle = "#ffffff";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        let x = this.table.x
        let y = this.table.y

        for (let i = 0; i <= y; i++) {
            // draw horizontal lines
            this.context.beginPath();
            this.context.moveTo(0, this.cell_size * i);
            this.context.lineTo(this.cell_size * x, this.cell_size * i);
            this.context.stroke();
        }
        for (let i = 0; i <= x; i++) {
            // draw vertical lines
            this.context.beginPath();
            this.context.moveTo(this.cell_size * i, 0);
            this.context.lineTo(this.cell_size * i, this.cell_size * y);
            this.context.stroke();

        }
    }
}

var game;
const canvas = document.getElementById('canvas')

window.addEventListener('load', () => {
    const x = 7;
    const y = 3;
    game = new Nash_browser_game(x, y, canvas, 'Nash game');
});
