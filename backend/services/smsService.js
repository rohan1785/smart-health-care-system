/**
 * SMS Service Backend
 * Handles SMS sending via Twilio or AWS SNS
 * Install: npm install twilio aws-sdk
 */

const twilio = require('twilio');
const AWS = require('aws-sdk');
const firebase = require('firebase-admin');

class SMSServiceBackend {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'twilio';
    this.initializeProviders();
  }

  /**
   * Initialize SMS providers (Twilio and AWS SNS)
   */
  initializeProviders() {
    // Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    }

    // AWS SNS
    if (process.env.AWS_ACCESS_KEY_ID) {
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      });
      this.snsClient = new AWS.SNS();
    }

    console.log(`[SMS] Provider: ${this.provider}`);
  }

  /**
   * Send SMS via configured provider
   */
  async sendSMS(phoneNumber, message, metadata = {}) {
    try {
      if (this.provider === 'twilio') {
        return await this.sendViaTwilio(phoneNumber, message, metadata);
      } else if (this.provider === 'sns') {
        return await this.sendViaSNS(phoneNumber, message, metadata);
      } else {
        throw new Error(`Unknown SMS provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('[SMS] Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * Send SMS via Twilio
   */
  async sendViaTwilio(phoneNumber, message, metadata) {
    try {
      const msg = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: phoneNumber,
      });

      // Log to database
      await this.logSMSRecord({
        provider: 'twilio',
        recipientPhone: phoneNumber,
        message,
        messageId: msg.sid,
        status: msg.status,
        sentAt: new Date(),
        metadata,
      });

      console.log(`[SMS-Twilio] Sent to ${phoneNumber}: ${msg.sid}`);

      return {
        success: true,
        messageId: msg.sid,
        status: msg.status,
        provider: 'twilio',
      };
    } catch (error) {
      console.error('[SMS-Twilio] Error:', error);
      throw error;
    }
  }

  /**
   * Send SMS via AWS SNS
   */
  async sendViaSNS(phoneNumber, message, metadata) {
    try {
      // Format phone number for SNS
      const formattedPhone = this.formatPhoneForSNS(phoneNumber);

      const params = {
        Message: message,
        PhoneNumber: formattedPhone,
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'ArogyaAlert',
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      };

      const result = await this.snsClient.publish(params).promise();

      // Log to database
      await this.logSMSRecord({
        provider: 'sns',
        recipientPhone: phoneNumber,
        message,
        messageId: result.MessageId,
        status: 'sent',
        sentAt: new Date(),
        metadata,
      });

      console.log(`[SMS-SNS] Sent to ${phoneNumber}: ${result.MessageId}`);

      return {
        success: true,
        messageId: result.MessageId,
        status: 'sent',
        provider: 'sns',
      };
    } catch (error) {
      console.error('[SMS-SNS] Error:', error);
      throw error;
    }
  }

  /**
   * Send bulk SMS to multiple recipients
   */
  async sendBulkSMS(phoneNumbers, message, metadata = {}) {
    console.log(`[SMS] Sending bulk SMS to ${phoneNumbers.length} recipients`);

    const results = {
      successful: [],
      failed: [],
      totalAttempted: phoneNumbers.length,
    };

    // Process in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      const batch = phoneNumbers.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map((phone) => this.sendSMS(phone, message, metadata))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.successful.push({
            phone: batch[index],
            messageId: result.value.messageId,
          });
        } else {
          results.failed.push({
            phone: batch[index],
            error: result.reason.message,
          });
        }
      });

      // Small delay between batches
      if (i + batchSize < phoneNumbers.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(
      `[SMS] Bulk SMS complete: ${results.successful.length} sent, ${results.failed.length} failed`
    );

    return results;
  }

  /**
   * Send zone alert SMS to affected area citizens
   * This would be implemented to query a list of citizen phone numbers in the affected area
   */
  async sendZoneAlert(hospitalName, zoneColor, affectedCity, recipients) {
    const riskLevel = zoneColor === 'RED' ? 'HIGH RISK' : 'MEDIUM RISK';
    const message = `🏥 HEALTH ALERT: ${hospitalName} is now in ${riskLevel} zone. Stay safe and follow precautions.`;

    // Log alert
    const db = firebase.firestore();
    const alertRef = await db.collection('smsAlerts').add({
      type: 'zone_alert',
      hospitalName,
      affectedCity,
      zoneColor,
      message,
      recipientCount: recipients.length,
      sentAt: new Date(),
      status: 'sending',
    });

    // Send to recipients
    const result = await this.sendBulkSMS(recipients, message, {
      alertType: 'zone_change',
      hospitalName,
      affectedCity,
      alertId: alertRef.id,
    });

    // Update alert status
    await alertRef.update({
      status: 'sent',
      sentCount: result.successful.length,
      failedCount: result.failed.length,
      completedAt: new Date(),
    });

    return result;
  }

  /**
   * Send hospital update notification
   */
  async sendHospitalNotification(phoneNumber, hospitalName, updateType, details) {
    const messages = {
      disease_update: `📊 ${hospitalName} reported ${details.cases} new cases of ${details.disease}`,
      bed_shortage: `⚠️ BED ALERT: ${hospitalName} has critical bed shortage (${details.availableBeds} beds available)`,
      occupancy_high: `📈 HIGH OCCUPANCY: ${hospitalName} is at ${details.occupancy}% capacity`,
      data_anomaly: `🚨 ALERT: ${hospitalName} reported unusual data. Please verify.`,
    };

    const message = messages[updateType] || `Update from ${hospitalName}`;
    return this.sendSMS(phoneNumber, message, { updateType, ...details });
  }

  /**
   * Format phone number for AWS SNS
   */
  formatPhoneForSNS(phoneNumber) {
    // SNS expects format: +[country code][number]
    let formatted = phoneNumber.replace(/\D/g, '');

    if (formatted.length === 10) {
      // Assume India
      formatted = `+91${formatted}`;
    } else if (formatted.length === 12 && formatted.startsWith('91')) {
      formatted = `+${formatted}`;
    } else if (!formatted.startsWith('+')) {
      formatted = `+${formatted}`;
    }

    return formatted;
  }

  /**
   * Log SMS record to Firebase
   */
  async logSMSRecord(record) {
    try {
      const db = firebase.firestore();
      await db.collection('smsRecords').add(record);
    } catch (error) {
      console.error('[SMS] Error logging record:', error);
    }
  }

  /**
   * Get SMS delivery status (Twilio only)
   */
  async getDeliveryStatus(messageId, provider = this.provider) {
    try {
      if (provider === 'twilio') {
        const message = await this.twilioClient.messages(messageId).fetch();
        return {
          messageId: message.sid,
          status: message.status,
          provider: 'twilio',
        };
      } else if (provider === 'sns') {
        // SNS doesn't provide detailed status without additional configuration
        const db = firebase.firestore();
        const record = await db
          .collection('smsRecords')
          .where('messageId', '==', messageId)
          .limit(1)
          .get();

        if (!record.empty) {
          return record.docs[0].data();
        }
        return null;
      }
    } catch (error) {
      console.error('[SMS] Error getting status:', error);
      throw error;
    }
  }

  /**
   * Get SMS history
   */
  async getSMSHistory(filters = {}) {
    try {
      const db = firebase.firestore();
      let query = db.collection('smsRecords');

      if (filters.startDate) {
        query = query.where('sentAt', '>=', filters.startDate);
      }
      if (filters.endDate) {
        query = query.where('sentAt', '<=', filters.endDate);
      }
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      const snapshot = await query.orderBy('sentAt', 'desc').limit(100).get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[SMS] Error fetching history:', error);
      throw error;
    }
  }

  /**
   * Estimate SMS cost
   */
  async estimateCost(phoneNumberCount, messageLength) {
    // These are approximate costs (as of 2024)
    const costPerSMS =
      this.provider === 'twilio' ? 0.0075 : 0.00645; // Per SMS

    const segments = Math.ceil(messageLength / 160); // SMS segments
    const totalCost = phoneNumberCount * segments * costPerSMS;

    return {
      provider: this.provider,
      phoneNumberCount,
      messageLength,
      segments,
      costPerSMS,
      estimatedTotalCost: totalCost.toFixed(2),
      currency: 'USD',
    };
  }

  /**
   * Get SMS service stats
   */
  async getStats() {
    try {
      const db = firebase.firestore();

      const totalRecords = await db.collection('smsRecords').get();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayRecords = await db
        .collection('smsRecords')
        .where('sentAt', '>=', today)
        .get();

      return {
        provider: this.provider,
        totalSMSSent: totalRecords.size,
        smsTodayCount: todayRecords.size,
      };
    } catch (error) {
      console.error('[SMS] Error getting stats:', error);
      return {};
    }
  }
}

// Export singleton
const smsServiceBackend = new SMSServiceBackend();

module.exports = smsServiceBackend;
