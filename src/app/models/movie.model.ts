export interface Movie {
  id: number;
  title: string;
  genre: string;
  language: string;
  durationMinutes: number;
  rating: number;
  posterUrl: string;
  description: string;
  cast: string[];
  releaseDate: string;
}
