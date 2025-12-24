/**
 * Real-time API Integration Utility
 * Provides WebSocket and polling-based real-time data updates
 */

type EventCallback = (data: any) => void;

interface RealtimeAPIConfig {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  pollingInterval?: number;
}

class RealtimeAPI {
  private ws: WebSocket | null = null;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private config: Required<RealtimeAPIConfig>;
  private pollingIntervals: Map<string, number> = new Map();

  constructor(config: RealtimeAPIConfig = {}) {
    this.config = {
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      pollingInterval: config.pollingInterval || 30000,
    };
  }

  /**
   * Connect to WebSocket endpoint for real-time updates
   */
  connectWebSocket(url: string): void {
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', { timestamp: Date.now() });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type || 'message', data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { error, timestamp: Date.now() });
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected', { timestamp: Date.now() });
        this.attemptReconnect(url);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.emit('error', { error, timestamp: Date.now() });
    }
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connectWebSocket(url);
      }, this.config.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed', { attempts: this.reconnectAttempts });
    }
  }

  /**
   * Send data through WebSocket
   */
  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
      this.emit('error', { error: 'WebSocket not connected', timestamp: Date.now() });
    }
  }

  /**
   * Start polling an API endpoint
   */
  startPolling(id: string, url: string, callback: EventCallback): void {
    this.stopPolling(id); // Clear any existing polling

    const poll = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        callback(data);
        this.emit(`poll_${id}`, data);
      } catch (error) {
        console.error(`Polling error for ${id}:`, error);
        this.emit('error', { error, id, timestamp: Date.now() });
      }
    };

    // Initial poll
    poll();

    // Set up interval
    const intervalId = window.setInterval(poll, this.config.pollingInterval);
    this.pollingIntervals.set(id, intervalId);
  }

  /**
   * Stop polling an API endpoint
   */
  stopPolling(id: string): void {
    const intervalId = this.pollingIntervals.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(id);
    }
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from events
   */
  off(event: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Emit events to subscribers
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Disconnect all connections
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Stop all polling
    this.pollingIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.pollingIntervals.clear();

    // Clear all listeners
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const realtimeAPI = new RealtimeAPI();

// Export class for custom instances
export default RealtimeAPI;

/**
 * Usage Example:
 * 
 * // WebSocket connection
 * realtimeAPI.connectWebSocket('wss://api.example.com/realtime');
 * 
 * // Listen for events
 * realtimeAPI.on('price_update', (data) => {
 *   console.log('Price updated:', data);
 * });
 * 
 * // Send data
 * realtimeAPI.send({ type: 'subscribe', channel: 'prices' });
 * 
 * // Start polling
 * realtimeAPI.startPolling('prices', 'https://api.example.com/prices', (data) => {
 *   console.log('Polled data:', data);
 * });
 * 
 * // Stop polling
 * realtimeAPI.stopPolling('prices');
 * 
 * // Disconnect
 * realtimeAPI.disconnect();
 */
