export const rollRandom = (minNumber: number, maxNumber: number) => {
  return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
}