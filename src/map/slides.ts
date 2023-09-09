import { GameMap, Point, TileType, EdgeType } from '../types'
import { sample } from '../utils/random'
import { getNeighbors, isTileNearEdgeType, isTileAdjacentToType } from './common'

/**
 * Randomly places a slide tile in a room ensuring it adheres to certain placement constraints.
 *
 * The function ensures that the slide is adjacent to a wall and is not near certain edges like
 * reinforced doors or embrasures. It also ensures that the slide isn't adjacent to secret corridors.
 *
 * @param {GameMap} map - The game map containing the room tiles.
 * @param {Point[]} roomTiles - A list of points that represents the room tiles.
 * @returns {GameMap} - The updated game map with the slide tile placed.
 *
 * @example
 * const updatedMap = placeSlideInRoom(gameMap, roomTiles);
 */
export const placeSlideInRoom = (map: GameMap, roomTiles: Point[]): GameMap => {
  const potentialSlideTiles: Point[] = []

  roomTiles.forEach((tile) => {
    const neighbors = getNeighbors(tile.x, tile.y, map)
    if (neighbors.some((neighbor) => map.tiles[neighbor.x][neighbor.y] === TileType.WALL)) {
      if (
        !isTileNearEdgeType(tile, map, EdgeType.REINFORCED_DOOR, 2) &&
        !isTileNearEdgeType(tile, map, EdgeType.EMBRASURE, 2) &&
        !isTileAdjacentToType(tile, map, TileType.SECRET_CORRIDOR)
      ) {
        potentialSlideTiles.push(tile)
      }
    }
  })

  if (potentialSlideTiles.length) {
    const selectedSlideTile = sample(potentialSlideTiles)!
    map.tiles[selectedSlideTile.x][selectedSlideTile.y] = TileType.SLIDE
  }

  return map
}
