export type SeatStatus =
  | "available"
  | "reserved"
  | "sold"
  | "blocked";

export interface seatState {
  cellID: string;
  price: number;
  status: SeatStatus;
}