import { GameMap, Point, TileType, EdgeType } from '../types'
import { sample, shuffle } from '../utils/random'
import { getNeighbors, isTileNearEdgeType, isTileAdjacentToType } from './common'

/**
 * Randomly places a slide tile in a room ensuring it adheres to certain placement constraints.
 *
 * The function ensures that the slide is adjacent to at least two walls and is not near certain edges like
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
  const potentialSlideTiles: Point[] = roomTiles.filter((tile) => {
    const neighbors = getNeighbors(tile.x, tile.y, map)

    // Ensure at least 2 WALL tiles are adjacent
    const wallNeighborsCount = neighbors.filter(
      (neighbor) => map.tiles[neighbor.x][neighbor.y] === TileType.WALL,
    ).length

    return (
      wallNeighborsCount >= 2 &&
      !isTileNearEdgeType(tile, map, EdgeType.REINFORCED_DOOR, 1) &&
      !isTileNearEdgeType(tile, map, EdgeType.EMBRASURE, 1) &&
      !isTileAdjacentToType(tile, map, TileType.SECRET_CORRIDOR)
    )
  })

  if (potentialSlideTiles.length) {
    const shuffledPotentialSlideTiles = shuffle(potentialSlideTiles)!

    const selectedSlideTile = shuffledPotentialSlideTiles[0]
    map.tiles[selectedSlideTile.x][selectedSlideTile.y] = TileType.SLIDE

    const selectedFakeSlideTile = shuffledPotentialSlideTiles[1]
    if (selectedFakeSlideTile != null) {
      map.tiles[selectedFakeSlideTile.x][selectedFakeSlideTile.y] = TileType.TRAP_SLIDE
    }
  }

  return map
}
