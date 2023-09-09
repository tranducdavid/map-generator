import _ from 'lodash'
import { GameMap, Point, TileType } from './types'
import {
  createCorridorRectangle,
  createGameMap,
  getDistance,
  getIntersectionsInCluster,
  getNeighbors,
  getUnvisitedNeighbors,
} from './utils'
import { random, sample } from './random'

/**
 * Grows a room from the specified origin point within a game map. The room growth process is limited by the specified maximum size.
 * It starts by setting the origin point as `ROOM_ORIGIN` and then tries to expand the room by converting adjacent `WALL` tiles to `ROOM` tiles.
 * The expansion process respects the constraints of the maximum size and has a safeguard for a maximum number of iterations.
 *
 * @param map - The game map in which the room is to be grown.
 * @param x - The x-coordinate of the origin point from where the room should start growing.
 * @param y - The y-coordinate of the origin point from where the room should start growing.
 * @param maxSize - The maximum size or number of tiles the room can grow to, including the origin.
 * @param maxRadius - The maximum radius around the starting point `(x, y)` within which the room can grow.
 * @returns A new game map with the grown room.
 *
 */
export const growRoom = (
  map: GameMap,
  x: number,
  y: number,
  maxSize: number,
  maxRadius: number,
): GameMap => {
  const newMap = _.cloneDeep(map)
  if (maxSize < 1) {
    return newMap
  }

  const overridableTileTypes = [TileType.WALL, TileType.CORRIDOR]
  const points: Point[] = [{ x, y }]
  const iterationsMax = 10000 // max iterations
  let size = 0
  let iteration = 0

  while (points.length && size < maxSize && iteration < iterationsMax) {
    iteration++

    const current = sample(points)!
    _.remove(points, (point) => point === current)

    const isOverridableTile =
      newMap.tiles[current.x][current.y] === TileType.WALL ||
      newMap.tiles[current.x][current.y] === TileType.CORRIDOR
    const isWithinDistance = getDistance(current, { x, y }) <= maxRadius
    if (isOverridableTile && isWithinDistance) {
      newMap.tiles[current.x][current.y] = TileType.ROOM
      size++

      const neighbors = getUnvisitedNeighbors(current.x, current.y, newMap, 1, overridableTileTypes)
      neighbors.forEach((neighbor) => points.push(neighbor))
    }
  }

  newMap.tiles[x][y] = TileType.ROOM_ORIGIN

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

  return map
}

/**
 * Removes isolated corridor tiles that do not connect to any room or room-origin tiles.
 *
 * The function uses a flood fill algorithm that starts from `ROOM_ORIGIN` tiles and then
 * propagates to adjacent corridor tiles. After the flood fill, any corridor tiles that
 * were not visited are considered isolated and are thus transformed back to `WALL` tiles.
 *
 * @param {GameMap} map - The input game map with tiles information.
 * @returns {GameMap} A new game map with isolated corridor tiles removed.
 *
 * @example
 * const newMap = removeIsolatedCorridors(oldMap);
 */
export const removeIsolatedCorridors = (map: GameMap): GameMap => {
  const newMap = _.cloneDeep(map)
  const visited: boolean[][] = Array(newMap.tiles.length)
    .fill(null)
    .map(() => Array(newMap.tiles[0].length).fill(false))

  // Flood fill starting from rooms or room origins
  const floodFill = (x: number, y: number) => {
    if (visited[x][y] || newMap.tiles[x][y] === TileType.WALL) {
      return
    }

    visited[x][y] = true

    if (
      newMap.tiles[x][y] === TileType.CORRIDOR ||
      newMap.tiles[x][y] === TileType.ROOM ||
      newMap.tiles[x][y] === TileType.ROOM_ORIGIN
    ) {
      for (const neighbor of getNeighbors(x, y, newMap)) {
        floodFill(neighbor.x, neighbor.y)
      }
    }
  }

  // Start the flood fill from all room-origin tiles (or any room tile)
  for (let x = 0; x < newMap.tiles.length; x++) {
    for (let y = 0; y < newMap.tiles[0].length; y++) {
      if (newMap.tiles[x][y] === TileType.ROOM_ORIGIN) {
        floodFill(x, y)
      }
    }
  }

  return {
    ...newMap,
    // Any corridor tile that wasn't visited during the flood fill is isolated
    tiles: newMap.tiles.map((row, x) =>
      row.map((tile, y) => {
        if (!visited[x][y] && tile === TileType.CORRIDOR) {
          return TileType.WALL
        }
        return tile
      }),
    ),
  }
}

/**
 * Constructs a corridor between two points on the game map.
 *
 * This function connects two points by constructing a straight corridor. The corridor is
 * created in a Manhattan style, meaning it will first move horizontally and then
 * vertically, or vice versa, depending on the relative positions of the two points.
 *
 * @param map - The game map on which the corridor is to be constructed.
 * @param start - The starting point of the corridor.
 * @param end - The ending point of the corridor.
 * @param corridorStep - The size variable which determines the width and height of the corridor rectangle.
 * @returns The updated game map with the new corridor.
 */
export const constructCorridor = (
  map: GameMap,
  start: Point,
  end: Point,
  corridorStep: number,
): GameMap => {
  let newMap = _.cloneDeep(map)

  // Decide the direction of the corridor based on the relative positions of the two points
  if (random() > 0.5) {
    newMap = constructHorizontal(newMap, start, end, corridorStep)
    newMap = constructVertical(newMap, { x: end.x, y: start.y }, end, corridorStep)
  } else {
    newMap = constructVertical(newMap, start, end, corridorStep)
    newMap = constructHorizontal(newMap, { x: start.x, y: end.y }, end, corridorStep)
  }

  return newMap
}

// Helper function to construct a horizontal segment of the corridor
const constructHorizontal = (
  map: GameMap,
  start: Point,
  end: Point,
  corridorStep: number,
): GameMap => {
  let newMap = _.cloneDeep(map)

  const startX = Math.min(start.x, end.x)
  const endX = Math.max(start.x, end.x)

  for (let x = startX; x <= endX; x++) {
    newMap = createCorridorRectangle(
      newMap,
      x,
      start.y,
      corridorStep,
      TileType.CORRIDOR,
      TileType.WALL,
    )
  }

  return newMap
}

// Helper function to construct a vertical segment of the corridor
const constructVertical = (
  map: GameMap,
  start: Point,
  end: Point,
  corridorStep: number,
): GameMap => {
  let newMap = _.cloneDeep(map)

  const startY = Math.min(start.y, end.y)
  const endY = Math.max(start.y, end.y)

  for (let y = startY; y <= endY; y++) {
    newMap = createCorridorRectangle(
      newMap,
      start.x,
      y,
      corridorStep,
      TileType.CORRIDOR,
      TileType.WALL,
    )
  }

  return newMap
}

/**
 * Connects isolated clusters together by constructing corridors between nearest intersection points.
 *
 * This function ensures that the number of corridors constructed is minimized by employing a strategy
 * similar to the Minimum Spanning Tree.
 *
 * @param {GameMap} map - The map containing the isolated clusters.
 * @param {Point[][]} clusters - The isolated clusters to be connected.
 * @param wallStep - The interval at which tiles are checked for intersections.
 * @param corridorStep - The size variable which determines the width and height of the corridor rectangle.
 */
export const connectClusters = (
  map: GameMap,
  clusters: Point[][],
  wallStep: number,
  corridorStep: number,
): GameMap => {
  let newMap = _.cloneDeep(map)
  const newClusters = _.cloneDeep(clusters)

  while (newClusters.length > 1) {
    let nearestClusterIndex = -1
    let currentClusterIndex = 0
    let minDistance = Infinity
    let start: Point = { x: 0, y: 0 }
    let end: Point = { x: 0, y: 0 }

    const currentCluster = newClusters[currentClusterIndex]

    // Find the nearest cluster
    for (let i = 0; i < newClusters.length; i++) {
      if (i !== currentClusterIndex) {
        const possibleStart = getIntersectionsInCluster(
          newMap,
          currentCluster,
          wallStep,
          corridorStep,
        )
        const possibleEnd = getIntersectionsInCluster(
          newMap,
          newClusters[i],
          wallStep,
          corridorStep,
        )

        for (const s of possibleStart) {
          for (const e of possibleEnd) {
            const distance = getDistance(s, e)
            if (distance < minDistance) {
              minDistance = distance
              start = s
              end = e
              nearestClusterIndex = i
            }
          }
        }
      }
    }

    // Connect the current cluster to the nearest cluster
    console.log('Construct Corridor', { start, end })
    newMap = constructCorridor(newMap, start, end, corridorStep)

    // Remove the current cluster from the list
    newClusters.splice(currentClusterIndex, 1)

    // If the nearest cluster is after the current in the list, decrement its index due to the splice
    if (nearestClusterIndex > currentClusterIndex) {
      nearestClusterIndex--
    }

    // Set the nearest cluster as the new current cluster
    currentClusterIndex = nearestClusterIndex
  }

  return newMap
}
