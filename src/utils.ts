import _ from 'lodash'
import { GameMap, Point, TileType } from './types'

/**
 * Creates a game map with specified dimensions.
 *
 * @param width - The width of the game map.
 * @param height - The height of the game map.
 * @param defaultTileType - The default tile type to initialize the map with. Defaults to `null`.
 * @returns A new `GameMap` object with the specified dimensions and initialized tiles and edges.
 *
 * @example
 * const map = createGameMap(10, 10, TileType.WALL);
 */
export const createGameMap = (
  width: number,
  height: number,
  defaultTileType: TileType | null = null,
): GameMap => {
  const tiles = _.times(width, () => _.times(height, () => defaultTileType))
  const edges = _.times(width, () => _.times(height, () => null))

  return {
    tiles,
    edges,
  }
}

/**
 * Returns a new map with a rectangle of a specified tile type positioned at the given coordinates.
 * The original map remains unchanged.
 *
 * @param map - The original game map.
 * @param x - The x-coordinate of the top-left corner of the rectangle.
 * @param y - The y-coordinate of the top-left corner of the rectangle.
 * @param width - The width of the rectangle.
 * @param height - The height of the rectangle.
 * @param tileType - The type of tile to fill the rectangle with.
 * @returns A new game map with the specified rectangle.
 *
 * @example
 * const updatedMap = createRectangleInMap(globalMap, 5, 5, 3, 3, TileType.CORRIDOR);
 */
export const createRectangleInMap = (
  map: GameMap,
  x: number,
  y: number,
  width: number,
  height: number,
  tileType: TileType,
): GameMap => {
  // Deep clone the entire map using lodash
  const newMap = _.cloneDeep(map)

  // Calculate the bottom-right coordinates of the rectangle
  const xEnd = x + width - 1
  const yEnd = y + height - 1

  // Iterate through the tiles in the rectangle and set them to the specified tileType
  for (let i = x; i <= xEnd; i++) {
    for (let j = y; j <= yEnd; j++) {
      // Check to ensure the indices are within the bounds of the map
      if (i >= 0 && i < newMap.tiles.length && j >= 0 && j < newMap.tiles[0].length) {
        newMap.tiles[i][j] = tileType
      }
    }
  }

  return newMap
}

/**
 * Returns a new map with a rectangle of type `TileType.CORRIDOR` centered at the given coordinates.
 * The original map remains unchanged. The size of the rectangle is based on the `corridorStep`.
 *
 * @param map - The original game map.
 * @param x - The x-coordinate of the top-left corner of the rectangle.
 * @param y - The y-coordinate of the top-left corner of the rectangle.
 * @param corridorStep - The size variable which determines the width and height of the corridor rectangle.
 * @returns A new game map with the corridor rectangle.
 *
 * @example
 * const updatedMap = createCorridorRectangle(map, 5, 5, 3);
 */
export const createCorridorRectangle = (
  map: GameMap,
  x: number,
  y: number,
  corridorStep: number,
): GameMap => {
  return createRectangleInMap(
    map,
    x - Math.floor(corridorStep / 2),
    y - Math.floor(corridorStep / 2),
    corridorStep,
    corridorStep,
    TileType.CORRIDOR,
  )
}

/**
 * Retrieves possible intersection points from the given game map based on a specified wall step.
 *
 * This function scans the map tiles in intervals defined by `wallStep` to identify possible
 * locations for intersections. For example, if `wallStep` is 2, it would check every other tile
 * on the map for possible intersections.
 *
 * @param map - The game map to be scanned for possible intersections.
 * @param wallStep - The interval at which tiles are checked for possible intersections.
 * @returns An array of points indicating possible intersection locations.
 */
export const getPossibleIntersections = (map: GameMap, wallStep: number): Point[] => {
  const points = []
  for (let x = 0; x < map.tiles.length - 1; x = x + wallStep) {
    for (let y = 0; y < map.tiles[0].length - 1; y = y + wallStep) {
      points.push({ x, y })
    }
  }

  return points
}

/**
 * Fetches unvisited neighboring tiles for a given point.
 *
 * @param x - The x-coordinate of the tile.
 * @param y - The y-coordinate of the tile.
 * @param map - The current game map.
 * @param step - The step distance to check for neighboring tiles.
 * @param unvisitedType - The type of unvisited tile.
 * @returns An array of unvisited neighboring points.
 */
export const getUnvisitedNeighbors = (
  x: number,
  y: number,
  map: GameMap,
  step: number,
  unvisitedTypes: TileType[] = [TileType.WALL],
): Point[] => {
  const neighbors: Point[] = []
  if (y > step - 1 && unvisitedTypes.includes(map.tiles[x][y - step]!)) {
    neighbors.push({ x, y: y - step }) // North
  }
  if (x < map.tiles.length - step && unvisitedTypes.includes(map.tiles[x + step][y]!)) {
    neighbors.push({ x: x + step, y }) // East
  }
  if (y < map.tiles[0].length - step && unvisitedTypes.includes(map.tiles[x][y + step]!)) {
    neighbors.push({ x, y: y + step }) // South
  }
  if (x > step - 1 && unvisitedTypes.includes(map.tiles[x - step][y]!)) {
    neighbors.push({ x: x - step, y }) // West
  }

  return neighbors
}

/**
 * Calculates the Euclidean distance between two points.
 *
 * @param p1 - The first point.
 * @param p2 - The second point.
 * @returns The distance between the two provided points.
 */
export const getDistance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx ** 2 + dy ** 2)
}

/**
 * Finds the nearest tile of the specified type from a given starting point using Pythagorean distance.
 *
 * @param map - The game map to search within.
 * @param startX - The starting x coordinate.
 * @param startY - The starting y coordinate.
 * @param targetType - The type of tile we're searching for.
 * @param ignoreStartTile - Flag indicating whether to ignore the tile at the starting coordinates. Defaults to true.
 * @returns The point (x, y) of the nearest tile of the specified type, or null if no such tile is found.
 */
export const findNearestTile = (
  map: GameMap,
  startX: number,
  startY: number,
  targetType: TileType,
  ignoreStartTile: boolean = true,
): Point | null => {
  let nearestPoint: Point | null = null
  let shortestDistance = Infinity

  for (let x = 0; x < map.tiles.length; x++) {
    for (let y = 0; y < map.tiles[x].length; y++) {
      if (ignoreStartTile && x === startX && y === startY) {
        continue
      }
      if (map.tiles[x][y] === targetType) {
        const distance = getDistance({ x: startX, y: startY }, { x, y })
        if (distance < shortestDistance) {
          shortestDistance = distance
          nearestPoint = { x, y }
        }
      }
    }
  }

  return nearestPoint
}

/**
 * Checks if a point is within a specified distance from the border of the map.
 *
 * @param map - The game map to check within.
 * @param point - The point to check.
 * @param distance - The distance from the border.
 * @returns A boolean indicating whether the point is within the specified distance from the map's border.
 */
export const isWithinDistanceFromBorder = (
  map: GameMap,
  point: Point,
  distance: number,
): boolean => {
  const { x, y } = point
  const maxX = map.tiles.length - 1
  const maxY = map.tiles[0].length - 1

  return x <= distance || y <= distance || x >= maxX - distance || y >= maxY - distance
}
