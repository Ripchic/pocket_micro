import {personIcon, houseIcon, straightArrow, selfArrow, doubleArrow} from '../scripts/svgObject.js';
import {Graph, anyCycle, getAgents} from '../scripts/graph_utils.js';

/**
 * Class representing a participant in the house allocation problem.
 * Each participant has an id, endowment, and a list of preferences.
 * Has methods to assign endowment and set preferences.
 */
class Participant {
    constructor(id) {
        this.id = id;
        this.endowment = null;
        this.preferences = [];
    }

    assignEndowment(house) {
        this.endowment = house;
    }

    setPreferences(preferences) {
        this.preferences = preferences;
    }
}

/**
 * Class representing the house allocation problem.
 * It contains a list of participants and a list of houses.
 * It also contains the table container and the SVG canvas for visualization.
 */
class HouseAllocation {
    constructor() {
        this.participants = [];
        this.houses = [];
        this.tableContainer = document.getElementById('preferences_table');
        this.svgCanvas = document.getElementById('visualizationCanvas');
        this.steps = []; // Store steps of algorithm for animation
        this.isPaused = false;
        this.currentStep = 0;
        this.maxSteps = 0;
        this.delay = 2000;
        this.animationTimeout = null;
        this.isAnimating = false; // Initially, animation is not running
        this.init();
    }

    // Initialize all event listeners and generate the table based on the number of participants
    init() {
        this.bindEventListeners();
        this.generateTable();
    }

    // Bind event listeners to the buttons
    bindEventListeners() {
        document.getElementById('addParticipant').addEventListener('click', () => this.addParticipant());
        document.getElementById('removeParticipant').addEventListener('click', () => this.removeParticipant());
        document.getElementById('populateEndowments').addEventListener('click', () => this.populateEndowments());
        document.getElementById('populatePreferences').addEventListener('click', () => this.populatePreferences());
        document.getElementById('run_algorithm').addEventListener('click', () => {
            if (this.isAnimating) {
                this.stopAnimation(); // Stop ongoing animation
            }
            this.runAnimation();
        });
        document.getElementById('StopResume').addEventListener('click', () => {
            this.togglePause();
            document.getElementById('StopResume').innerHTML = this.isPaused ? 'Resume' : 'Pause';
        });
        document.getElementById('next_step').addEventListener('click', () => this.nextStep());
        document.getElementById('prev_step').addEventListener('click', () => this.prevStep());
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValueText = document.getElementById('speedValueText');
        this.speedSlider.addEventListener('input', () => this.updateSpeed());
    }

    // Method to add a participant
    addParticipant() {
        const id = this.participants.length + 1;
        this.participants.push(new Participant(id));
        this.generateTable();
    }

    // Method to remove a participant
    removeParticipant() {
        this.participants.pop();
        this.generateTable();
    }

    // Random sorting of array
    shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    // Used to populate endowments randomly
    populateEndowments() {
        this.houses = Array.from({length: this.participants.length}, (_, index) => index + 1);
        const shuffledHouses = this.shuffleArray([...this.houses]);
        this.participants.forEach((participant, index) => {
            participant.assignEndowment(shuffledHouses[index]);
        });
        this.updateEndowmentInputs();
    }

    // Assign random preferences to participants
    populatePreferences() {
        this.houses = Array.from({length: this.participants.length}, (_, index) => index + 1);
        this.participants.forEach(participant => {
            participant.setPreferences(this.shuffleArray([...this.houses]));
        });
        this.updatePreferenceInputs();
    }

    // Update the table content based on the participants' endowments
    updateEndowmentInputs() {
        this.participants.forEach((participant, index) => {
            const input = document.getElementById(`endowment-${index}`);
            input.value = participant.endowment;
        });
    }

    // Update the table content based on the participants' preferences
    updatePreferenceInputs() {
        this.participants.forEach((participant, i) => {
            participant.preferences.forEach((preference, j) => {
                const input = document.getElementById(`cell-${i}-${j}`);
                input.value = preference;
            });
        });
    }

    // Generate the table based on the number of participants
    generateTable() {
        this.tableContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const table = document.createElement('table');
        fragment.appendChild(table);
        table.appendChild(this.createTableHeader());
        table.appendChild(this.createTableBody());
        this.tableContainer.appendChild(fragment);
    }

    // Create the table header with columns for players, endowments, and preferences
    createTableHeader() {
        const thead = document.createElement('thead');
        const row = thead.insertRow();
        row.insertCell().textContent = 'Players';
        row.insertCell().textContent = 'Endowment';
        const preferencesCell = row.insertCell();
        preferencesCell.colSpan = this.participants.length * 2 - 1;
        preferencesCell.textContent = 'Preferences';
        return thead;
    }

    // Create the table body with rows for each participant and their endowment and preferences
    createTableBody() {
        const tbody = document.createElement('tbody');
        this.participants.forEach((_, i) => {
            const row = tbody.insertRow();
            row.insertCell().textContent = `Player ${i + 1}`;
            const endowmentCell = row.insertCell();
            const endowmentInput = document.createElement('input');
            endowmentInput.type = 'text';
            endowmentInput.id = `endowment-${i}`;
            endowmentCell.appendChild(endowmentInput);
            for (let j = 0; j < this.participants.length; j++) {
                const preferenceCell = row.insertCell();
                const preferenceInput = document.createElement('input');
                preferenceInput.type = 'text';
                preferenceInput.id = `cell-${i}-${j}`;
                preferenceInput.className = 'item-input';
                preferenceCell.appendChild(preferenceInput);
                if (j < this.participants.length - 1) {
                    const separatorCell = row.insertCell();
                    separatorCell.textContent = '>';
                }
            }
        });
        return tbody;
    }

    // Read the user input data from the table and update the participants' endowments and preferences
    readData() {
        this.houses = [];
        this.participants.forEach((participant, i) => {
            participant.assignEndowment(parseInt(document.getElementById(`endowment-${i}`).value));
            this.houses.push(i + 1);
            let prefs = [];
            for (let j = 0; j < this.participants.length; ++j) {
                const cell = document.getElementById(`cell-${i}-${j}`);
                prefs.push(parseInt(cell.value));
            }
            participant.setPreferences(prefs);
        });
    }

    // Clear the table cell colors
    clearTableColors() {
        const inputs = document.querySelectorAll('.item-input');
        inputs.forEach(input => input.style.backgroundColor = '');
    }

    // Update the speed of the animation based on the slider value
    updateSpeed() {
        this.delay = parseInt(this.speedSlider.value, 10);
        this.speedValueText.innerHTML = `${this.delay / 1000} s`;
    }

    // Start the process of animation
    runAnimation() {
        this.steps = [];
        this.svgCanvas.innerHTML = '';
        this.calculateSteps();
        this.maxSteps = this.steps.length;
        this.isPaused = false;
        this.currentStep = 0;
        this.isAnimating = true;
        this.animate();
    }

    stopAnimation() {
        clearTimeout(this.animationTimeout);
        this.isAnimating = false;
    }

    // Animate the steps of the house allocation algorithm
    animate() {
        if (this.currentStep < this.maxSteps && !this.isPaused) {
            let cur_step = this.steps[this.currentStep];
            this.updateCanvas(cur_step);
            this.currentStep++;
            this.animationTimeout = setTimeout(() => this.animate(), this.delay);
        } else {
            this.isAnimating = false;
        }
    }

    // Update the SVG canvas based on the current step data
    updateCanvas(step) {
        this.svgCanvas.innerHTML = '';
        step.participants.forEach(participant => this.svgCanvas.appendChild(participant));
        step.houses.forEach(house => this.svgCanvas.appendChild(house));
        if (step.arrows) {
            step.arrows.forEach(arrow => this.svgCanvas.appendChild(arrow));
        }
        if (step.allocation) {
            this.updateTableWithAllocation(step.allocation);
        }
    }

    // Toggle the pause status of the animation
    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.animate();
        }
    }

    // Move to the next step of the animation
    nextStep() {
        if (this.currentStep < this.maxSteps) {
            let cur_step = this.steps[this.currentStep];
            this.updateCanvas(cur_step);
            this.currentStep++;
        }
    }

    // Move to the previous step of the animation
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            let cur_step = this.steps[this.currentStep];
            this.updateCanvas(cur_step);
        }
    }

    // Calculate all the steps of the house allocation algorithm
    calculateSteps() {
        this.readData();
        this.clearTableColors();
        let agents = this.participants.map(participant => `P${participant.id}`);
        const houses = this.houses.map(house => `H${house}`);
        const agentPreferences = {};
        const initialOwnership = {};

        this.svgCanvas.innerHTML = ''; // Clear previous contents

        // Canvas dimension
        const radius = this.svgCanvas.clientHeight / 3;
        const centerX = this.svgCanvas.clientWidth / 2;
        const centerY = this.svgCanvas.clientHeight / 2;

        // Variables to store the icons of participants and houses
        let canvas_participants = [];
        let canvas_houses = [];

        // Add icons of participants and their initial houses around circle
        this.participants.sort((a, b) => a.id - b.id);
        this.participants.forEach((participant, index) => {
            const angle = 2 * Math.PI * index / this.participants.length;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const person = personIcon(x, y, `P${participant.id}`, "#419aff", `person-${participant.id}`);
            canvas_participants.push(person);
            const house = houseIcon(x, y, `H${participant.endowment}`, "magenta", `house-${participant.endowment}`);
            canvas_houses.push(house);
        });
        this.steps.push({participants: [...canvas_participants], houses: [...canvas_houses], arrows: null});

        // Initialize agent preferences and initial ownership
        this.participants.forEach((participant) => {
            agentPreferences[`P${participant.id}`] = participant.preferences.map(house => `H${house}`);
            initialOwnership[`H${participant.endowment}`] = `P${participant.id}`;
        });

        agents = new Set(agents);
        let vertexSet = new Set([...agents, ...houses]);
        let G = new Graph(vertexSet);

        let currentPreferenceIndex = {};
        agents.forEach(a => currentPreferenceIndex[a] = 0);

        let preferredHouse = a => agentPreferences[a][currentPreferenceIndex[a]];

        // Add edges from all agents to their current preferred houses
        agents.forEach(a => {
            G.addEdge(a, preferredHouse(a));
        });

        // Add edges from all houses to their current owners
        houses.forEach(h => {
            G.addEdge(h, initialOwnership[h]);
        });

        let allocation = {};

        // While there are agents in the graph we keep finding cycles in it
        while (G.vertices.size > 0) {
            let arrows = [];
            agents.forEach(a => {
                if (G.vertices.has(a)) {
                    const house = preferredHouse(a);
                    const owner = initialOwnership[house];
                    const {x: ax, y: ay} = this.getPositionOfParticipant(parseInt(a.slice(1)));
                    const {x: bx, y: by} = this.getPositionOfParticipant(parseInt(owner.slice(1)));
                    if (owner === a) {
                        const arrow = selfArrow(ax, ay, "blue", `self-arrow-${a}`);
                        arrow.classList.add('arrow');
                        arrows.push(arrow);
                    } else if (a === G.edges.get(G.edges.get(owner)[0])[0]) {
                        const arrow1 = doubleArrow(ax, ay, bx, by, "blue", centerX, centerY, `double-arrow-${a}-${owner}`);
                        const arrow2 = doubleArrow(bx, by, ax, ay, "blue", centerX, centerY, `double-arrow-${owner}-${a}`);
                        arrow1.classList.add('arrow');
                        arrow2.classList.add('arrow');
                        arrows.push(arrow1, arrow2);
                    } else {
                        const arrow = straightArrow(ax, ay, bx, by, "blue", centerX, centerY, `arrow-${a}-${house}`);
                        arrow.classList.add('arrow');
                        arrows.push(arrow);
                    }
                }
            });

            this.steps.push({participants: [...canvas_participants], houses: [...canvas_houses], arrows: arrows});

            arrows = [];
            let cycleList = anyCycle(G); // Find any cycle in the graph
            let cycleAgents = getAgents(G, cycleList, agents); // Agent that form the cycle
            cycleAgents = Array.from(cycleAgents);

            // Add arrows based on the number of agents in the cycle
            // Single
            if (cycleAgents.length === 1) {
                const self = cycleAgents[0];
                const {x, y} = this.getPositionOfParticipant(self[1]);
                const selfArrowElem = selfArrow(x, y, "#fa6c6c", `self-arrow-${self}`);
                selfArrowElem.classList.add('arrow');
                arrows.push(selfArrowElem);
                // Double not to overlap
            } else if (cycleAgents.length === 2) {
                const p1 = cycleAgents[0];
                const p2 = cycleAgents[1];
                const {x: x1, y: y1} = this.getPositionOfParticipant(p1[1]);
                const {x: x2, y: y2} = this.getPositionOfParticipant(p2[1]);
                const doubleArrowElem1 = doubleArrow(x1, y1, x2, y2, "#fa6c6c", centerX, centerY, `double-arrow-${p1}-${p2}`);
                const doubleArrowElem2 = doubleArrow(x2, y2, x1, y1, "#fa6c6c", centerX, centerY, `double-arrow-${p2}-${p1}`);
                doubleArrowElem1.classList.add('arrow');
                doubleArrowElem2.classList.add('arrow');
                arrows.push(doubleArrowElem1, doubleArrowElem2);
                // Straign multiple arrows
            } else if (cycleAgents.length > 2) {
                for (let i = 0; i < cycleAgents.length; i++) {
                    const participant = cycleAgents[i];
                    const nextParticipant = cycleAgents[(i + 1) % cycleAgents.length];
                    const {x: fx, y: fy} = this.getPositionOfParticipant(parseInt(participant.slice(1)));
                    const {x: tx, y: ty} = this.getPositionOfParticipant(parseInt(nextParticipant.slice(1)));
                    const arrow = straightArrow(fx, fy, tx, ty, "#fa6c6c", centerX, centerY, `straight-arrow-${participant}-${nextParticipant}`);
                    arrow.classList.add('arrow');
                    arrows.push(arrow);
                }
            }

            this.steps.push({participants: [...canvas_participants], houses: [...canvas_houses], arrows: arrows});

            // Move houses to new owners and remove them from the graph
            cycleAgents.forEach(a => {
                let h = G.edges.get(a)[0];
                canvas_houses = canvas_houses.filter(house => house.id !== `house-${h.slice(1)}`);
                const {x, y} = this.getPositionOfParticipant(parseInt(a.slice(1)));
                const newHouse = houseIcon(x, y, h, "#53e553", `house-${h.slice(1)}`);
                canvas_houses.push(newHouse);
                allocation[a] = h; // Assign house to agent
                G.delete(a);
                G.delete(h);
            });

            this.steps.push({
                participants: [...canvas_participants],
                houses: [...canvas_houses],
                arrows: null,
                allocation: {...allocation}
            });

            // Add edges to the next preferred house of not assigned agents
            agents.forEach(a => {
                if (G.vertices.has(a) && G.edges.get(a).length === 0) {
                    while (!G.vertices.has(preferredHouse(a))) {
                        currentPreferenceIndex[a]++;
                    }
                    G.addEdge(a, preferredHouse(a));
                }
            });
        }
    }

    // Get the position of a participant on the circle based on their id
    getPositionOfParticipant(participantId) {
        const radius = 200;
        const centerX = 400;
        const centerY = 300;
        const angle = 2 * Math.PI * (participantId - 1) / this.participants.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return {x, y};
    }

    // Update the table with the allocated houses
    updateTableWithAllocation(allocation) {
        const inputs = document.querySelectorAll('.item-input');
        inputs.forEach(input => input.style.backgroundColor = '');
        for (const [agent, house] of Object.entries(allocation)) {
            const agentIndex = parseInt(agent.slice(1)) - 1;
            const assignedHouse = parseInt(house.slice(1));
            for (let j = 0; j < this.participants.length; j++) {
                const cell = document.getElementById(`cell-${agentIndex}-${j}`);
                if (parseInt(cell.value) === assignedHouse) {
                    cell.style.backgroundColor = '#53e553';
                    break;
                } else {
                    cell.style.backgroundColor = '#fa6c6c';
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HouseAllocation();
});
