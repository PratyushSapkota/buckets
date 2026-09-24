export function columnToLetter(columnIndex: number) {
  let value = columnIndex + 1;
  let result = "";

  while (value > 0) {
    value--;
    result =
      String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }

  return result;
}