import { Pipe, PipeTransform } from '@angular/core';
import { Movie } from '../models';

export interface MovieFilterCriteria {
  genre?: string;
  language?: string;
  minRating?: number;
  query?: string;
}

@Pipe({
  name: 'movieFilter',
  standalone: true
})
export class MovieFilterPipe implements PipeTransform {
  transform(movies: Movie[] = [], criteria?: MovieFilterCriteria): Movie[] {
    if (!criteria) {
      return movies;
    }

    const normalizedQuery = criteria.query?.toLowerCase().trim();

    return movies.filter((movie) => {
      const matchesGenre = criteria.genre ? movie.genre === criteria.genre : true;
      const matchesLanguage = criteria.language ? movie.language === criteria.language : true;
      const matchesRating = criteria.minRating ? movie.rating >= criteria.minRating : true;
      const matchesQuery = normalizedQuery
        ? movie.title.toLowerCase().includes(normalizedQuery) ||
          movie.genre.toLowerCase().includes(normalizedQuery) ||
          movie.language.toLowerCase().includes(normalizedQuery)
        : true;
      return matchesGenre && matchesLanguage && matchesRating && matchesQuery;
    });
  }
}
