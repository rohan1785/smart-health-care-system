/**
 * SMS Alerting Service
 * Handles SMS notifications via Twilio or AWS SNS
 * This is a client-side wrapper that calls backend APIs
 */

class SMSAlertService {
  constructor(apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api') {
    this.apiBaseUrl = apiBaseUrl;
    this.provider = process.env.REACT_APP_SMS_PROVIDER || 'twilio'; // 'twilio' or 'sns'
  }

  /**
   * Send SMS via SMS provider (Twilio/AWS SNS)
   */
  async sendSMS(phoneNumber, message) {
    try {
      const payload = {
        phoneNumber,
        message,
        provider: this.provider,
      };

      const response = await fetch(`${this.apiBaseUrl}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`SMS failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * Send bulk SMS to multiple recipients
   */
  async sendBulkSMS(phoneNumbers, message) {
    try {
      const payload = {
        phoneNumbers,
        message,
        provider: this.provider,
      };

      const response = await fetch(`${this.apiBaseUrl}/sms/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Bulk SMS failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      throw error;
    }
  }

  /**
   * Send zone alert SMS to affected area citizens
   */
  async sendZoneAlert(hospitalName, zoneColor, zoneReason, affectedCity) {
    const riskLevel = zoneColor === 'RED' ? 'HIGH RISK' : zoneColor === 'YELLOW' ? 'MEDIUM RISK' : 'LOW RISK';

    const message = `🏥 HEALTH ALERT: ${hospitalName} is now in ${riskLevel} zone. ${zoneReason}. Stay safe and follow precautions.`;

    try {
      const payload = {
        hospitalName,
        affectedCity,
        message,
        alertType: 'zone_change',
        severity: zoneColor === 'RED' ? 'critical' : 'warning',
      };

      const response = await fetch(`${this.apiBaseUrl}/sms/send-zone-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Zone alert SMS failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending zone alert:', error);
      throw error;
    }
  }

  /**
   * Send hospital update notification
   */
  async sendHospitalUpdate(phoneNumber, hospitalName, updateType, details) {
    // updateType: 'disease_update' | 'bed_shortage' | 'occupancy_high' | 'data_anomaly'
    const messages = {
      disease_update: `${hospitalName} reported new disease cases: ${details.cases} cases of ${details.disease}`,
      bed_shortage: `⚠️ BED ALERT: ${hospitalName} has only ${details.availableBeds} beds available (Occupancy: ${details.occupancy}%)`,
      occupancy_high: `${hospitalName} occupancy is now ${details.occupancy}% (HIGH)`,
      data_anomaly: `🚨 DATA ALERT: ${hospitalName} reported unusual data (${details.message}). Please verify.`,
    };

    const message = messages[updateType] || `Update from ${hospitalName}`;
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Get SMS delivery status
   */
  async getDeliveryStatus(messageId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sms/status/${messageId}`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get SMS status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting SMS status:', error);
      throw error;
    }
  }

  /**
   * Get SMS history for authority
   */
  async getSMSHistory(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${this.apiBaseUrl}/sms/history?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch SMS history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching SMS history:', error);
      throw error;
    }
  }

  /**
   * Get SMS cost estimate
   */
  async estimateCost(phoneNumberCount, messageLength) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sms/estimate-cost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          phoneNumberCount,
          messageLength,
          provider: this.provider,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to estimate cost');
      }

      return await response.json();
    } catch (error) {
      console.error('Error estimating cost:', error);
      throw error;
    }
  }

  /**
   * Helper to get auth token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Set SMS provider
   */
  setProvider(provider) {
    if (!['twilio', 'sns'].includes(provider)) {
      throw new Error('Invalid SMS provider. Use "twilio" or "sns"');
    }
    this.provider = provider;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber) {
    // Simple validation: should have at least 10 digits
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phoneNumber) {
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // If doesn't start with country code, assume India (+91)
    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    }
    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      return `+${digitsOnly}`;
    }
    if (digitsOnly.startsWith('+')) {
      return digitsOnly;
    }

    return `+${digitsOnly}`;
  }
}

const smsService = new SMSAlertService();

export default smsService;
