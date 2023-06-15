export function shuffleArray<T>(a: Array<T>) {
  return a.sort(() => Math.random() - 0.5);
}
