export type SeatStatus =
  | "available"
  | "reserved"
  | "sold"
  | "blocked";

export interface seatState {
  seatId: string;
  price: number;
  status: SeatStatus;
}