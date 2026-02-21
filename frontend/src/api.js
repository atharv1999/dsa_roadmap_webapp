const API_BASE = `http://${window.location.hostname}:5000/api`;

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Topics
export const getTopics = () => request('/topics');
export const createTopic = (name) => request('/topics', { method: 'POST', body: JSON.stringify({ name }) });
export const deleteTopic = (id) => request(`/topics/${id}`, { method: 'DELETE' });

// Subtopics
export const getSubtopics = (topicId) => request(`/topics/${topicId}/subtopics`);
export const createSubtopic = (topic_id, name, description) =>
  request('/subtopics', { method: 'POST', body: JSON.stringify({ topic_id, name, description }) });
export const deleteSubtopic = (id) => request(`/subtopics/${id}`, { method: 'DELETE' });

// Problems
export const getProblems = (subtopicId) => request(`/subtopics/${subtopicId}/problems`);
export const createProblem = (subtopic_id, title, leetcode_url, difficulty) =>
  request('/problems', { method: 'POST', body: JSON.stringify({ subtopic_id, title, leetcode_url, difficulty }) });
export const deleteProblem = (id) => request(`/problems/${id}`, { method: 'DELETE' });
export const toggleDone = (id) => request(`/problems/${id}/done`, { method: 'PATCH' });
export const toggleBookmark = (id) => request(`/problems/${id}/bookmark`, { method: 'PATCH' });
export const saveCode = (id, code_solution) =>
  request(`/problems/${id}/code`, { method: 'PATCH', body: JSON.stringify({ code_solution }) });

// LeetCode fetch
export const fetchLeetcodeInfo = (url) =>
  request('/leetcode/fetch', { method: 'POST', body: JSON.stringify({ url }) });

// Stats
export const getSubtopicStats = (subtopicId) => request(`/subtopics/${subtopicId}/stats`);

// Bookmarks
export const getBookmarkedProblems = () => request('/bookmarks');

// Export
export const exportSeedData = () => request('/export/save', { method: 'POST' });
