

import axios from "axios";

export const axiosInstance = axios.create({
    baseURL : import.meta.env.MODE === "development" ? "http://localhost:8000/api/v1" : "https://whey-code-backend.onrender.com/api/v1",
    withCredentials: true,

});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { axiosInstance };