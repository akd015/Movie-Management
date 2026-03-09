import { Routes } from '@angular/router';
import { BookingSummaryComponent } from './components/booking-summary/booking-summary.component';
import { BookingHistoryComponent } from './components/booking-history/booking-history.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { SeatSelectionComponent } from './components/seat-selection/seat-selection.component';
import { ShowtimeListComponent } from './components/showtime-list/showtime-list.component';
import { bookingGuard } from './guards/booking.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full' },
  { path: 'movies', component: MovieListComponent },
  { path: 'movies/:id', component: MovieDetailComponent },
  { path: 'showtimes/:movieId', component: ShowtimeListComponent },
  { path: 'seats/:showtimeId', component: SeatSelectionComponent },
  { path: 'booking-summary', component: BookingSummaryComponent, canActivate: [bookingGuard] },
  { path: 'booking-history', component: BookingHistoryComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: '**', redirectTo: 'movies' }
];
