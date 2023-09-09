import { EdgeType, GameMap, Point, TileType } from '../types'
import { shuffle } from '../utils/random'
import { isTileAdjacentToType, getNeighbors } from './common'

/**
 * Randomly places ladder tiles next to secret corridor tiles on the game map, replacing wall tiles.
 * Ensures that ladders are surrounded by at least 3 walls.
 *
 * @param {GameMap} map - The game map to place ladders on.
 * @param {number} ladderCount - The count of eligible wall tiles to turn into ladder tiles.
 * @returns {GameMap} The game map with ladders placed.
 *
 * @example
 * const gameMapWithLadders = placeLadders(gameMap, 10);  // Turns 10% of eligible wall tiles into ladders
 */
export const placeLadders = (map: GameMap, ladderCount: number): GameMap => {
  const potentialLadderPoints: Point[] = []

  // Collect all wall tiles adjacent to secret corridors and having 3 wall neighbors
  for (let x = 0; x < map.tiles.length; x++) {
    for (let y = 0; y < map.tiles[x].length; y++) {
      if (
        map.tiles[x][y] === TileType.WALL &&
        isTileAdjacentToType({ x, y }, map, TileType.SECRET_CORRIDOR)
      ) {
        const wallNeighbors = getNeighbors(x, y, map).filter(
          (n) => map.tiles[n.x][n.y] === TileType.WALL,
        )
        if (wallNeighbors.length >= 3) {
          potentialLadderPoints.push({ x, y })
        }
      }
    }
  }

  // Shuffle the potential ladder points array to randomize ladder placement
  const shuffledLadderPoints = shuffle(potentialLadderPoints)

  // Place the ladders
  for (let i = 0; i < ladderCount; i++) {
    const { x, y } = shuffledLadderPoints[i]
    map.tiles[x][y] = TileType.LADDER_DOWN

    // Add secret door edge between the ladder and secret corridor
    const secretCorridorNeighbors = getNeighbors(x, y, map).filter(
      (n) => map.tiles[n.x][n.y] === TileType.SECRET_CORRIDOR,
    )
    if (secretCorridorNeighbors.length) {
      const { x: nx, y: ny } = secretCorridorNeighbors[0] // take the first secret corridor neighbor
      if (nx < x) {
        map.edges[x][y].left = EdgeType.HIDDEN_DOOR
      } else if (nx > x) {
        map.edges[x][y].right = EdgeType.HIDDEN_DOOR
      } else if (ny < y) {
        map.edges[x][y].top = EdgeType.HIDDEN_DOOR
      } else if (ny > y) {
        map.edges[x][y].bottom = EdgeType.HIDDEN_DOOR
      }
    }
  }

  return map
}
