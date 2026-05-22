export interface EventType {
  eventID?: number;
  showID: number;
  mapID: number;
  venueID: number;
  city: string;
  date: string;
  ticketSale: boolean;
  isPublic: boolean;
  created_at?: Date;
  updated_at?: Date;
  imageKey?: string | null;
  imageThumbKey?: string | null;

  // display-only
  showName?: string;
  venueName?: string;
  soldTickets?: string;
}
