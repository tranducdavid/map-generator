import _ from 'lodash'
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
 * Randomly grows a room from a starting point, attempting to make it look more natural.
 *
 * @param map - The current game map.
 * @param startX - The x-coordinate of the starting point.
 * @param startY - The y-coordinate of the starting point.
 * @param maxRoomSize - The maximum size of the room.
 * @returns A new game map with the room added.
 */
const growRoom = (map: GameMap, startX: number, startY: number, maxRoomSize: number): GameMap => {
  let newMap = _.cloneDeep(map)
  let roomTiles: Point[] = [{ x: startX, y: startY }]
  let roomSize = 1

  while (roomSize < maxRoomSize && roomTiles.length) {
    const currentTile = roomTiles.shift()!

    const neighbors = [
      { x: currentTile.x + 1, y: currentTile.y },
      { x: currentTile.x - 1, y: currentTile.y },
      { x: currentTile.x, y: currentTile.y + 1 },
      { x: currentTile.x, y: currentTile.y - 1 },
    ]

    for (const neighbor of neighbors) {
      // Check if the neighbor is within the map bounds and is a wall.
      if (
        neighbor.x >= 0 &&
        neighbor.x < newMap.tiles.length &&
        neighbor.y >= 0 &&
        neighbor.y < newMap.tiles[0].length &&
        newMap.tiles[neighbor.x][neighbor.y] === TileType.WALL
      ) {
        // Randomize the inclusion of neighbors to make the room look more "organic"
        if (Math.random() > 0.2) {
          newMap.tiles[neighbor.x][neighbor.y] = TileType.CORRIDOR
          roomTiles.push(neighbor)
          roomSize++
        }
      }
    }
  }

  return newMap
}

/**
 * Adds organic rooms to the generated maze.
 *
 * @param map - The current game map.
 * @param numberOfRooms - Number of rooms to add.
 * @returns A new game map with rooms added.
 */
const addRoomsToMaze = (map: GameMap, numberOfRooms: number): GameMap => {
  let newMap = _.cloneDeep(map)
  for (let i = 0; i < numberOfRooms; i++) {
    // Random starting point
    const startX = Math.floor(Math.random() * newMap.tiles.length)
    const startY = Math.floor(Math.random() * newMap.tiles[0].length)

    // Random room size
    const maxRoomSize = Math.floor(Math.random() * 40) + 10 // e.g. rooms between 10 and 50 tiles

    // If the starting point is a wall, start growing the room.
    if (newMap.tiles[startX][startY] === TileType.WALL) {
      newMap = growRoom(newMap, startX, startY, maxRoomSize)
    }
  }
  return newMap
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

  return addRoomsToMaze(map, 3)
}
