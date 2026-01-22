export interface Showtime {
  id: number;
  movieId: number;
  theatreId: number;
  startTime: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  screenName?: string;
  isPremium?: boolean;
}
