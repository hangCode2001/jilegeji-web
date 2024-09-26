var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var directions = ['UP', 'DOWN', 'LEFT_UP', 'RIGHT_UP', 'LEFT_DOWN', 'RIGHT_DOWN'];
var directionOffsets = {
    'UP': [-1, 0],
    'DOWN': [1, 0],
    'LEFT_UP': [-1, -1],
    'RIGHT_UP': [-1, 1],
    'LEFT_DOWN': [1, -1],
    'RIGHT_DOWN': [1, 1]
};
var colors = ['red', 'blue', 'green', 'yellow'];
var Line_Number = 8;
var Graph = /** @class */ (function () {
    function Graph() {
        this.edgeList = new Map();
        this.ships = [];
        this.map = Array.from({ length: Line_Number }, function () { return Array(Line_Number).fill(-1); });
    }
    // 新增一条船
    Graph.prototype.addShip = function (ship) {
        var _this = this;
        // 增加船
        this.ships.push(ship);
        // 地图上增加此船的位置
        ship.positions.forEach(function (position) {
            _this.map[position[0]][position[1]] = ship.id;
        });
        // 增加边，并更新与其他船的依赖关系
        this.addEmptyEdge(ship.id);
        this.ships.forEach(function (s) {
            var dependentShipsID = getShipInDirection(s, _this.map);
            _this.addEdges(s.id, dependentShipsID);
        });
    };
    // 新增空边
    Graph.prototype.addEmptyEdge = function (shipId) {
        if (!this.edgeList.has(shipId)) {
            this.edgeList.set(shipId, []);
        }
    };
    // 删除船
    Graph.prototype.removeShip = function (shipId) {
        // 删除船
        this.ships = this.ships.filter(function (s) { return s.id !== shipId; });
        // 删除边
        this.edgeList.delete(shipId);
        this.removeEdges(shipId);
        // 删除位置
        this.map.forEach(function (row) {
            row.forEach(function (cell) {
                if (cell === shipId) {
                    cell = -1;
                }
            });
        });
    };
    Graph.prototype.shipCanRemove = function (shipId) {
        return this.edgeList.get(shipId).length === 0;
    };
    // 批量添加边
    Graph.prototype.addEdges = function (fromId, toIds) {
        var _this = this;
        toIds.forEach(function (toId) {
            if (_this.edgeList.has(fromId) && !_this.edgeList.get(fromId).includes(toId)) {
                _this.edgeList.get(fromId).push(toId);
            }
        });
    };
    // 删除当前船的所有边
    Graph.prototype.removeEdges = function (shipId) {
        this.edgeList.forEach(function (value, key) {
            if (value.includes(shipId)) {
                var index = value.indexOf(shipId);
                value.splice(index, 1);
            }
        });
    };
    // 获取出度为0的所有船只
    Graph.prototype.getShipsWithZeroOutdegree = function () {
        var shipsWithZeroOutdegree = [];
        this.edgeList.forEach(function (value, key) {
            if (value.length === 0) {
                shipsWithZeroOutdegree.push(key);
            }
        });
        return shipsWithZeroOutdegree;
    };
    return Graph;
}());
// 生成不重复位置
function generatePosition(positionsKey) {
    var basePosition;
    var positions = [];
    var direction;
    var positionKey = [];
    var size = 1;
    // 位置是否合规，两个条件
    // 1. 位置没被占用
    // 2. 位置介于0～Line_Num
    var notPass = function () {
        return positionKey.some(function (key) { return positionsKey.has(key); }) ||
            positions.some(function (item) { return item[0] < 0 || item[0] >= Line_Number || item[1] < 0 || item[1] >= Line_Number; });
    };
    do {
        positionKey = [];
        positions = [];
        basePosition = [Math.floor(Math.random() * Line_Number), Math.floor(Math.random() * Line_Number)];
        size = Math.floor(Math.random() * 3) + 1;
        direction = directions[Math.floor(Math.random() * directions.length)];
        var _a = directionOffsets[direction], dx = _a[0], dy = _a[1];
        for (var i = 0; i < size; i++) {
            positions.push([basePosition[0] + i * dx, basePosition[1] + i * dy]);
            positionKey.push("".concat(basePosition[0] + i * dx, ",").concat(basePosition[1] + i * dy));
        }
    } while (notPass()); // 确保位置不重复
    return { positions: positions, positionKey: positionKey, size: size, direction: direction };
}
/**
 * 生成指定数量的船只并放置在无环图结构中
 * @param numShips 要生成的船数量
 * @returns 包含生成的图对象的字典
 */
function generateGraph(numShips) {
    var graph = new Graph();
    var positionsKey = new Set();
    while (graph.ships.length < numShips) {
        var addedSuccessfully = false;
        while (!addedSuccessfully) {
            var _a = generatePosition(positionsKey), positions = _a.positions, positionKey = _a.positionKey, direction = _a.direction, size = _a.size;
            var ship = {
                id: graph.ships.length,
                color: colors[Math.floor(Math.random() * colors.length)],
                positions: positions,
                direction: direction,
                size: size
            };
            graph.addShip(ship);
            addedSuccessfully = true;
            if (hasCycle(graph)) {
                graph.removeShip(ship.id);
                addedSuccessfully = false;
            }
            if (addedSuccessfully) {
                positionKey.forEach(function (key) { return positionsKey.add(key); });
            }
        }
    }
    return { graph: graph };
}
/**
 *
 * @param ship
 * @param ships
 * @returns
 */
function getShipInDirection(ship, map) {
    var dependentShips = [];
    var _a = directionOffsets[ship.direction], dx = _a[0], dy = _a[1];
    var pos = ship.positions;
    var x = pos[pos.length - 1][0] + dx;
    var y = pos[pos.length - 1][1] + dy;
    while (x >= 0 && x < Line_Number && y >= 0 && y < Line_Number) {
        if (map[x][y] !== -1) {
            dependentShips.push(map[x][y]);
        }
        x += dx;
        y += dy;
    }
    return dependentShips;
}
function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj);
    }
    if (obj instanceof Map) {
        var clonedMap_1 = new Map();
        obj.forEach(function (value, key) {
            clonedMap_1.set(key, deepCopy(value));
        });
        return clonedMap_1;
    }
    if (obj instanceof Set) {
        var clonedSet_1 = new Set();
        obj.forEach(function (value) {
            clonedSet_1.add(deepCopy(value));
        });
        return clonedSet_1;
    }
    if (obj instanceof Array) {
        return obj.map(function (item) { return deepCopy(item); });
    }
    var clonedObj = {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepCopy(obj[key]);
        }
    }
    return clonedObj;
}
// 判断图是否有环
function hasCycle(graph) {
    var visited = new Set();
    var recStack = new Set();
    function dfs(node) {
        if (recStack.has(node)) {
            return true; // 发现环
        }
        if (visited.has(node)) {
            return false; // 已访问过，且之前的访问没有发现环
        }
        visited.add(node);
        recStack.add(node);
        var neighbors = graph.edgeList.get(node) || [];
        for (var _i = 0, neighbors_1 = neighbors; _i < neighbors_1.length; _i++) {
            var neighbor = neighbors_1[_i];
            if (dfs(neighbor)) {
                return true; // 递归发现环
            }
        }
        recStack.delete(node); // 当前路径访问完成，未发现环，从递归栈中移除
        return false;
    }
    var res = false;
    graph.edgeList.forEach(function (node, key) {
        if (res || dfs(key)) {
            res = true;
        }
    });
    return res; // 遍历完所有节点，未发现环
}
// 克隆图对象
function cloneGraph(graph) {
    var newGraph = new Graph();
    graph.edgeList.forEach(function (deps, shipId) {
        newGraph.addEmptyEdge(shipId);
        newGraph.addEdges(shipId, deps);
    });
    return newGraph;
}
// 找到所有出去的路径
function findAllLeavingSequences(graph) {
    var results = [];
    var visited = new Set(); // 用于记录已经处理过的节点
    var times = 0;
    function backtrack(currentSequence, tempGraph) {
        times++;
        if (times > 100)
            return;
        var shipsCanLeave = tempGraph.getShipsWithZeroOutdegree().filter(function (ship) { return !visited.has(ship); });
        if (shipsCanLeave.length === 0) {
            if (currentSequence.length === graph.edgeList.size) {
                results.push(__spreadArray([], currentSequence, true));
            }
            return;
        }
        for (var _i = 0, shipsCanLeave_1 = shipsCanLeave; _i < shipsCanLeave_1.length; _i++) {
            var shipId = shipsCanLeave_1[_i];
            currentSequence.push(shipId);
            visited.add(shipId); // 在递归前，标记节点为已访问
            var newGraph = cloneGraph(tempGraph);
            newGraph.removeShip(shipId); // 移除节点及其相关的边
            backtrack(currentSequence, newGraph);
            // 回溯：恢复状态以尝试其他可能性
            currentSequence.pop();
            visited.delete(shipId); // 回溯后，取消标记节点为已访问
        }
    }
    backtrack([], graph);
    return results;
}
var graph = generateGraph(40).graph;
console.log("%c Line:254 🍺 graph", "color:#465975", graph);
var results = findAllLeavingSequences(graph);
console.log("%c Line:256 🍖 results", "color:#e41a6a", results);
