import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, of, shareReplay } from 'rxjs';
import { Seat, Theatre } from '../models';
import { environment } from '../../environments/environment';
import { SUPPRESS_ERROR_SNACKBAR } from '../interceptors/http-context.tokens';
import { SeatMap, fallbackSeatMaps, fallbackTheatres } from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class TheatreService {
  private theatres$?: ReturnType<TheatreService['fetchTheatres']>;
  private readonly suppressErrorContext = new HttpContext().set(SUPPRESS_ERROR_SNACKBAR, true);

  constructor(private http: HttpClient) {}

  private fetchTheatres() {
    return this.http.get<Theatre[]>(`${environment.apiBaseUrl}/theatres`, {
      context: this.suppressErrorContext
    }).pipe(
      catchError(() => of(fallbackTheatres)),
      shareReplay(1)
    );
  }

  getTheatres() {
    if (!this.theatres$) {
      this.theatres$ = this.fetchTheatres();
    }
    return this.theatres$;
  }

  getTheatreById(id: number) {
    return this.getTheatres().pipe(map((theatres) => theatres.find((t) => t.id === id)));
  }

  getSeatMapForShowtime(showtimeId: number, totalSeats = 40) {
    return this.http
      .get<SeatMap[]>(`${environment.apiBaseUrl}/seatMaps?showtimeId=${showtimeId}`, {
        context: this.suppressErrorContext
      })
      .pipe(
        map((maps) => maps[0]?.seats ?? this.getFallbackSeatMap(showtimeId, totalSeats)),
        catchError(() => of(this.getFallbackSeatMap(showtimeId, totalSeats)))
      );
  }

  private getFallbackSeatMap(showtimeId: number, totalSeats: number): Seat[] {
    const existing = fallbackSeatMaps.find((map) => map.showtimeId === showtimeId);
    if (existing) {
      return existing.seats;
    }
    return this.generateSeatLayout(totalSeats);
  }

  private generateSeatLayout(totalSeats: number): Seat[] {
    const seats: Seat[] = [];
    const seatsPerRow = 10;
    const rows = Math.ceil(totalSeats / seatsPerRow);
    for (let r = 0; r < rows; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      for (let c = 1; c <= seatsPerRow && seats.length < totalSeats; c++) {
        seats.push({
          id: `${rowLabel}${c}`,
          label: `${rowLabel}${c}`,
          row: rowLabel,
          number: c,
          status: 'available',
          isPremium: r === 0
        });
      }
    }
    return seats;
  }
}
