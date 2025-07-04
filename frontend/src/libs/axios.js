

import axios from "axios";

const axiosInstance = axios.create({
    baseURL : import.meta.env.MODE === "development" ? "http://localhost:8000/api/v1" : "https://whey-code-backend.onrender.com/api/v1",
    withCredentials: true,

});



export { axiosInstance };