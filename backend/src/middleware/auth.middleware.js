import jwt from 'jsonwebtoken';
import { UserModel } from '../model/user.model.js';

const protectedRoute = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
           res.clearCookie('jwt', { httpOnly: true, sameSite: 'lax' });
        return res.status(401).json({message: "not authorized"});
    }   
    try {
        const decoded = jwt.verify(token, "secret");
        req.user = await UserModel.findById(decoded.userId).select('-password'); // select all fields except password

        if (!req.user) {
            return res.status(401).json({ message: "Not authorized1234" });
        }
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
        return;
    }   
};

export default protectedRoute;