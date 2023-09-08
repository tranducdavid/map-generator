import { TileType } from './types'
import { createGameGameMap } from './utils'
import { writeFileSync } from 'fs'
import { renderGameMapToImage } from './renderer'

const globalMap = createGameGameMap(100, 50, TileType.WALL)
globalMap.tiles[1][5] = TileType.CORRIDOR
globalMap.tiles[2][5] = TileType.WALL
globalMap.tiles[3][5] = TileType.TRAP_PITFALL
globalMap.tiles[4][5] = TileType.SPIKES
globalMap.tiles[5][5] = TileType.LAVA

const imageBuffer = renderGameMapToImage(globalMap)
writeFileSync('output.png', imageBuffer)
