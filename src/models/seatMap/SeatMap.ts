import type { SeatRow } from "@/src/models/seatMap/SeatRow";

export type stageLocation = "up" | "down";

export interface SeatMap {
  id: string;
  name: string;

  venueId: number;
  venueName: string;

  blockId: number;
  blockName: string;

  stageLocation: stageLocation;

  rows: SeatRow[];
}
