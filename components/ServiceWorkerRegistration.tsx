"use client";

import { useEffect } from "react";
import { savePendingChange, syncPendingChanges } from "@/lib/offline-sync";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      // Registrar el service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado:", registration.scope);

          // Escuchar mensajes del service worker
          navigator.serviceWorker.addEventListener("message", async (event) => {
            if (event.data.type === "SAVE_PENDING_CHANGE") {
              await savePendingChange({
                type: event.data.data.method,
                url: event.data.data.url,
                body: event.data.data.body,
                timestamp: Date.now(),
              });
            } else if (event.data.type === "SYNC_PENDING_CHANGES") {
              await syncPendingChanges();
            }
          });

          // Verificar actualizaciones periódicamente
          setInterval(() => {
            registration.update();
          }, 60000); // Cada minuto

          // Manejar actualizaciones del service worker
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // Hay una nueva versión disponible
                  if (
                    window.confirm(
                      "Hay una nueva versión disponible. ¿Deseas recargar la página?"
                    )
                  ) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Error registrando Service Worker:", error);
        });

      // Manejar cuando el service worker toma control
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      // Sincronizar cuando vuelve la conexión
      window.addEventListener("online", () => {
        syncPendingChanges();
      });

      // Sincronizar al cargar si hay conexión
      if (navigator.onLine) {
        syncPendingChanges();
      }
    }
  }, []);

  return null;
}

