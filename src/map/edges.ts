import _ from 'lodash'
import { Direction, EdgeConfig, EdgeType, GameMap, Point, TileType } from '../types'
import { getNeighbors, tileHasEdgeType } from './common'

export const EDGE_CONFIGS: EdgeConfig[] = [
  {
    direction: Direction.TOP,
    dx: 0,
    dy: -1,
    compare: (a, b) => a < b,
    originCompare: (a, b) => a <= b,
    defaultAcc: Infinity,
  },
  {
    direction: Direction.BOTTOM,
    dx: 0,
    dy: 1,
    compare: (a, b) => a > b,
    originCompare: (a, b) => a >= b,
    defaultAcc: -Infinity,
  },
  {
    direction: Direction.LEFT,
    dx: -1,
    dy: 0,
    compare: (a, b) => a < b,
    originCompare: (a, b) => a <= b,
    defaultAcc: Infinity,
  },
  {
    direction: Direction.RIGHT,
    dx: 1,
    dy: 0,
    compare: (a, b) => a > b,
    originCompare: (a, b) => a >= b,
    defaultAcc: -Infinity,
  },
]

export const findRoomCadidateEdge = (
  config: EdgeConfig,
  roomTiles: Point[],
  map: GameMap,
  origin: Point,
): Point | null => {
  return roomTiles.reduce<Point | null>((acc, { x, y }) => {
    const currentTile = map.tiles[x][y]
    const newValue =
      config.direction === Direction.TOP || config.direction === Direction.BOTTOM ? y : x
    const originValue =
      config.direction === Direction.TOP || config.direction === Direction.BOTTOM
        ? origin.y
        : origin.x
    const accValue =
      acc &&
      (config.direction === Direction.TOP || config.direction === Direction.BOTTOM ? acc.y : acc.x)

    if (
      (currentTile === TileType.ROOM || currentTile === TileType.ROOM_ORIGIN) &&
      map.tiles[x + config.dx][y + config.dy] === TileType.CORRIDOR &&
      map.edges[x][y]![config.direction] === EdgeType.ROOM_WALL &&
      config.compare(newValue, accValue ?? config.defaultAcc) &&
      config.originCompare(newValue, originValue) &&
      !tileHasEdgeType(map, x, y, EdgeType.REINFORCED_DOOR)
    ) {
      return { x, y }
    }
    return acc
  }, null)
}

/**
 * Create edges between neighboring tiles based on specific tile types.
 *
 * This function examines neighboring tiles for the types specified in `tileTypes1`
 * and `tileTypes2`. When a pair of neighboring tiles match these types, the edge
 * between them is set to the given `edgeType` if it's in the allowed directions.
 *
 * @param {GameMap} map - The game map to modify.
 * @param {Point[]} roomTiles - An array of room tile points to examine.
 * @param {TileType[]} tileTypes1 - The first array of tile types to check against.
 * @param {TileType[]} tileTypes2 - The second array of tile types to check against.
 * @param {EdgeType} edgeType - The edge type to set between matching neighboring tiles.
 * @param {Direction[]?} allowedDirections - List of directions where edges are allowed. Defaults to all directions.
 */
export const createEdgesBetweenTiles = (
  map: GameMap,
  roomTiles: Point[],
  tileTypes1: TileType[],
  tileTypes2: TileType[],
  edgeType: EdgeType,
  allowedDirections: Direction[] = Object.values(Direction), // defaults to all directions
): GameMap => {
  for (const tile of roomTiles) {
    const neighbors = getNeighbors(tile.x, tile.y, map)

    for (const neighbor of neighbors) {
      const currentTileType = map.tiles[tile.x][tile.y]
      const neighborTileType = map.tiles[neighbor.x][neighbor.y]

      const determineDirection = (): Direction | null => {
        if (tile.x < neighbor.x) return Direction.RIGHT
        else if (tile.x > neighbor.x) return Direction.LEFT
        else if (tile.y < neighbor.y) return Direction.BOTTOM
        else if (tile.y > neighbor.y) return Direction.TOP
        return null
      }

      const direction = determineDirection()

      if (direction && allowedDirections.includes(direction)) {
        if (tileTypes1.includes(currentTileType!) && tileTypes2.includes(neighborTileType!)) {
          map.edges[tile.x][tile.y]![direction] = edgeType
        } else if (
          tileTypes2.includes(currentTileType!) &&
          tileTypes1.includes(neighborTileType!)
        ) {
          map.edges[tile.x][tile.y]![direction] = edgeType
        }
      }
    }
  }

  return map
}
