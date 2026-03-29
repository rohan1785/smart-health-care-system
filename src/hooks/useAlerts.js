/**
 * useAlerts Hook
 * Manages health alerts and notifications
 */

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getActiveAlerts, markAlertAsRead } from '../services/zoneService';

function useAlerts(hospitalId = null, userId = null, hoursBack = 24) {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to alerts with real-time updates
  useEffect(() => {
    let unsubscribe;

    try {
      setLoading(true);
      setError(null);

      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

      let q;
      if (hospitalId) {
        q = query(
          collection(db, 'alerts'),
          where('hospitalId', '==', hospitalId),
          where('sentAt', '>=', cutoffTime),
          orderBy('sentAt', 'desc'),
          limit(50)
        );
      } else {
        q = query(
          collection(db, 'alerts'),
          where('sentAt', '>=', cutoffTime),
          orderBy('sentAt', 'desc'),
          limit(100)
        );
      }

      unsubscribe = onSnapshot(q, (snapshot) => {
        const alertsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAlerts(alertsData);

        // Calculate unread count
        if (userId) {
          const unread = alertsData.filter(
            (a) => !a.readBy || !a.readBy.includes(userId)
          ).length;
          setUnreadCount(unread);
        }

        setLoading(false);
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('Error setting up alerts listener:', err);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [hospitalId, hoursBack, userId]);

  // Mark alert as read
  const handleMarkAsRead = useCallback(
    async (alertId) => {
      if (!userId) return;
      try {
        await markAlertAsRead(alertId, userId);
        // Update local state
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? {
                ...alert,
                readBy: [...(alert.readBy || []), userId],
              }
              : alert
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking alert as read:', err);
      }
    },
    [userId]
  );

  // Mark all alerts as read
  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      const unreadAlerts = alerts.filter(
        (a) => !a.readBy || !a.readBy.includes(userId)
      );
      await Promise.all(
        unreadAlerts.map((alert) => markAlertAsRead(alert.id, userId))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
    }
  }, [alerts, userId]);

  // Get critical alerts
  const getCriticalAlerts = useCallback(() => {
    return alerts.filter((a) => a.severity === 'high');
  }, [alerts]);

  // Get unread alerts
  const getUnreadAlerts = useCallback(() => {
    if (!userId) return alerts;
    return alerts.filter((a) => !a.readBy || !a.readBy.includes(userId));
  }, [alerts, userId]);

  // Show browser notification
  const showNotification = useCallback((alert) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(alert.type === 'zone_change' ? '⚠️ Zone Update' : '🔔 Alert', {
        body: alert.message,
        icon: '/alert-icon.png',
        tag: alert.id,
        requireInteraction: alert.severity === 'high',
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('🔔 Alert', {
            body: alert.message,
            icon: '/alert-icon.png',
          });
        }
      });
    }
  }, []);

  // Request notification permissions
  const requestNotificationPermission = useCallback(() => {
    if (!('Notification' in window)) {
      setError('Notifications not supported');
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    });
  }, []);

  return {
    alerts,
    unreadCount,
    loading,
    error,
    handleMarkAsRead,
    handleMarkAllAsRead,
    getCriticalAlerts,
    getUnreadAlerts,
    showNotification,
    requestNotificationPermission,
  };
}

export default useAlerts;
