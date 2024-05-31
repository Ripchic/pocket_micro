// This class represents a directed graph with vertices and edges, where a vertex can a house or an agent
export class Graph {
    constructor(vertices) {
        // Initialize the set of vertices
        this.vertices = new Set(vertices);
        // Initialize the map of edges with array of neighbors for each vertex
        this.edges = new Map();
        vertices.forEach(v => this.edges.set(v, []));
    }

    // Method to add an edge from vertex 'from' to vertex 'to'
    addEdge(from, to) {
        this.edges.get(from).push(to);
    }

    // Delete a vertex and all edges connected to it
    delete(vertex) {
        // Remove the vertex from the set of vertices and edges map
        this.vertices.delete(vertex);
        this.edges.delete(vertex);
        // Remove any edges pointing to this vertex
        this.edges.forEach((neighbors, v) => {
            this.edges.set(v, neighbors.filter(n => n !== vertex));
        });
    }

    // Get a random vertex from the set of vertices
    anyVertex() {
        return Array.from(this.vertices)[Math.floor(Math.random() * this.vertices.size)];
    }
}

// cycleVertex detection when it is guaranteed that there is a cycleVertex in the graph
export function anycycleVertex(G) {
    // Set to keep track of visited vertices
    const visited = new Set();
    // Start with a random vertex
    let v = G.anyVertex();

    // Traverse the graph until a cycleVertex is found
    while (!visited.has(v)) {
        visited.add(v);
        v = G.edges.get(v)[Math.floor(Math.random() * G.edges.get(v).length)];
    }

    return v;
}

// Find all agents in a cycleVertex with a defined vertex
export function getAgents(G, cycleVertex, agents) {
    // If the cycleVertex vertex is already an agent, move to another random connected vertex that is a house
    if (agents.has(cycleVertex)) {
        cycleVertex = G.edges.get(cycleVertex)[Math.floor(Math.random() * G.edges.get(cycleVertex).length)];
    }

    // Initialize the starting house as the cycle beginning
    const startingHouse = cycleVertex;
    // Pick a random neighbor of the starting house
    let currentVertex = G.edges.get(startingHouse)[Math.floor(Math.random() * G.edges.get(startingHouse).length)];
    // Set to keep track of the agents
    const cycleAgents = new Set();

    // Traverse the graph until an agent is visited again so that the cycle is completed
    while (!cycleAgents.has(currentVertex)) {
        cycleAgents.add(currentVertex);
        // Pick a random neighbor of the current vertex that is an agent
        currentVertex = G.edges.get(currentVertex)[Math.floor(Math.random() * G.edges.get(currentVertex).length)];
        // Pick another random neighbor of the current vertex that is a house and iterate further
        currentVertex = G.edges.get(currentVertex)[Math.floor(Math.random() * G.edges.get(currentVertex).length)];
    }

    // Return the set of agents forming the cycle
    return cycleAgents;
}