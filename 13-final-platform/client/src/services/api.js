const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  users: () => request('/auth/users'),
  generateUsers: () => request('/auth/users/generate', { method: 'POST' }),
  selectUser: (id) => request('/auth/select-user', { method: 'POST', body: JSON.stringify({ id }) }),
  me: () => request('/auth/me'),
  topics: () => request('/quiz/topics'),
  quiz: (topic, mode = 'gemini', roadmapId = null) => {
    const params = new URLSearchParams({ mode });
    if (roadmapId) params.set('roadmapId', roadmapId);
    return request(`/quiz/${encodeURIComponent(topic)}?${params.toString()}`);
  },
  submit: (body) => request('/quiz/submit', { method: 'POST', body: JSON.stringify(body) }),
  assessmentHistory: () => request('/quiz/history'),
  assessmentAttempt: (id) => request(`/quiz/history/${id}`),
  dashboard: () => request('/dashboard'),
  ranking: () => request('/ranking'),
  mentor: (body) => request('/mentor/explain', { method: 'POST', body: JSON.stringify(body) }),
  roadmaps: () => request('/learning/roadmaps'),
  roadmap: (id) => request(`/learning/roadmaps/${id}`),
  updateRoadmapItem: (id, completed) => request(`/learning/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  }),
  progress: () => request('/learning/progress'),
};
