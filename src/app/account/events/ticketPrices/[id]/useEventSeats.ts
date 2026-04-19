import type { SeatRow } from "@/src/models/seatMap/SeatRow";
import type { seatState } from "@/src/models/seatMap/seatState";


export function useEventSeats(

    
    
  eventSeats: Record<string, seatState>,
  setEventSeats: React.Dispatch<React.SetStateAction<Record<string, seatState>>>
) {

    const canEdit = (seat: seatState) =>
  seat.status === "available" || seat.status === "blocked";

const isBlocked = (seat: seatState) =>
  seat.status === "blocked";

    
const setAllPrices = (price: number) => {
  setEventSeats(prev =>
    Object.fromEntries(
      Object.entries(prev).map(([id, seat]) => [
        id,
        canEdit(seat) ? { ...seat, price } : seat,
      ])
    )
  );
};


const validatePrices = () => {
  const errors: string[] = [];

  for (const seat of Object.values(eventSeats)) {
    // Safety net only — shouldn't be possible via UI
    if (seat.status === "sold") {
      errors.push(`Sold seat ${seat.seatId} cannot be modified`);
      continue;
    }

    // Blocked seats must be free
    if (seat.status === "blocked") {
      if (seat.price !== 0) {
        errors.push(`Blocked seat ${seat.seatId} must have price 0`);
      }
      continue;
    }

    // Sellable seats must have price
    if (seat.price == null || seat.price <= 0) {
      errors.push(`Seat ${seat.seatId} must have a valid price`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const setRowPrice = (row: SeatRow, price: number) => {
  setEventSeats(prev => {
    const next = { ...prev };

    row.cells.forEach(cell => {
      if (cell.type !== "seat") return;

      const seat = next[cell.id];
      if (!seat || !canEdit(seat)) return;

      next[cell.id] = { ...seat, price };
    });

    return next;
  });
};

const setSeatPrice = (seatId: string, price: number) => {
  setEventSeats(prev => {
    const seat = prev[seatId];
    if (!seat || !canEdit(seat)) return prev;

    return {
      ...prev,
      [seatId]: { ...seat, price },
    };
  });
};

const toggleAll = () => {
  setEventSeats(prev => {
    const editableSeats = Object.values(prev).filter(canEdit);
    if (editableSeats.length === 0) return prev;

    const allBlocked = editableSeats.every(isBlocked);

    return Object.fromEntries(
      Object.entries(prev).map(([id, seat]) => [
        id,
        canEdit(seat)
          ? {
              ...seat,
              status: allBlocked ? "available" : "blocked",
            }
          : seat,
      ])
    );
  });
};

const toggleRow = (row: SeatRow) => {
  setEventSeats(prev => {
    const seatIds = row.cells
      .filter(c => c.type === "seat")
      .map(c => c.id);

    const editableSeats = seatIds
      .map(id => prev[id])
      .filter((s): s is seatState => !!s && canEdit(s));

    if (editableSeats.length === 0) return prev;

    const allBlocked = editableSeats.every(isBlocked);
    const next = { ...prev };

    editableSeats.forEach(seat => {
      next[seat.seatId] = {
        ...seat,
        status: allBlocked ? "available" : "blocked",
      };
    });

    return next;
  });
};
const toggleSeat = (seatId: string) => {
  setEventSeats(prev => {
    const seat = prev[seatId];
    if (!seat || !canEdit(seat)) return prev;

    return {
      ...prev,
      [seatId]: {
        ...seat,
        status: seat.status === "blocked" ? "available" : "blocked",
      },
    };
  });
};

  return {
    setAllPrices,
    setRowPrice,
    setSeatPrice,
    toggleAll,
    toggleRow,
    toggleSeat,
    validatePrices,
  };
}