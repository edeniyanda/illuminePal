// Cross-platform Notification Helper (Tauri Native + Web Browser Fallback)

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // Check Tauri Notification API
    if (typeof window !== "undefined" && (window as unknown as { __TAURI__?: unknown }).__TAURI__) {
      const { isPermissionGranted, requestPermission } = await import("@tauri-apps/api/notification");
      let granted = await isPermissionGranted();
      if (!granted) {
        const permission = await requestPermission();
        granted = permission === "granted";
      }
      return granted;
    }

    // Web Browser Fallback
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") return true;
      if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      }
    }
  } catch (e) {
    console.warn("Notification permission error:", e);
  }
  return false;
}

export async function sendNativeNotification(title: string, body: string) {
  try {
    // Check Tauri Native API
    if (typeof window !== "undefined" && (window as unknown as { __TAURI__?: unknown }).__TAURI__) {
      const { sendNotification, isPermissionGranted } = await import("@tauri-apps/api/notification");
      const granted = await isPermissionGranted();
      if (granted) {
        sendNotification({ title, body });
        return;
      }
    }

    // Web Notification Fallback
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
      });
    }
  } catch (e) {
    console.warn("Could not send native notification:", e);
  }
}
