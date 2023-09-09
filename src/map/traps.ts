import { GameMap, Point, TileType } from '../types'
import { shuffle } from '../utils/random'
import { isTileAdjacentToType } from './common'

/**
 * Randomly places traps of type `TRAP_PITFALL` in a percentage of corridor tiles on the game map.
 * Ensures traps are not placed adjacent to secret corridors.
 *
 * @param {GameMap} map - The game map to place traps on.
 * @param {number} trapPercentage - The percentage (0-100) of corridor tiles to turn into traps.
 * @returns {GameMap} The game map with traps placed.
 *
 * @example
 * const gameMapWithTraps = placeTraps(gameMap, 10);  // Turns 10% of corridor tiles into traps
 */
export const placeTraps = (map: GameMap, trapPercentage: number): GameMap => {
  const corridorPoints: Point[] = []

  // Collect all corridor tiles that aren't adjacent to secret corridors
  for (let x = 0; x < map.tiles.length; x++) {
    for (let y = 0; y < map.tiles[x].length; y++) {
      if (
        map.tiles[x][y] === TileType.CORRIDOR &&
        !isTileAdjacentToType({ x, y }, map, TileType.SECRET_CORRIDOR)
      ) {
        corridorPoints.push({ x, y })
      }
    }
  }

  const totalTraps = Math.floor(corridorPoints.length * (trapPercentage / 100))

  // Shuffle the corridor points array to randomize trap placement
  const shuffledCorridorPoints = shuffle(corridorPoints)

  // Place the traps
  for (let i = 0; i < totalTraps; i++) {
    const { x, y } = shuffledCorridorPoints[i]
    map.tiles[x][y] = TileType.TRAP_PITFALL
  }

  return map
}
