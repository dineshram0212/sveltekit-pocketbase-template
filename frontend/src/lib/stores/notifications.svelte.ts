import { browser } from "$app/environment";
import { pb } from "$lib/pb";
import { toast } from "svelte-sonner";

export type NotificationType = "share" | "alert" | "info" | "success";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: number | string; // Unix timestamp
  isRead: boolean;
  type: NotificationType;
  actionData?: {
    label: string;
    url: string;
  };
}

function createNotificationStore() {
  let internalNotifications = $state<NotificationItem[]>([]);
  let isSubscribed = false;

  const fetchNotifications = async () => {
    if (!browser || !pb.authStore.isValid) return;
    
    try {
      // Fetch latest notifications for the current user
      const records = await pb.collection('notifications').getList(1, 50, {
        sort: '-created',
        filter: `user = "${pb.authStore.model?.id}"`
      });

      internalNotifications = records.items.map(record => ({
        id: record.id,
        title: record.title,
        description: record.description,
        time: new Date(record.created).getTime(),
        isRead: record.isRead,
        type: record.type as NotificationType,
        actionData: record.actionData ? (typeof record.actionData === 'string' ? JSON.parse(record.actionData) : record.actionData) : undefined
      }));

      // Set up realtime subscription if not already done
      setupSubscription();
    } catch (err) {
      console.error("Failed to load notifications from PocketBase:", err);
    }
  };

  const setupSubscription = async () => {
    if (isSubscribed || !pb.authStore.isValid) return;

    try {
      await pb.collection('notifications').subscribe('*', (e) => {
        if (e.action === 'create') {
          // Add new notification to the top if it's for this user
          if (e.record.user === pb.authStore.model?.id) {
            const newItem: NotificationItem = {
              id: e.record.id,
              title: e.record.title,
              description: e.record.description,
              time: new Date(e.record.created).getTime(),
              isRead: e.record.isRead,
              type: e.record.type as NotificationType,
              actionData: e.record.actionData ? (typeof e.record.actionData === 'string' ? JSON.parse(e.record.actionData) : e.record.actionData) : undefined
            };
            internalNotifications = [newItem, ...internalNotifications];

            // Trigger Sonner Toast
            const toastOptions = {
              description: newItem.description,
              action: newItem.actionData ? {
                label: newItem.actionData.label,
                onClick: () => window.location.href = newItem.actionData!.url
              } : undefined
            };

            if (newItem.type === 'success') toast.success(newItem.title, toastOptions);
            else if (newItem.type === 'alert') toast.error(newItem.title, toastOptions);
            else toast.info(newItem.title, toastOptions);
          }
        } else if (e.action === 'update') {
          internalNotifications = internalNotifications.map(n => 
            n.id === e.record.id ? { 
              ...n, 
              isRead: e.record.isRead,
              title: e.record.title,
              description: e.record.description,
              type: e.record.type as NotificationType
            } : n
          );
        } else if (e.action === 'delete') {
          internalNotifications = internalNotifications.filter(n => n.id !== e.record.id);
        }
      });
      isSubscribed = true;
    } catch (err) {
      console.error("Failed to subscribe to notifications:", err);
    }
  };

  const addNotification = async (
    notification: Omit<NotificationItem, "id" | "isRead" | "time">,
  ) => {
    if (!browser || !pb.authStore.isValid) return;

    try {
      await pb.collection('notifications').create({
        user: pb.authStore.model?.id,
        title: notification.title,
        description: notification.description,
        type: notification.type,
        isRead: false,
        actionData: notification.actionData
      });
      // Realtime subscription will handle updating the UI and showing toast
    } catch (err) {
      console.error("Failed to create notification:", err);
      toast.error("Error", { description: "Failed to create notification" });
    }
  };

  const markAsRead = async (id: string) => {
    // Optimistic UI
    internalNotifications = internalNotifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    );

    if (browser) {
      try {
        await pb.collection('notifications').update(id, { isRead: true });
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
  };

  const markAllAsRead = async () => {
    internalNotifications = internalNotifications.map((n) => ({
      ...n,
      isRead: true,
    }));

    if (browser && pb.authStore.isValid) {
      try {
        const unread = internalNotifications.filter(n => !n.isRead);
        await Promise.all(unread.map(n => pb.collection('notifications').update(n.id, { isRead: true })));
      } catch (err) {
        console.error("Failed to mark all notifications as read:", err);
      }
    }
  };

  const unsubscribe = () => {
    if (isSubscribed) {
      pb.collection('notifications').unsubscribe('*');
      isSubscribed = false;
    }
  };

  return {
    get notifications() {
      return internalNotifications;
    },
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    unsubscribe
  };
}

export const notificationStore = createNotificationStore();

export const notify = {
  toast: (title: string, description?: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if (type === 'success') toast.success(title, { description });
    else if (type === 'error') toast.error(title, { description });
    else if (type === 'warning') toast.warning(title, { description });
    else toast.info(title, { description });
  },
  share: (
    title: string,
    description: string,
    actionData?: { label: string; url: string },
  ) => {
    notificationStore.addNotification({
      title,
      description,
      type: "share",
      actionData,
    });
  },
  alert: (
    title: string,
    description: string,
    actionData?: { label: string; url: string },
  ) => {
    notificationStore.addNotification({
      title,
      description,
      type: "alert",
      actionData,
    });
  },
  info: (
    title: string,
    description: string,
    actionData?: { label: string; url: string },
  ) => {
    notificationStore.addNotification({
      title,
      description,
      type: "info",
      actionData,
    });
  },
  success: (
    title: string,
    description: string,
    actionData?: { label: string; url: string },
  ) => {
    notificationStore.addNotification({
      title,
      description,
      type: "success",
      actionData,
    });
  },
};
