/**
 * WebSocket Server
 * Handles real-time communications for zone updates, alerts, and notifications
 * Install: npm install ws
 */

const WebSocket = require('ws');
const firebase = require('firebase-admin');

class WebSocketServer {
  constructor(port = 3001) {
    this.port = port;
    this.wss = null;
    this.clients = new Map(); // Map of userId -> WebSocket
    this.subscriptions = new Map(); // Map of userId -> [subscribed topics]
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');

      let userId = null;
      let userRole = null;

      // Handle authentication
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);

          if (message.type === 'authenticate') {
            userId = message.data.userId;
            userRole = message.data.userRole;

            // Store connection
            this.clients.set(userId, ws);
            this.subscriptions.set(userId, ['general']);

            console.log(`[WS] Authenticated: ${userId} (${userRole})`);

            // Send confirmation
            this.send(ws, 'authenticated', { success: true, userId, userRole });
          } else if (userId) {
            // Handle other messages after authentication
            this.handleMessage(userId, userRole, message);
          }
        } catch (error) {
          console.error('[WS] Error parsing message:', error);
        }
      });

      ws.on('close', () => {
        if (userId) {
          this.clients.delete(userId);
          this.subscriptions.delete(userId);
          console.log(`[WS] User disconnected: ${userId}`);
        }
      });

      ws.on('error', (error) => {
        console.error('[WS] Error:', error);
      });
    });

    console.log(`[WS] Server listening on port ${this.port}`);
  }

  /**
   * Handle incoming messages from clients
   */
  handleMessage(userId, userRole, message) {
    const { type, data } = message;

    switch (type) {
      case 'zone:request_update':
        this.handleZoneUpdateRequest(userId, data);
        break;

      case 'disease:reported':
        this.handleDiseaseReport(userId, userRole, data);
        break;

      case 'data:verified':
        this.handleDataVerification(userId, userRole, data);
        break;

      case 'subscribe':
        this.handleSubscription(userId, data.topic);
        break;

      case 'unsubscribe':
        this.handleUnsubscription(userId, data.topic);
        break;

      case 'ping':
        this.send(this.clients.get(userId), 'pong', { timestamp: Date.now() });
        break;

      default:
        console.log(`[WS] Unknown message type: ${type}`);
    }
  }

  /**
   * Handle zone update request
   */
  async handleZoneUpdateRequest(userId, data) {
    try {
      const db = firebase.firestore();
      const hospitalRef = db.collection('hospitals').doc(data.hospitalId);
      const hospital = await hospitalRef.get();

      if (hospital.exists) {
        this.send(
          this.clients.get(userId),
          'zone:updated',
          hospital.data().zoneStatus
        );
      }
    } catch (error) {
      console.error('[WS] Error fetching zone:', error);
    }
  }

  /**
   * Handle disease report (hospital user reports new cases)
   */
  async handleDiseaseReport(userId, userRole, data) {
    try {
      if (userRole !== 'hospital') {
        console.warn(`[WS] Unauthorized disease report from ${userId}`);
        return;
      }

      const db = firebase.firestore();

      // Store disease record
      const reportRef = await db.collection('diseaseRecords').add({
        hospitalId: data.hospitalId,
        diseaseId: data.diseaseId,
        newCases: data.newCases,
        recoveredCases: data.recoveredCases,
        fatalCases: data.fatalCases,
        reportedAt: new Date(),
        reportedBy: userId,
        verificationStatus: 'pending',
        dataQualityScore: 85, // Calculate based on data completeness
      });

      // Notify authorities to verify
      this.broadcast('data:verification_request', {
        recordId: reportRef.id,
        hospitalId: data.hospitalId,
        diseaseId: data.diseaseId,
        cases: data.newCases,
      }, null, ['authority']);

      console.log(`[WS] Disease report stored: ${reportRef.id}`);
    } catch (error) {
      console.error('[WS] Error handling disease report:', error);
    }
  }

  /**
   * Handle data verification (authority approves/rejects)
   */
  async handleDataVerification(userId, userRole, data) {
    try {
      if (userRole !== 'authority') {
        console.warn(`[WS] Unauthorized verification from ${userId}`);
        return;
      }

      const db = firebase.firestore();
      const recordRef = db.collection('diseaseRecords').doc(data.recordId);

      // Update record
      await recordRef.update({
        verificationStatus: data.status,
        verifiedBy: userId,
        verifiedAt: new Date(),
      });

      // Notify hospital
      const record = await recordRef.get();
      this.notifyByHospital(
        record.data().hospitalId,
        'data:verified',
        { recordId: data.recordId, status: data.status }
      );

      console.log(`[WS] Data verified: ${data.recordId} -> ${data.status}`);
    } catch (error) {
      console.error('[WS] Error handling verification:', error);
    }
  }

  /**
   * Handle subscription to topics
   */
  handleSubscription(userId, topic) {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, []);
    }

    const topics = this.subscriptions.get(userId);
    if (!topics.includes(topic)) {
      topics.push(topic);
      console.log(`[WS] ${userId} subscribed to ${topic}`);
    }
  }

  /**
   * Handle unsubscription from topics
   */
  handleUnsubscription(userId, topic) {
    const topics = this.subscriptions.get(userId) || [];
    this.subscriptions.set(
      userId,
      topics.filter((t) => t !== topic)
    );
    console.log(`[WS] ${userId} unsubscribed from ${topic}`);
  }

  /**
   * Send message to specific WebSocket
   */
  send(ws, type, data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString(),
      });

      ws.send(message, (error) => {
        if (error) {
          console.error('[WS] Error sending message:', error);
        }
      });
    }
  }

  /**
   * Send to all connected users
   */
  broadcast(type, data, excludeUserId = null, roles = null) {
    let count = 0;

    for (const [userId, ws] of this.clients.entries()) {
      if (excludeUserId === userId) continue;

      // If roles specified, only send to those roles (would need to track roles separately)
      // For now, send to all
      this.send(ws, type, data);
      count++;
    }

    console.log(`[WS] Broadcast ${type} to ${count} clients`);
  }

  /**
   * Send to specific hospital users
   */
  notifyByHospital(hospitalId, type, data) {
    // In real implementation, you'd track which users belong to which hospital
    // For now, this is a placeholder
    console.log(`[WS] Notifying hospital ${hospitalId}: ${type}`);
  }

  /**
   * Send zone update to all connected clients
   */
  broadcastZoneUpdate(hospitalId, zoneData) {
    this.broadcast('zone:updated', {
      hospitalId,
      ...zoneData,
    });
  }

  /**
   * Broadcast zone color change alert
   */
  broadcastZoneColorChange(hospitalName, previousColor, newColor, reason) {
    this.broadcast('zone:colorChanged', {
      hospitalName,
      previousColor,
      newColor,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast new alert
   */
  broadcastAlert(alert) {
    this.broadcast('alert:new', alert);
  }

  /**
   * Get server stats
   */
  getStats() {
    return {
      connectedClients: this.clients.size,
      totalSubscriptions: Array.from(this.subscriptions.values()).reduce(
        (sum, topics) => sum + topics.length,
        0
      ),
      activeTopics: Array.from(
        new Set(Array.from(this.subscriptions.values()).flat())
      ),
    };
  }
}

// Export singleton
const wsServer = new WebSocketServer(process.env.WS_PORT || 3001);

module.exports = wsServer;
