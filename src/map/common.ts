import _ from 'lodash'
import { EdgeType, GameMap, Point, TileType } from '../types'

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
  const edges = _.times(width, () => _.times(height, () => ({})))

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
 * @param replaceType - Optional. The tile type to be replaced. If specified, only tiles of this type will be replaced.
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
  replaceType?: TileType,
): GameMap => {
  const newMap = _.cloneDeep(map)
  const xEnd = x + width - 1
  const yEnd = y + height - 1

  for (let i = x; i <= xEnd; i++) {
    for (let j = y; j <= yEnd; j++) {
      if (isWithinBounds(i, j, newMap)) {
        if (replaceType === undefined || newMap.tiles[i][j] === replaceType) {
          newMap.tiles[i][j] = tileType
        }
      }
    }
  }

  return newMap
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
  const points: Point[] = []
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

/**
 * Retrieves the neighboring tiles of a given point on the game map.
 *
 * The function typically checks for tiles immediately adjacent to the given point.
 * This may include tiles above, below, to the left, and to the right of the point.
 *
 * @param {number} x - The x-coordinate of the point.
 * @param {number} y - The y-coordinate of the point.
 * @param {GameMap} map - The game map to search for neighbors.
 * @returns {Point[]} An array of neighboring points.
 *
 * @example
 * const neighbors = getNeighbors(5, 5, gameMap);
 */
export const getNeighbors = (x: number, y: number, map: GameMap): Point[] => {
  const directions = [
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
  ]
  const neighbors: Point[] = []

  for (const dir of directions) {
    const newX = x + dir.x
    const newY = y + dir.y
    if (newX >= 0 && newY >= 0 && newX < map.tiles.length && newY < map.tiles[0].length) {
      neighbors.push({ x: newX, y: newY })
    }
  }

  return neighbors
}

/**
 * Checks if a given point (x, y) is within the bounds of the game map.
 *
 * @param x - The x-coordinate of the point.
 * @param y - The y-coordinate of the point.
 * @param map - The game map to check against.
 * @returns A boolean indicating whether the point is within the map's bounds.
 */
export const isWithinBounds = (x: number, y: number, map: GameMap): boolean => {
  return x >= 0 && y >= 0 && x < map.tiles.length && y < map.tiles[0].length
}

/**
 * Retrieves all points of a specific tile type from the given game map.
 *
 * @param map - The game map to be scanned.
 * @param tileType - The specific type of tile for which to find the points.
 * @returns An array of points where the specified tile type is located.
 */
export const getTiles = (map: GameMap, tileType: TileType): Point[] => {
  return map.tiles
    .flatMap((row, x) =>
      row.map((cell, y) => ({ x, y, type: cell })).filter((point) => point.type === tileType),
    )
    .map(({ x, y }) => ({ x, y })) // Strip the type information after filtering
}

/**
 * Checks if a given tile (specified by its x, y coordinates) has an edge of a certain type.
 *
 * @param map - The game map to check against.
 * @param x - The x-coordinate of the tile.
 * @param y - The y-coordinate of the tile.
 * @param edgeType - The type of edge to check for.
 * @returns `true` if the tile has the specified edge type, otherwise `false`.
 */
export const tileHasEdgeType = (
  map: GameMap,
  x: number,
  y: number,
  edgeType: EdgeType,
): boolean => {
  const tileEdges = map.edges[x][y]

  if (!tileEdges) return false

  return Object.values(tileEdges).some((type) => type === edgeType)
}

/**
 * Checks if all of the tiles surrounding a given tile (specified by its x, y coordinates) are among certain types.
 *
 * @param map - The game map to check against.
 * @param x - The x-coordinate of the tile.
 * @param y - The y-coordinate of the tile.
 * @param tileTypes - The array of types of tiles to check for.
 * @returns `true` if all of the surrounding tiles are of the specified types, otherwise `false`.
 */
export const allSurroundingTilesOfTypes = (
  map: GameMap,
  x: number,
  y: number,
  tileTypes: TileType[],
): boolean => {
  // Get all neighboring tiles
  const neighbors = getNeighbors(x, y, map)

  // Check each neighboring tile
  for (let neighbor of neighbors) {
    if (!tileTypes.includes(map.tiles[neighbor.x][neighbor.y]!)) {
      return false
    }
  }

  return true
}

/**
 * Retrieves all valid points within a rectangle defined on the game map.
 *
 * Given a top-left corner `(x, y)` and dimensions `(width, height)`,
 * this function returns an array of `Point` objects for all the tiles
 * within the rectangle that exist on the given game map.
 *
 * @param {GameMap} map - The game map to retrieve points from.
 * @param {number} x - The x-coordinate of the top-left corner of the rectangle.
 * @param {number} y - The y-coordinate of the top-left corner of the rectangle.
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 * @returns {Point[]} An array of points within the defined rectangle.
 *
 * @example
 * const rectanglePoints = getRectanglePoints(5, 5, 3, 3, gameMap);
 */
export const getRectanglePoints = (
  map: GameMap,
  x: number,
  y: number,
  width: number,
  height: number,
): Point[] => {
  const points: Point[] = []

  for (let i = x; i < x + width && i < map.tiles.length; i++) {
    for (let j = y; j < y + height && j < map.tiles[0].length; j++) {
      points.push({ x: i, y: j })
    }
  }

  return points
}
