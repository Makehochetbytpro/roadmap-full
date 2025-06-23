import React from 'react';
import './Tree.css';
import TreeNode from './TreeNode';

const transformData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { id: null, value: 'Empty Tree', parent_id: null, children: [], materials: [] };
  }

  const transformNode = (node) => ({
    id: node.step_id || null,
    value: node.step_title || 'Unnamed Node',
    parent_id: node.parent_step_id || null,
    children: Array.isArray(node.children) ? node.children.map(transformNode) : [],
    materials: Array.isArray(node.materials) ? node.materials : []
  });

  return transformNode(data[0]);
};

const Tree = ({ data, onEditRequest, editMode, onNodeSelect }) => {
  const clonedData = JSON.parse(JSON.stringify(transformData(data)));
  const positionedTree = assignPositions(clonedData);

  const { maxX, maxY } = findMaxXY(positionedTree);

  const spacingX = 180;
  const spacingY = 105;
  const radius = 23;

  const viewBoxWidth = (maxY + 1) * spacingX + 2 * radius + 250;
  const viewBoxHeight = (maxX + 1) * spacingY + 2 * radius + 150;

  return (
    <svg
      viewBox={`-70 0 ${viewBoxWidth} ${viewBoxHeight}`}
      width={viewBoxWidth}
      height={viewBoxHeight}
    >
      <TreeNode
        node={positionedTree}
        spacingX={spacingX}
        spacingY={spacingY}
        radius={radius}
        onEditRequest={onEditRequest}
        editMode={editMode}
        onNodeSelect={onNodeSelect}
        viewBoxWidth={viewBoxWidth}
      />
    </svg>
  );
};

function assignPositions(node, depth = 0, xStart = 0) {
  node.children = Array.isArray(node.children) ? node.children : [];
  const subtreeWidth = getSubtreeWidth(node);
  const childWidths = node.children.map(getSubtreeWidth);

  node.x = xStart + subtreeWidth / 2;
  node.y = depth;

  let currentX = xStart;
  for (let i = 0; i < node.children.length; i++) {
    assignPositions(node.children[i], depth + 1, currentX);
    currentX += childWidths[i];
  }

  return node;
}

function getSubtreeWidth(node) {
  node.children = Array.isArray(node.children) ? node.children : [];
  if (node.children.length === 0) return 1;
  return node.children.map(getSubtreeWidth).reduce((a, b) => a + b, 0);
}

function findMaxXY(node) {
  let maxX = node.x;
  let maxY = node.y;

  node.children = Array.isArray(node.children) ? node.children : [];
  for (const child of node.children) {
    const { maxX: childMaxX, maxY: childMaxY } = findMaxXY(child);
    maxX = Math.max(maxX, childMaxX);
    maxY = Math.max(maxY, childMaxY);
  }

  return { maxX, maxY };
}

export default Tree;