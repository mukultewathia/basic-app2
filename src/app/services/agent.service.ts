
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { API_URLS } from '../config/api.config';

export interface AgentRequest {
  userQuery: string;
  challengeId?: number;
  habitId?: number;
  chatId?: string;
}

export interface AgentResponse {
  response: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  askAgent(request: AgentRequest): Observable<AgentResponse> {
    let params = new HttpParams();
    
    // Check global query params for noCache
    const urlTree = this.router.parseUrl(this.router.url);
    if (urlTree.queryParams['noCache'] === 'true') {
      params = params.set('no-cache', 'true');
    }

    return this.http.post<AgentResponse>(API_URLS.AGENT.QUERY, request, { params });
  }
}
