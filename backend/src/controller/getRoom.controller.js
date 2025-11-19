import mongoose from "mongoose";

import { RoomModel } from "../model/room.model.js";

export const getRoom = async (req, res) => {
  const { roomCode } = req.params;  
    try {
    const room = await RoomModel.findOne({ roomCode });
    if (!room) {
      return res.status(404).json(room);
    }   
    res.status(200).json(room);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  } 
};



 export const leaveRoom = async (req, res) => {
 
  const { userId } = req.body;
  const { roomCode } = req.params;
  try {
    console.log(`User ${userId} is leaving room ${roomCode}`);
    const room = await RoomModel.findOne({ roomCode });
    if (!room) {
      console.log("Room not found");
      return;
    } 
    room.players = room.players.filter((player) => player.id !== userId)  ;
    await room.save();
    console.log(`User ${userId} left room ${roomCode}`);
  } catch (error) {
    console.log("Error leaving room:");
  }
};