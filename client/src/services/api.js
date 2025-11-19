import axios from "axios";

// Create an axios instance with base URL
const api = axios.create({
  // baseURL:
  //   "http://localhost:9000/api" || "https://pod-pairer-server.vercel.app/api",
  baseURL: "https://pod-pairer-server.vercel.app/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.get("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateDetails: (userData) => api.put("/auth/updatedetails", userData),
  updatePin: (pinData) => api.put("/auth/updatepin", pinData),
};

// Queue API
export const queueAPI = {
  joinQueue: () => api.put("/queue/join"),
  leaveQueue: () => api.put("/queue/leave"),
  readyForNextGame: () => api.put("/queue/ready"),
  finishPlaying: () => api.put("/queue/finish"),
  getQueueStatus: () => api.get("/queue/status"),
};

// Pod API
export const podAPI = {
  getCurrentPod: () => api.get("/pods/current"),
  confirmPod: (podId) => api.put(`/pods/${podId}/confirm`),
  rejectPod: (podId) => api.put(`/pods/${podId}/reject`),
  getPodHistory: () => api.get("/pods/history"),
  ratePlayer: (podId, playerId, rating) =>
    api.post(`/pods/${podId}/rate/${playerId}`, { rating }),
  getPlayerRatings: (playerId) => api.get(`/pods/ratings/${playerId}`),
};

export default api;
