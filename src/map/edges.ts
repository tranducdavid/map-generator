import _ from 'lodash'
import { EdgeConfig, EdgeType, GameMap, Point, TileType } from '../types'
import { getNeighbors, tileHasEdgeType } from './common'

export const EDGE_CONFIGS: EdgeConfig[] = [
  {
    direction: 'north',
    edgeKey: 'top',
    dx: 0,
    dy: -1,
    compare: (a, b) => a < b,
    originCompare: (a, b) => a <= b,
    defaultAcc: Infinity,
  },
  {
    direction: 'south',
    edgeKey: 'bottom',
    dx: 0,
    dy: 1,
    compare: (a, b) => a > b,
    originCompare: (a, b) => a >= b,
    defaultAcc: -Infinity,
  },
  {
    direction: 'west',
    edgeKey: 'left',
    dx: -1,
    dy: 0,
    compare: (a, b) => a < b,
    originCompare: (a, b) => a <= b,
    defaultAcc: Infinity,
  },
  {
    direction: 'east',
    edgeKey: 'right',
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
    const newValue = config.direction === 'north' || config.direction === 'south' ? y : x
    const originValue =
      config.direction === 'north' || config.direction === 'south' ? origin.y : origin.x
    const accValue =
      acc && (config.direction === 'north' || config.direction === 'south' ? acc.y : acc.x)

    if (
      (currentTile === TileType.ROOM || currentTile === TileType.ROOM_ORIGIN) &&
      map.tiles[x + config.dx][y + config.dy] === TileType.CORRIDOR &&
      map.edges[x][y]![config.edgeKey] === EdgeType.ROOM_WALL &&
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
 * between them is set to the given `edgeType`.
 *
 * @param {GameMap} map - The game map to modify.
 * @param {Point[]} roomTiles - An array of room tile points to examine.
 * @param {TileType[]} tileTypes1 - The first array of tile types to check against.
 * @param {TileType[]} tileTypes2 - The second array of tile types to check against.
 * @param {EdgeType} edgeType - The edge type to set between matching neighboring tiles.
 */
export const createEdgesBetweenTiles = (
  map: GameMap,
  roomTiles: Point[],
  tileTypes1: TileType[],
  tileTypes2: TileType[],
  edgeType: EdgeType,
): GameMap => {
  let newMap = _.cloneDeep(map)

  for (const tile of roomTiles) {
    const neighbors = getNeighbors(tile.x, tile.y, newMap)

    for (const neighbor of neighbors) {
      const currentTileType = newMap.tiles[tile.x][tile.y]
      const neighborTileType = newMap.tiles[neighbor.x][neighbor.y]

      if (tileTypes1.includes(currentTileType!) && tileTypes2.includes(neighborTileType!)) {
        // Set the appropriate edge type based on the direction of the neighboring tiles
        if (tile.x < neighbor.x) newMap.edges[tile.x][tile.y]!.right = edgeType
        else if (tile.x > neighbor.x) newMap.edges[tile.x][tile.y]!.left = edgeType
        else if (tile.y < neighbor.y) newMap.edges[tile.x][tile.y]!.bottom = edgeType
        else if (tile.y > neighbor.y) newMap.edges[tile.x][tile.y]!.top = edgeType
      } else if (tileTypes2.includes(currentTileType!) && tileTypes1.includes(neighborTileType!)) {
        if (tile.x < neighbor.x) newMap.edges[tile.x][tile.y]!.right = edgeType
        else if (tile.x > neighbor.x) newMap.edges[tile.x][tile.y]!.left = edgeType
        else if (tile.y < neighbor.y) newMap.edges[tile.x][tile.y]!.bottom = edgeType
        else if (tile.y > neighbor.y) newMap.edges[tile.x][tile.y]!.top = edgeType
      }
    }
  }

  return newMap
}
