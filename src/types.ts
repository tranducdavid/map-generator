export enum TileType {
  CORRIDOR = 'CORRIDOR',
  SECRET_CORRIDOR = 'SECRET_CORRIDOR',
  ROOM = 'ROOM',
  ROOM_ORIGIN = 'ROOM_ORIGIN',
  WALL = 'WALL',
  TRAP_PITFALL = 'TRAP_PITFALL',
  SPIKES = 'SPIKES',
  LAVA = 'LAVA',
}

export const ALL_TILE_TYPES: TileType[] = Object.values(TileType) as TileType[]

export enum EdgeType {
  ROOM_WALL = 'ROOM_WALL',
  DOOR = 'DOOR',
  HIDDEN_DOOR = 'HIDDEN_DOOR',
  REINFORCED_DOOR = 'REINFORCED_DOOR',
  WINDOW = 'WINDOW',
  EMBRASURE = 'EMBRASURE',
}

export type Edge = {
  top?: EdgeType
  right?: EdgeType
  bottom?: EdgeType
  left?: EdgeType
}

export type EdgeConfig = {
  direction: 'north' | 'south' | 'east' | 'west'
  edgeKey: 'top' | 'bottom' | 'left' | 'right'
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
