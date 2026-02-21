import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDownIcon, PlusIcon, TrashIcon, BookmarkIcon } from './Icons';
import ProblemRow from './ProblemRow';
import * as api from '../api';

export default function SubtopicCard({
  subtopic,
  onDeleteSubtopic,
  onCodeClick,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState({ total: 0, done: 0 });
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const loadProblems = useCallback(async () => {
    try {
      const data = await api.getProblems(subtopic.id);
      setProblems(data);
      const done = data.filter((p) => p.is_done).length;
      setStats({ total: data.length, done });
    } catch (err) {
      console.error('Failed to load problems:', err);
    }
  }, [subtopic.id]);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  const handleAddProblem = async () => {
    if (!leetcodeUrl.trim()) return;
    setFetching(true);
    setFetchError('');
    try {
      const info = await api.fetchLeetcodeInfo(leetcodeUrl.trim());
      await api.createProblem(subtopic.id, info.title, info.leetcode_url, info.difficulty);
      setLeetcodeUrl('');
      setShowAddModal(false);
      await loadProblems();
    } catch (err) {
      setFetchError(err.message);
    }
    setFetching(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddProblem();
    }
  };

  const handleToggleDone = async (problemId) => {
    try {
      await api.toggleDone(problemId);
      await loadProblems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (problemId) => {
    try {
      await api.toggleBookmark(problemId);
      await loadProblems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    try {
      await api.deleteProblem(problemId);
      await loadProblems();
    } catch (err) {
      console.error(err);
    }
  };

  const progressPercent = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;
  const displayedProblems = showBookmarkedOnly
    ? problems.filter((p) => p.is_bookmarked)
    : problems;

  return (
    <div className="subtopic-card">
      <div className="subtopic-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="subtopic-header-left">
          <h3 className="subtopic-title">{subtopic.name}</h3>
        </div>
        <div className="subtopic-header-right">
          <span className="subtopic-stats">
            {stats.done}/{stats.total}
          </span>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.stopPropagation(); setShowAddModal(true); setFetchError(''); setLeetcodeUrl(''); }}
          >
            <PlusIcon size={14} /> Add
          </button>
          <button
            className={`bookmark-filter-btn ${showBookmarkedOnly ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setShowBookmarkedOnly(!showBookmarkedOnly); }}
            title={showBookmarkedOnly ? 'Show all problems' : 'Show bookmarked only'}
          >
            <BookmarkIcon filled={showBookmarkedOnly} />
          </button>
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete subtopic "${subtopic.name}" and all its problems?`)) {
                onDeleteSubtopic(subtopic.id);
              }
            }}
            title="Delete subtopic"
            style={{ marginLeft: 4 }}
          >
            <TrashIcon size={14} />
          </button>
          <span className={`collapse-icon ${isOpen ? 'open' : ''}`}>
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      {isOpen && (
        <>
          {subtopic.description && (
            <div className="subtopic-description">
              <div className="desc-box scenario">{subtopic.description}</div>
            </div>
          )}

          <div className="problems-section">
            {displayedProblems.length > 0 && (
              <table className="problems-table">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>LeetCode</th>
                    <th>Done</th>
                    <th>Difficulty</th>
                    <th>Bookmark</th>
                    <th>Code</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProblems.map((problem) => (
                    <ProblemRow
                      key={problem.id}
                      problem={problem}
                      onToggleDone={handleToggleDone}
                      onToggleBookmark={handleToggleBookmark}
                      onCodeClick={onCodeClick}
                      onDelete={handleDeleteProblem}
                    />
                  ))}
                </tbody>
              </table>
            )}


          </div>

          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Add Problem</h3>
                <div className="modal-field">
                  <label>LeetCode URL</label>
                  <input
                    type="text"
                    value={leetcodeUrl}
                    onChange={(e) => { setLeetcodeUrl(e.target.value); setFetchError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="https://leetcode.com/problems/two-sum/"
                    autoFocus
                    disabled={fetching}
                  />
                </div>
                {fetchError && (
                  <div className="fetch-status error">⚠ {fetchError}</div>
                )}
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddProblem}
                    disabled={fetching || !leetcodeUrl.trim()}
                  >
                    {fetching ? <span className="spinner" /> : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
