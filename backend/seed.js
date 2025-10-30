require('dotenv').config();
const mongoose = require('mongoose');
const Reading = require('./models/Reading');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solar_panel_monitoring';

// Generate realistic solar panel data with some anomalies
const generateReadings = (count = 200) => {
  const readings = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Normal operating ranges
    let voltage = 24 + Math.random() * 6; // 24-30V
    let current = 3 + Math.random() * 3;  // 3-6A
    let temperature = 35 + Math.random() * 15; // 35-50°C
    let power = voltage * current * (0.85 + Math.random() * 0.1); // ~85-95% efficiency
    
    // Inject anomalies (~15% of data)
    const isAnomalous = Math.random() < 0.15;
    
    if (isAnomalous) {
      const anomalyType = Math.floor(Math.random() * 4);
      
      switch (anomalyType) {
        case 0: // Low power
          power *= 0.5;
          break;
        case 1: // High temperature
          temperature = 85 + Math.random() * 15;
          break;
        case 2: // Voltage drop
          voltage *= 0.6;
          power = voltage * current * 0.9;
          break;
        case 3: // Current spike
          current *= 1.8;
          temperature += 20;
          break;
      }
    }
    
    readings.push({
      voltage: parseFloat(voltage.toFixed(2)),
      current: parseFloat(current.toFixed(2)),
      power: parseFloat(power.toFixed(2)),
      temperature: parseFloat(temperature.toFixed(2)),
      timestamp: new Date(now - (count - i) * 5 * 60 * 1000), // 5 min intervals
      isAnomaly: false, // Will be detected by our algorithm
      anomalyReason: null
    });
  }
  
  return readings;
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await Reading.deleteMany({});
    console.log('🗑️  Cleared existing readings');
    
    // Generate and insert readings
    const readings = generateReadings(200);
    
    // Insert initial batch without anomaly detection
    const insertedReadings = await Reading.insertMany(readings);
    console.log(`📊 Inserted ${insertedReadings.length} readings`);
    
    // Now run anomaly detection on all readings
    const AnomalyDetector = require('./utils/anomalyDetector');
    let anomalyCount = 0;
    
    console.log('🔍 Running anomaly detection...');
    for (const reading of insertedReadings) {
      const anomalyResult = await AnomalyDetector.detectAnomaly({
        voltage: reading.voltage,
        current: reading.current,
        power: reading.power,
        temperature: reading.temperature
      });
      
      if (anomalyResult.isAnomaly) {
        reading.isAnomaly = true;
        reading.anomalyReason = anomalyResult.reason;
        await reading.save();
        anomalyCount++;
      }
    }
    
    console.log(`⚠️  Detected ${anomalyCount} anomalies`);
    console.log('✅ Database seeded successfully!');
    
    // Display sample stats
    const totalReadings = await Reading.countDocuments();
    const totalAnomalies = await Reading.countDocuments({ isAnomaly: true });
    const anomalyRate = ((totalAnomalies / totalReadings) * 100).toFixed(2);
    
    console.log('\n📈 Statistics:');
    console.log(`   Total Readings: ${totalReadings}`);
    console.log(`   Anomalies: ${totalAnomalies}`);
    console.log(`   Anomaly Rate: ${anomalyRate}%`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
