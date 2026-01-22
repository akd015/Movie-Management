export interface Booking {
  id: number;
  movieId: number;
  showtimeId: number;
  theatreId: number;
  seats: string[];
  customerName: string;
  email: string;
  phone: string;
  totalAmount: number;
  bookedAt: string;
}
