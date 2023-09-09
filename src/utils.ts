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
      if (i >= 0 && i < newMap.tiles.length && j >= 0 && j < newMap.tiles[0].length) {
        if (replaceType === undefined || newMap.tiles[i][j] === replaceType) {
          newMap.tiles[i][j] = tileType
        }
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
 * @param tileType - The type of tile to fill the rectangle with. Defaults to `TileType.CORRIDOR`.
 * @param replaceType - Optional. The tile type to be replaced. If specified, only tiles of this type will be replaced.
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
  tileType: TileType = TileType.CORRIDOR,
  replaceType?: TileType,
): GameMap => {
  return createRectangleInMap(
    map,
    x - Math.floor(corridorStep / 2),
    y - Math.floor(corridorStep / 2),
    corridorStep,
    corridorStep,
    tileType,
    replaceType,
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
 * Retrieves intersection points within a cluster based on a specified wall step.
 *
 * This function scans the vicinity of the cluster in intervals defined by `wallStep` to identify
 * intersection locations. It determines the boundaries of the cluster and then checks
 * tiles within those boundaries at the specified interval. Only tiles that are of type corridor,
 * room, or room origin and that belong to the provided cluster are considered as intersections.
 *
 * @param map - The game map to be scanned for intersections.
 * @param cluster - The cluster of points for which to find intersections.
 * @param wallStep - The interval at which tiles are checked for intersections.
 * @param corridorStep - The size variable which determines the width and height of the corridor rectangle.
 * @returns An array of points indicating intersection locations within the cluster's vicinity.
 */
export const getIntersectionsInCluster = (
  map: GameMap,
  cluster: Point[],
  wallStep: number,
  corridorStep: number,
): Point[] => {
  const points: Point[] = []
  for (
    let x = wallStep + Math.floor(corridorStep / 2);
    x < map.tiles.length - Math.floor(corridorStep / 2);
    x += wallStep
  ) {
    for (
      let y = wallStep + Math.floor(corridorStep / 2);
      y < map.tiles[0].length - Math.floor(corridorStep / 2);
      y += wallStep
    ) {
      // Ensure the coordinates are within the map's boundaries and belong to the cluster.
      if (
        x < map.tiles.length &&
        y < map.tiles[0].length &&
        cluster.some((p) => p.x === x && p.y === y)
      ) {
        // Check if the tile is a corridor, room, or room origin.
        const tileType = map.tiles[x][y]
        if (
          tileType === TileType.CORRIDOR ||
          tileType === TileType.ROOM ||
          tileType === TileType.ROOM_ORIGIN
        ) {
          points.push({ x, y })
        }
      }
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
 * Removes the borders of the given map and returns a new map without mutating the original.
 *
 * @param map - The game map from which borders need to be removed.
 * @param corridorStep - The size variable which determines the width and height of the corridor rectangle.
 * @returns A new game map without the outer borders.
 */
export const removeMapBorders = (map: GameMap, corridorStep: number): GameMap => {
  const newMap = _.cloneDeep(map)
  newMap.tiles = newMap.tiles
    .slice(corridorStep, -corridorStep)
    .map((row) => row.slice(corridorStep, -corridorStep))

  return newMap
}

/**
 * Fills the borders of the map with a specified tile type within a specified width.
 *
 * This function sets the tile type of the map's borders, within a width defined by `corridorStep`, to the provided `tileType`.
 *
 * @param map - The game map whose borders are to be overridden.
 * @param corridorStep - The width of the border to be overridden.
 * @param tileType - The tile type to be set on the overridden border.
 * @returns A new game map with the borders overridden as specified.
 */
export const fillMapBorders = (map: GameMap, corridorStep: number, tileType: TileType): GameMap => {
  const newMap = _.cloneDeep(map)

  // Top and bottom borders
  for (let x = 0; x < map.tiles.length; x++) {
    for (let b = 0; b < corridorStep; b++) {
      if (b < map.tiles[0].length) {
        newMap.tiles[x][b] = tileType
        newMap.tiles[x][map.tiles[0].length - 1 - b] = tileType
      }
    }
  }

  // Left and right borders
  for (let y = 0; y < map.tiles[0].length; y++) {
    for (let b = 0; b < corridorStep; b++) {
      if (b < map.tiles.length) {
        newMap.tiles[b][y] = tileType
        newMap.tiles[map.tiles.length - 1 - b][y] = tileType
      }
    }
  }

  return newMap
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
 * Finds isolated clusters within a given map.
 *
 * This function identifies isolated parts of the maze (corridors, rooms, and room origins)
 * and returns them as clusters. A cluster is a group of tiles that are connected to each other
 * but isolated from other tiles in the map.
 *
 * @param {GameMap} map - The map to analyze.
 * @returns {Point[][]} A list of clusters where each cluster is a list of points (tiles) belonging to that cluster.
 */
export const findIsolatedClusters = (map: GameMap): Point[][] => {
  const visited: boolean[][] = Array(map.tiles.length)
    .fill(null)
    .map(() => Array(map.tiles[0].length).fill(false))
  const clusters: Point[][] = []

  const floodFill = (x: number, y: number, currentCluster: Point[]) => {
    if (visited[x][y] || map.tiles[x][y] === TileType.WALL) {
      return
    }

    visited[x][y] = true
    currentCluster.push({ x, y })

    getNeighbors(x, y, map).forEach((neighbor) => floodFill(neighbor.x, neighbor.y, currentCluster))
  }

  for (let x = 0; x < map.tiles.length; x++) {
    for (let y = 0; y < map.tiles[0].length; y++) {
      if (
        !visited[x][y] &&
        (map.tiles[x][y] === TileType.CORRIDOR ||
          map.tiles[x][y] === TileType.ROOM ||
          map.tiles[x][y] === TileType.ROOM_ORIGIN)
      ) {
        const cluster: Point[] = []
        floodFill(x, y, cluster)
        if (cluster.length > 0) clusters.push(cluster)
      }
    }
  }

  return clusters
}
