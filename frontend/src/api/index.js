import api from './axios';

export default {
  auth: {
    login: (credentials) => api.post('social_network/auth/login/', credentials),  // → /social_network/auth/login/,
    refresh: () => api.post('token/refresh/'),
    getCurrentUser: () => api.get('auth/user/'),
  },
  posts: {
  list: () => api.get('social_network/posts/'),
  create: (data) => api.post('social_network/posts/', data),
  like: (postId) => api.post(`social_network/posts/${postId}/like/`),
  comments: {
    list: (postId) => api.get(`social_network/posts/${postId}/comments/`),
    create: (postId, data) => api.post(`social_network/posts/${postId}/comments/`, data),
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
