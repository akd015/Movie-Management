import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { HighlightSoldoutDirective } from '../../directives/highlight-soldout.directive';
import { Movie, Showtime, Theatre } from '../../models';
import { BookingService } from '../../services/booking.service';
import { MovieService } from '../../services/movie.service';
import { TheatreService } from '../../services/theatre.service';

@Component({
  selector: 'app-showtime-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    HighlightSoldoutDirective
  ],
  templateUrl: './showtime-list.component.html',
  styleUrl: './showtime-list.component.scss'
})
export class ShowtimeListComponent {
  displayedColumns = ['theatre', 'time', 'price', 'seats', 'actions'];
  movie?: Movie | null;

  movie$ = this.route.paramMap.pipe(
    map((params) => Number(params.get('movieId'))),
    switchMap((movieId) => this.movieService.getMovieById(movieId)),
    tap((movie) => this.bookingService.selectMovie(movie ?? null)),
    tap((movie) => (this.movie = movie))
  );

  showtimeRows$ = this.route.paramMap.pipe(
    map((params) => Number(params.get('movieId'))),
    switchMap((movieId) =>
      combineLatest([
        this.movieService.getShowtimesForMovie(movieId),
        this.theatreService.getTheatres()
      ]).pipe(
        map(([showtimes, theatres]) =>
          showtimes.map((showtime) => ({
            ...showtime,
            theatre: theatres.find((t) => t.id === showtime.theatreId)
          }))
        )
      )
    )
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly movieService: MovieService,
    private readonly theatreService: TheatreService,
    private readonly bookingService: BookingService
  ) {}

  onSelect(showtime: Showtime) {
    if (this.movie) {
      this.bookingService.selectMovie(this.movie);
    }
    this.bookingService.selectShowtime(showtime);
    this.router.navigate(['/seats', showtime.id]);
  }

  isSoldOut(showtime: Showtime) {
    return showtime.availableSeats === 0;
  }

  formatSeats(showtime: Showtime) {
    if (showtime.availableSeats === 0) return 'Sold out';
    return `${showtime.availableSeats}/${showtime.totalSeats}`;
  }
}
