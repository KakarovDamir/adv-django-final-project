import api from './axios';

export default {
  auth: {
    login: (credentials) => api.post('social_network/auth/login/', credentials),  // → /social_network/auth/login/,
    refresh: () => api.post('token/refresh/'),
    getCurrentUser: () => api.get('auth/user/'),
  },
  posts: {
    list: () => api.get('posts/'),
    create: (data) => api.post('posts/', data),
    like: (postId) => api.post(`posts/${postId}/like/`),
    comments: {
      list: (postId) => api.get(`posts/${postId}/comments/`),
      create: (postId, data) => api.post(`posts/${postId}/comments/`, data),
    },
  },
  profiles: {
    get: (username) => api.get(`profiles/${username}/`),
  },
  friends: {
    requests: {
      list: () => api.get('friends/requests/'),
      send: (username) => api.post(`friends/requests/send/${username}/`),
      respond: (requestId, action) => api.post(`friends/requests/${requestId}/${action}/`),
    },
  },
  notifications: {
    list: () => api.get('notifications/'),
    markRead: (notificationId) => api.post(`notifications/${notificationId}/read/`),
  },
};
