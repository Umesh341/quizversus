import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:8000/api" : "https://guizbackend.onrender.com/api",
  withCredentials: true,
  secure: true,
  headers: { "Content-Type": "application/json" },
});
``