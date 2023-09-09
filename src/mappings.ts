import { TileType, EdgeType } from './types'

export const secretTileColorMapping: Record<TileType, string> = {
  [TileType.CORRIDOR]: '#e3e3e3',
  [TileType.SECRET_CORRIDOR]: '#c3c3c3',
  [TileType.ROOM]: '#d3d3d3',
  [TileType.ROOM_ORIGIN]: '#d3d3d3',
  [TileType.WALL]: '#1a1a1a',
  [TileType.TRAP_PITFALL]: '#8b0000',
  [TileType.SPIKES]: '#c79c7f',
  [TileType.LAVA]: '#e57c52',
  [TileType.SLIDE]: '#8bd4e5',
  [TileType.TRAP_SLIDE]: '#8bd4e5',
  [TileType.LADDER_UP]: '#8eb97e',
  [TileType.LADDER_DOWN]: '#8eb97e',
}

export const secretTileTextMapping: Partial<Record<TileType, string>> = {
  [TileType.TRAP_SLIDE]: '💀',
  [TileType.LADDER_UP]: '^',
  [TileType.LADDER_DOWN]: 'v',
}

export const secretEdgeColorMapping: Record<EdgeType, string> = {
  [EdgeType.ROOM_WALL]: secretTileColorMapping[TileType.WALL],
  [EdgeType.DOOR]: '#986a57',
  [EdgeType.HIDDEN_DOOR]: '#a561c2',
  [EdgeType.REINFORCED_DOOR]: '#986a57',
  [EdgeType.WINDOW]: '#88c8f7',
  [EdgeType.EMBRASURE]: '#746bf5',
}

export const publicTileColorMapping: Record<TileType, string> = {
  ...secretTileColorMapping,
  [TileType.SECRET_CORRIDOR]: secretTileColorMapping[TileType.WALL],
  [TileType.TRAP_PITFALL]: secretTileColorMapping[TileType.CORRIDOR],
  [TileType.LADDER_UP]: secretTileColorMapping[TileType.WALL],
  [TileType.LADDER_DOWN]: secretTileColorMapping[TileType.WALL],
}

export const publicEdgeColorMapping: Record<EdgeType, string> = {
  ...secretEdgeColorMapping,
  [EdgeType.HIDDEN_DOOR]: secretEdgeColorMapping[EdgeType.ROOM_WALL],
}

export const publicTileTextMapping: Partial<Record<TileType, string>> = {}
