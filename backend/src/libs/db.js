import mongoose from "mongoose";
const DB_NAME = "quizversus_db";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () =>{
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n DB connected !!! host:  ${conn.connection.host}`);
        
    } catch (error) {
        console.log("DB connection error : ", error);
        process.exit(1);
    }
}

export {connectDB};