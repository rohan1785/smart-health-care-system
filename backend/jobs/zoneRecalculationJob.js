/**
 * Zone Recalculation Cron Job
 * Runs daily at 00:00 UTC to recalculate all hospital zones
 * Can also be triggered manually via API
 */

const cron = require('node-cron');
const firebase = require('firebase-admin');
const { classifyZoneLogic } = require('../utils/zoneCalculator');

class ZoneRecalculationJob {
  constructor() {
    this.jobName = 'dailyZoneRecalculation';
    this.cronExpression = '0 0 * * *'; // 00:00 UTC daily
    this.isRunning = false;
    this.lastRun = null;
  }

  /**
   * Initialize the cron job
   */
  initialize() {
    console.log(`[${this.jobName}] Initializing...`);

    // Schedule the job
    cron.schedule(this.cronExpression, async () => {
      console.log(`[${this.jobName}] Triggered at ${new Date().toISOString()}`);
      await this.execute();
    });

    console.log(`[${this.jobName}] Scheduled to run daily at 00:00 UTC`);
  }

  /**
   * Execute the zone recalculation
   */
  async execute() {
    if (this.isRunning) {
      console.warn(`[${this.jobName}] Already running, skipping...`);
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log(`[${this.jobName}] Starting zone recalculation...`);

      // Fetch all hospitals
      const db = firebase.firestore();
      const hospitalsRef = db.collection('hospitals');
      const hospitalsSnapshot = await hospitalsRef.get();

      if (hospitalsSnapshot.empty) {
        console.log(`[${this.jobName}] No hospitals found`);
        return;
      }

      let updated = 0;
      let changed = 0;
      const changes = [];

      // Process each hospital
      for (const docSnapshot of hospitalsSnapshot.docs) {
        const hospital = docSnapshot.data();
        const oldZone = hospital.zoneStatus?.color;

        // Calculate new zone
        const newZone = classifyZoneLogic({
          dengueCases: hospital.dengueCases || 0,
          fluCases: hospital.fluCases || 0,
          totalBeds: hospital.totalBeds,
          availableBeds: hospital.availableBeds || 0,
          occupancyRate: hospital.occupancyRate || 0,
          customDiseases: hospital.customDiseases || [],
          region: hospital.region || 'urban',
        }, 'normal'); // Can adjust season dynamically

        // Update hospital document
        await docSnapshot.ref.update({
          zoneStatus: {
            ...newZone,
            affectedArea: {
              type: 'circle',
              radius: calculateZoneRadius(newZone.riskScore, hospital.totalBeds || 100),
              coordinates: [hospital.latitude, hospital.longitude],
            },
            lastCalculated: new Date(),
          },
        });

        updated++;

        // Track zone changes
        if (oldZone !== newZone.color) {
          changed++;
          changes.push({
            hospitalId: docSnapshot.id,
            hospitalName: hospital.name,
            from: oldZone,
            to: newZone.color,
            reason: newZone.reason,
            riskScore: newZone.riskScore,
          });

          // Record in zone history
          await db.collection('zoneHistory').add({
            hospitalId: docSnapshot.id,
            hospitalName: hospital.name,
            previousColor: oldZone,
            currentColor: newZone.color,
            trigger: 'daily_recalculation',
            changedAt: new Date(),
            changedBy: 'system',
            riskScore: newZone.riskScore,
            reason: newZone.reason,
          });

          // If zone changed to RED, generate alert
          if (newZone.color === 'RED') {
            await generateZoneAlert(
              docSnapshot.id,
              hospital.name,
              oldZone,
              'RED',
              newZone.reason,
              hospital.city
            );
          }
        }
      }

      // Log summary
      const duration = Date.now() - startTime;
      const summary = {
        timestamp: new Date().toISOString(),
        jobName: this.jobName,
        status: 'success',
        duration: `${duration}ms`,
        processed: updated,
        changed,
        changes: changes,
      };

      console.log(`[${this.jobName}] Complete: Processed ${updated} hospitals, ${changed} zone changes in ${duration}ms`);

      if (changed > 0) {
        console.log(`[${this.jobName}] Zone changes:`, JSON.stringify(changes, null, 2));
      }

      // Store job execution record
      await firebase.firestore().collection('jobExecutionLogs').add(summary);

      this.lastRun = new Date();
    } catch (error) {
      console.error(`[${this.jobName}] Failed:`, error);

      // Log error
      await firebase.firestore().collection('jobExecutionLogs').add({
        timestamp: new Date().toISOString(),
        jobName: this.jobName,
        status: 'failed',
        error: error.message,
        stack: error.stack,
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Trigger job manually (for testing or immediate updates)
   */
  async executeManually() {
    console.log(`[${this.jobName}] Manual execution triggered`);
    return this.execute();
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      jobName: this.jobName,
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      cronExpression: this.cronExpression,
    };
  }
}

/**
 * Helper: Calculate zone radius based on risk score and hospital size
 */
function calculateZoneRadius(riskScore, hospitalBeds) {
  const baseRadius = 1500 + (riskScore / 100) * 1500; // 1.5km to 3km
  const sizeAdjustment = (hospitalBeds / 100) * 500; // Scale with hospital size
  return Math.round(baseRadius + sizeAdjustment);
}

/**
 * Helper: Generate zone alert when zone changes to RED
 */
async function generateZoneAlert(hospitalId, hospitalName, previousColor, currentColor, reason, city) {
  try {
    const db = firebase.firestore();

    const alert = {
      hospitalId,
      type: 'zone_change',
      severity: 'high',
      message: `${hospitalName} is now in HIGH RISK zone. ${reason}`,
      targetAudience: ['citizens', 'authorities'],
      sentAt: new Date(),
      readBy: [],
      city,
      previousZone: previousColor,
      currentZone: currentColor,
    };

    const docRef = await db.collection('alerts').add(alert);
    console.log(`[ZoneAlert] Created alert: ${docRef.id}`);

    // Trigger SMS notification (via WebSocket or background task)
    // This would be handled by a separate SMS service
    return docRef.id;
  } catch (error) {
    console.error('[ZoneAlert] Failed to create alert:', error);
  }
}

// Export singleton
const zoneRecalculationJob = new ZoneRecalculationJob();

module.exports = zoneRecalculationJob;
