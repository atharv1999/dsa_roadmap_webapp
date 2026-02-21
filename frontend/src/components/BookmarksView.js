import React, { useState, useEffect, useCallback } from 'react';
import { LeetCodeIcon, BookmarkIcon, CodeIcon, TrashIcon } from './Icons';
import * as api from '../api';

export default function BookmarksView({ onCodeClick }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    try {
      const data = await api.getBookmarkedProblems();
      setProblems(data);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleToggleDone = async (id) => {
    await api.toggleDone(id);
    await loadBookmarks();
  };

  const handleToggleBookmark = async (id) => {
    await api.toggleBookmark(id);
    await loadBookmarks();
  };

  const handleDeleteProblem = async (id) => {
    if (window.confirm('Delete this problem?')) {
      await api.deleteProblem(id);
      await loadBookmarks();
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⭐</div>
        <div className="empty-state-text">No bookmarked problems</div>
        <div className="empty-state-sub">
          Bookmark problems from any topic to see them here
        </div>
      </div>
    );
  }

  // Group by topic → subtopic
  const grouped = {};
  problems.forEach((p) => {
    const key = `${p.topic_name} › ${p.subtopic_name}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  return (
    <div>
      {Object.entries(grouped).map(([groupName, groupProblems]) => (
        <div key={groupName} className="subtopic-card">
          <div className="subtopic-header" style={{ cursor: 'default' }}>
            <div className="subtopic-header-left">
              <h3 className="subtopic-title">{groupName}</h3>
            </div>
            <div className="subtopic-header-right">
              <span className="subtopic-stats">{groupProblems.length} bookmarked</span>
            </div>
          </div>
          <div className="problems-section">
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
                {groupProblems.map((problem) => {
                  const diffClass = problem.difficulty.toLowerCase();
                  return (
                    <tr key={problem.id}>
                      <td>
                        <a
                          href={problem.leetcode_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="problem-name"
                        >
                          {problem.title}
                        </a>
                      </td>
                      <td>
                        <a
                          href={problem.leetcode_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="leetcode-link"
                        >
                          <LeetCodeIcon />
                        </a>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="done-checkbox"
                          checked={!!problem.is_done}
                          onChange={() => handleToggleDone(problem.id)}
                        />
                      </td>
                      <td>
                        <span className={`difficulty-badge ${diffClass}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`bookmark-btn ${problem.is_bookmarked ? 'active' : ''}`}
                          onClick={() => handleToggleBookmark(problem.id)}
                        >
                          <BookmarkIcon filled={!!problem.is_bookmarked} />
                        </button>
                      </td>
                      <td>
                        <button
                          className={`code-btn ${problem.code_solution ? 'has-code' : ''}`}
                          onClick={() => onCodeClick(problem)}
                        >
                          <CodeIcon />
                        </button>
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteProblem(problem.id)}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
