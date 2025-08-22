import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { registerables, Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { AuthService } from '../auth/auth.service';
import { WeightService } from './service';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import 'chartjs-adapter-date-fns';
import { API_URLS } from '../config/api.config';

// Register Chart.js components and the zoom plugin.
// This is required for chart functionality and zoom support.
Chart.register(...registerables, zoomPlugin);

@Component({
  selector: 'weight-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './weight.html',
  styleUrls: ['./weight.scss']
})
export class WeightComponent implements OnInit {
  readonly chartType = 'line';

  // View toggle properties
  isWeeklyView = false;
  
  // Modal properties
  showModal = false;
  isSubmitting = false;
  modalMessage: string | null = null;
  isModalError = false;
  
  // Format today as YYYY-MM-DD in IST
  private getTodayIST(): string {
    const now = new Date();
    // IST is UTC+5:30, so add 5.5 hours in ms
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffsetMs);
    // Format as YYYY-MM-DD
    const yyyy = istDate.getFullYear();
    const mm = String(istDate.getMonth() + 1).padStart(2, '0');
    const dd = String(istDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  today: string = this.getTodayIST();

  constructor(
    public readonly authService: AuthService,
    private readonly weightService: WeightService,
    private readonly router: Router,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadWeightData();
  }

  loadWeightData(): void {
    if (this.isWeeklyView) {
      this.loadWeeklyData();
    } else {
      this.loadDailyData();
    }
  }

  private loadDailyData(): void {
    this.weightService.getAverageWeight$().subscribe({
      next: (weights) => {
        console.log('Daily weight data received:', weights);
        this.updateDailyChartData(weights);
      },
      error: (error) => {
        console.error('Error fetching daily weight data:', error);
        // Optionally redirect to login on API error if it's an auth error
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/metrics-app/login']);
        }
      }
    });
  }

  private loadWeeklyData(): void {
    this.weightService.getWeeklyAverageWeight$().subscribe({
      next: (weeklyWeights) => {
        console.log('Weekly weight data received:', weeklyWeights);
        this.updateWeeklyChartData(weeklyWeights);
      },
      error: (error) => {
        console.error('Error fetching weekly weight data:', error);
        // Optionally redirect to login on API error if it's an auth error
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/metrics-app/login']);
        }
      }
    });
  }

  private updateDailyChartData(weights: any[]): void {
    // Transform the daily weight data for the chart
    const chartData = weights.map(weight => ({
      x: weight.date.getTime(), // Convert Date to timestamp
      y: weight.avgWeightKg
    }));

    this.data = {
      datasets: [{
        label: 'Daily Weight (kg)',
        data: chartData,
        borderColor: 'steelblue',
        backgroundColor: 'rgba(70,130,180,.25)',
        tension: 0.3,
        pointRadius: 3
      }]
    };
  }

  private updateWeeklyChartData(weeklyWeights: any[]): void {
    // Transform the weekly weight data for the chart
    const chartData = weeklyWeights.map(weight => ({
      x: weight.weekStart.getTime(), // Convert Date to timestamp
      y: weight.avgWeightKg
    }));

    this.data = {
      datasets: [{
        label: 'Weekly Average Weight (kg)',
        data: chartData,
        borderColor: 'darkgreen',
        backgroundColor: 'rgba(0,100,0,.25)',
        tension: 0.3,
        pointRadius: 4
      }]
    };
  }

  // Toggle between daily and weekly views
  switchToDailyView(): void {
    this.isWeeklyView = false;
    this.loadWeightData();
  }

  switchToWeeklyView(): void {
    this.isWeeklyView = true;
    this.loadWeightData();
  }

  // Modal methods
  openWeightModal(): void {
    this.showModal = true;
    this.modalMessage = null;
    this.isModalError = false;
  }

  closeWeightModal(): void {
    this.showModal = false;
    this.modalMessage = null;
    this.isModalError = false;
  }

  submitWeight(weightForm: { value: { weight: number, date: string } }): void {
    // Get the weight and date values from the form
    const weightKg = weightForm.value.weight;
    let date = weightForm.value.date || this.today;

    // Convert date (YYYY-MM-DD) to ISO 8601 with time and timezone
    // Set time to 00:00:00 in local timezone
    const dateObj = new Date(date);

    this.isSubmitting = true;
    this.modalMessage = null;
    this.isModalError = false;

    const payload = {
      weightKg: weightKg,
      date: dateObj.toISOString()
    };

    this.http.post(API_URLS.ADD_WEIGHT, payload)
      .pipe(
        catchError(err => {
          console.error('Error adding weight:', err);
          this.modalMessage = 'Failed to add weight entry. Please try again.';
          this.isModalError = true;
          this.isSubmitting = false;
          return of(null);
        })
      )
      .subscribe(response => {
          this.modalMessage = 'Weight entry added successfully!';
          this.isModalError = false;
          this.isSubmitting = false;
          
          // Close modal after a short delay
          setTimeout(() => {
            this.closeWeightModal();
                      // Reload the weight data to update the chart
          this.loadWeightData();
          }, 1500);
      });
  }

  /** Replace with real time-series data */
  data: ChartData<'line'> = {
    datasets: []
  };

  get options(): ChartOptions<'line'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: this.isWeeklyView ? 'week' : 'day',
            tooltipFormat: this.isWeeklyView ? 'MMM d, yyyy' : 'MMM d, yyyy'
          },
          title: { display: true, text: 'Date' }
        },
        y: {
          title: { display: true, text: 'Weight (kg)' }
        }
      },
      /** pan = horizontal "scroll" */
      plugins: {
        zoom: {
          pan: { enabled: true, mode: 'x' },
          zoom: {
            wheel: { enabled: true },   // mouse-wheel
            pinch: { enabled: true },   // touch pinch
            mode: 'x'
          }
        }
      }
    };
  }
}