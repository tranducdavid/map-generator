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
  HIDDEN = 'HIDDEN',
  DOOR = 'DOOR',
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

export type GameMap = {
  tiles: (TileType | null)[][]
  edges: (Edge | null)[][]
}

export type Point = {
  x: number
  y: number
}
