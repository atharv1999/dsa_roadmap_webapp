import React, { useState, useEffect, useCallback } from 'react';
import TopicTabs from './components/TopicTabs';
import SubtopicCard from './components/SubtopicCard';
import BookmarksView from './components/BookmarksView';
import { AddTopicModal, AddSubtopicModal, CodeEditorModal } from './components/Modal';
import { PlusIcon } from './components/Icons';
import * as api from './api';

export default function App() {
  const [topics, setTopics] = useState([]);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Modals
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddSubtopic, setShowAddSubtopic] = useState(false);
  const [codeEditorProblem, setCodeEditorProblem] = useState(null);

  // Load topics
  const loadTopics = useCallback(async () => {
    try {
      const data = await api.getTopics();
      setTopics(data);
      if (data.length > 0 && !activeTopicId) {
        setActiveTopicId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
    }
    setLoading(false);
  }, [activeTopicId]);

  // Load subtopics when active topic changes
  const loadSubtopics = useCallback(async () => {
    if (!activeTopicId || showBookmarks) {
      setSubtopics([]);
      return;
    }
    try {
      const data = await api.getSubtopics(activeTopicId);
      setSubtopics(data);
    } catch (err) {
      console.error('Failed to load subtopics:', err);
    }
  }, [activeTopicId, showBookmarks]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  useEffect(() => {
    loadSubtopics();
  }, [loadSubtopics]);

  // Handlers
  const handleAddTopic = async (name) => {
    const topic = await api.createTopic(name);
    setTopics((prev) => [...prev, topic]);
    setActiveTopicId(topic.id);
    setShowBookmarks(false);
  };

  const handleSelectTopic = (id) => {
    setActiveTopicId(id);
    setShowBookmarks(false);
  };

  const handleBookmarksClick = () => {
    setShowBookmarks(true);
  };

  const handleDeleteTopic = async (id) => {
    await api.deleteTopic(id);
    setTopics((prev) => prev.filter((t) => t.id !== id));
    if (activeTopicId === id) {
      const remaining = topics.filter((t) => t.id !== id);
      setActiveTopicId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleAddSubtopic = async (topicId, name, description) => {
    await api.createSubtopic(topicId, name, description);
    await loadSubtopics();
  };

  const handleDeleteSubtopic = async (id) => {
    await api.deleteSubtopic(id);
    setSubtopics((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveCode = async (problemId, code) => {
    await api.saveCode(problemId, code);
  };

  const handleExportSeedData = async () => {
    try {
      await api.exportSeedData();
      alert('seed-data.json updated successfully!');
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="empty-state">
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">
          <span>DSA</span> Roadmap
        </h1>
        <button className="btn btn-secondary btn-sm" onClick={handleExportSeedData} title="Update seed-data.json with current problems">
          📤 Export Seed Data
        </button>
      </div>

      {/* Topic Tabs */}
      <TopicTabs
        topics={topics}
        activeTopicId={activeTopicId}
        onSelect={handleSelectTopic}
        onAddClick={() => setShowAddTopic(true)}
        onDelete={handleDeleteTopic}
        showBookmarks={showBookmarks}
        onBookmarksClick={handleBookmarksClick}
      />

      {/* Content */}
      {showBookmarks ? (
        <BookmarksView onCodeClick={(problem) => setCodeEditorProblem(problem)} />
      ) : activeTopicId ? (
        <>
          {subtopics.map((subtopic) => (
            <SubtopicCard
              key={subtopic.id}
              subtopic={subtopic}
              onDeleteSubtopic={handleDeleteSubtopic}
              onCodeClick={(problem) => setCodeEditorProblem(problem)}
            />
          ))}

          <button
            className="add-subtopic-btn"
            onClick={() => setShowAddSubtopic(true)}
          >
            <PlusIcon size={16} />
            Add Subtopic
          </button>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">No topics yet</div>
          <div className="empty-state-sub">
            Click "Add Topic" to create your first DSA topic
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddTopic && (
        <AddTopicModal
          onClose={() => setShowAddTopic(false)}
          onAdd={handleAddTopic}
        />
      )}

      {showAddSubtopic && activeTopicId && (
        <AddSubtopicModal
          topicId={activeTopicId}
          onClose={() => setShowAddSubtopic(false)}
          onAdd={handleAddSubtopic}
        />
      )}

      {codeEditorProblem && (
        <CodeEditorModal
          problem={codeEditorProblem}
          onClose={() => setCodeEditorProblem(null)}
          onSave={handleSaveCode}
        />
      )}
    </div>
  );
}
