import _ from 'lodash'
import { GameMap, TileType } from '../types'

/**
 * Removes the borders of the given map.
 *
 * @param map - The game map from which borders need to be removed.
 * @param corridorStep - The size variable which determines the width and height of the corridor rectangle.
 * @returns A game map without the outer borders.
 */
export const shrinkMap = (map: GameMap, corridorStep: number): GameMap => {
  // Adjust the tiles
  map.tiles = map.tiles
    .slice(corridorStep, -corridorStep)
    .map((row) => row.slice(corridorStep, -corridorStep))

  // Adjust the edges
  map.edges = map.edges
    .slice(corridorStep, -corridorStep)
    .map((row) => row.slice(corridorStep, -corridorStep))

  return map
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
  // Top and bottom borders
  for (let x = 0; x < map.tiles.length; x++) {
    for (let b = 0; b < corridorStep; b++) {
      if (b < map.tiles[0].length) {
        map.tiles[x][b] = tileType
        map.tiles[x][map.tiles[0].length - 1 - b] = tileType
      }
    }
  }

  // Left and right borders
  for (let y = 0; y < map.tiles[0].length; y++) {
    for (let b = 0; b < corridorStep; b++) {
      if (b < map.tiles.length) {
        map.tiles[b][y] = tileType
        map.tiles[map.tiles.length - 1 - b][y] = tileType
      }
    }
  }

  return map
}
