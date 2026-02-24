import type { SeatRow } from "@/src/models/seatMap/SeatRow";


export interface SeatMap {
  id: string;
  name: string;

  venueId: number;
  venueName: string;

  blockId: number;
  blockName: string;


  rows: SeatRow[];
}
