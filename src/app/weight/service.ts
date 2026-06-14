import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URLS } from '../config/api.config';

interface AvgWeightDto {
  date: string;
  avgWeightKg: number;
}

interface AvgWeight {
  date: Date;
  avgWeightKg: number;
}

interface WeeklyAvgWeight {
  weekStart: Date;     // Monday of the week
  avgWeightKg: number; // Average weight for the week
}

interface MonthlyAvgWeight {
  monthStart: Date;     // 1st of the month
  avgWeightKg: number; // Average weight for the month
}

function toAvgWeight(dto: AvgWeightDto): AvgWeight {
  return {
    date: new Date(dto.date),
    avgWeightKg: dto.avgWeightKg
  };
}

function getWeekStart(date: Date): Date {
  const day = date.getUTCDay();
  const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff));
}

function getMonthFromDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function calculateWeeklyAverages(dailyWeights: AvgWeight[]): WeeklyAvgWeight[] {
  const weeklyMap = new Map<string, { total: number; count: number }>();

  dailyWeights.forEach(weight => {
    const weekStart = getWeekStart(new Date(weight.date));
    const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, { total: 0, count: 0 });
    }

    const weekData = weeklyMap.get(weekKey)!;
    weekData.total += weight.avgWeightKg;
    weekData.count += 1;
  });

  return Array.from(weeklyMap.entries())
    .map(([weekKey, data]) => ({
      weekStart: new Date(weekKey),
      avgWeightKg: data.total / data.count
    }))
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
}

function calculateMonthlyAverages(dailyWeights: AvgWeight[]): MonthlyAvgWeight[] {
  const monthlyMap = new Map<string, { total: number; count: number }>();

  dailyWeights.forEach(weight => {
    console.log('mafia', weight.date, weight.avgWeightKg);
    const monthStart = getMonthFromDate(new Date(weight.date));
    const monthKey = monthStart.toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log('mafia: monthKey', monthKey, weight.avgWeightKg);

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { total: 0, count: 0 });
    }

    const monthData = monthlyMap.get(monthKey)!;
    monthData.total += weight.avgWeightKg;
    monthData.count += 1;
  });

  return Array.from(monthlyMap.entries())
    .map(([monthKey, data]) => ({
      monthStart: new Date(monthKey),
      avgWeightKg: data.total / data.count
    }))
    .sort((a, b) => a.monthStart.getTime() - b.monthStart.getTime());
}

@Injectable({
  providedIn: 'root'
})
export class WeightService {

  constructor(private http: HttpClient) { }

  getAverageWeight$(): Observable<AvgWeight[]> {
    return this.http
      .get<AvgWeightDto[]>(API_URLS.DAILY_AVERAGES)
      .pipe(
        map(dtos => dtos.map(toAvgWeight))
      );
  }

  getWeeklyAverageWeight$(): Observable<WeeklyAvgWeight[]> {
    return this.getAverageWeight$().pipe(
      map(dailyWeights => calculateWeeklyAverages(dailyWeights))
    );
  }

  getMonthlyAverageWeight$(): Observable<MonthlyAvgWeight[]> {
    return this.getAverageWeight$().pipe(
      map(dailyWeights => calculateMonthlyAverages(dailyWeights))
    );
  }

  getLatestAverageWeight$(): Observable<AvgWeight> {
    return this.getAverageWeight$().pipe(
      map(weights => weights[weights.length - 1])
    );
  }
}
