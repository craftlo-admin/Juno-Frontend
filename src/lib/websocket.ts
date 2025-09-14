import { io, Socket } from 'socket.io-client';

class WSClient {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;

  connect(token?: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
      const url = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;

      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.info('[WebSocket] Connected successfully');
        this.reconnectAttempts = 0;
      };

      this.socket.onclose = (event) => {
        console.info('[WebSocket] Connection closed', event.code, event.reason);
        this.handleReconnect(token);
      };

      this.socket.onerror = (error) => {
        console.warn('[WebSocket] Connection error:', error);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.debug('[WebSocket] Message received:', data);
          // Handle incoming messages here
        } catch (error) {
          console.warn('[WebSocket] Failed to parse message:', event.data);
        }
      };
    } catch (error) {
      console.warn('[WebSocket] Failed to connect:', error);
      this.socket = null;
    }
  }

  private handleReconnect(token?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.info(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(token);
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.warn('[WebSocket] Max reconnection attempts reached');
    }
  }

  disconnect() {
    try {
      if (this.socket) {
        this.socket.close();
      }
    } catch (error) {
      console.warn('[WebSocket] Error during disconnect:', error);
    } finally {
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(data));
      } catch (error) {
        console.warn('[WebSocket] Failed to send message:', error);
      }
    } else {
      console.warn('[WebSocket] Cannot send message - connection not open');
    }
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WSClient();
export default wsClient;
