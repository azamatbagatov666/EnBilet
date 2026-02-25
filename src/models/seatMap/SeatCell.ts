export type CellType = "seat" | "space";
export type SeatKind = "regular" | "handicapped";


export interface SeatCell {
  id: string;
  type: CellType;
  label?: string; // only for seats
  seatKind?: SeatKind; // only if type === "seat"

}
