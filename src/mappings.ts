import { TileType, EdgeType } from './types'

export const tileColorMapping: Record<TileType, string> = {
  [TileType.CORRIDOR]: '#d3d3d3',
  [TileType.WALL]: '#1a1a1a',
  [TileType.TRAP_PITFALL]: '#8b0000',
  [TileType.SPIKES]: '#c79c7f',
  [TileType.LAVA]: '#e57c52',
}

export const edgeColorMapping: Record<EdgeType, string> = {
  [EdgeType.HIDDEN]: '#a561c2',
  [EdgeType.DOOR]: '#5f4135',
  [EdgeType.REINFORCED_DOOR]: '#1d1411',
  [EdgeType.WINDOW]: '#88c8f7',
  [EdgeType.EMBRASURE]: '#746bf5',
}
