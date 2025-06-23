import React from 'react';

const TreeNode = ({ node, spacingX, spacingY, radius, onEditRequest, editMode, onNodeSelect, selectedNode, viewBoxWidth }) => {
  const x = node.y * spacingX + radius;
  const y = node.x * spacingY + radius;

  const rectPaddingX = 12;
  const rectPaddingY = 6;
  const rectYGap = 8;
  const fontSize = 18;
  const maxWidth = 150;
  const estimatedCharWidth = 9;

  const splitValue = node.value.split(' ').reduce((lines, word) => {
    const lastLine = lines[lines.length - 1];
    if (lastLine && (lastLine + ' ' + word).length <= 20) {
      lines[lines.length - 1] = lastLine + ' ' + word;
    } else {
      lines.push(word);
    }
    return lines;
  }, []);

  const rectWidth = Math.min(
    maxWidth,
    Math.max(...splitValue.map(line => line.length)) * estimatedCharWidth + 2 * rectPaddingX
  );
  const rectHeight = fontSize * splitValue.length + 2 * rectPaddingY;

  const clipId = `clip-${node.value || 'node'}-${node.x}-${node.y}`;
  const startY = y + radius + rectYGap + rectHeight / 2 - splitValue.length * fontSize / 2 + fontSize * 0.8;

  const isSelected = selectedNode && node.id === selectedNode.id;

  return (
    <>
      {(node.children || []).map((child, idx) => (
        <line
          key={idx}
          x1={x}
          y1={y}
          x2={child.y * spacingX + radius}
          y2={child.x * spacingY + radius}
          stroke="white"
          strokeWidth={3}
        />
      ))}

      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={isSelected ? 'rgb(0, 212, 180)' : 'rgb(19, 27, 92)'}
        stroke="white"
        strokeWidth={3}
        onClick={() => onNodeSelect(node)}
      />

      <g>
        <clipPath id={clipId}>
          <rect
            x={x - rectWidth / 2}
            y={y + radius + rectYGap}
            width={rectWidth}
            height={rectHeight}
            rx="6" ry="6"
          />
        </clipPath>

        <rect
          x={x - rectWidth / 2}
          y={y + radius + rectYGap}
          width={rectWidth}
          height={rectHeight}
          fill="none"
          stroke="none"
          rx="3"
          ry="3"
        />

        <text
          x={x}
          y={startY}
          fontSize={fontSize}
          fill="white"
          textAnchor="middle"
          clipPath={`url(#${clipId})`}
        >
          {splitValue.map((line, idx) => (
            <tspan key={idx} x={x} dy={idx === 0 ? 0 : fontSize}>
              {line}
            </tspan>
          ))}
        </text>
      </g>

      {editMode && (
        <>
          <g className="action-circle add" onClick={() => onEditRequest({ action: 'add', parent_id: node.id, node })}>
            <circle cx={x - 34} cy={y - 34} r={12} fill="#8bc34a" />
            <text x={x - 34} y={y - 30} fontSize="12" textAnchor="middle" fill="white">+</text>
          </g>
          <g className="action-circle change" onClick={() => onEditRequest({ action: 'change', step_id: node.id, node })}>
            <circle cx={x} cy={y - 50} r={12} fill="#ff9800" />
            <text x={x} y={y - 46} fontSize="12" textAnchor="middle" fill="white">✎</text>
          </g>
          <g className="action-circle remove" onClick={() => onEditRequest({ action: 'remove', step_id: node.id, node, parent_id: node.parent_id, children: (node.children || []).map(c => c.id)})}>
            <circle cx={x + 34} cy={y - 34} r={12} fill="#f44336" />
            <text x={x + 34} y={y - 30} fontSize="12" textAnchor="middle" fill="white">–</text>
          </g>
        </>
      )}

      {(node.children || []).map((child, idx) => (
        <TreeNode
          key={idx}
          node={child}
          spacingX={spacingX}
          spacingY={spacingY}
          radius={radius}
          onEditRequest={onEditRequest}
          editMode={editMode}
          onNodeSelect={onNodeSelect}
          selectedNode={selectedNode}
          viewBoxWidth={viewBoxWidth}
        />
      ))}
    </>
  );
};

export default TreeNode;