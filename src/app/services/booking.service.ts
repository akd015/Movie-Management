import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { Booking, Movie, Seat, Showtime } from '../models';
import { environment } from '../../environments/environment';
import { fallbackBookings } from './mock-data';

export interface CustomerDetails {
  customerName: string;
  email: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private selectedMovieSubject = new BehaviorSubject<Movie | null>(null);
  private selectedShowtimeSubject = new BehaviorSubject<Showtime | null>(null);
  private selectedSeatsSubject = new BehaviorSubject<Seat[]>([]);
  private bookingSummarySubject = new BehaviorSubject<Booking | null>(null);

  readonly selectedMovie$ = this.selectedMovieSubject.asObservable();
  readonly selectedShowtime$ = this.selectedShowtimeSubject.asObservable();
  readonly selectedSeats$ = this.selectedSeatsSubject.asObservable();
  readonly bookingSummary$ = this.bookingSummarySubject.asObservable();

  constructor(private http: HttpClient) {}

  selectMovie(movie: Movie | null) {
    this.selectedMovieSubject.next(movie);
  }

  selectShowtime(showtime: Showtime | null) {
    this.selectedShowtimeSubject.next(showtime);
    this.selectedSeatsSubject.next([]);
  }

  setSeats(seats: Seat[]) {
    this.selectedSeatsSubject.next(seats);
  }

  toggleSeat(seat: Seat) {
    if (seat.status === 'booked' || seat.status === 'reserved') {
      return;
    }
    const current = this.selectedSeatsSubject.value;
    const exists = current.find((s) => s.id === seat.id);
    if (exists) {
      this.selectedSeatsSubject.next(current.filter((s) => s.id !== seat.id));
    } else {
      this.selectedSeatsSubject.next([...current, { ...seat, status: 'selected' }]);
    }
  }

  hasActiveBooking(): boolean {
    return (
      !!this.bookingSummarySubject.value ||
      (!!this.selectedMovieSubject.value &&
        !!this.selectedShowtimeSubject.value &&
        this.selectedSeatsSubject.value.length > 0)
    );
  }

  getSelectedSeatsSnapshot(): Seat[] {
    return this.selectedSeatsSubject.value;
  }

  clearBooking() {
    this.selectedMovieSubject.next(null);
    this.selectedShowtimeSubject.next(null);
    this.selectedSeatsSubject.next([]);
    this.bookingSummarySubject.next(null);
  }

  confirmBooking(details: CustomerDetails): Observable<Booking | null> {
    const movie = this.selectedMovieSubject.value;
    const showtime = this.selectedShowtimeSubject.value;
    const seats = this.selectedSeatsSubject.value;

    if (!movie || !showtime || seats.length === 0) {
      return of(null);
    }

    const booking: Booking = {
      id: Date.now(),
      movieId: movie.id,
      showtimeId: showtime.id,
      theatreId: showtime.theatreId,
      seats: seats.map((s) => s.label),
      customerName: details.customerName,
      email: details.email,
      phone: details.phone,
      totalAmount: seats.length * showtime.price,
      bookedAt: new Date().toISOString()
    };

    return this.http.post<Booking>(`${environment.apiBaseUrl}/bookings`, booking).pipe(
      tap((response) => this.bookingSummarySubject.next(response)),
      catchError(() => {
        this.bookingSummarySubject.next(booking);
        fallbackBookings.push(booking);
        return of(booking);
      })
    );
  }
}
