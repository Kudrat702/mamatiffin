import webpush from 'web-push';
import { PushSubscription } from '../models/pushSubscription';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@mamatiffin.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
}

export const sendPushToSubscription = async (
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushPayload
): Promise<boolean> => {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription expired — clean up
      await PushSubscription.deleteOne({ endpoint: subscription.endpoint });
    }
    return false;
  }
};

export const notifyAllAdmins = async (payload: PushPayload): Promise<void> => {
  const adminSubs = await PushSubscription.find({ subscriptionType: 'admin' });
  await Promise.allSettled(
    adminSubs.map((sub) => sendPushToSubscription(sub, payload))
  );
};

export const notifySubscription = async (
  endpoint: string,
  payload: PushPayload
): Promise<void> => {
  const sub = await PushSubscription.findOne({ endpoint });
  if (sub) {
    await sendPushToSubscription(sub, payload);
  }
};
