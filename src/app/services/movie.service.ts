import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, of, catchError, shareReplay } from 'rxjs';
import { Movie, Showtime } from '../models';
import { environment } from '../../environments/environment';
import { fallbackMovies, fallbackShowtimes } from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private movies$?: ReturnType<MovieService['fetchMovies']>;

  constructor(private http: HttpClient) {}

  private fetchMovies() {
    return this.http.get<Movie[]>(`${environment.apiBaseUrl}/movies`).pipe(
      catchError(() => of(fallbackMovies)),
      shareReplay(1)
    );
  }

  getMovies() {
    if (!this.movies$) {
      this.movies$ = this.fetchMovies();
    }
    return this.movies$;
  }

  getMovieById(id: number) {
    return this.getMovies().pipe(map((movies) => movies.find((m) => m.id === id)));
  }

  getShowtimesForMovie(movieId: number) {
    return this.http
      .get<Showtime[]>(`${environment.apiBaseUrl}/showtimes?movieId=${movieId}`)
      .pipe(
        map((showtimes) => showtimes.sort((a, b) => a.startTime.localeCompare(b.startTime))),
        catchError(() =>
          of(
            fallbackShowtimes
              .filter((s) => s.movieId === movieId)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
          )
        )
      );
  }

  searchMovies(term: string) {
    const normalized = term.toLowerCase();
    return this.getMovies().pipe(
      map((movies) =>
        movies.filter(
          (movie) =>
            movie.title.toLowerCase().includes(normalized) ||
            movie.genre.toLowerCase().includes(normalized) ||
            movie.language.toLowerCase().includes(normalized)
        )
      )
    );
  }

  getShowtimeById(id: number) {
    return this.http.get<Showtime>(`${environment.apiBaseUrl}/showtimes/${id}`).pipe(
      catchError(() => of(fallbackShowtimes.find((s) => s.id === id))),
      map((showtime) => showtime ?? null)
    );
  }
}
