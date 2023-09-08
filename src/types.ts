export enum TileType {
  CORRIDOR = 'CORRIDOR',
  WALL = 'WALL',
  TRAP_PITFALL = 'TRAP_PITFALL',
  SPIKES = 'SPIKES',
  LAVA = 'LAVA',
}

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
