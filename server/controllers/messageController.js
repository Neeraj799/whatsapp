import { io, userSocketMap } from "../index.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import connectCloudinary from "../utils/cloudinary.js";

const getUsersForSidebar = async () => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    //Count number of messages not seen
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    return res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get all messages for selected user

const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const id = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: id, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: id },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: id },
      { seen: true }
    );

    return res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// api to mark message as seen using message id

const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Message.findByIdAndUpdate(id, { seen: true });
    return res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

//Send message to selected user

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const uploadResponse = await connectCloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    //Emit the new message to the receiver's socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { getUsersForSidebar, getMessages, markMessageAsSeen, sendMessage };
