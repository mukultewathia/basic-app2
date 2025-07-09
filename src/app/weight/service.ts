import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// exactly what the backend returns
interface AvgWeightDto {
  date: string;        // ISO-8601 date string
  avgWeightKg: number; // raw number from API
}

// what the rest of your app should receive
interface AvgWeight {
  date: Date;          // real Date instance (easier for charts, sort, format)
  avgWeightKg: number; // stays the same
}

function toAvgWeight(dto: AvgWeightDto): AvgWeight {
  return {
    date: new Date(dto.date), // ISO string → Date
    avgWeightKg: dto.avgWeightKg
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeightService {
  private readonly API_URL = 'http://localhost:8080/api/weights/dailyAverages';

  constructor(private http: HttpClient) {}

  getAverageWeight$(username: string): Observable<AvgWeight[]> {
    const url = `${this.API_URL}?userName=${encodeURIComponent(username)}`;
    
    return this.http
      .get<AvgWeightDto[]>(url) // typed DTO array
      .pipe(
        map(dtos => dtos.map(toAvgWeight)) // transform each DTO
        // more operators here if needed: retry, shareReplay, etc.
      );
  }

  // Alternative method if you want a single weight entry
  getLatestAverageWeight$(username: string): Observable<AvgWeight> {
    return this.getAverageWeight$(username).pipe(
      map(weights => weights[weights.length - 1]) // get the latest entry
    );
  }
}
