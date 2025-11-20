import axios from 'axios';



export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE == "production" ? "https://guizbackend.onrender.com"  : 'http://localhost:8000',
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
    
});


