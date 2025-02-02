import { asyncMiddleware } from "../middlewares/async.js";
import { Message } from "../db/message.js";
import { User } from "../db/user.js";
import { PinnedMessage } from "../db/pinnedMessage.js";


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

export const deleteMessage = asyncMiddleware(async (req, res) => {
  try {
    const { messageId } = req.params;
    console.log('deleting the message where messageId is :', messageId)
    // Check if messageId is provided
    if (!messageId) {
      return res.status(400).json({ success: false, message: "Message ID is required" });
    }

    // Find the message
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Delete the message
    message.destroy()

    return res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export const getPinnedMessages = asyncMiddleware(async (req, res) => {
  try {
    const { userId } = req; // Assuming userId is extracted from auth middleware
    const { projectId, receiverId } = req.body;

    let whereCondition = { userId };

    if (projectId) {
      whereCondition.projectId = projectId; // Fetch project-specific pinned messages
    } else if (receiverId) {
      whereCondition.receiverId = receiverId; // Fetch receiver-specific pinned messages
    } else {
      return res.status(400).json({ message: "Either projectId or receiverId is required." });
    }

    const pinnedMessages = await PinnedMessage.findAll({
      where: whereCondition,
      include: [{ model: Message }], // Include full message details
    });

    res.status(200).json({ success: true, pinnedMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export const pinMessage = asyncMiddleware(async (req, res) => {
  try {
    console.log('Pinned message called')
    const userId = req.user.id; // Assuming userId is extracted from auth middleware
    const { messageId } = req.params;
    const { projectId, receiverId } = req.body;

    console.log("Pinning message:", { userId, messageId, projectId, receiverId });

    // Validate input
    if (!messageId) {
      return res.status(400).json({ success: false, message: "Message ID is required" });
    }
    if (!projectId && !receiverId) {
      return res.status(400).json({ success: false, message: "Either projectId or receiverId is required" });
    }

    // Check if the message exists
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Ensure uniqueness (prevent duplicate pins)
    const existingPin = await PinnedMessage.findOne({
      where: {
        userId,
        messageId,
        projectId: projectId || null, // Ensure uniqueness in case of project messages
        receiverId: receiverId || null, // Ensure uniqueness in case of direct messages
      },
    });

    if (existingPin) {
      return res.status(400).json({ success: false, message: "Message is already pinned" });
    }

    // Create a new pinned message entry
    await PinnedMessage.create({
      userId,
      messageId,
      projectId: projectId || null, // Store projectId only if provided
      receiverId: receiverId || null, // Store receiverId only if provided
    });

    return res.status(201).json({ success: true, message: "Message pinned successfully" });
  } catch (error) {
    console.error("Error pinning message:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

