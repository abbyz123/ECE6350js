const coordDim = 3;

// node factory function
const createNode = function (coord) {
    if (!(coord instanceof Array)) throw "need an 3-element array to create a node!";
    if (coordDim !== coord.length) throw "need a coordinate with " + coordDim + " dimensions!";
    return {
        id : 0,
        coord,
        nexts : new Array(),
        addNext(next) {
            this.nexts.push(next);
        }
    }
}

// count how many node are there
function countNodes(node, counter) {
    if (null === node) return;
    counter.count += 1;
    if (node.nexts.length !== 0) {
        node.nexts.forEach(next => {
            countNodes(next, counter);
        });
    }
}

// count how many degree of freedom in total
function countElement(node, counter) {
    if (null === node) return;
    counter.count += node.nexts.length;
    if (node.nexts.length !== 0) {
        node.nexts.forEach(next => {
            countElement(next, counter);
        });
    }
}

// assign each node with an id
function assignNodeWithId(node) {
    // count how many nodes are there
    let counter = {count : 0};
    countNodes(node, counter);

    let idPool = Array.from(Array(counter.count).keys());
    let idToNodeArr = new Array(idPool.length);
    assignNodeIdFromPool(node, idPool, idToNodeArr);

    return idToNodeArr;
}

// assign node id from a id pool
function assignNodeIdFromPool(node, idPool, idToNodeArr) {
    // do nothing if the node is null
    if (null === node) return;

    // assign an id from pool
    let id = idPool[Math.floor(Math.random() * idPool.length)];
    idToNodeArr[id] = node;
    node.id = id;

    // remove the assigned id
    idPool = idPool.filter(elem => elem !== id);

    // move on to next nodes
    if (0 !== node.nexts.length) {
        node.nexts.forEach(next => {
            assignNodeIdFromPool(next, idPool, idToNodeArr);
        });
    }
}

// build element list

//////////////////////////////////////////////
// testing code
//////////////////////////////////////////////
let coords = [[-1.0, 0, 0],[0.5, 0, 0], [0, 0, 0], [0, 0.5, 0], [1.0, 1, 0], [1.0, 1.6, 0]];
let nodes = new Array();

coords.forEach(coord => {
    nodes.push(createNode(coord));
});

for (let i = 1; i < nodes.length; i++) {
    nodes[i - 1].addNext(nodes[i]);
}

// check created node without id
console.log(JSON.stringify(nodes[0]));

// check node count
counter = {count : 0};
countNodes(nodes[0], counter);
console.log(counter.count);

// assigne id for each node
let idArr = assignNodeWithId(nodes[0]);
console.log(JSON.stringify(nodes[0]));
idArr.forEach(elem => {
    console.log(elem.id + ": " + elem.coord);
});

// output each 
nodes.forEach(node => {
    console.log("id = " + node.id);
});

// count element
let elemCounter = {count : 0};
countElement(nodes[0], elemCounter);
console.log("element count = " + elemCounter.count);