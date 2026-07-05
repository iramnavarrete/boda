export const highlightSeats = (type: "guest" | "family", id: string) => {
  const seats = document.querySelectorAll(`[data-${type}-id="${id}"]`);
  seats.forEach((seat) => seat.setAttribute("data-highlighted", "true"));
};

export const removeHighlightSeats = (type: "guest" | "family", id: string) => {
  const seats = document.querySelectorAll(`[data-${type}-id="${id}"]`);
  seats.forEach((seat) => seat.removeAttribute("data-highlighted"));
};
