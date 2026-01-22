import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatListModule, MatButtonModule],
  templateUrl: './booking-summary.component.html',
  styleUrl: './booking-summary.component.scss'
})
export class BookingSummaryComponent {
  booking$ = this.bookingService.bookingSummary$;
  movie$ = this.bookingService.selectedMovie$;
  showtime$ = this.bookingService.selectedShowtime$;

  constructor(private readonly bookingService: BookingService) {}
}
