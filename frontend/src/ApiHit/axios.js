import axios from 'axios';



export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "production" ? import.meta.env.BACKEND_URL + "/api" : 'http://localhost:8000/api',
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
    
});


