/**
 * SerialDictWeb class represents a web-based implementation of the Serial Dictatorship algorithm.
 * It contains properties related to the game state, such as the current step, the list of steps, and the delay between steps.
 * It also contains properties related to the game interface, such as the table container and various buttons and inputs.
 * The class includes methods for handling user interactions, updating the game state, and animating the algorithm.
 *
 * @param {HTMLInputElement} playerNumInput - The input element for the number of players.
 * @param {HTMLInputElement} itemNumInput - The input element for the number of items.
 * @param {HTMLElement} tableContainer - The container element for the game table.
 */
class SerialDictWeb {
    constructor(playerNumInput, itemNumInput, tableContainer) {
        this.tableContainer = tableContainer;
        this.numAgentsInput = playerNumInput;
        this.numItemsInput = itemNumInput;
        this.currentStep = 0;
        this.steps = [];
        this.isPaused = false;
        this.isAnimating = false;
        this.animationTimeout = null;
        this.delay = 500; // Default speed in milliseconds

        // Buttons and event listeners
        this.pauseResumeButton = document.getElementById('pause_resume');
        this.clearButton = document.getElementById('clear');
        this.resetButton = document.getElementById('reset');
        this.populateRandomButton = document.getElementById('populateRandom');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValueText = document.getElementById('speedValueText');

        this.numAgentsInput.addEventListener('input', () => this.generateTable());
        this.numItemsInput.addEventListener('input', () => this.generateTable());
        this.populateRandomButton.addEventListener('click', () => this.populateRandom());
        this.pauseResumeButton.addEventListener('click', () => {
            this.toggleStartPause();
            this.pauseResumeButton.innerHTML = this.isPaused ? 'Resume' : 'Pause';
        });
        this.clearButton.addEventListener('click', () => this.clear());
        this.resetButton.addEventListener('click', () => this.reset());
        this.speedSlider.addEventListener('input', () => this.updateSpeed());

        this.generateTable(); // Generate the table to add the event listeners of the rows
    }

    // Update the speed value based on the slider position
    updateSpeed() {
        this.delay = parseInt(this.speedSlider.value, 10);
        this.speedValueText.innerHTML = `${this.delay} ms`;
    }

    // Generate the table based on the number of agents and items
    generateTable() {
        const numAgents = parseInt(this.numAgentsInput.value, 10);
        const numItems = parseInt(this.numItemsInput.value, 10);

        if (isNaN(numAgents) || isNaN(numItems)) {
            console.error('Invalid input. Please enter valid numbers.');
            return;
        }

        // Clear the table container
        this.tableContainer.innerHTML = '';
        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.createTBody();

        // Create the first row of the table header
        let row = thead.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = 'Players';

        // Add a new cell for "Item preferences"
        cell = row.insertCell();
        cell.colSpan = numItems * 2 - 1; // span across all item cells and '>' signs
        cell.innerHTML = 'Item preferences';

        // Create rows for each player and their preferences
        for (let i = 0; i < numAgents; i++) {
            row = tbody.insertRow();
            // Add event listeners for drag and drop functionality
            row.draggable = true;
            row.addEventListener('dragstart', this.handleDragStart.bind(this));
            row.addEventListener('dragover', this.handleDragOver.bind(this));
            row.addEventListener('drop', this.handleDrop.bind(this));
            row.addEventListener('dragend', this.handleDragEnd.bind(this));

            cell = row.insertCell();
            cell.innerHTML = `Player ${i + 1}`;
            for (let j = 0; j < numItems; j++) {
                cell = row.insertCell();
                const inputId = `cell-${i}-${j}`;
                cell.innerHTML = `<input type='text' id='${inputId}' class='item-input'/>`;
                if (j < numItems - 1) {
                    cell = row.insertCell();
                    cell.innerHTML = '>';
                }
            }
        }
        // Append the table to the container
        this.tableContainer.appendChild(table);
    }

    handleDragStart(e) {
        e.target.style.opacity = '0.3';
        this.draggedRow = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e) {
        e.preventDefault(); // Prevent the default action
        e.stopPropagation(); // Stop the event from bubbling up when overlapped

        if (this.draggedRow !== e.target) {
            const draggedIndex = Array.from(this.tableContainer.querySelectorAll('tbody tr')).indexOf(this.draggedRow);
            const droppedIndex = Array.from(this.tableContainer.querySelectorAll('tbody tr')).indexOf(e.target.closest('tr'));
            // Insert the dragged row before or after the dropped row based on the position
            if (draggedIndex < droppedIndex) {
                e.target.closest('tr').parentNode.insertBefore(this.draggedRow, e.target.closest('tr').nextSibling);
            } else {
                e.target.closest('tr').parentNode.insertBefore(this.draggedRow, e.target.closest('tr'));
            }

            this.updateRowIds();
            this.readData();
        }
    }

    handleDragEnd(e) {
        e.target.style.opacity = '1';
        this.draggedRow = null;
    }


    // Update the input IDs based on the row and cell indices
    // This is necessary for drag and drop functionality
    updateRowIds() {
        const rows = this.tableContainer.querySelectorAll('tbody tr');
        rows.forEach((row, rowIndex) => {
            const inputs = row.querySelectorAll('.item-input');
            inputs.forEach((input, cellIndex) => {
                input.id = `cell-${rowIndex}-${cellIndex}`;
            });
        });
    }


    // Populate the table with random references
    populateRandom() {
        // Read the number of agents and items from the input fields
        const numAgents = parseInt(this.numAgentsInput.value, 10);
        const numItems = parseInt(this.numItemsInput.value, 10);

        // Iterate over each cell in the table and populate it with a random value without duplicates
        for (let i = 0; i < numAgents; i++) {
            let availableItems = Array.from({length: numItems}, (_, index) => index + 1);
            for (let j = 0; j < numItems; j++) {
                const inputId = `cell-${i}-${j}`;
                const input = document.getElementById(inputId);
                if (availableItems.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableItems.length);
                    input.value = availableItems[randomIndex];
                    availableItems.splice(randomIndex, 1);
                }
            }
        }
    }

    // Read the data from the table and store it in the preferences array
    readData() {
        const numAgents = parseInt(this.numAgentsInput.value, 10);
        const numItems = parseInt(this.numItemsInput.value, 10);
        this.preferences = Array.from({length: numAgents}, () => Array(numItems).fill(''));

        for (let i = 0; i < numAgents; i++) {
            for (let j = 0; j < numItems; j++) {
                const inputId = `cell-${i}-${j}`;
                const input = document.getElementById(inputId);
                this.preferences[i][j] = input.value;
            }
        }
    }

    // Calculate the steps based on the preferences
    calculateSteps() {
        this.steps = [];
        const numAgents = parseInt(this.numAgentsInput.value, 10);
        const numItems = parseInt(this.numItemsInput.value, 10);
        const itemAvailability = Array(numItems + 1).fill(true);

        // Iterate over each agent and their preferences
        for (let i = 0; i < numAgents; i++) {
            for (let j = 0; j < numItems; j++) {
                const itemIndex = parseInt(this.preferences[i][j], 10);
                this.steps.push({agent: i, item: j, color: 'grey'});
                if (itemIndex && itemAvailability[itemIndex]) {
                    // If the item is available, mark it green and update the availability
                    this.steps.push({agent: i, item: j, color: '#53e553'});
                    itemAvailability[itemIndex] = false;
                    break;
                } else {
                    // If the item is not available, mark it red
                    this.steps.push({agent: i, item: j, color: '#fa6c6c'});
                }
            }
        }
    }

    // Update the animation according to the current step
    updateStep() {
        if (this.currentStep < this.steps.length) {
            const step = this.steps[this.currentStep];
            const cell = document.getElementById(`cell-${step.agent}-${step.item}`);
            cell.style.backgroundColor = step.color;
        }
    }

    // Iterate over the steps and update the table
    iterateSteps() {
        if (!this.isPaused && this.currentStep < this.steps.length) {
            this.updateStep();
            this.currentStep++;
            this.animationTimeout = setTimeout(() => this.iterateSteps(), this.delay);
        } else {
            this.isAnimating = false;
            clearTimeout(this.animationTimeout);
        }
    }

    toggleStartPause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused && !this.isAnimating) {
            this.isAnimating = true;
            this.iterateSteps();
        }
    }

    // Completely clear the table
    clear() {
        this.steps = [];
        const numAgents = parseInt(this.numAgentsInput.value, 10);
        const numItems = parseInt(this.numItemsInput.value, 10);

        for (let i = 0; i < numAgents; i++) {
            for (let j = 0; j < numItems; j++) {
                const inputId = `cell-${i}-${j}`;
                const input = document.getElementById(inputId);
                // Clear the input value and background color
                input.value = '';
                input.style.backgroundColor = '';
            }
        }
    }

    // Clear the colors in the table and reset the current step (prepare for a new run with same data)
    reset() {
        this.currentStep = 0;
        this.isPaused = false;
        this.isAnimating = false;
        clearTimeout(this.animationTimeout);
        const numAgents = parseInt(this.numAgentsInput.value, 10);
        const numItems = parseInt(this.numItemsInput.value, 10);

        for (let i = 0; i < numAgents; i++) {
            for (let j = 0; j < numItems; j++) {
                const inputId = `cell-${i}-${j}`;
                const input = document.getElementById(inputId);
                input.style.backgroundColor = '';
            }
        }
    }
}

// Initialize the SerialDictWeb class
const tableContainer = document.getElementById('preferences_table');
const numAgentsInput = document.getElementById('num_agents');
const numItemsInput = document.getElementById('num_items');
const game = new SerialDictWeb(numAgentsInput, numItemsInput, tableContainer);

document.getElementById('run_algorithm').addEventListener('click', () => {
    game.reset();
    game.readData();
    game.calculateSteps();
    game.iterateSteps();
});
