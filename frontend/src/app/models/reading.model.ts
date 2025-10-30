export interface Reading {
  _id?: string;
  timestamp: Date;
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  isAnomaly: boolean;
  anomalyReason?: string;
}

export interface Stats {
  totalReadings: number;
  anomalyCount: number;
  anomalyRate: string;
  averages: {
    power: string;
    temperature: string;
    voltage: string;
    current: string;
  };
}
