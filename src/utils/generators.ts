export const generateGuestID = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";

  // Genera un número aleatorio entre 5 y 8
  const length = Math.floor(Math.random() * (8 - 5 + 1)) + 5;

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
