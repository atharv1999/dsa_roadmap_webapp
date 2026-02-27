import React, { useState, useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-go';

const LANGUAGES = [
  { value: 'cpp', label: 'C++', prismKey: 'cpp' },
  { value: 'java', label: 'Java', prismKey: 'java' },
  { value: 'python', label: 'Python', prismKey: 'python' },
  { value: 'go', label: 'Go', prismKey: 'go' },
];

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
  const [language, setLanguage] = useState(problem.code_language || 'cpp');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(problem.id, code, language);
      onClose();
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  const highlightCode = useCallback(
    (code) => {
      const lang = LANGUAGES.find((l) => l.value === language);
      const grammar = Prism.languages[lang?.prismKey || 'cpp'];
      if (grammar) {
        return Prism.highlight(code, grammar, lang?.prismKey || 'cpp');
      }
      return code;
    },
    [language]
  );

  const handleKeyDown = (e) => {
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
          <div className="code-editor-header-right">
            <select
              className="language-dropdown"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <span className="code-editor-title">Ctrl+S to save</span>
          </div>
        </div>
        <div className="code-editor-container" onKeyDown={handleKeyDown}>
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={highlightCode}
            padding={16}
            placeholder="Paste your code solution here..."
            className="code-editor-highlighted"
            textareaClassName="code-editor-textarea"
            style={{
              fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace",
              fontSize: 14,
              lineHeight: 1.6,
              background: 'var(--bg-input)',
              color: '#e4e4e7',
              tabSize: 4,
            }}
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
