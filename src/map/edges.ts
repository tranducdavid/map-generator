import { EdgeConfig, EdgeType, GameMap, Point, TileType } from '../types'
import { tileHasEdgeType } from './common'

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
