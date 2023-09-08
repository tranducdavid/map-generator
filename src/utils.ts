import _ from 'lodash'
import { GameMap, TileType } from './types'

export const createGameGameMap = (
  width: number,
  height: number,
  defaultTileType: TileType | null = null,
): GameMap => {
  const tiles = _.times(width, () => _.times(height, () => defaultTileType))
  const edges = _.times(width, () => _.times(height, () => null))

  return {
    tiles,
    edges,
  }
}
