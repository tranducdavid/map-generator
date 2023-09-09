/**
 * A seedable random number generator (PRNG) based on a simple linear congruential generator.
 */
class SeedableRNG {
  private m: number
  private a: number
  private c: number
  private state: number

  /**
   * Constructs a new SeedableRNG instance with the provided seed.
   *
   * @param seed - The seed for the PRNG. If not provided, it defaults to a random number.
   */
  constructor(seed?: number) {
    this.m = 0x80000000
    this.a = 1103515245
    this.c = 12345
    this.state = seed !== undefined ? seed : Math.floor(Math.random() * (this.m - 1))
  }

  /**
   * Generates the next integer in the sequence.
   *
   * @returns The next integer.
   */
  nextInt(): number {
    this.state = (this.a * this.state + this.c) % this.m
    return this.state
  }

  /**
   * Generates the next floating-point number in the sequence between 0 (inclusive) and 1 (exclusive).
   *
   * @returns The next floating-point number.
   */
  nextFloat(): number {
    return this.nextInt() / (this.m - 1)
  }

  /**
   * Generates a random floating-point number between the provided `min` (inclusive) and `max` (exclusive).
   *
   * @param min - The minimum value (inclusive).
   * @param max - The maximum value (exclusive).
   * @returns A random float between `min` and `max`.
   */
  randomFloatInRange(min: number, max: number): number {
    return this.nextFloat() * (max - min) + min
  }
}

const rng = new SeedableRNG(1)

export const random = (min?: number, max?: number) =>
  min != null && max != null ? rng.randomFloatInRange(min, max) : rng.nextFloat()

/**
 * Shuffles an array of elements using the Fisher-Yates algorithm.
 *
 * @param arr - The array of generic type T to be shuffled.
 * @returns A new shuffled array of the same type.
 */
export const shuffle = <T>(arr: T[]): T[] => {
  const shuffledArr = [...arr]
  for (let i = shuffledArr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]]
  }
  return shuffledArr
}

/**
 * Gets a random element from an array.
 *
 * @param arr - The array of generic type T from which a random element will be retrieved.
 * @returns A random element from the array or `undefined` if the array is empty.
 */
export const sample = <T>(arr: T[]): T | undefined => {
  if (arr.length === 0) return undefined
  const index = Math.floor(random() * arr.length)
  return arr[index]
}
