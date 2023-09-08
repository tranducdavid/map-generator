import { EdgeType, TileType } from './types'
import { createGameMap } from './utils'
import { writeFileSync } from 'fs'
import { renderGameMapToImage } from './renderer'
import { generateMaze } from './mapGeneration'

// const globalMap = createGameMap(10, 10, TileType.WALL)

// globalMap.tiles[1][5] = TileType.CORRIDOR
// globalMap.tiles[2][5] = TileType.WALL
// globalMap.tiles[3][5] = TileType.TRAP_PITFALL
// globalMap.tiles[4][5] = TileType.SPIKES
// globalMap.tiles[5][5] = TileType.LAVA

// globalMap.edges[1][5] = { right: EdgeType.HIDDEN }
// globalMap.edges[2][5] = { right: EdgeType.DOOR }
// globalMap.edges[2][5] = { left: EdgeType.REINFORCED_DOOR }
// globalMap.edges[4][5] = { right: EdgeType.WINDOW }
// globalMap.edges[5][5] = { right: EdgeType.EMBRASURE }

const globalMap = generateMaze(100, 100, 8, 2)

const imageBuffer = renderGameMapToImage(globalMap)
writeFileSync('output.png', imageBuffer)
