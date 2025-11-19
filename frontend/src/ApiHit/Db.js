import { useNavigate} from "react-router-dom";
import { axiosInstance } from "./axios";


export const registerUser = async (formData,navigate) => {
    try {
        console.log(formData);
      const res = await axiosInstance.post("/auth/register", formData , { withCredentials: true });
        console.log(res.data);
        if(res){
          navigate('/verify/' + formData.email);
        }
        return res.data;
       
    } catch (error) {
        throw error;
    }
};

export const verifyEmail = async (email, token) => {
    try {
        console.log(token);
        console.log(email);
        const er= "vgvuvhjvhjhj@gmail.com";
        console.log("token", token)
        const res = await axiosInstance.post(`/auth/verify/${er}`, { token: token } , { withCredentials: true });
        console.log(res.data);
        return res.data;
    } catch (error) {
        console.log("error: ", error.response.data);
    }
};


export const loginUser = async (formData,navigate) => {
    try {
        console.log(formData);
      const res = await axiosInstance.post("/auth/login", formData , { withCredentials: true });
        console.log(res.data);
    alert("Login Successful");
          navigate('/');
        return res.data;
       
    } catch (error) {
        throw error;
    }
};