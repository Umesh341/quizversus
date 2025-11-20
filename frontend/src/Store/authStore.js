import { create } from "zustand";
import { axiosInstance } from "../ApiHit/axios.js";
import { loginUser, verifyEmail } from "../ApiHit/Db.js";


export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  registerUser: async (formData, navigate) => {
    try {
      console.log(formData);
      const res = await axiosInstance.post("/api/auth/register", formData, {
        withCredentials: true,
      });
      console.log(res);
      const tempUser = res.data.user;
      set({ user: tempUser });
      const { user } = get();

      navigate("/verify/" + user.email);
      return res;
    } catch (error) {
      throw error;
    }
  },

  loginUser: async (formData, navigate) => {
    try {
      console.log(formData);
      const res = await axiosInstance.post("/api/auth/login", formData, {
        withCredentials: true,
      });
      console.log(res.data);
      const tempUser = res.data.user;
      set({ user: tempUser });
      alert("Login Successful");
      navigate("/");
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  verifyEmail: async (token) => {
    try {
      console.log(token);
      const { user } = get();
      console.log(user);
      const res = await axiosInstance.post(
        `/api/auth/verify/${user.email}`,
        { token: token },
        { withCredentials: true }
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("error: ", error);
    }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.post("/api/auth/checkauth",{ withCredentials: true });
        const tempUser = res.data.user;
        set({ user: tempUser });
        if(res.status!==200){
          set({ user: null });
          return;
        }

    } catch (error) {
      set({ user: null });
      console.log("error in checkAuth: ", error);
    }
  },
 logoutUser: async () => {
    try {
      const res = await axiosInstance.post("/api/auth/logout", { withCredentials: true
      });
      if(res.status!==200){
        set({ user: null });
        throw new Error("Logout failed");
      }
      set({ user: res.data.user });
      get().checkAuth();
      console.log("Logged out successfully");
    }
    catch (error) {
      console.log("error in logout: ", error);
    } 
  },
  getRoomInfo: async (roomCode) => {
    try {
      const res = await axiosInstance.get(`/api/auth/getroom/${roomCode}`, {
        withCredentials: true,
      });

      return res.data;
    } catch (error) {
      console.log("error in getRoomInfo: ", error);
      throw error;
    }
  },
  deleteRoom: async (roomCode) => {
    console.log("Deleting room with code:", roomCode);
    try {
      const res = await axiosInstance.post(`/api/auth/deleteroom/${roomCode}`, {
        withCredentials: true,
      });
      if(res){
        alert("Room deleted successfully");
        set({ roomCode: "" });
      }
      return res.data;
    }
    catch (error) {
      console.log("error in deleteRoom: ", error);
      throw error;
    }
  },
  leaveRoom: async (roomCode, userId) => {
    try {
      const res = await axiosInstance.post(`/api/auth/leaveroom/${roomCode}`, { userId }, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.log("error in leaveRoom: ", error);
      throw error;
    }
  },

}));
