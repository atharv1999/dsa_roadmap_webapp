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
  const [leetcodeUrls, setLeetcodeUrls] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0, results: [] });
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

  const handleAddProblems = async () => {
    const urls = leetcodeUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);
    if (urls.length === 0) return;

    setFetching(true);
    setFetchError('');
    setFetchProgress({ current: 0, total: urls.length, results: [] });

    const results = [];
    for (let i = 0; i < urls.length; i++) {
      setFetchProgress(prev => ({ ...prev, current: i + 1 }));
      try {
        const info = await api.fetchLeetcodeInfo(urls[i]);
        await api.createProblem(subtopic.id, info.title, info.leetcode_url, info.difficulty);
        results.push({ url: urls[i], success: true });
      } catch (err) {
        results.push({ url: urls[i], success: false, error: err.message });
      }
      setFetchProgress(prev => ({ ...prev, results: [...results] }));
    }

    const failures = results.filter(r => !r.success);
    if (failures.length === 0) {
      setLeetcodeUrls('');
      setShowAddModal(false);
      setFetchProgress({ current: 0, total: 0, results: [] });
    } else {
      // Keep only the failed URLs in the textarea so user can retry
      setLeetcodeUrls(failures.map(f => f.url).join('\n'));
      setFetchError(`${failures.length} of ${urls.length} failed. Failed URLs kept below.`);
    }
    await loadProblems();
    setFetching(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAddProblems();
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
            onClick={(e) => { e.stopPropagation(); setShowAddModal(true); setFetchError(''); setLeetcodeUrls(''); setFetchProgress({ current: 0, total: 0, results: [] }); }}
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
            <div className="modal-overlay" onClick={() => { if (!fetching) setShowAddModal(false); }}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Add Problems</h3>
                <div className="modal-field">
                  <label>LeetCode URLs <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85em' }}>(one per line)</span></label>
                  <textarea
                    value={leetcodeUrls}
                    onChange={(e) => { setLeetcodeUrls(e.target.value); setFetchError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder={'https://leetcode.com/problems/two-sum/\nhttps://leetcode.com/problems/3sum/\nhttps://leetcode.com/problems/valid-parentheses/'}
                    autoFocus
                    disabled={fetching}
                    rows={5}
                    style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                  />
                </div>
                {fetching && fetchProgress.total > 0 && (
                  <div className="bulk-progress">
                    <div className="bulk-progress-text">Adding {fetchProgress.current} of {fetchProgress.total}...</div>
                    <div className="progress-bar-container" style={{ height: 6, marginTop: 6 }}>
                      <div className="progress-bar-fill" style={{ width: `${(fetchProgress.current / fetchProgress.total) * 100}%` }} />
                    </div>
                    {fetchProgress.results.length > 0 && (
                      <div className="bulk-results">
                        {fetchProgress.results.map((r, i) => (
                          <div key={i} className={`bulk-result-item ${r.success ? 'success' : 'fail'}`}>
                            {r.success ? '✓' : '✗'} {r.url.replace(/.*\/problems\//, '').replace(/\/$/, '')}
                            {!r.success && <span className="bulk-error-msg"> — {r.error}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {fetchError && (
                  <div className="fetch-status error">⚠ {fetchError}</div>
                )}
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={fetching}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddProblems}
                    disabled={fetching || !leetcodeUrls.trim()}
                  >
                    {fetching ? <span className="spinner" /> : `Add ${leetcodeUrls.split('\n').filter(u => u.trim()).length || ''} Problem${leetcodeUrls.split('\n').filter(u => u.trim()).length !== 1 ? 's' : ''}`}
                  </button>
                </div>
                <div style={{ marginTop: 8, fontSize: '0.8em', color: 'var(--text-muted)' }}>Ctrl+Enter to submit</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
