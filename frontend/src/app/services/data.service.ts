import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reading, Stats } from '../models/reading.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // READ Operations
  getReadings(limit: number = 100): Observable<any> {
    return this.http.get(`${this.apiUrl}/data?limit=${limit}`);
  }

  getReadingById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/data/${id}`);
  }

  getLatestReading(): Observable<any> {
    return this.http.get(`${this.apiUrl}/data/latest`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/data/stats`);
  }

  getAnomalies(limit: number = 50): Observable<any> {
    return this.http.get(`${this.apiUrl}/data?anomalyOnly=true&limit=${limit}`);
  }

  // CREATE Operation
  uploadReading(reading: Partial<Reading>): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, reading);
  }

  // UPDATE Operation
  updateReading(id: string, reading: Partial<Reading>): Observable<any> {
    return this.http.put(`${this.apiUrl}/data/${id}`, reading);
  }

  // DELETE Operations
  deleteReading(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/data/${id}`);
  }

  deleteAllReadings(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/data/all`);
  }
}
