import { useEffect, useRef } from "react";
import { queryClient } from "./queryClient";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Invalidate queries based on the message type
        if (data.type === "resource_update") {
          queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
        } else if (data.type === "territory_update") {
          queryClient.invalidateQueries({ queryKey: ["/api/territories"] });
        } else if (data.type === "structure_update") {
          queryClient.invalidateQueries({ queryKey: ["/api/structures"] });
        } else if (data.type === "unit_update") {
          queryClient.invalidateQueries({ queryKey: ["/api/units"] });
        } else if (data.type === "event") {
          queryClient.invalidateQueries({ queryKey: ["/api/events"] });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
}
