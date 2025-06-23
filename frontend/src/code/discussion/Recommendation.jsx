import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import './UserSuggestions.css';

const UserSuggestions = ({ editRequest, onSubmitSuggestion, onStartEdit, suggestions, handleVote }) => {
  const [modalData, setModalData] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', comment: '' });

  useEffect(() => {
    if (editRequest && ['add', 'change', 'remove'].includes(editRequest.action)) {
      setModalData(editRequest);
    }
  }, [editRequest]);

  const handleInput = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    onSubmitSuggestion({ ...modalData, ...form });
    setForm({ name: '', description: '', comment: '' });
    setModalData(null);
  };

  const modal = modalData && ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>
            {modalData.action === 'add' && 'Add New Step'}
            {modalData.action === 'change' && 'Change Step'}
            {modalData.action === 'remove' && 'Remove Step'}
        </h3>

        {modalData.action === 'add' && (
            <TreePreview parentNode={modalData.node} newNodeId="TEMP_ID" />
        )}
        {(modalData.action === 'change' || modalData.action === 'remove') && (
            <TreePreview node={modalData.node} highlightOnly />
        )}

        {modalData.action !== 'remove' && (
        <>
            <input name="name" placeholder="Step Name" value={form.name} onChange={handleInput} style={{width: 'calc(100% - 1rem)'}}/>
            <textarea name="description" placeholder="Step Description" value={form.description} onChange={handleInput} style={{width: 'calc(100% - 1rem)'}}/>
        </>
        )}
        <textarea name="comment" placeholder="Your Comment (optional)" value={form.comment} onChange={handleInput} style={{width: 'calc(100% - 1rem)'}}/>
        <div className="modal-actions">
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={() => setModalData(null)}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="suggestion-container">
      <button className="suggestion-btn" onClick={onStartEdit}>
        ✏️ Propose Edit
      </button>
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-item">
            <div className="suggestion-header">
              {suggestion.action === 'add' && `Add new step under: ${suggestion.node.value}`}
              {suggestion.action === 'change' && `Change step: ${suggestion.node.value}`}
              {suggestion.action === 'remove' && `Remove step: ${suggestion.node.value}`}
            </div>
            {suggestion.action !== 'remove' && (
              <>
                <div className="suggestion-detail">Proposed Name: {suggestion.name}</div>
                <div className="suggestion-detail">Proposed Description: {suggestion.description}</div>
              </>
            )}
            {suggestion.comment && <div className="comment-suggestion">Comment: {suggestion.comment}</div>}
            <div className="vote-buttons">
              <button onClick={() => handleVote(index, 'up')}>👍</button>
              <span>{suggestion.votes || 0}</span>
              <button onClick={() => handleVote(index, 'down')}>👎</button>
            </div>
          </div>
        ))}
      </div>
      {modal}
    </div>
  );
};

export default UserSuggestions;

// ---- PREVIEW COMPONENT ----

const TreePreview = ({ parentNode, node, newNodeId, highlightOnly }) => {
    const spacingX = 180;
    const spacingY = 105;
    const radius = 23;
    const rectPaddingX = 12;
    const rectPaddingY = 6;
    const rectYGap = 8;
    const fontSize = 18;
    const maxWidth = 150;
    const estimatedCharWidth = 9;
  
    const dummyChild = useMemo(() => {
        if (!highlightOnly && parentNode) {
            return {
            id: newNodeId,
            value: "New Step",
            x: parentNode.x,
            y: parentNode.y + 1,
            children: [],
            };
        }
        return null;
    }, [highlightOnly, parentNode, newNodeId]);
  
    const nodesToRender = useMemo(() => {
      const nodes = [];
      if (highlightOnly && node) {
        nodes.push(node);
      } else if (!highlightOnly && parentNode && dummyChild) {
        nodes.push(parentNode, dummyChild);
      }
      return nodes;
    }, [highlightOnly, node, parentNode, dummyChild]);
  
    const bounds = useMemo(() => {
      const xs = nodesToRender.map(n => n.y * spacingX + radius);
      const ys = nodesToRender.map(n => n.x * spacingY + radius);
      const minX = Math.min(...xs) - 150;
      const maxX = Math.max(...xs) + 150;
      const minY = Math.min(...ys) - 100;
      const maxY = Math.max(...ys) + 130;
      return {
        viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
        width: maxX - minX,
        height: maxY - minY,
      };
    }, [nodesToRender]);
  
    const renderNode = (n, isNew = false) => {
      const x = n.y * spacingX + radius;
      const y = n.x * spacingY + radius;
  
      const splitValue = (() => {
        const maxCharsPerLine = Math.floor((maxWidth - 2 * rectPaddingX) / estimatedCharWidth);
        if (n.value.length <= maxCharsPerLine) return [n.value];
        const firstLine = n.value.slice(0, maxCharsPerLine);
        const secondLine = n.value.slice(maxCharsPerLine, 2 * maxCharsPerLine);
        return [firstLine, secondLine];
      })();
  
      const rectWidth = Math.min(
        maxWidth,
        Math.max(...splitValue.map(line => line.length)) * estimatedCharWidth + 2 * rectPaddingX
      );
      const rectHeight = fontSize * splitValue.length + 2 * rectPaddingY;
  
      const clipId = `clip-${n.value}-${n.x}-${n.y}`;
      const startY = y + radius + rectYGap + rectHeight / 2 - splitValue.length * fontSize / 2 + fontSize * 0.8;
  
      return (
        <g key={n.id}>
          <circle
            cx={x}
            cy={y}
            r={radius}
            fill={isNew ? "#aed581" : "rgb(19, 27, 92)"}
            stroke="white"
            strokeWidth={3}
          />
          <g>
            <clipPath id={clipId}>
              <rect
                x={x - rectWidth / 2}
                y={y + radius + rectYGap}
                width={rectWidth}
                height={rectHeight}
                rx="6"
                ry="6"
              />
            </clipPath>
            <rect
              x={x - rectWidth / 2}
              y={y + radius + rectYGap}
              width={rectWidth}
              height={rectHeight}
              fill="#e0f7fa"
              stroke="#006064"
              strokeWidth="1"
              rx="3"
              ry="3"
            />
            <text
              x={x}
              y={startY}
              fontSize={fontSize}
              fill="#006064"
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
        </g>
      );
    };
  
    return (
        <svg
            viewBox={bounds.viewBox}
            width="100%"
            height={bounds.height}
            style={{
                backgroundColor: 'rgb(10, 15, 50)',
                borderRadius: '1vw',
                maxWidth: '100%',
                display: 'block',
            }}
        >
        {!highlightOnly && parentNode && dummyChild && (
          <line
            x1={parentNode.y * spacingX + radius}
            y1={parentNode.x * spacingY + radius}
            x2={dummyChild.y * spacingX + radius}
            y2={dummyChild.x * spacingY + radius}
            stroke="white"
            strokeWidth={3}
          />
        )}
        {nodesToRender.map(n =>
          renderNode(n, n.id === newNodeId)
        )}
      </svg>
    );
  };