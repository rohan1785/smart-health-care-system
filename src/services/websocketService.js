/**
 * WebSocket Service
 * Handles real-time communication with backend for zone updates, alerts, and notifications
 */

class WebSocketService {
  constructor(url = process.env.REACT_APP_WS_URL || 'ws://localhost:3001') {
    this.url = url;
    this.socket = null;
    this.listeners = {};
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1s, increase exponentially
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId, userRole) {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;

          // Authenticate with server
          this.send('authenticate', { userId, userRole });
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };

        this.socket.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.attemptReconnect(userId, userRole);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  handleMessage(message) {
    const { type, data, timestamp } = message;

    // Execute all listeners for this message type
    if (this.listeners[type]) {
      this.listeners[type].forEach((callback) => {
        try {
          callback(data, timestamp);
        } catch (error) {
          console.error(`Error in listener for ${type}:`, error);
        }
      });
    }

    // Always notify generic listeners
    if (this.listeners['*']) {
      this.listeners['*'].forEach((callback) => {
        try {
          callback({ type, data, timestamp });
        } catch (error) {
          console.error('Error in generic listener:', error);
        }
      });
    }
  }

  /**
   * Send message to server
   */
  send(type, data) {
    if (!this.isConnected || !this.socket) {
      console.warn(`WebSocket not connected, cannot send ${type}`);
      return;
    }

    const message = {
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    try {
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  /**
   * Subscribe to event type
   */
  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[type] = this.listeners[type].filter((cb) => cb !== callback);
      if (this.listeners[type].length === 0) {
        delete this.listeners[type];
      }
    };
  }

  /**
   * Subscribe once (auto-unsubscribe after first event)
   */
  once(type, callback) {
    const unsubscribe = this.on(type, (data, timestamp) => {
      callback(data, timestamp);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Unsubscribe from event type
   */
  off(type, callback) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((cb) => cb !== callback);
  }

  /**
   * Request zone update from server
   */
  requestZoneUpdate(hospitalId) {
    this.send('zone:request_update', { hospitalId });
  }

  /**
   * Subscribe to zone updates
   */
  onZoneUpdate(callback) {
    return this.on('zone:updated', callback);
  }

  /**
   * Subscribe to alerts
   */
  onNewAlert(callback) {
    return this.on('alert:new', callback);
  }

  /**
   * Subscribe to zone color changes
   */
  onZoneColorChange(callback) {
    return this.on('zone:colorChanged', callback);
  }

  /**
   * Subscribe to data verification requests
   */
  onDataVerificationRequest(callback) {
    return this.on('data:verification_request', callback);
  }

  /**
   * Submit disease data with server notification
   */
  submitDiseaseData(hospitalId, data) {
    this.send('disease:reported', {
      hospitalId,
      ...data,
      submittedAt: new Date().toISOString(),
    });
  }

  /**
   * Notify server of data verification
   */
  verifyData(recordId, status, authorityId) {
    this.send('data:verified', {
      recordId,
      status, // 'verified' | 'rejected'
      authorityId,
      verifiedAt: new Date().toISOString(),
    });
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect(userId, userRole) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(userId, userRole).catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners = {};
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      url: this.url,
      listeners: Object.keys(this.listeners).length,
    };
  }
}

// Singleton instance
const wsService = new WebSocketService();

export default wsService;
