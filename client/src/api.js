export const likeComment = async (commentId, action) => {
  const res = await axios.post(`${API_URL}/comments/${commentId}/like`, { action });
  return res.data;
};
export const getCommentsByEvent = async (eventId) => {
  const res = await axios.get(`${API_URL}/comments/${eventId}`);
  return res.data.comments;
};
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const register = async (email, password, nickname) => {
  const res = await axios.post(`${API_URL}/register`, { email, password, nickname });
  return res.data;
};

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  return res.data;
};

export const postComment = async (userId, eventId, eventName, nickname, body) => {
  const res = await axios.post(`${API_URL}/comments`, { userId, eventId, eventName, nickname, body });
  return res.data;
};
