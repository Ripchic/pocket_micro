// Description:
// This file contains functions to create SVG elements for visualizing the graph in house allocation problem.

/** Used to ease the creation of SVG elements with attributes
 * @param tag
 * @param attributes
 * @returns {Element} SVG element
 */
export function createSvgElement(tag, attributes) {
    const svgns = 'http://www.w3.org/2000/svg';
    const element = document.createElementNS(svgns, tag);
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
}


/**
 * @param x position
 * @param y position
 * @param text to be displayed in the house
 * @param color of the house
 * @param id of the element
 * @returns {Element} a group forming a house icon
 */
export function houseIcon(x, y, text, color, id) {
    const houseGroup = createSvgElement('g', {id});
    // Create a rectangle forming the foundation of the house
    const house = createSvgElement('rect', {
        x: x,
        y: y,
        width: 30,
        height: 20,
        fill: color
    });
    // Create a triangle forming the roof of the house using polygons to for it
    const roof = createSvgElement('polygon', {
        points: `${x},${y} ${x + 30},${y} ${x + 15},${y - 20}`, // position of the points
        fill: color
    });
    // Add a text to the house
    const textElement = createSvgElement('text', {
        x: x + 15,
        y: y + 19,
        'text-anchor': 'middle'
    });
    textElement.textContent = text;
    // Create a group combining all the elements
    houseGroup.append(house, roof, textElement);

    return houseGroup;
}

// Create a person icon
// It is using the same logic as the house icon
export function personIcon(x, y, text, color, id) {
    const personGroup = createSvgElement('g', {id});
    const head = createSvgElement('circle', {
        cx: x - 15,
        cy: y - 10,
        r: 10,
        fill: color
    });
    const body = createSvgElement('polygon', {
        points: `${x - 15},${y} ${x - 23},${y + 5} ${x - 30},${y + 20} ${x},${y + 20} ${x - 7},${y + 5}`,
        fill: color
    });
    const textElement = createSvgElement('text', {
        x: x - 15,
        y: y + 19,
        'text-anchor': 'middle'
    });
    textElement.textContent = text;

    personGroup.append(head, body, textElement);
    return personGroup;
}

// Arrow that points from the person to the house that he owns
// Both person and house are located in the same coordinates (x, y)
export function selfArrow(x, y, color, id) {
    const arrowGroup = createSvgElement('g', {id});
    const path = createSvgElement('path', {
        d: `M${x - 5},${y - 30} A30,40 -45,1,1 ${x + 15},${y + 25}`,
        'stroke-width': '2px',
        fill: 'none',
        stroke: color
    });
    const marker = createSvgElement('polygon', {
        points: `${x - 5},${y - 30} ${x},${y - 28} ${x - 10},${y - 25} ${x - 6},${y - 35}`,
        fill: color
    });

    arrowGroup.append(marker, path);
    return arrowGroup;
}


// Arrow that points from the person to the house that is the most desired
// Used when the person is included in a cycle with length > 2 or then the person is not included in any cycle
export function straightArrow(fx, fy, tx, ty, color, cnvCenterX, cnvCenterY, id) {

    // Adjust the coordinates of the arrow to reduce overlapping with the person and house icons
    if (fy > cnvCenterY) {
        fy -= 30;
    }
    if (ty > cnvCenterY) {
        ty -= 30;
    }
    if (fy < cnvCenterY) {
        fy += 30;
    }
    if (ty < cnvCenterY) {
        ty += 30;
    }


    const arrowGroup = createSvgElement('g', {id});
    const path = createSvgElement('path', {
        d: `M${fx},${fy} L${tx},${ty}`,
        'stroke-width': '2px',
        fill: 'none',
        stroke: color
    });

    //That crazy math is to calculate the angle of the arrow
    const angle = Math.atan2(ty - fy, tx - fx);
    const arrowLength = 10;
    const x1 = tx - arrowLength * Math.cos(angle - Math.PI / 6);
    const y1 = ty - arrowLength * Math.sin(angle - Math.PI / 6);
    const x2 = tx - arrowLength * Math.cos(angle + Math.PI / 6);
    const y2 = ty - arrowLength * Math.sin(angle + Math.PI / 6);
    const marker = createSvgElement('polygon', {
        points: `${tx},${ty} ${x1},${y1} ${x2},${y2}`,
        fill: color
    });

    arrowGroup.append(marker, path);
    return arrowGroup;
}

// Arrow that points from the person to the house that is the most desired
// Used when the person is included in a cycle with length = 2
// Consists of two arrows, not to overlap straight ones
// Uses the same logic as the straight arrow
export function doubleArrow(fx, fy, tx, ty, color, cnvCenterX, cnvCenterY, id) {

    if (fy > cnvCenterY) {
        fy -= 30;
    }
    if (ty > cnvCenterY) {
        ty -= 30;
    }
    if (fy < cnvCenterY) {
        fy += 30;
    }
    if (ty < cnvCenterY) {
        ty += 30;
    }

    const arrowGroup = createSvgElement('g', {id});
    const angle = Math.atan2(ty - fy, tx - fx);
    const x1 = tx - 30 * Math.cos(angle - Math.PI / 2);
    const y1 = ty - 30 * Math.sin(angle - Math.PI / 2);

    const path1 = createSvgElement('path', {
        d: `M${fx},${fy} L${x1},${y1}`,
        'stroke-width': '2px',
        stroke: color
    });
    const angle2 = Math.atan2(ty - y1, tx - x1);
    const x2 = tx - 10 * Math.cos(angle2 - Math.PI / 6);
    const y2 = ty - 10 * Math.sin(angle2 - Math.PI / 6);
    const x3 = tx - 10 * Math.cos(angle2 + Math.PI / 6);
    const y3 = ty - 10 * Math.sin(angle2 + Math.PI / 6);
    const marker1 = createSvgElement('polygon', {
        points: `${tx},${ty} ${x2},${y2} ${x3},${y3}`,
        fill: color
    });

    const path2 = createSvgElement('path', {
        d: `M${x1},${y1} L${tx},${ty}`,
        'stroke-width': '2px',
        stroke: color
    });

    arrowGroup.append(path1, marker1, path2);
    return arrowGroup;
}