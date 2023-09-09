import _ from 'lodash'
import { GameMap, TileType } from '../types'

/**
 * Removes the borders of the given map and returns a new map without mutating the original.
 *
 * @param map - The game map from which borders need to be removed.
 * @param corridorStep - The size variable which determines the width and height of the corridor rectangle.
 * @returns A new game map without the outer borders.
 */
export const shrinkMap = (map: GameMap, corridorStep: number): GameMap => {
  const newMap = _.cloneDeep(map)

  // Adjust the tiles
  newMap.tiles = newMap.tiles
    .slice(corridorStep, -corridorStep)
    .map((row) => row.slice(corridorStep, -corridorStep))

  // Adjust the edges
  newMap.edges = newMap.edges
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
