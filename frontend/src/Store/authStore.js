import { create } from "zustand";
import { axiosInstance } from "../ApiHit/axios.js";
import { loginUser, verifyEmail } from "../ApiHit/Db.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  registerUser: async (formData, navigate) => {
    try {
      console.log(formData);
      const res = await axiosInstance.post("/auth/register", formData, {
        withCredentials: true,
      });
      console.log(res);
   toast.success("OTP is sent to your email.");
      navigate("/verify/" + formData.email);
      return res;
    } catch (error) {
      throw error;
    }
  },

  loginUser: async (formData, navigate) => {
    try {
      console.log(formData);
      const res = await axiosInstance.post("/auth/login", formData, {
        withCredentials: true,
      });
      console.log(res.data);
      const tempUser = res.data.user;
      set({ user: tempUser });
      toast.success("Login Successful");
      navigate("/");
      return res;
    } catch (error) {
      console.log("error: ", error.response.data);
      toast.error(error.response.data.message);
          if(error.status==402){
             navigate("/verify/" + formData.email);

      }
    }
  },

  verifyEmail: async (token,navigate,email) => {
    try {
    
      console.log(email);
      const res = await axiosInstance.post(
        `/auth/verify/${email}`,
        { token: token },
        { withCredentials: true }
      );
      toast.success("Email verified successfully");
      navigate("/profile");
      return res;
    } catch (error) {
      console.log("error: ", error);
      if(error.status==409){
        toast.error("Invalid OTP. Please try again.");
    }
  }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.post("/auth/checkauth",{ withCredentials: true });
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
      const res = await axiosInstance.post("/auth/logout", { withCredentials: true
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
      const res = await axiosInstance.get(`/auth/getroom/${roomCode}`, {
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
      const res = await axiosInstance.post(`/auth/deleteroom/${roomCode}`, {
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
      const res = await axiosInstance.post(`/auth/leaveroom/${roomCode}`, { userId }, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.log("error in leaveRoom: ", error);
      throw error;
    }
  },

}));
