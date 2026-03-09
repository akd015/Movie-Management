import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { combineLatest, map, switchMap } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { MovieService } from '../../services/movie.service';
import { TheatreService } from '../../services/theatre.service';

interface BookingHistoryRow {
  id: number;
  movieTitle: string;
  theatreName: string;
  seats: string[];
  customerName: string;
  totalAmount: number;
  bookedAt: string;
}

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule],
  templateUrl: './booking-history.component.html',
  styleUrl: './booking-history.component.scss'
})
export class BookingHistoryComponent {
  displayedColumns = ['reference', 'movie', 'theatre', 'seats', 'customer', 'total', 'bookedAt'];

  rows$ = this.bookingService.loadBookingHistory().pipe(
    switchMap((bookings) =>
      combineLatest([
        this.movieService.getMovies(),
        this.theatreService.getTheatres(),
        this.bookingService.bookingHistory$
      ]).pipe(
        map(([movies, theatres, history]) =>
          (history.length ? history : bookings).map(
            (booking): BookingHistoryRow => ({
              id: booking.id,
              movieTitle: movies.find((movie) => movie.id === booking.movieId)?.title ?? `#${booking.movieId}`,
              theatreName:
                theatres.find((theatre) => theatre.id === booking.theatreId)?.name ??
                `#${booking.theatreId}`,
              seats: booking.seats,
              customerName: booking.customerName,
              totalAmount: booking.totalAmount,
              bookedAt: booking.bookedAt
            })
          )
        )
      )
    )
  );

  constructor(
    private readonly bookingService: BookingService,
    private readonly movieService: MovieService,
    private readonly theatreService: TheatreService
  ) {}
}
