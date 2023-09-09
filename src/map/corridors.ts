import _, { random } from 'lodash'
import { GameMap, Point, TileType } from '../types'
import { createRectangleInMap, getNeighbors } from './common'

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
