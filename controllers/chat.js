import { asyncMiddleware } from "../middlewares/async.js";
import { Message } from "../db/message.js";
import { User } from "../db/user.js";


export const sendMessage = asyncMiddleware(async (req, res) => {
  try {
    const { type, projectId, receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!content)
      return res.status(400).json({ error: "Message cannot be empty" });
    if (!projectId && !receiverId)
      return res.status(400).json({ error: "Project or Receiver id is required" });

    // Save the message to the database
    let newMessage = await Message.create({
      senderId,
      receiverId,
      projectId,
      content,
      type,
    });

    newMessage = await Message.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "avatar"],
        },
      ],
    });
    

    // Emit the message to the relevant room(s) via WebSocket
    if (projectId) {
      // If the message is related to a project, emit it to the project room
      console.log('sending message to socket')
      req.io.to(`chat-${projectId}`).emit("message", newMessage);
    } else if (receiverId) {
      // If the message is a direct message, emit it to the user room
      req.io.to(`chat-${receiverId}`).emit("message", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const getProjectMessage = asyncMiddleware(async (req, res) => {
  try {
    const { projectId } = req.params;
    const senderId = req.user.id;

    if (!projectId)
      return res.status(400).json({ error: "ProjectId cannot be empty" });
    const messages = await Message.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          as: "sender", // Should match the alias in association
          attributes: ["id", "name", "email", "avatar"], // Include only necessary fields
        },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
});
