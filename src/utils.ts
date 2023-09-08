import _ from 'lodash'
import { GameMap, TileType } from './types'

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
