export type SeatStatus = 'available' | 'reserved' | 'selected' | 'booked';

export interface Seat {
  id: string;
  label: string;
  row: string;
  number: number;
  status: SeatStatus;
  isPremium?: boolean;
}
