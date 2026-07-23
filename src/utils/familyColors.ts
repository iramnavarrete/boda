export interface FamilyColor {
  bg: string;
  border: string;
}

// Una súper paleta de 40 colores cuidadosamente seleccionados
// para que tengan buen contraste y luzcan elegantes en la UI.
const EXTENDED_PALETTE: FamilyColor[] = [
  { bg: "#FFB3BA", border: "#FF8B94" }, // 1. Rosa pastel
  { bg: "#BAE1FF", border: "#8BCAFF" }, // 2. Azul claro
  { bg: "#BAFFC9", border: "#8BFF9E" }, // 3. Verde menta
  { bg: "#FFFFBA", border: "#F5D061" }, // 4. Amarillo pastel
  { bg: "#E0BBE4", border: "#C596CE" }, // 5. Lila
  { bg: "#FFDFBA", border: "#FFC28B" }, // 6. Naranja pastel
  { bg: "#D2E5D0", border: "#9DBE9A" }, // 7. Verde olivo claro
  { bg: "#A4DFD6", border: "#6FB5AA" }, // 8. Turquesa agua (Reemplazó al Salmón)
  { bg: "#B5EAEC", border: "#74C6CB" }, // 9. Cyan pastel
  { bg: "#E2F0CB", border: "#B5D596" }, // 10. Lima claro
  { bg: "#FFC4E1", border: "#FF8FBC" }, // 11. Magenta suave
  { bg: "#C1E1C1", border: "#8CC68C" }, // 12. Verde jade pastel
  { bg: "#FDFD96", border: "#E5E55A" }, // 13. Amarillo limón
  { bg: "#CBAACB", border: "#A27AA2" }, // 14. Púrpura apagado
  { bg: "#FF9CEE", border: "#FF5CD8" }, // 15. Rosa chicle
  { bg: "#AEC6CF", border: "#759CB0" }, // 16. Azul pizarra
  { bg: "#F49AC2", border: "#DB6E9C" }, // 17. Rosa frambuesa claro
  { bg: "#77DD77", border: "#4CB84C" }, // 18. Verde manzana
  { bg: "#CFCFC4", border: "#A6A69A" }, // 19. Gris cálido
  { bg: "#B39EB5", border: "#856B88" }, // 20. Morado cenizo
  { bg: "#FFD1DC", border: "#FF99B0" }, // 21. Rosa durazno
  { bg: "#8FCACA", border: "#5E9E9E" }, // 22. Teal claro
  { bg: "#C6E2FF", border: "#99C5F5" }, // 23. Azul hielo (Reemplazó al Rojo Coral)
  { bg: "#CB99C9", border: "#9D6A9B" }, // 24. Lavanda
  { bg: "#FDF9C4", border: "#DCD57C" }, // 25. Vainilla
  { bg: "#9ACEEB", border: "#65A1C2" }, // 26. Azul cielo
  { bg: "#FFFACD", border: "#D1CC97" }, // 27. Limón chifón (Reemplazó al Terracota rojizo)
  { bg: "#E2D1F9", border: "#B59DE0" }, // 28. Violeta claro
  { bg: "#31A2AC", border: "#227C84" }, // 29. Turquesa medio
  { bg: "#DFCFBE", border: "#B5A492" }, // 30. Arena / Beige
  { bg: "#98FB98", border: "#5BCE5B" }, // 31. Verde pálido
  { bg: "#E6A8D7", border: "#B873A7" }, // 32. Orquídea pastel
  { bg: "#F5F5DC", border: "#CACAAB" }, // 33. Crema
  { bg: "#84B6F4", border: "#5890D8" }, // 34. Azul aciano
  { bg: "#C4C3D0", border: "#9B9AA8" }, // 35. Bígaro suave (Reemplazó al Rosa palo/rojo)
  { bg: "#F0E68C", border: "#C4BA59" }, // 36. Caqui claro
  { bg: "#B2ECA1", border: "#87C673" }, // 37. Verde primavera (Reemplazó al Óxido pastel)
  { bg: "#76D7C4", border: "#4EAA98" }, // 38. Aguamarina
  { bg: "#D7BDE2", border: "#9D77AA" }, // 39. Uva claro
  { bg: "#A9DFBF", border: "#6CA884" }, // 40. Verde bosque claro
  { bg: "#C7CEEA", border: "#9BA4D3" }, // 41. Índigo pastel
  { bg: "#B2D3C2", border: "#85AC98" }, // 42. Verde espuma de mar
  { bg: "#FCE883", border: "#D1BA4D" }, // 43. Amarillo mostaza suave
  { bg: "#DDA0DD", border: "#B47DB4" }, // 44. Ciruela claro
  { bg: "#E3F988", border: "#BAD162" }, // 45. Verde lima vibrante
  { bg: "#AFEEEE", border: "#7FC7C7" }, // 46. Azul glacial
  { bg: "#FFDAB9", border: "#D9AC88" }, // 47. Durazno pálido (sin rojo)
  { bg: "#E8D1ED", border: "#C3A5C9" }, // 48. Lavanda rubor
  { bg: "#ACE1AF", border: "#7EBA82" }, // 49. Verde celadón
  { bg: "#EEE8AA", border: "#C2B872" }, // 50. Vara de oro pálida
];

/**
 * Devuelve un par de colores (fondo y borde) basado en el índice proporcionado.
 * Usa un ciclo infinito seguro, soportando 200, 500 o 1000 familias.
 */
export const getFamilyColorByIndex = (index: number): FamilyColor => {
  return EXTENDED_PALETTE[index % EXTENDED_PALETTE.length];
};
