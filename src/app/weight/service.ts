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

function toAvgWeight(dto: AvgWeightDto): AvgWeight {
  return {
    date: new Date(dto.date), 
    avgWeightKg: dto.avgWeightKg
  };
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

  getLatestAverageWeight$(username: string): Observable<AvgWeight> {
    return this.getAverageWeight$(username).pipe(
      map(weights => weights[weights.length - 1]) 
    );
  }
}
