import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DataService } from './services/data.service';
import { Reading, Stats } from './models/reading.model';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'Solar Panel Monitoring Dashboard';
  
  // Data
  latestReading: Reading | null = null;
  readings: Reading[] = [];
  anomalies: Reading[] = [];
  stats: Stats | null = null;
  
  // State
  loading = true;
  error: string | null = null;
  systemStatus: 'normal' | 'warning' | 'alert' = 'normal';
  refreshing = false;
  lastRefreshTime: Date | null = null;
  
  // Auto-refresh
  private refreshInterval: any;
  
  // CRUD State
  showAddForm = false;
  editingReading: Reading | null = null;
  newReading = {
    voltage: 26,
    current: 4.5,
    power: 117,
    temperature: 42
  };
  
  // Chart references
  @ViewChild('powerTempChart') powerTempChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('voltageCurrentChart') voltageCurrentChartRef!: ElementRef<HTMLCanvasElement>;
  private powerTempChart: Chart | null = null;
  private voltageCurrentChart: Chart | null = null;
  
  // Chart configurations
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Power (W)',
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        data: [],
        label: 'Temperature (°C)',
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  };

  voltageCurrentChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Voltage (V)',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        data: [],
        label: 'Current (A)',
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  voltageCurrentChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  };

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadAllData();
    
    // Refresh data every 30 seconds (increased from 10 to reduce flickering)
    this.refreshInterval = setInterval(() => {
      this.loadAllData();
    }, 30000);
  }

  ngAfterViewInit() {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    // Destroy charts
    if (this.powerTempChart) {
      this.powerTempChart.destroy();
    }
    if (this.voltageCurrentChart) {
      this.voltageCurrentChart.destroy();
    }
  }

  initializeCharts() {
    // Initialize Power & Temperature Chart
    if (this.powerTempChartRef) {
      const ctx = this.powerTempChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.powerTempChart = new Chart(ctx, {
          type: 'line',
          data: this.lineChartData,
          options: this.lineChartOptions
        });
      }
    }

    // Initialize Voltage & Current Chart
    if (this.voltageCurrentChartRef) {
      const ctx = this.voltageCurrentChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.voltageCurrentChart = new Chart(ctx, {
          type: 'line',
          data: this.voltageCurrentChartData,
          options: this.voltageCurrentChartOptions
        });
      }
    }
  }

  loadAllData() {
    // Only show loading spinner on first load, not on auto-refresh
    const isFirstLoad = this.readings.length === 0;
    if (isFirstLoad) {
      this.loading = true;
    } else {
      this.refreshing = true;
    }
    this.error = null;

    // Load latest reading
    this.dataService.getLatestReading().subscribe({
      next: (response: any) => {
        this.latestReading = response.data;
        this.updateSystemStatus();
      },
      error: (err: any) => {
        console.error('Error loading latest reading:', err);
      }
    });

    // Load all readings for charts
    this.dataService.getReadings(50).subscribe({
      next: (response: any) => {
        this.readings = response.data.reverse(); // Reverse to show chronological order
        this.updateCharts();
        this.lastRefreshTime = new Date();
        this.refreshing = false;
        if (isFirstLoad) {
          this.loading = false;
        }
      },
      error: (err: any) => {
        this.error = 'Failed to load readings. Make sure the backend server is running.';
        this.refreshing = false;
        if (isFirstLoad) {
          this.loading = false;
        }
        console.error('Error loading readings:', err);
      }
    });

    // Load anomalies
    this.dataService.getAnomalies(20).subscribe({
      next: (response: any) => {
        this.anomalies = response.data;
        this.updateSystemStatus();
      },
      error: (err: any) => {
        console.error('Error loading anomalies:', err);
      }
    });

    // Load stats
    this.dataService.getStats().subscribe({
      next: (response: any) => {
        this.stats = response.data;
      },
      error: (err: any) => {
        console.error('Error loading stats:', err);
      }
    });
  }

  updateCharts() {
    if (this.readings.length === 0) return;

    const labels = this.readings.map(r => {
      const date = new Date(r.timestamp);
      return date.toLocaleTimeString();
    });

    const powerData = this.readings.map(r => r.power);
    const tempData = this.readings.map(r => r.temperature);
    const voltageData = this.readings.map(r => r.voltage);
    const currentData = this.readings.map(r => r.current);

    // Update power and temperature chart
    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          data: powerData,
          label: 'Power (W)',
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: this.readings.map(r => r.isAnomaly ? '#ef4444' : '#667eea'),
          pointRadius: this.readings.map(r => r.isAnomaly ? 6 : 3)
        },
        {
          data: tempData,
          label: 'Temperature (°C)',
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Update voltage and current chart
    this.voltageCurrentChartData = {
      labels: labels,
      datasets: [
        {
          data: voltageData,
          label: 'Voltage (V)',
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          data: currentData,
          label: 'Current (A)',
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Update Chart.js instances or create them if they don't exist
    if (this.powerTempChart) {
      this.powerTempChart.data = this.lineChartData;
      this.powerTempChart.update();
    } else if (this.powerTempChartRef?.nativeElement) {
      // Chart not initialized yet, try to initialize it
      this.initializeCharts();
    }
    
    if (this.voltageCurrentChart) {
      this.voltageCurrentChart.data = this.voltageCurrentChartData;
      this.voltageCurrentChart.update();
    }
  }

  updateSystemStatus() {
    if (!this.latestReading) return;

    if (this.latestReading.isAnomaly) {
      // Check severity
      if (this.latestReading.temperature > 90 || this.latestReading.power < 50) {
        this.systemStatus = 'alert';
      } else {
        this.systemStatus = 'warning';
      }
    } else {
      this.systemStatus = 'normal';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString();
  }

  getStatusText(): string {
    switch (this.systemStatus) {
      case 'normal':
        return '✓ System Normal';
      case 'warning':
        return '⚠ Warning Detected';
      case 'alert':
        return '⚠ Critical Alert';
      default:
        return 'Unknown';
    }
  }

  // CRUD Operations

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.newReading = {
      voltage: 26,
      current: 4.5,
      power: 117,
      temperature: 42
    };
    this.editingReading = null;
  }

  // CREATE
  createReading() {
    this.dataService.uploadReading(this.newReading).subscribe({
      next: (response: any) => {
        console.log('Reading created:', response);
        alert(`✅ Reading created successfully! ${response.anomalyDetected ? '⚠️ Anomaly detected!' : ''}`);
        this.resetForm();
        this.showAddForm = false;
        this.loadAllData();
      },
      error: (err: any) => {
        console.error('Error creating reading:', err);
        alert('❌ Error creating reading. Check console for details.');
      }
    });
  }

  // UPDATE
  startEdit(reading: Reading) {
    this.editingReading = { ...reading };
    this.showAddForm = true;
    this.newReading = {
      voltage: reading.voltage,
      current: reading.current,
      power: reading.power,
      temperature: reading.temperature
    };
  }

  updateReading() {
    if (!this.editingReading || !this.editingReading._id) return;
    
    this.dataService.updateReading(this.editingReading._id, this.newReading).subscribe({
      next: (response: any) => {
        console.log('Reading updated:', response);
        alert('✅ Reading updated successfully!');
        this.resetForm();
        this.showAddForm = false;
        this.loadAllData();
      },
      error: (err: any) => {
        console.error('Error updating reading:', err);
        alert('❌ Error updating reading. Check console for details.');
      }
    });
  }

  cancelEdit() {
    this.resetForm();
    this.showAddForm = false;
  }

  // DELETE
  deleteReading(id: string | undefined) {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this reading?')) {
      return;
    }

    this.dataService.deleteReading(id).subscribe({
      next: (response: any) => {
        console.log('Reading deleted:', response);
        alert('✅ Reading deleted successfully!');
        this.loadAllData();
      },
      error: (err: any) => {
        console.error('Error deleting reading:', err);
        alert('❌ Error deleting reading. Check console for details.');
      }
    });
  }

  // Calculate power automatically
  calculatePower() {
    this.newReading.power = parseFloat((this.newReading.voltage * this.newReading.current).toFixed(2));
  }
}
