import { useState, useEffect, useCallback } from 'react';

interface NotificationPreferences {
  priceAlerts: boolean;
  recurringPurchases: boolean;
  transactionUpdates: boolean;
}

const STORAGE_KEY = 'pm_notification_preferences';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    priceAlerts: true,
    recurringPurchases: true,
    transactionUpdates: true,
  });

  // Check support and current state
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        
        // Check if already subscribed
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }
    };

    // Load preferences
    const savedPrefs = localStorage.getItem(STORAGE_KEY);
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error('Failed to parse notification preferences:', e);
      }
    }

    checkSupport();
  }, []);

  // Save preferences
  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [preferences]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.error('Push notifications not supported');
      return false;
    }

    setIsLoading(true);
    
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      }

      // Mark as subscribed (simplified - in production would use actual push subscription)
      localStorage.setItem('pm_push_enabled', 'true');

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      localStorage.removeItem('pm_push_enabled');
      
      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }, []);

  // Show local notification (for testing or immediate notifications)
  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.log('Cannot show notification - not supported or not permitted');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/pm-app-logo.png',
        badge: '/pm-app-logo.png',
        ...options,
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }, [isSupported, permission]);

  // Send price alert notification
  const sendPriceAlert = useCallback(async (crypto: string, price: number, condition: 'above' | 'below', targetPrice: number) => {
    if (!preferences.priceAlerts) return;
    
    await showNotification(`🔔 ${crypto} Price Alert`, {
      body: `${crypto} is now ${condition} your target of $${targetPrice.toLocaleString()}. Current price: $${price.toLocaleString()}`,
      tag: `price-alert-${crypto}`,
      requireInteraction: true,
      data: { type: 'price_alert', crypto, price },
    });
  }, [preferences.priceAlerts, showNotification]);

  // Send recurring purchase notification
  const sendRecurringPurchaseAlert = useCallback(async (crypto: string, amount: number, currency: string) => {
    if (!preferences.recurringPurchases) return;
    
    await showNotification(`💰 Auto-Buy Executed`, {
      body: `Your scheduled purchase of ${currency}${amount} worth of ${crypto} has been executed.`,
      tag: `recurring-${crypto}`,
      data: { type: 'recurring_purchase', crypto, amount },
    });
  }, [preferences.recurringPurchases, showNotification]);

  // Send transaction notification
  const sendTransactionAlert = useCallback(async (type: 'send' | 'receive' | 'swap', amount: string, token: string) => {
    if (!preferences.transactionUpdates) return;
    
    const icons = { send: '📤', receive: '📥', swap: '🔄' };
    const titles = { send: 'Sent', receive: 'Received', swap: 'Swapped' };
    
    await showNotification(`${icons[type]} Transaction ${titles[type]}`, {
      body: `${amount} ${token} ${type === 'swap' ? 'swapped' : type}`,
      tag: `transaction-${Date.now()}`,
      data: { type: 'transaction', txType: type, amount, token },
    });
  }, [preferences.transactionUpdates, showNotification]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
    showNotification,
    sendPriceAlert,
    sendRecurringPurchaseAlert,
    sendTransactionAlert,
  };
};
