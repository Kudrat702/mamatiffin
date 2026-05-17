import { API_BASE_URL } from '../configapi/api';

const STORAGE_KEY = 'push_subscription_endpoint';

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch {
    return null;
  }
};

const getVapidPublicKey = async (): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/api/notifications/vapid-public-key`);
  const data = await res.json() as { publicKey: string };
  return data.publicKey;
};

export const subscribeToPush = async (
  subscriptionType: 'customer' | 'admin' = 'customer'
): Promise<string | null> => {
  try {
    if (!('Notification' in window)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const reg = await navigator.serviceWorker.ready;
    const vapidKey = await getVapidPublicKey();

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    const subJson = subscription.toJSON() as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...subJson, subscriptionType }),
    });

    localStorage.setItem(STORAGE_KEY, subJson.endpoint);
    return subJson.endpoint;
  } catch {
    return null;
  }
};

export const getStoredEndpoint = (): string | null =>
  localStorage.getItem(STORAGE_KEY);

export const initNotifications = async (
  subscriptionType: 'customer' | 'admin' = 'customer'
): Promise<string | null> => {
  await registerServiceWorker();
  return subscribeToPush(subscriptionType);
};
