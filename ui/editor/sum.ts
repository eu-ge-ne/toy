export function sum(values: number[]): number {
  let sum = 0;

  for (let i = 0; i < values.length; i += 1) {
    sum += values[i]!;
  }

  return sum;
}
