import { TileType } from './types'

export const tileColorMapping: Record<TileType, string> = {
  [TileType.CORRIDOR]: '#D3D3D3', // LightGray
  [TileType.WALL]: '#696969', // DimGray
  [TileType.TRAP_PITFALL]: '#8B0000', // DarkRed
  [TileType.SPIKES]: '#FFD700', // Gold
  [TileType.LAVA]: '#FF4500', // OrangeRed
}
