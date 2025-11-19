import express from 'express';
import { registerUser, emailVerification, loginUser, checkAuth,logoutUser } from '../controller/auth.controller.js';
import protectedRoute from '../middleware/auth.middleware.js';
import { getRoom } from '../controller/getRoom.controller.js';
import { leaveRoom } from '../controller/getRoom.controller.js';


const router = express.Router();

router.route('/register').post(registerUser);
router.route('/verify/:email').post(emailVerification);
router.route('/login').post(loginUser);
router.route('/checkauth').post(protectedRoute, checkAuth);
router.route('/logout').post(protectedRoute, logoutUser);
router.route('/getroom/:roomCode').get(getRoom);
router.route('/getroom/:roomCode').get(getRoom);
router.route('/leaveroom/:roomCode').post(leaveRoom);


export default router;