import { GameMap, Point, TileType } from './types'
import { createCorridorRectangle, createGameMap } from './utils'

/**
 * Fetches unvisited neighboring tiles for a given point.
 *
 * @param x - The x-coordinate of the tile.
 * @param y - The y-coordinate of the tile.
 * @param map - The current game map.
 * @param step - The step distance to check for neighboring tiles.
 * @returns An array of unvisited neighboring points.
 */
const getUnvisitedNeighbors = (x: number, y: number, map: GameMap, step: number): Point[] => {
  const neighbors: Point[] = []
  if (y > step - 1 && map.tiles[x][y - step] === TileType.WALL) {
    neighbors.push({ x, y: y - step }) // North
  }
  if (x < map.tiles.length - step && map.tiles[x + step][y] === TileType.WALL) {
    neighbors.push({ x: x + step, y }) // East
  }
  if (y < map.tiles[0].length - step && map.tiles[x][y + step] === TileType.WALL) {
    neighbors.push({ x, y: y + step }) // South
  }
  if (x > step - 1 && map.tiles[x - step][y] === TileType.WALL) {
    neighbors.push({ x: x - step, y }) // West
  }

  return neighbors
}

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

  while (stack.length > 0) {
    const current = stack.pop()!
    const neighbors = getUnvisitedNeighbors(current.x, current.y, map, wallStep)

    if (neighbors.length) {
      stack.push(current)

      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)]
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

  return map
}
