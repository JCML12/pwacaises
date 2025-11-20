"use client";

import { useEffect, useState } from "react";
import { getPendingChanges } from "@/lib/offline-sync";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const checkPendingChanges = async () => {
      try {
        const changes = await getPendingChanges();
        setPendingCount(changes.length);
      } catch (error) {
        console.error("Error checking pending changes:", error);
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();
    checkPendingChanges();

    // Verificar cambios pendientes periódicamente
    const interval = setInterval(checkPendingChanges, 5000);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2 flex items-center gap-2">
          <span className="text-sm font-medium">⚠️ Sin conexión</span>
        </div>
      )}
      {pendingCount > 0 && (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <span className="text-sm font-medium">
            {pendingCount} cambio{pendingCount > 1 ? "s" : ""} pendiente{pendingCount > 1 ? "s" : ""} de sincronizar
          </span>
        </div>
      )}
    </div>
  );
}

