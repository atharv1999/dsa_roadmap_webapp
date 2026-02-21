import React from 'react';
import { LeetCodeIcon, BookmarkIcon, CodeIcon, TrashIcon } from './Icons';

export default function ProblemRow({ problem, onToggleDone, onToggleBookmark, onCodeClick, onDelete }) {
  const diffClass = problem.difficulty.toLowerCase();

  return (
    <tr>
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
          title="Open on LeetCode"
        >
          <LeetCodeIcon />
        </a>
      </td>
      <td>
        <input
          type="checkbox"
          className="done-checkbox"
          checked={!!problem.is_done}
          onChange={() => onToggleDone(problem.id)}
          title={problem.is_done ? 'Mark as not done' : 'Mark as done'}
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
          onClick={() => onToggleBookmark(problem.id)}
          title={problem.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <BookmarkIcon filled={!!problem.is_bookmarked} />
        </button>
      </td>
      <td>
        <button
          className={`code-btn ${problem.code_solution ? 'has-code' : ''}`}
          onClick={() => onCodeClick(problem)}
          title={problem.code_solution ? 'Edit code' : 'Add code'}
        >
          <CodeIcon />
        </button>
      </td>
      <td>
        <button
          className="delete-btn"
          onClick={() => {
            if (window.confirm(`Delete "${problem.title}"?`)) {
              onDelete(problem.id);
            }
          }}
          title="Delete problem"
        >
          <TrashIcon />
        </button>
      </td>
    </tr>
  );
}
