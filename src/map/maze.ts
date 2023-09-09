import { GameMap, TileType, Point } from '../types'
import { createGameMap, getUnvisitedNeighbors } from './common'
import { random } from '../utils/random'
import { createCorridorRectangle } from './corridors'
import { profile } from '../utils/profiling'

/**
 * Generates a maze with adjustable wall and corridor thickness.
 *
 * @param width - The desired width of the maze. Rounds up to nearest upper width.
 * @param height - The desired height of the maze. Rounds up to nearest upper height.
 * @param wallStep - The thickness of the walls.
 * @param corridorStep - The thickness of the corridors.
 * @returns A procedurally generated maze `GameMap`.
 */
export const generateMaze = (
  width: number,
  height: number,
  wallStep: number,
  corridorStep: number,
): GameMap => {
  const nearestLargerWidth = (Math.floor(width / wallStep) + 1) * wallStep + corridorStep
  const nearestLargerHeight = (Math.floor(height / wallStep) + 1) * wallStep + corridorStep
  let map = createGameMap(nearestLargerWidth, nearestLargerHeight, TileType.WALL)

  const stack: Point[] = []
  const startX = 0 + Math.floor(corridorStep / 2)
  const startY = 0 + Math.floor(corridorStep / 2)

  map = createCorridorRectangle(map, startX, startY, corridorStep)
  stack.push({ x: startX, y: startY })

  profile(() => {
    while (stack.length > 0) {
      const current = stack.pop()!
      const neighbors = getUnvisitedNeighbors(current.x, current.y, map, wallStep)

      if (neighbors.length) {
        stack.push(current)

        const randomNeighbor = neighbors[Math.floor(random() * neighbors.length)]
        const dx = (randomNeighbor.x - current.x) / 2
        const dy = (randomNeighbor.y - current.y) / 2

        for (let i = 1; i < wallStep; i++) {
          const x = current.x + i * Math.sign(dx)
          const y = current.y + i * Math.sign(dy)
          map = createCorridorRectangle(map, x, y, corridorStep)
        }
        map = createCorridorRectangle(map, randomNeighbor.x, randomNeighbor.y, corridorStep)

        stack.push(randomNeighbor)
      }
    }
  })()

  return map
}
