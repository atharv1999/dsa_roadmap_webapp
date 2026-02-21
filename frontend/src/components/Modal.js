import React, { useState } from 'react';

export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function AddTopicModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onAdd(name.trim());
      onClose();
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <Modal title="Add New Topic" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label>Topic Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Arrays, Binary Search, Graphs..."
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
            {loading ? <span className="spinner" /> : 'Add Topic'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AddSubtopicModal({ topicId, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onAdd(topicId, name.trim(), description.trim());
      onClose();
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <Modal title="Add New Subtopic" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label>Subtopic Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Two Pointers, Sliding Window..."
            autoFocus
          />
        </div>
        <div className="modal-field">
          <label>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the pattern or technique..."
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
            {loading ? <span className="spinner" /> : 'Add Subtopic'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function CodeEditorModal({ problem, onClose, onSave }) {
  const [code, setCode] = useState(problem.code_solution || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(problem.id, code);
      onClose();
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="code-editor-header">
          <h3 className="modal-title" style={{ margin: 0 }}>
            {problem.title} — Solution
          </h3>
          <span className="code-editor-title">Ctrl+S to save</span>
        </div>
        <div className="code-editor-container">
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your code solution here..."
            spellCheck={false}
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
