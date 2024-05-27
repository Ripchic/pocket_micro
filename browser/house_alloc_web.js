import {personIcon, houseIcon, straightArrow, selfArrow, doubleArrow} from '../scripts/svgObject.js';
import {Graph, anyCycle, getAgents} from '../scripts/graph_utils.js';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

class HouseAllocation {
    constructor() {
        this.participants = [];
        this.houses = [];
        this.tableContainer = document.getElementById('preferences_table');
        this.svgCanvas = document.getElementById('visualizationCanvas');
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.generateTable();
    }

    bindEventListeners() {
        document.getElementById('addParticipant').addEventListener('click', () => this.addParticipant());
        document.getElementById('removeParticipant').addEventListener('click', () => this.removeParticipant());
        document.getElementById('populateEndowments').addEventListener('click', () => this.populateEndowments());
        document.getElementById('populatePreferences').addEventListener('click', () => this.populatePreferences());
        document.getElementById('run_algorithm').addEventListener('click', () => this.solveTTC());
    }

    addParticipant() {
        const id = this.participants.length + 1;
        this.participants.push(new Participant(id));
        this.generateTable();
    }

    removeParticipant() {
        this.participants.pop();
        this.generateTable();
    }

    shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    populateEndowments() {
        this.houses = Array.from({length: this.participants.length}, (_, index) => index + 1);
        const shuffledHouses = this.shuffleArray([...this.houses]);
        this.participants.forEach((participant, index) => {
            participant.assignEndowment(shuffledHouses[index]);
        });
        this.updateEndowmentInputs();
    }

    populatePreferences() {
        this.houses = Array.from({length: this.participants.length}, (_, index) => index + 1);
        this.participants.forEach(participant => {
            participant.setPreferences(this.shuffleArray([...this.houses]));
        });
        this.updatePreferenceInputs();
    }

    updateEndowmentInputs() {
        this.participants.forEach((participant, index) => {
            const input = document.getElementById(`endowment-${index}`);
            input.value = participant.endowment;
        });
    }

    updatePreferenceInputs() {
        this.participants.forEach((participant, i) => {
            participant.preferences.forEach((preference, j) => {
                const input = document.getElementById(`cell-${i}-${j}`);
                input.value = preference;
            });
        });
    }

    generateTable() {
        this.tableContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();

        const table = document.createElement('table');
        fragment.appendChild(table);

        table.appendChild(this.createTableHeader());
        table.appendChild(this.createTableBody());

        this.tableContainer.appendChild(fragment);
    }

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
        })
    };

    clearTableColors() {
        const inputs = document.querySelectorAll('.item-input');
        inputs.forEach(input => input.style.backgroundColor = '');
    }


    // main algo
    async solveTTC() {
        this.readData();
        this.clearTableColors();
        console.log(this.participants);
        let agents = this.participants.map(participant => `P${participant.id}`);
        const houses = this.houses.map(house => `H${house}`);
        const agentPreferences = {};
        const initialOwnership = {};

        this.svgCanvas.innerHTML = ''; // Clear previous contents

        const radius = this.svgCanvas.clientHeight / 3;
        const centerX = this.svgCanvas.clientWidth / 2;
        const centerY = this.svgCanvas.clientHeight / 2;

        // Draw icons of participants and their initial houses around circle
        this.participants.sort((a, b) => a.id - b.id);
        this.participants.forEach((participant, index) => {
            const angle = 2 * Math.PI * index / this.participants.length;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const person = personIcon(x, y, `P${participant.id}`, "skyblue", `person-${participant.id}`);
            this.svgCanvas.appendChild(person);

            const house = houseIcon(x, y, `H${participant.endowment}`, "yellow", `house-${participant.endowment}`);
            this.svgCanvas.appendChild(house);
        });

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

        agents.forEach(a => {
            G.addEdge(a, preferredHouse(a));
        });

        houses.forEach(h => {
            G.addEdge(h, initialOwnership[h]);
        });

        let allocation = {};

        // find the cycles and move the houses
        while (G.vertices.size > 0) {
            // Remove previous arrows
            let previousArrows = document.querySelectorAll('.arrow');
            previousArrows.forEach(arrow => arrow.remove());

            // Draw new arrows pointing to preferred houses
            agents.forEach(a => {
                    if (G.vertices.has(a)) {
                        const house = preferredHouse(a);
                        const owner = initialOwnership[house];
                        const {x: ax, y: ay} = this.getPositionOfParticipant(parseInt(a.slice(1)));
                        const {x: bx, y: by} = this.getPositionOfParticipant(parseInt(owner.slice(1)));
                        if (owner === a) {
                            // Draw self arrow if the person is pointing to their initial house
                            const arrow = selfArrow(ax, ay, "blue", `self-arrow-${a}`);
                            arrow.classList.add('arrow');
                            this.svgCanvas.appendChild(arrow);
                        } else if (a === G.edges.get(G.edges.get(owner)[0])[0]) {
                            // Draw double arrow if two participants point to each other
                            const arrow1 = doubleArrow(ax, ay, bx, by, "blue", centerX, centerY, `double-arrow-${a}-${owner}`);
                            const arrow2 = doubleArrow(bx, by, ax, ay, "blue", centerX, centerY, `double-arrow-${owner}-${a}`);
                            arrow1.classList.add('arrow');
                            arrow2.classList.add('arrow');
                            this.svgCanvas.appendChild(arrow1);
                            this.svgCanvas.appendChild(arrow2);
                        } else {
                            // Draw straight arrow otherwise
                            const arrow = straightArrow(ax, ay, bx, by, "blue", centerX, centerY, `arrow-${a}-${house}`);
                            arrow.classList.add('arrow');
                            this.svgCanvas.appendChild(arrow);
                        }
                    }
                }
            );

            await sleep(3000);

            let cycleList = anyCycle(G);
            let cycleAgents = getAgents(G, cycleList, agents);
            cycleAgents = Array.from(cycleAgents);
            previousArrows = document.querySelectorAll('.arrow');
            previousArrows.forEach(arrow => arrow.remove());

            if (cycleAgents.length === 1) {
                const self = cycleAgents[0];
                const {x, y} = this.getPositionOfParticipant(self[1]);
                const selfArrowElem = selfArrow(x, y, "red", `self-arrow-${self}`);
                selfArrowElem.classList.add('arrow');
                this.svgCanvas.appendChild(selfArrowElem);
                await sleep(1000);
            } else if (cycleAgents.length === 2) {
                const p1 = cycleAgents[0];
                const p2 = cycleAgents[1];
                const {x: x1, y: y1} = this.getPositionOfParticipant(p1[1]);
                const {x: x2, y: y2} = this.getPositionOfParticipant(p2[1]);
                const doubleArrowElem1 = doubleArrow(x1, y1, x2, y2, "red", centerX, centerY, `double-arrow-${p1}-${p2}`);
                const doubleArrowElem2 = doubleArrow(x2, y2, x1, y1, "red", centerX, centerY, `double-arrow-${p2}-${p1}`);
                doubleArrowElem1.classList.add('arrow');
                doubleArrowElem2.classList.add('arrow');
                this.svgCanvas.appendChild(doubleArrowElem1);
                this.svgCanvas.appendChild(doubleArrowElem2);
                await sleep(1000);
            } else if (cycleAgents.length > 2) {
                for (let i = 0; i < cycleAgents.length; i++) {
                    const participant = cycleAgents[i];
                    const nextParticipant = cycleAgents[(i + 1) % cycleAgents.length];
                    const {x: fx, y: fy} = this.getPositionOfParticipant(parseInt(participant.slice(1)));
                    const {x: tx, y: ty} = this.getPositionOfParticipant(parseInt(nextParticipant.slice(1)));
                    const arrow = straightArrow(fx, fy, tx, ty, "red", centerX, centerY, `straight-arrow-${participant}-${nextParticipant}`);
                    arrow.classList.add('arrow');
                    this.svgCanvas.appendChild(arrow);
                    await sleep(1000);
                }
            }

            await sleep(2000);

            // Move houses to new owners
            cycleAgents.forEach(a => {
                let h = G.edges.get(a)[0];
                const houseElem = document.getElementById(`house-${h.slice(1)}`);
                houseElem.remove();

                const {x, y} = this.getPositionOfParticipant(parseInt(a.slice(1)));
                const newHouse = houseIcon(x, y, h, "lightgreen", `house-${h.slice(1)}`);
                this.svgCanvas.appendChild(newHouse);
            });


            await sleep(1000);

            cycleAgents.forEach(a => {
                let h = G.edges.get(a)[0];
                allocation[a] = h;
                G.delete(a);
                G.delete(h);
            });

            agents.forEach(a => {
                if (G.vertices.has(a) && G.edges.get(a).length === 0) {
                    while (!G.vertices.has(preferredHouse(a))) {
                        currentPreferenceIndex[a]++;
                    }
                    G.addEdge(a, preferredHouse(a));
                }
            });
            this.updateTableWithAllocation(allocation);
        }
        // remove previous arrows
        let previousArrows = document.querySelectorAll('.arrow');
        previousArrows.forEach(arrow => arrow.remove());
    }


    getPositionOfParticipant(participantId) {
        const radius = 200;
        const centerX = 400;
        const centerY = 300;
        const angle = 2 * Math.PI * (participantId - 1) / this.participants.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return {x, y};
    }

    updateTableWithAllocation(allocation) {
        const inputs = document.querySelectorAll('.item-input');
        inputs.forEach(input => input.style.backgroundColor = '');

        for (const [agent, house] of Object.entries(allocation)) {
            const agentIndex = parseInt(agent.slice(1)) - 1;
            const assignedHouse = parseInt(house.slice(1));

            for (let j = 0; j < this.participants.length; j++) {
                const cell = document.getElementById(`cell-${agentIndex}-${j}`);
                if (parseInt(cell.value) === assignedHouse) {
                    cell.style.backgroundColor = 'green';
                    break;
                } else {
                    cell.style.backgroundColor = 'orange';
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HouseAllocation();
});
