export function sum(xx: number[]): number {
  let sum = 0;

  for (let i = 0; i < xx.length; i += 1) {
    sum += xx[i]!;
  }

  return sum;
}
