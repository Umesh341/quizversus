import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "production" ? "https://guizbackend.onrender.com/api" : import.meta.env.BACKEND_URL+ "/api",
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
    
});


