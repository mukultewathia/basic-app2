import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { registerables, Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { AppDataService } from '../app_service_data';
import { WeightService } from './service';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
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

  // Modal properties
  showModal = false;
  isSubmitting = false;
  modalMessage: string | null = null;
  isModalError = false;

  constructor(
    public readonly appDataService: AppDataService,
    private readonly weightService: WeightService,
    private readonly router: Router,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    this.checkAuthenticationAndLoadData();
  }

  private checkAuthenticationAndLoadData(): void {
    const username = this.appDataService.username;
    
    if (!username) {
      console.warn('No username available, redirecting to login');
      this.router.navigate(['/metrics-app/login']);
      return;
    }

    this.loadWeightData(username);
  }

  private loadWeightData(username: string): void {
    this.weightService.getAverageWeight$(username).subscribe({
      next: (weights) => {
        console.log('Weight data received:', weights);
        this.updateChartData(weights);
      },
      error: (error) => {
        console.error('Error fetching weight data:', error);
        // Optionally redirect to login on API error if it's an auth error
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/metrics-app/login']);
        }
      }
    });
  }

  private updateChartData(weights: any[]): void {
    // Transform the weight data for the chart
    const chartData = weights.map(weight => ({
      x: weight.date.getTime(), // Convert Date to timestamp
      y: weight.avgWeightKg
    }));

    this.data = {
      datasets: [{
        label: 'Weight (kg)',
        data: chartData,
        borderColor: 'steelblue',
        backgroundColor: 'rgba(70,130,180,.25)',
        tension: 0.3,
        pointRadius: 3
      }]
    };
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

  submitWeight(weightForm: { value: { weight: number } }): void {
    const username = this.appDataService.username;
    if (!username) {
      this.modalMessage = 'User not authenticated';
      this.isModalError = true;
      return;
    }

    // Get the weight value from the form
    const weightKg = weightForm.value.weight;

    this.isSubmitting = true;
    this.modalMessage = null;
    this.isModalError = false;

    const payload = {
      userName: username,
      weightKg: weightKg
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
            this.loadWeightData(username);
          }, 1500);
      });
  }

  /** Replace with real time-series data */
  data: ChartData<'line'> = {
    datasets: []
  };

  options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day', // Changed to 'day' since we're dealing with daily averages
          tooltipFormat: 'MMM d, yyyy'
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