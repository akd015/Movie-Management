import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { combineLatest, startWith, map, Observable } from 'rxjs';
import { Movie } from '../../models';
import { BookingService } from '../../services/booking.service';
import { MovieService } from '../../services/movie.service';
import { MovieFilterCriteria, MovieFilterPipe } from '../../pipes/movie-filter.pipe';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MovieFilterPipe
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss'
})
export class MovieListComponent implements OnInit {
  movies$!: Observable<Movie[]>;
  filteredMovies$!: Observable<Movie[]>;
  readonly genres = ['Sci-Fi', 'Drama', 'Thriller', 'Animation'];
  readonly languages = ['English', 'Korean', 'Japanese'];
  private readonly movieFilter = new MovieFilterPipe();

  readonly filterForm = this.fb.nonNullable.group<MovieFilterCriteria>({
    query: '',
    genre: '',
    language: '',
    minRating: 0
  });

  constructor(
    private readonly movieService: MovieService,
    private readonly bookingService: BookingService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.movies$ = this.movieService.getMovies();
    this.filteredMovies$ = combineLatest([
      this.movies$,
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
    ]).pipe(
      map(([movies, criteria]) => this.movieFilter.transform(movies, criteria))
    );
  }

  selectMovie(movie: Movie) {
    this.bookingService.selectMovie(movie);
  }
}
