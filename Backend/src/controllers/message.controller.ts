import { Response } from 'express';
import { Message } from '../models/message.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEventToUser } from '../sockets/socket';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { content, receiverRole } = req.body;

    if (!content || !receiverRole) {
      return res.status(400).json({ error: 'Content and receiver role are required.' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized.' });
    }

    const today = new Date();
    const timeStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + (today.getHours() >= 12 ? 'PM' : 'AM');

    let senderName = 'System';
    let senderRole = req.user.role as string;

    if (req.user.role === 'Chief Minister') {
      senderName = 'Chief Minister';
    } else if (req.user.role === 'District Magistrate') {
      senderName = `${req.user.district} DM`;
      senderRole = `${req.user.district} DM`;
    } else if (req.user.role === 'Department Head') {
      if (req.user.department === 'Education & Schools') {
        senderName = 'Director of Education';
        senderRole = 'Director of Education';
      } else if (req.user.department === 'Public Health') {
        senderName = 'Director Health Services';
        senderRole = 'Director Health Services';
      } else if (req.user.department === 'PWD & Infrastructure') {
        senderName = 'Chief Engineer';
        senderRole = 'Chief Engineer';
      } else {
        senderName = req.user.department || 'Department Head';
        senderRole = req.user.department || 'Department Head';
      }
    }

    const count = await Message.countDocuments();
    const formattedId = `MSG-0${count + 1}`;

    const newMessage = await Message.create({
      id: formattedId,
      senderName,
      senderRole,
      receiverRole,
      content,
      timestamp: timeStr
    });

    // Notify the receiver in real-time if they are online
    sendEventToUser(receiverRole, 'message_received', newMessage);

    res.status(201).json(newMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

