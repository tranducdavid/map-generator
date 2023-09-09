import _, { map } from 'lodash'
import {
  ALL_TILE_TYPES,
  Direction,
  EdgeType,
  GameMap,
  HORIZONTAL_DIRECTION_TYPES,
  Point,
  TileType,
  VERTICAL_DIRECTION_TYPES,
} from '../types'
import {
  createRectangleInMap,
  getNeighbors,
  getRectanglePoints,
  getTiles,
  getUnvisitedNeighbors,
} from './common'
import { random } from '../utils/random'
import { createEdgesBetweenTiles } from './edges'

/**
 * Constructs a corridor between two points on the game map.
 *
 * This function connects two points by constructing a straight corridor. The corridor is
 * created in a Manhattan style, meaning it will first move horizontally and then
 * vertically, or vice versa, depending on a chance.
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
  // Decide the direction of the corridor based on the relative positions of the two points
  if (random() > 0.5) {
    map = constructHorizontal(map, start, end, corridorStep)
    map = constructVertical(map, { x: end.x, y: start.y }, end, corridorStep)
  } else {
    map = constructVertical(map, start, end, corridorStep)
    map = constructHorizontal(map, { x: start.x, y: end.y }, end, corridorStep)
  }

  return map
}

const constructHorizontal = (
  map: GameMap,
  start: Point,
  end: Point,
  corridorStep: number,
): GameMap => {
  const startX = Math.min(start.x, end.x)
  const endX = Math.max(start.x, end.x)

  for (let x = startX; x <= endX; x++) {
    map = createCorridorRectangle(map, x, start.y, corridorStep, TileType.CORRIDOR, TileType.WALL)
  }

  return map
}

const constructVertical = (
  map: GameMap,
  start: Point,
  end: Point,
  corridorStep: number,
): GameMap => {
  const startY = Math.min(start.y, end.y)
  const endY = Math.max(start.y, end.y)

  for (let y = startY; y <= endY; y++) {
    map = createCorridorRectangle(map, start.x, y, corridorStep, TileType.CORRIDOR, TileType.WALL)
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
  const visited: boolean[][] = Array.from({ length: map.tiles.length }, () =>
    Array(map.tiles[0].length).fill(false),
  )

  // Flood fill starting from rooms or room origins
  const floodFill = (x: number, y: number) => {
    if (visited[x][y] || map.tiles[x][y] === TileType.WALL) {
      return
    }

    visited[x][y] = true

    if (
      map.tiles[x][y] === TileType.CORRIDOR ||
      map.tiles[x][y] === TileType.ROOM ||
      map.tiles[x][y] === TileType.ROOM_ORIGIN
    ) {
      for (const neighbor of getNeighbors(x, y, map)) {
        floodFill(neighbor.x, neighbor.y)
      }
    }
  }

  // Start the flood fill from all room-origin tiles (or any room tile)
  for (let x = 0; x < map.tiles.length; x++) {
    for (let y = 0; y < map.tiles[0].length; y++) {
      if (map.tiles[x][y] === TileType.ROOM_ORIGIN) {
        floodFill(x, y)
      }
    }
  }

  return {
    ...map,
    // Any corridor tile that wasn't visited during the flood fill is isolated
    tiles: map.tiles.map((row, x) =>
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
 * Creates secret corridors from a central point to its neighbors.
 *
 * @param map - The original game map.
 * @param centralPoint - The central point from which corridors are created.
 * @param neighbors - Array of neighboring points.
 * @param corridorStep - The width of the secret corridor.
 * @returns A new game map with the secret corridors.
 */
export const createSecretCorridors = (
  map: GameMap,
  centralPoint: Point,
  neighbors: Point[],
  corridorStep: number,
): GameMap => {
  for (const neighbor of neighbors) {
    // Calculate the direction of the neighbor relative to the central point
    const deltaX = neighbor.x - centralPoint.x
    const deltaY = neighbor.y - centralPoint.y

    const isHorizontal = deltaY === 0
    const isVertical = !isHorizontal

    // Determine corridor dimensions based on the direction
    const corridorWidth = Math.abs(deltaX) + (isVertical ? corridorStep : 0)
    const corridorHeight = Math.abs(deltaY) + (isHorizontal ? corridorStep : 0)

    // Determine starting point of the corridor rectangle
    const startX = centralPoint.x + (deltaX >= 0 ? 0 : -corridorWidth + 1)
    const startY = centralPoint.y + (deltaY >= 0 ? 0 : -corridorHeight + 1)

    // Create the corridor towards the neighbor
    map = createRectangleInMap(
      map,
      startX,
      startY,
      corridorWidth,
      corridorHeight,
      TileType.SECRET_CORRIDOR,
      TileType.WALL,
    )

    // Create secret doors
    const roomTiles = getRectanglePoints(map, startX, startY, corridorWidth, corridorHeight)
    map = createEdgesBetweenTiles(
      map,
      roomTiles,
      [TileType.SECRET_CORRIDOR],
      [TileType.CORRIDOR, TileType.ROOM, TileType.ROOM_ORIGIN],
      EdgeType.HIDDEN_DOOR,
      undefined,
      isHorizontal ? HORIZONTAL_DIRECTION_TYPES : VERTICAL_DIRECTION_TYPES,
    )
  }

  return map
}

/**
 * Generate secret corridors from room origins.
 *
 * @param globalMap - The current game map.
 * @param wallStep - Indicating the wall's step size.
 *
 * @returns The game map.
 */
export const generateSecretCorridorsFromRoomOrigins = (map: GameMap, wallStep: number): GameMap => {
  const roomOrigins = getTiles(map, TileType.ROOM_ORIGIN)

  roomOrigins.forEach(({ x, y }) => {
    map = createSecretCorridors(
      map,
      { x, y },
      getUnvisitedNeighbors(x, y, map, wallStep, ALL_TILE_TYPES),
      1,
    )
  })

  return map
}
