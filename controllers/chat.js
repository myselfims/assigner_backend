import { asyncMiddleware } from "../middlewares/async";
import { Message } from "../db/message";

export const sendMessage = async (req, res) => {
    try {
      const { type, projectId, receiverId, message } = req.body;
      const senderId = req.user.id;
  
      if (!message) return res.status(400).json({ error: "Message cannot be empty" });
  
      let newMessage;
      if (type === "global") {
        if (!receiverId) return res.status(400).json({ error: "Receiver ID is required for global chat" });
  
        newMessage = await Message.create({
          senderId,
          receiverId,
          message,
          type: "global",
        });
      } else if (type === "project") {
        if (!projectId) return res.status(400).json({ error: "Project ID is required for project chat" });
  
        newMessage = await Message.create({
          senderId,
          projectId,
          message,
          type: "project",
        });
      } else {
        return res.status(400).json({ error: "Invalid chat type" });
      }
  
      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  