const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');
const AnomalyDetector = require('../utils/anomalyDetector');

/**
 * @route   GET /api/data
 * @desc    Get all readings with optional filters
 * @query   limit, anomalyOnly, startDate, endDate
 */
router.get('/data', async (req, res) => {
  try {
    const { limit = 100, anomalyOnly, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by anomaly status
    if (anomalyOnly === 'true') {
      query.isAnomaly = true;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const readings = await Reading.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: readings.length,
      data: readings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/data/latest
 * @desc    Get the most recent reading
 */
router.get('/data/latest', async (req, res) => {
  try {
    const latestReading = await Reading.findOne()
      .sort({ timestamp: -1 });
    
    if (!latestReading) {
      return res.status(404).json({
        success: false,
        message: 'No readings found'
      });
    }
    
    res.json({
      success: true,
      data: latestReading
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/data/stats
 * @desc    Get statistical summary of readings
 */
router.get('/data/stats', async (req, res) => {
  try {
    const totalReadings = await Reading.countDocuments();
    const anomalyCount = await Reading.countDocuments({ isAnomaly: true });
    
    const recentReadings = await Reading.find()
      .sort({ timestamp: -1 })
      .limit(100);
    
    if (recentReadings.length === 0) {
      return res.json({
        success: true,
        data: {
          totalReadings: 0,
          anomalyCount: 0,
          anomalyRate: 0
        }
      });
    }
    
    const avgPower = recentReadings.reduce((sum, r) => sum + r.power, 0) / recentReadings.length;
    const avgTemp = recentReadings.reduce((sum, r) => sum + r.temperature, 0) / recentReadings.length;
    const avgVoltage = recentReadings.reduce((sum, r) => sum + r.voltage, 0) / recentReadings.length;
    const avgCurrent = recentReadings.reduce((sum, r) => sum + r.current, 0) / recentReadings.length;
    
    res.json({
      success: true,
      data: {
        totalReadings,
        anomalyCount,
        anomalyRate: ((anomalyCount / totalReadings) * 100).toFixed(2),
        averages: {
          power: avgPower.toFixed(2),
          temperature: avgTemp.toFixed(2),
          voltage: avgVoltage.toFixed(2),
          current: avgCurrent.toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/upload
 * @desc    Upload a new reading with anomaly detection
 * @body    { voltage, current, power, temperature, timestamp? }
 */
router.post('/upload', async (req, res) => {
  try {
    const { voltage, current, power, temperature, timestamp } = req.body;
    
    // Validate input
    if (!voltage || !current || !power || temperature === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: voltage, current, power, temperature'
      });
    }
    
    // Detect anomaly
    const readingData = { voltage, current, power, temperature };
    const anomalyResult = await AnomalyDetector.detectAnomaly(readingData);
    
    // Create new reading
    const reading = new Reading({
      voltage,
      current,
      power,
      temperature,
      timestamp: timestamp || Date.now(),
      isAnomaly: anomalyResult.isAnomaly,
      anomalyReason: anomalyResult.reason
    });
    
    await reading.save();
    
    res.status(201).json({
      success: true,
      data: reading,
      anomalyDetected: anomalyResult.isAnomaly
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/upload/batch
 * @desc    Upload multiple readings at once
 * @body    { readings: [{ voltage, current, power, temperature, timestamp? }] }
 */
router.post('/upload/batch', async (req, res) => {
  try {
    const { readings } = req.body;
    
    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'readings array is required'
      });
    }
    
    const processedReadings = [];
    
    for (const readingData of readings) {
      const { voltage, current, power, temperature, timestamp } = readingData;
      
      if (!voltage || !current || !power || temperature === undefined) {
        continue; // Skip invalid readings
      }
      
      const anomalyResult = await AnomalyDetector.detectAnomaly(readingData);
      
      processedReadings.push({
        voltage,
        current,
        power,
        temperature,
        timestamp: timestamp || Date.now(),
        isAnomaly: anomalyResult.isAnomaly,
        anomalyReason: anomalyResult.reason
      });
    }
    
    const savedReadings = await Reading.insertMany(processedReadings);
    
    res.status(201).json({
      success: true,
      count: savedReadings.length,
      data: savedReadings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/data/:id
 * @desc    Get a single reading by ID (READ operation)
 */
router.get('/data/:id', async (req, res) => {
  try {
    const reading = await Reading.findById(req.params.id);
    
    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found'
      });
    }
    
    res.json({
      success: true,
      data: reading
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/data/:id
 * @desc    Update a reading by ID (UPDATE operation)
 */
router.put('/data/:id', async (req, res) => {
  try {
    const { voltage, current, power, temperature } = req.body;
    
    // Find the reading
    const reading = await Reading.findById(req.params.id);
    
    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found'
      });
    }
    
    // Update fields if provided
    if (voltage !== undefined) reading.voltage = voltage;
    if (current !== undefined) reading.current = current;
    if (power !== undefined) reading.power = power;
    if (temperature !== undefined) reading.temperature = temperature;
    
    // Re-run anomaly detection on updated data
    const readingData = {
      voltage: reading.voltage,
      current: reading.current,
      power: reading.power,
      temperature: reading.temperature
    };
    
    const anomalyResult = await AnomalyDetector.detectAnomaly(readingData);
    reading.isAnomaly = anomalyResult.isAnomaly;
    reading.anomalyReason = anomalyResult.reason;
    
    await reading.save();
    
    res.json({
      success: true,
      message: 'Reading updated successfully',
      data: reading
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/data/:id
 * @desc    Delete a single reading by ID (DELETE operation)
 */
router.delete('/data/:id', async (req, res) => {
  try {
    const reading = await Reading.findById(req.params.id);
    
    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found'
      });
    }
    
    await reading.deleteOne();
    
    res.json({
      success: true,
      message: 'Reading deleted successfully',
      data: reading
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/data/all
 * @desc    Delete all readings (for testing)
 */
router.delete('/data/all', async (req, res) => {
  try {
    const result = await Reading.deleteMany({});
    res.json({
      success: true,
      message: 'All readings deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
