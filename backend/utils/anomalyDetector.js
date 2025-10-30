const Reading = require('../models/Reading');

/**
 * Anomaly Detection Algorithm
 * Uses statistical thresholds and rule-based checks
 */
class AnomalyDetector {
  
  /**
   * Check if a reading is anomalous based on historical data
   * @param {Object} reading - Current reading data
   * @returns {Object} - { isAnomaly: boolean, reason: string }
   */
  static async detectAnomaly(reading) {
    const { voltage, current, power, temperature } = reading;
    const anomalyReasons = [];

    try {
      // Get historical data (last 100 readings for baseline)
      const historicalReadings = await Reading.find({ isAnomaly: false })
        .sort({ timestamp: -1 })
        .limit(100);

      if (historicalReadings.length < 10) {
        // Not enough data for statistical analysis, use basic rules
        return this.basicRuleCheck(reading);
      }

      // Calculate statistics
      const stats = this.calculateStatistics(historicalReadings);

      // Check 1: Power deviation (70% threshold)
      if (power < stats.avgPower * 0.7) {
        anomalyReasons.push(`Low power output: ${power.toFixed(2)}W (avg: ${stats.avgPower.toFixed(2)}W)`);
      }

      // Check 2: High temperature (above 80°C or 2 std dev above mean)
      if (temperature > 80) {
        anomalyReasons.push(`High temperature: ${temperature.toFixed(2)}°C (critical threshold: 80°C)`);
      } else if (temperature > stats.avgTemp + (2 * stats.stdDevTemp)) {
        anomalyReasons.push(`Temperature spike: ${temperature.toFixed(2)}°C (avg: ${stats.avgTemp.toFixed(2)}°C)`);
      }

      // Check 3: Voltage outside expected range
      if (voltage < stats.avgVoltage * 0.8 || voltage > stats.avgVoltage * 1.2) {
        anomalyReasons.push(`Voltage anomaly: ${voltage.toFixed(2)}V (avg: ${stats.avgVoltage.toFixed(2)}V)`);
      }

      // Check 4: Current spike or drop
      if (current < stats.avgCurrent * 0.6 || current > stats.avgCurrent * 1.5) {
        anomalyReasons.push(`Current anomaly: ${current.toFixed(2)}A (avg: ${stats.avgCurrent.toFixed(2)}A)`);
      }

      // Check 5: Power factor check (V * I should approximate Power)
      const expectedPower = voltage * current;
      if (Math.abs(expectedPower - power) > expectedPower * 0.3) {
        anomalyReasons.push(`Power calculation mismatch: Expected ${expectedPower.toFixed(2)}W, got ${power.toFixed(2)}W`);
      }

      return {
        isAnomaly: anomalyReasons.length > 0,
        reason: anomalyReasons.length > 0 ? anomalyReasons.join('; ') : null
      };

    } catch (error) {
      console.error('Error in anomaly detection:', error);
      return this.basicRuleCheck(reading);
    }
  }

  /**
   * Calculate statistical measures from historical data
   */
  static calculateStatistics(readings) {
    const n = readings.length;
    
    const sumPower = readings.reduce((sum, r) => sum + r.power, 0);
    const sumTemp = readings.reduce((sum, r) => sum + r.temperature, 0);
    const sumVoltage = readings.reduce((sum, r) => sum + r.voltage, 0);
    const sumCurrent = readings.reduce((sum, r) => sum + r.current, 0);

    const avgPower = sumPower / n;
    const avgTemp = sumTemp / n;
    const avgVoltage = sumVoltage / n;
    const avgCurrent = sumCurrent / n;

    // Calculate standard deviations
    const varianceTemp = readings.reduce((sum, r) => 
      sum + Math.pow(r.temperature - avgTemp, 2), 0) / n;
    const stdDevTemp = Math.sqrt(varianceTemp);

    return {
      avgPower,
      avgTemp,
      avgVoltage,
      avgCurrent,
      stdDevTemp
    };
  }

  /**
   * Basic rule-based check when not enough historical data
   */
  static basicRuleCheck(reading) {
    const { voltage, current, power, temperature } = reading;
    const anomalyReasons = [];

    // Basic thresholds
    if (temperature > 80) {
      anomalyReasons.push(`High temperature: ${temperature.toFixed(2)}°C`);
    }

    if (power < 50) {
      anomalyReasons.push(`Very low power output: ${power.toFixed(2)}W`);
    }

    if (voltage < 10 || voltage > 50) {
      anomalyReasons.push(`Voltage out of normal range: ${voltage.toFixed(2)}V`);
    }

    if (current < 0.5 || current > 10) {
      anomalyReasons.push(`Current out of normal range: ${current.toFixed(2)}A`);
    }

    return {
      isAnomaly: anomalyReasons.length > 0,
      reason: anomalyReasons.length > 0 ? anomalyReasons.join('; ') : null
    };
  }
}

module.exports = AnomalyDetector;
