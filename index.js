const express = require("express");
const app = express();
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const server = createServer(app);
const io = new Server(server);
const { join } = require("node:path");
const cors = require("cors");
const Chat = require("./Models/Chat");
app.use(express.json(), cors());
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/Real_Time_Chat", {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
  })
  .then((result) => {
    console.log("Connected to database");
  });

//Socket code is starting From Here!

io.on("connection", (socket) => {

  socket.on("sendMessage", async (data) => {
  
    const { senderId, receiverId, message } = data;

    const RoomName = `room${senderId}${receiverId}`;

    socket.join(RoomName);

    const newMessage = new Chat({
  
      sender_id: senderId,

      receiver_id: receiverId,

      message: message,
    });

    try {

      await newMessage.save();

      console.log("Data successfully added");

      //Getting message From database!

      const data = await Chat.find({ sender_id: senderId })
        .sort({ _id: -1 }) // Sort by sender_id in ascending order in descending order
        .limit(1);
        socket.emit('get-all-chats',"HighLight the main isssue!")
      socket.to(RoomName).emit("recMessage", data);

    } catch (error) {
      console.error("Failed to save data:", error);
    }
  });

  socket.on("recMessage", async (data) => {

    const { senderId, receiverId, message } = data;

    RoomName = `room${receiverId}${senderId}`;

    socket.join(RoomName);

    const newMessage = new Chat({
    
      sender_id: senderId,

      receiver_id: receiverId,

      message: message,
    });

    try {

      await newMessage.save();

      console.log("Data successfully added");

      //Getting message From database:
      const data = await Chat.find({ receiver_id: receiverId })
        .sort({ _id: -1 })
        .limit(1);
      
        socket.to(RoomName).emit("sendMessage", data);
        socket.emit('get-all-chats',"HighLight the main isssue!")
      }
    
      catch (error) {
      console.error("Failed to save data:", error);
    }
  });

  socket.on("get_all_chats", async (userId, callback) => {
    try {
      const sender_id = new ObjectId("6540df095ee07c514c834491");
      const receiver_id = new ObjectId("6540def25ee07c514c83448f");

      const chats = await Chat.find({
        $or: [
          {
            $and: [{ sender_id: sender_id }, { receiver_id: receiver_id }],
          },
          {
            $and: [{ sender_id: receiver_id }, { receiver_id: sender_id }],
          },
        ],
      });

      socket.emit("get_all_chats", chats);
    } catch (error) {
      console.error("Failed to retrieve chat messages:", error);
    }
  });

  socket.on("disconnected", () => {
    console.log("Socket is disconnected!");
  });

  socket.on("socket_error", () => {
    console.log("Eror!");
  });
});

const User = require("./Models/User");

const { ObjectId } = require("bson");

app.post("/user", async (req, res) => {
  const { name, email } = req.body;
  const data = new User(req.body);
  const save = await data.save();
  if (save)
    res.status(200).send({ status: 1, message: "User Successfully added!" });
  else res.status(400).send({ status: 0, message: "User Failed to add!" });
});

// ChatList API for the user!
app.get("/user-chat-list/:id", async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.params.id);

  if (!userId)
    res.status(400).send({ status: 1, message: "Please provide me userId" });
  try {
    const chatList = await Chat.aggregate([
      {
        $match: {
          $or: [
            {
              sender_id: userId,
            },
            {
              receiver_id: userId,
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              {
                $eq: ["$sender_id", userId],
              },
              "$receiver_id",
              "$sender_id",
            ],
          },
          latestMessage: {
            $last: "$message",
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          latestMessage: 1,
          count: 1,
          userId: 1,
          userName: "$user.name",
          // userEmail: 1
        },
      },
    ]);

    res
      .status(200)
      .json({ status: 1, message: `The User : ${userId} `, data: chatList });
  } catch (error) {
    console.error("Failed to retrieve chat lists:", error);
    res
      .status(500)
      .json({ status: 0, message: "Failed to retrieve chat lists" });
  }
});

//Getting all the chat:
app.get("/user-chat", async (req, res) => {
  const sender_id = req.body.sender_id;
  const receiver_id = req.body.receiver_id;
  if (!sender_id)
    res.send({ status: 1, message: "Please insert the sender_id" });
  else if (!receiver_id)
    res.send({ status: 1, message: "Please insert the receiver ID" });
  const chats = await Chat.find({
    $or: [
      {
        $and: [{ sender_id: sender_id }, { receiver_id: receiver_id }],
      },
      {
        $and: [{ sender_id: receiver_id }, { receiver_id: sender_id }],
      },
    ],
  });
  res.status(200).send({ status: 1, data: chats });
});
server.listen(3001, () => {
  console.log("server running at http://localhost:3000");
});

