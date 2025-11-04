import axios from 'axios';

// Configure axios base URL to backend root. Client code already includes the '/api/v1' prefix
// in many requests (for example '/api/v1/files/upload'), so keep the baseURL at the server root.
axios.defaults.baseURL = 'http://127.0.0.1:5001';

// Add request interceptor to include Authorization header
axios.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    if (userData.token) {
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);