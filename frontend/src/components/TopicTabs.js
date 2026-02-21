import React from 'react';
import { PlusIcon, BookmarkIcon } from './Icons';

export default function TopicTabs({ topics, activeTopicId, onSelect, onAddClick, onDelete, showBookmarks, onBookmarksClick }) {
  return (
    <div className="topic-tabs-wrapper">
      <div className="topic-tabs">
        {topics.map((topic) => (
          <div key={topic.id} className="topic-tab-wrapper">
            <button
              className={`topic-tab ${activeTopicId === topic.id && !showBookmarks ? 'active' : ''}`}
              onClick={() => onSelect(topic.id)}
            >
              {topic.name}
            </button>
            <button
              className="topic-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete topic "${topic.name}" and all its problems?`)) {
                  onDelete(topic.id);
                }
              }}
              title="Delete topic"
            >
              ×
            </button>
          </div>
        ))}
        <button className="topic-tab add-tab" onClick={onAddClick}>
          <PlusIcon size={14} />
          Add Topic
        </button>
        <button
          className={`topic-tab bookmarks-tab ${showBookmarks ? 'active' : ''}`}
          onClick={onBookmarksClick}
          title="Bookmarked problems"
        >
          <BookmarkIcon filled={showBookmarks} />
        </button>
      </div>
    </div>
  );
}
