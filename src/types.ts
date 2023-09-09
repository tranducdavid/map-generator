export enum TileType {
  CORRIDOR = 'corridor',
  SECRET_CORRIDOR = 'secretCorridor',
  ROOM = 'room',
  ROOM_ORIGIN = 'roomOrigin',
  WALL = 'wall',
  TRAP_PITFALL = 'trapPitfall',
  SPIKES = 'spikes',
  LAVA = 'lava',
  SLIDE = 'slide',
  TRAP_SLIDE = 'trapSlide',
  LADDER_UP = 'ladderUp',
  LADDER_DOWN = 'ladderDown',
}

export const ALL_TILE_TYPES: TileType[] = Object.values(TileType)

export enum EdgeType {
  ROOM_WALL = 'roomWall',
  DOOR = 'door',
  HIDDEN_DOOR = 'hiddenDoor',
  REINFORCED_DOOR = 'reinforcedDoor',
  WINDOW = 'window',
  EMBRASURE = 'embrasure',
}

export enum Direction {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

export const ALL_DIRECTIONS_TYPES: Direction[] = Object.values(Direction)
export const VERTICAL_DIRECTION_TYPES: Direction[] = [Direction.TOP, Direction.BOTTOM]
export const HORIZONTAL_DIRECTION_TYPES: Direction[] = [Direction.LEFT, Direction.RIGHT]

export type Edge = {
  [Direction.TOP]?: EdgeType
  [Direction.RIGHT]?: EdgeType
  [Direction.BOTTOM]?: EdgeType
  [Direction.LEFT]?: EdgeType
}

export type EdgeConfig = {
  direction: Direction
  dx: number
  dy: number
  compare: (a: number, b: number) => boolean
  originCompare: (a: number, b: number) => boolean
  defaultAcc: number
}

export type GameMap = {
  tiles: (TileType | null)[][]
  edges: Edge[][]
}

export type Point = {
  x: number
  y: number
}
