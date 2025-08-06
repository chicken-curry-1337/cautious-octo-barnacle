export const randomInRange = (min: number, max: number): number => {
  const low = Math.ceil(min);
  const high = Math.floor(max);

  return Math.floor(Math.random() * (high - low + 1)) + low;
};
