import { TileType, EdgeType } from './types'

export const tileColorMapping: Record<TileType, string> = {
  [TileType.CORRIDOR]: '#e3e3e3',
  [TileType.SECRET_CORRIDOR]: '#c3c3c3',
  [TileType.ROOM]: '#d3d3d3',
  [TileType.ROOM_ORIGIN]: '#d3d3d3',
  [TileType.WALL]: '#1a1a1a',
  [TileType.TRAP_PITFALL]: '#8b0000',
  [TileType.SPIKES]: '#c79c7f',
  [TileType.LAVA]: '#e57c52',
}

export const edgeColorMapping: Record<EdgeType, string> = {
  [EdgeType.ROOM_WALL]: tileColorMapping[TileType.WALL],
  [EdgeType.HIDDEN]: '#a561c2',
  [EdgeType.DOOR]: '#986a57',
  [EdgeType.REINFORCED_DOOR]: '#986a57',
  [EdgeType.WINDOW]: '#88c8f7',
  [EdgeType.EMBRASURE]: '#746bf5',
}
