import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://guizbackend.onrender.com/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
