type Direction = 'UP' | 'DOWN' | 'LEFT_UP' | 'RIGHT_UP' | 'LEFT_DOWN' | 'RIGHT_DOWN';
const directions: Direction[] = ['UP', 'DOWN', 'LEFT_UP', 'RIGHT_UP', 'LEFT_DOWN', 'RIGHT_DOWN'];
const directionOffsets: { [key in Direction]: [number, number] } = {
  'UP': [-1, 0],
  'DOWN': [1, 0],
  'LEFT_UP': [-1, -1],
  'RIGHT_UP': [-1, 1],
  'LEFT_DOWN': [1, -1],
  'RIGHT_DOWN': [1, 1]
};
const colors: string[] = ['red', 'blue', 'green', 'yellow'];
const Line_Number = 8;

interface Ship {
  id: number;
  color: string;
  size: number;
  direction: Direction;
  positions: Record<number,number>[];
}

class Graph {
  ships: Ship[]; // 船list
  map: number[][]; // 地图
  edgeList: Map<number, number[]>; // key 为船的id，value 为当前其他船的 id

  constructor() {
    this.edgeList = new Map();
    this.ships = [];
    this.map = Array.from({ length: Line_Number }, () => Array(Line_Number).fill(-1));
  }

  // 新增一条船
  addShip(ship: Ship){
    // 增加船
    this.ships.push(ship);
    // 地图上增加此船的位置
    ship.positions.forEach((position) => {
      this.map[position[0]][position[1]] = ship.id;
    });
    // 增加边，并更新与其他船的依赖关系
    this.addEmptyEdge(ship.id);
    this.ships.forEach(s => {
      const dependentShipsID = getShipInDirection(s, this.map);
      this.addEdges(s.id, dependentShipsID);
    });
  }

  // 新增空边
  addEmptyEdge(shipId: number) {
    if (!this.edgeList.has(shipId)) {
      this.edgeList.set(shipId, []);
    }
  }
  // 删除船
  removeShip(shipId: number){
    // 删除船
    this.ships = this.ships.filter(s => s.id !== shipId);
    // 删除边
    this.edgeList.delete(shipId);
    this.removeEdges(shipId);
    // 删除位置
    this.map.forEach((row) => {
      row.forEach((cell) => {
        if (cell === shipId) {
          cell = -1;
        }
      });
    });
  }

  shipCanRemove(shipId: number){
    return this.edgeList.get(shipId)!.length === 0;
  }

  // 批量添加边
  addEdges(fromId: number, toIds: number[]) {
    toIds.forEach(toId => {
      if (this.edgeList.has(fromId) && !this.edgeList.get(fromId)!.includes(toId)) {
        this.edgeList.get(fromId)!.push(toId);
      }
    });
  }

  // 删除当前船的所有边
  removeEdges(shipId: number) {
    this.edgeList.forEach((value, key) => {
      if (value.includes(shipId)) {
        const index = value.indexOf(shipId);
        value.splice(index, 1);
      }
    });
  }

  // 获取出度为0的所有船只
  getShipsWithZeroOutdegree(): number[] {
    const shipsWithZeroOutdegree: number[] = [];
    this.edgeList.forEach((value, key) => {
      if (value.length === 0) {
        shipsWithZeroOutdegree.push(key);
      }
    });
    return shipsWithZeroOutdegree;
  }
}

// 生成不重复位置
function generatePosition(positionsKey: Set<string>) {
  let basePosition: [number, number];
  let positions: Record<number,number>[] =[];
  let direction: Direction;
  let positionKey: string[]= [];
  let size = 1;
  // 位置是否合规，两个条件
  // 1. 位置没被占用
  // 2. 位置介于0～Line_Num
  const notPass=()=>{
    return positionKey.some(key => positionsKey.has(key))|| 
    positions.some(item => item[0] < 0 || item[0] >= Line_Number || item[1] < 0 || item[1] >= Line_Number);
  }
  do {
    positionKey = []
    positions = []
    basePosition = [Math.floor(Math.random() * Line_Number), Math.floor(Math.random() * Line_Number)];
    size = Math.floor(Math.random() * 3) + 1;
    direction = directions[Math.floor(Math.random() * directions.length)];
    const [dx, dy] = directionOffsets[direction];
    for (let i = 0; i < size; i++) {
      positions.push([basePosition[0] + i * dx, basePosition[1] + i * dy]);
      positionKey.push(`${basePosition[0] + i * dx},${basePosition[1] + i * dy}`);
    }
  } while (notPass()); // 确保位置不重复
  return {positions,positionKey,size,direction};
}

/**
 * 生成指定数量的船只并放置在无环图结构中
 * @param numShips 要生成的船数量
 * @returns 包含生成的图对象的字典
 */
function generateGraph(numShips: number): { graph: Graph } {
  const graph = new Graph();
  const positionsKey = new Set<string>();
  while (graph.ships.length < numShips) {
    let addedSuccessfully = false;
    while (!addedSuccessfully) {
      const { positions, positionKey, direction, size } = generatePosition(positionsKey);
      const ship: Ship = {
        id: graph.ships.length,
        color: colors[Math.floor(Math.random() * colors.length)],
        positions,
        direction,
        size
      };
      graph.addShip(ship);
      addedSuccessfully = true;
      if(hasCycle(graph)){
        graph.removeShip(ship.id);
        addedSuccessfully = false;
      }
      if (addedSuccessfully) {
        positionKey.forEach(key => positionsKey.add(key))
      }
    }
  }

  return { graph };
}

/**
 * 
 * @param ship 
 * @param ships 
 * @returns 
 */
function getShipInDirection(ship: Ship, map: number[][]): number[] {
  const dependentShips: number[] = [];
  const [dx, dy] = directionOffsets[ship.direction];
  const pos = ship.positions;
  let x = pos[pos.length-1][0] + dx;
  let y = pos[pos.length-1][1] + dy;
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
    const clonedMap = new Map();
    obj.forEach((value, key) => {
      clonedMap.set(key, deepCopy(value));
    });
    return clonedMap;
  }

  if (obj instanceof Set) {
    const clonedSet = new Set();
    obj.forEach(value => {
      clonedSet.add(deepCopy(value));
    });
    return clonedSet;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepCopy(item));
  }

  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepCopy(obj[key]);
    }
  }
  return clonedObj;
}

// 判断图是否有环
function hasCycle(graph: Graph): boolean {
  let visited = new Set();
  let recStack = new Set();

  function dfs(node) {
    if (recStack.has(node)) {
      return true; // 发现环
    }
    if (visited.has(node)) {
      return false; // 已访问过，且之前的访问没有发现环
    }

    visited.add(node);
    recStack.add(node);

    const neighbors = graph.edgeList.get(node) || [];
    for (let neighbor of neighbors) {
      if (dfs(neighbor)) {
        return true; // 递归发现环
      }
    }

    recStack.delete(node); // 当前路径访问完成，未发现环，从递归栈中移除
    return false;
  }
  let res=false;
  graph.edgeList.forEach((node,key)=>{
    if(res || dfs(key)){
      res=true;
    }
  })

  return res; // 遍历完所有节点，未发现环
}

// 克隆图对象
function cloneGraph(graph: Graph): Graph {
  let newGraph = new Graph();
  graph.edgeList.forEach((deps, shipId) => {
    newGraph.addEmptyEdge(shipId);
    newGraph.addEdges(shipId, deps);
  });
  return newGraph;
}

// 找到所有出去的路径
function findAllLeavingSequences(graph: Graph): number[][] {
  let results: number[][] = [];
  let visited = new Set<number>(); // 用于记录已经处理过的节点
  let times = 0;

  function backtrack(currentSequence: number[], tempGraph: Graph) {
    times++;
    if (times > 100) return;
    let shipsCanLeave = tempGraph.getShipsWithZeroOutdegree().filter(ship => !visited.has(ship));

    if (shipsCanLeave.length === 0) {
      if (currentSequence.length === graph.edgeList.size) {
        results.push([...currentSequence]);
      }
      return;
    }

    for (let shipId of shipsCanLeave) {
      currentSequence.push(shipId);
      visited.add(shipId); // 在递归前，标记节点为已访问

      let newGraph = cloneGraph(tempGraph);
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

const { graph } = generateGraph(40);
console.log("%c Line:254 🍺 graph", "color:#465975", graph);
const results = findAllLeavingSequences(graph);
console.log("%c Line:256 🍖 results", "color:#e41a6a", results);