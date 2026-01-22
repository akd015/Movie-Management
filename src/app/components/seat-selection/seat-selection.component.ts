import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of, switchMap, tap, map } from 'rxjs';
import { HighlightSoldoutDirective } from '../../directives/highlight-soldout.directive';
import { Movie, Seat, Showtime } from '../../models';
import { BookingService, CustomerDetails } from '../../services/booking.service';
import { MovieService } from '../../services/movie.service';
import { TheatreService } from '../../services/theatre.service';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatStepperModule,
    HighlightSoldoutDirective
  ],
  templateUrl: './seat-selection.component.html',
  styleUrl: './seat-selection.component.scss'
})
export class SeatSelectionComponent implements OnInit {
  seats: Seat[] = [];
  seatRows: { row: string; seats: Seat[] }[] = [];
  showtime: Showtime | null = null;
  movie: Movie | null = null;

  customerForm = this.fb.group({
    customerName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+]{8,15}$/)]]
  });

  readonly selectedSeats$ = this.bookingService.selectedSeats$;

  private showtime$ = this.route.paramMap.pipe(
    map((params) => Number(params.get('showtimeId'))),
    switchMap((id) => this.movieService.getShowtimeById(id)),
    tap((showtime) => {
      this.showtime = showtime;
      this.bookingService.selectShowtime(showtime ?? null);
    })
  );

  private movie$ = this.showtime$.pipe(
    switchMap((showtime) =>
      showtime ? this.movieService.getMovieById(showtime.movieId) : of(null)
    ),
    tap((movie) => {
      this.movie = movie ?? null;
      this.bookingService.selectMovie(movie ?? null);
    })
  );

  private seats$ = this.showtime$.pipe(
    switchMap((showtime) =>
      showtime
        ? this.theatreService.getSeatMapForShowtime(showtime.id, showtime.totalSeats)
        : of([])
    ),
    tap((seats) => {
      this.seats = seats.map((seat) => ({ ...seat }));
      this.syncSelectedSeats();
    })
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly movieService: MovieService,
    private readonly theatreService: TheatreService,
    private readonly bookingService: BookingService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.movie$.subscribe();
    this.seats$.subscribe();
  }

  onToggleSeat(seat: Seat) {
    if (seat.status === 'booked' || seat.status === 'reserved') return;
    this.bookingService.toggleSeat(seat);
    this.syncSelectedSeats();
  }

  syncSelectedSeats() {
    const selectedIds = new Set(
      this.bookingService.getSelectedSeatsSnapshot().map((seat) => seat.id)
    );
    this.seats = this.seats.map((seat) => {
      if (selectedIds.has(seat.id)) {
        return { ...seat, status: 'selected' };
      }
      if (seat.status === 'selected') {
        return { ...seat, status: 'available' };
      }
      return seat;
    });
    this.groupSeats();
  }

  groupSeats() {
    const groups: Record<string, Seat[]> = {};
    this.seats.forEach((seat) => {
      groups[seat.row] = groups[seat.row] ?? [];
      groups[seat.row].push(seat);
    });
    this.seatRows = Object.entries(groups).map(([row, seats]) => ({
      row,
      seats: seats.sort((a, b) => a.number - b.number)
    }));
  }

  totalAmount() {
    return (this.bookingService.getSelectedSeatsSnapshot().length || 0) * (this.showtime?.price ?? 0);
  }

  canContinue() {
    return this.bookingService.getSelectedSeatsSnapshot().length > 0;
  }

  submit(stepper: MatStepper) {
    if (!this.customerForm.valid || !this.canContinue()) {
      this.customerForm.markAllAsTouched();
      return;
    }
    const details = this.customerForm.value as CustomerDetails;
    this.bookingService.confirmBooking(details).subscribe(() => {
      stepper.next();
      this.router.navigate(['/booking-summary']);
    });
  }
}
