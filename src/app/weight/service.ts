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

function toAvgWeight(dto: AvgWeightDto): AvgWeight {
  return {
    date: new Date(dto.date), 
    avgWeightKg: dto.avgWeightKg
  };
}

function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(date.setDate(diff));
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

@Injectable({
  providedIn: 'root'
})
export class WeightService {

  constructor(private http: HttpClient) {}

  getAverageWeight$(username: string): Observable<AvgWeight[]> {
    const url = `${API_URLS.DAILY_AVERAGES}?userName=${encodeURIComponent(username)}`;
    
    return this.http
      .get<AvgWeightDto[]>(url) 
      .pipe(
        map(dtos => dtos.map(toAvgWeight)) 
      );
  }

  getWeeklyAverageWeight$(username: string): Observable<WeeklyAvgWeight[]> {
    return this.getAverageWeight$(username).pipe(
      map(dailyWeights => calculateWeeklyAverages(dailyWeights))
    );
  }

  getLatestAverageWeight$(username: string): Observable<AvgWeight> {
    return this.getAverageWeight$(username).pipe(
      map(weights => weights[weights.length - 1]) 
    );
  }
}
