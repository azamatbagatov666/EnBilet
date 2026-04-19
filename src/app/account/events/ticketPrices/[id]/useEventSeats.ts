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


const isEditable = (seat: seatState) =>
  seat.status === "available" || seat.status === "blocked";

const validatePrices = () => {
  const errors: string[] = [];

  let invalidPrices = 0;

  for (const seat of Object.values(eventSeats)) {

    // 🚫 ignore locked seats completely
    if (!isEditable(seat)) continue;

    // price validation only for editable seats
    if (
      seat.price == null ||
      seat.price <= 0 ||
      Number.isNaN(seat.price)
    ) {
      invalidPrices++;
    }
  }

  if (invalidPrices > 0) {
    errors.push("Tüm satılabilir koltukların geçerli fiyatı olmalıdır.");
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

const setSeatPrice = (cellID: string, price: number) => {
  setEventSeats(prev => {
    const seat = prev[cellID];
    if (!seat || !canEdit(seat)) return prev;

    return {
      ...prev,
      [cellID]: { ...seat, price },
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
    const cellIDs = row.cells
      .filter(c => c.type === "seat")
      .map(c => c.id);

    const editableSeats = cellIDs
      .map(id => prev[id])
      .filter((s): s is seatState => !!s && canEdit(s));

    if (editableSeats.length === 0) return prev;

    const allBlocked = editableSeats.every(isBlocked);
    const next = { ...prev };

    editableSeats.forEach(seat => {
      next[seat.cellID] = {
        ...seat,
        status: allBlocked ? "available" : "blocked",
      };
    });

    return next;
  });
};
const toggleSeat = (cellID: string) => {
  setEventSeats(prev => {
    const seat = prev[cellID];
    if (!seat || !canEdit(seat)) return prev;

    return {
      ...prev,
      [cellID]: {
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