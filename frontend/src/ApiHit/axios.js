import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://guizbackend.onrender.com/api",
  withCredentials: true,
  secure: true,
  headers: { "Content-Type": "application/json" },
});
