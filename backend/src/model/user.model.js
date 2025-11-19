import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,   
        required: true,
        unique: true,
        index: true,
    },  
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,  
        default: false,
    },
    verificationToken: {
        type: String,
        expires: 30,
        default: Date.now // Token expires in 5 minutes
    }
}, {timestamps: true});

const UserModel = mongoose.model('User', userSchema);

export {UserModel};