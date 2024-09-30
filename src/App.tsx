import { useEffect, useState } from 'preact/hooks';
import './App.css';
import { generateGraph, findAllLeavingSequences } from "./core"
// 假设 Line_Number 和 graph 对象已经定义
const Line_Number = 8; // 临时定义，用于演示
// 这里的 graph 和 ship 数据需要根据具体情形来定义或获取
const directionMap = {
  'UP': '上',
  'DOWN': '下',
  'LEFT_UP': '左上',
  'RIGHT_UP': '右上',
  'LEFT_DOWN': '左下',
  'RIGHT_DOWN': '右下'
};
const App = () => {
  const [graph, setGraph] = useState({}); // 临时定义，用于演示

  useEffect(() => {
    const { graph: graph2 } = generateGraph(40);
    setGraph(graph2);
    console.log("%c Line:21 🍫 graph2", "color:#ea7e5c", graph2);
    const sequences = findAllLeavingSequences(graph2);
    console.log("%c Line:22 🍒 sequences", "color:#f5ce50", sequences);
  }, []);

  // 渲染网格
  const renderGrid = () => {
    let cells = [];
    for (let i = 0; i < Line_Number * Line_Number; i++) {
      cells.push(
        <div key={i} className="cell"></div>
      );
    }
    return cells;
  };
  // 渲染船只
  const renderShips = () => {
    return graph?.ships?.map(ship => {
      return ship.positions.map(position => {
        const index = position[0] * Line_Number + position[1];
        return (
          <div
            key={ship.id}
            className="ship"
            style={{ backgroundColor: ship.color }}
          >
            {ship.id + ' ' + directionMap[ship.direction]}
          </div>
        );
      });
    });
  };
  // 处理点击事件
  const handleClick = (event) => {
    // 事件处理逻辑
  };
  return (
    <div>
      <div id="matrix-container" onClick={handleClick}>
        {renderGrid()}
      </div>
      <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 75,75 Q 100,50 125,75 Q 115,75 100,60 Q 85,75 75,75" fill="#456" />
        <path d="M 100,60 L 110,75 L 100,75 Z" fill="#789" />
        <path d="M 100,60 L 90,75 L 100,75 Z" fill="#abc" />
        <line x1="100" y1="60" x2="100" y2="75" stroke="black" stroke-width="2" />
      </svg>
    </div>
  );
};
export default App;