// coordinate dimension
const coordDim = 3;

// id pool
let idPool = {
    nodeId : 0,
    elementId : 0,
    DoFId : 0,
    firstID : 1,
    assignNodeId : function() {
        this.nodeId += 1;
        return this.nodeId;
    },
    assignElementId : function() {
        this.elementId += 1;
        return this.elementId;
    },
    assignDoFId : function() {
        this.DoFId += 1;
        return this.DoFId;
    }
};

// node factory function
const createNode = function (coord, idPool) {
    if (!(coord instanceof Array)) throw "need an 3-element array to create a node!";
    if (coordDim !== coord.length) throw "need a coordinate with " + coordDim + " dimensions!";

    return {
        id : idPool.assignNodeId(),
        coord,
    }
}

// element factory function
const createElement = function(node1, node2, idPool) {
    if (null === node1 || null === node2) throw "each element need two nodes!";

    return {
        id : idPool.assignElementId(),
        _1 : {
            nodeId : node1.id,
            DoF : NaN
        },
        _2 : {
            nodeId : node2.id,
            DoF : NaN
        }
    }
}

// node to element mapping 
const createNodeToElementMap = function(nodes, elements) {
    // create a mapping array
    let mapArr = new Array();
    elements.forEach(element => {
        // map node 1 of the element
        if (mapArr[element._1.nodeId]) {
            mapArr[element._1.nodeId].push(element.id);
        } else {
            mapArr[element._1.nodeId] = [element.id];
        }

        // map node 2 of the element
        if (mapArr[element._2.nodeId]) {
            mapArr[element._2.nodeId].push(element.id);
        } else {
            mapArr[element._2.nodeId] = [element.id];
        }
    });

    return mapArr;
}

// assign DoF and create DoF to node mapping
const assignDoFsToNodes = function(nodes, elements, nodeToElementMapArr, idPool) {
    if (null === elements || 0 === elements.length) throw "need at least one element to start assigning DoF!";
    if (null === nodes || 0 === nodes.length) throw "There is no node provided!"

    // DoF to node map array
    let DoFToNodeMapArr = new Array();

    // DFS stack for node
    let nodeStk = new Array();

    // DFS first step: assign DoF to the first node
    let nodeId = nodes[idPool.firstID].id;
    assignDoFToFirstElementWithNode(nodeId, elements, nodeToElementMapArr, Math.sign(1));

    // DFS first step: push the first node into node stack and map DoF
    nodeStk.push(nodeId);

    // DFS second step: iteration
    while (0 !== nodeStk.length) {
        // pop node stack top
        let nodeId = nodeStk.pop();

        // get the elements with this node
        let elementIdArrWithNode = nodeToElementMapArr[nodeId];

        let assignedDoF;        // the DoF is already assigned when i = 0, record this DoF
        for (let i = 0; i < elementIdArrWithNode.length; i++) {
            let element = elements[elementIdArrWithNode[i]];
            let localNodeId = getLocalNodeId(element, nodeId);
            let localOtherNodeId = getOtherLocalNodeId(localNodeId);

            if (0 === i) {
                assignedDoF = element[localNodeId].DoF;
            } else if (1 === i) {
                console.log("assignedDoF: " + assignedDoF);
                element[localNodeId].DoF = assignedDoF * (-1);
                console.log(element);
            } else {
                element[localNodeId].DoF = idPool.assignDoFId() * (-1);
            }

            // update the assigned DoF to elements in array
            elements[elementIdArrWithNode[i]] = element;

            // update mapping
            DoFToNodeMapArr[Math.abs(element[localNodeId].DoF)] = element[localNodeId].nodeId;

            // update other node DoF and push it into stack
            if (isNaN(element[localOtherNodeId].DoF)) {
                // get the first element in the mapping array of the other node
                let otherNodeId = element[localOtherNodeId].nodeId;
                assignDoFToFirstElementWithNode(otherNodeId, elements, nodeToElementMapArr, (-1) * Math.sign(element[localNodeId].DoF));

                // push the other node id into the node stack
                nodeStk.push(otherNodeId);
            }

            elements[elementIdArrWithNode[i]] = element;
        }
    }

    return DoFToNodeMapArr;
}

const assignDoFToFirstElementWithNode = function (nodeId, elements, nodeToElementMapArr, sign) {
    let element = elements[nodeToElementMapArr[nodeId][0]];

    let localNodeId = getLocalNodeId(element, nodeId);
    element[localNodeId].DoF = idPool.assignDoFId() * sign;
    elements[nodeToElementMapArr[nodeId][0]] = element;

    return element;
}

// get local node id
const getLocalNodeId = function (element, nodeId) {
    if (element._1.nodeId === nodeId) {
        return "_1";
    } else if (element._2.nodeId === nodeId) {
        return "_2";
    } else {
        throw "ERROR: node is not in the element"
    }
}

// get other local node id
const getOtherLocalNodeId = function(localNodeId) {
    if ("_1" === localNodeId) return "_2";
    else if ("_2" === localNodeId) return "_1";
    else throw "incorrect local node id";
}

/////////////////////////////////////////
/// testing code
/////////////////////////////////////////
// coordinates
coords = [[-1.5, 0.0, 0.0], [-1.0, 0.0, 0.0], [-0.5, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.5, 0.0], [0.0, 1.0, 0.0]];

// nodes
let nodes = new Array();
coords.forEach(coord => {
    let node = createNode(coord, idPool);
    nodes[node.id] = node;
});

let elements = new Array();
for(let i = idPool.firstID; i < nodes.length - 1; i++) {
    let element = createElement(nodes[i], nodes[i + 1], idPool);
    elements[element.id] = element;
}

let nodeToElementMapArr = createNodeToElementMap(nodes, elements);
console.log(nodeToElementMapArr);

let DoFToNodeMapArr = assignDoFsToNodes(nodes, elements, nodeToElementMapArr, idPool);
console.log("----------- DoF ------------")
console.log(DoFToNodeMapArr);
console.log("----------- Nodes ------------")
console.log(nodes);
console.log("----------- Elements ------------")
console.log(elements);