import { writeFileSync } from 'fs'
import { renderGameMapToImage } from './renderer'
import { generateMaze, growRoom } from './mapGeneration'
import { getPossibleIntersections } from './utils'
import _ from 'lodash'

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

const generateMap = () => {
  const MAP_WIDTH = 100
  const MAP_HEIGHT = 100
  const WALL_STEP = 8
  const CORRIDOR_STEP = 2

  const ROOM_MAX_RADIUS = WALL_STEP - CORRIDOR_STEP - 1
  const ROOM_SIZE = Math.PI * ROOM_MAX_RADIUS ** 2
  const ROOM_SIZE_MIN = 0.75
  const ROOM_SIZE_MAX = 0.5
  const ROOM_SPAWN_CHANCE = 0.1

  let globalMap = generateMaze(MAP_WIDTH, MAP_HEIGHT, WALL_STEP, CORRIDOR_STEP)

  const possibleIntersections = getPossibleIntersections(globalMap, WALL_STEP)

  possibleIntersections.forEach((intersection) => {
    const roomSize = Math.round(ROOM_SIZE * _.random(ROOM_SIZE_MIN, ROOM_SIZE_MAX))

    if (Math.random() < ROOM_SPAWN_CHANCE) {
      globalMap = growRoom(globalMap, intersection.x, intersection.y, roomSize, ROOM_MAX_RADIUS)
    }
  })

  const imageBuffer = renderGameMapToImage(globalMap)
  writeFileSync('output.png', imageBuffer)
}

generateMap()
