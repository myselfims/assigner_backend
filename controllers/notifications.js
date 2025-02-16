import { Notification } from "../db/notification.js";
import { asyncMiddleware } from "../middlewares/async.js";

export const getAllNotifications = asyncMiddleware(async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const notifications = await Notification.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]], // Sort by newest first
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  res.json({ notifications, unread: unreadCount });
});


export const readNotification = asyncMiddleware(async (req, res) => {
    const { id } = req.params; // Notification ID from request params
    const notification = await Notification.findOne({ where: { id, userId: req.user.id } });

    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
});
