import { Request, Response } from 'express';
import { PushSubscription } from '../models/pushSubscription';

export const subscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { endpoint, keys, subscriptionType } = req.body as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      subscriptionType?: 'customer' | 'admin';
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ success: false, message: 'Invalid subscription data' });
      return;
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { endpoint, keys, subscriptionType: subscriptionType || 'customer' },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ success: false, message: 'Failed to subscribe' });
  }
};

export const unsubscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { endpoint } = req.body as { endpoint: string };

    if (!endpoint) {
      res.status(400).json({ success: false, message: 'Endpoint required' });
      return;
    }

    await PushSubscription.deleteOne({ endpoint });
    res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
  }
};

export const getVapidPublicKey = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
  });
};
