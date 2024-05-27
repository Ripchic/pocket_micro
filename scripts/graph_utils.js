export class Graph {
    constructor(vertices) {
        this.vertices = new Set(vertices);
        this.edges = new Map();
        vertices.forEach(v => this.edges.set(v, []));
    }

    addEdge(from, to) {
        this.edges.get(from).push(to);
    }

    delete(vertex) {
        this.vertices.delete(vertex);
        this.edges.delete(vertex);
        this.edges.forEach((neighbors, v) => {
            this.edges.set(v, neighbors.filter(n => n !== vertex));
        });
    }

    anyVertex() {
        return Array.from(this.vertices)[Math.floor(Math.random() * this.vertices.size)];
    }
}

export function anyCycle(G) {
    const visited = new Set();
    let v = G.anyVertex();

    while (!visited.has(v)) {
        visited.add(v);
        v = G.edges.get(v)[Math.floor(Math.random() * G.edges.get(v).length)];
    }

    return v;
}

export function getAgents(G, cycle, agents) {
    if (agents.has(cycle)) {
        cycle = G.edges.get(cycle)[Math.floor(Math.random() * G.edges.get(cycle).length)];
    }

    const startingHouse = cycle;
    let currentVertex = G.edges.get(startingHouse)[Math.floor(Math.random() * G.edges.get(startingHouse).length)];
    const theAgents = new Set();

    while (!theAgents.has(currentVertex)) {
        theAgents.add(currentVertex);
        currentVertex = G.edges.get(currentVertex)[Math.floor(Math.random() * G.edges.get(currentVertex).length)];
        currentVertex = G.edges.get(currentVertex)[Math.floor(Math.random() * G.edges.get(currentVertex).length)];
    }

    return theAgents;
}