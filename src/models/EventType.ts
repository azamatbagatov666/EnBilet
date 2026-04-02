export interface EventType  {
  eventID?: number;
  showID: number;
  venueID: number;
  city: string;
  date: string;
  ticketsale: boolean;
  ispublic: boolean;

  // display-only
  showName?: string;
  venueName?: string;
};

