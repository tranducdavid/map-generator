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
}

export const publicEdgeColorMapping: Record<EdgeType, string> = {
  ...secretEdgeColorMapping,
  [EdgeType.HIDDEN_DOOR]: secretEdgeColorMapping[EdgeType.ROOM_WALL],
}
