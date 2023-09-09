import { writeFileSync } from 'fs'
import { renderGameMapToImage } from './utils/renderer'
import { connectClusters, findIsolatedClusters } from './map/clusters'
import _ from 'lodash'
import { TileType } from './types'
import { generateMaze } from './map/maze'
import { generateSecretCorridorsFromRoomOrigins, removeIsolatedCorridors } from './map/corridors'
import { generateRoomsAtIntersections } from './map/rooms'
import { fillMapBorders, shrinkMap } from './map/mapBorders'
import { profile } from './utils/profiling'
import {
  publicEdgeColorMapping,
  publicTileColorMapping,
  publicTileTextMapping,
  secretEdgeColorMapping,
  secretTileColorMapping,
  secretTileTextMapping,
} from './mappings'
import { placeTraps } from './map/traps'
import { placeSlideInRoom } from './map/slides'
import { placeLadders } from './map/ladders'

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
  // Constants defining the map
  const MAP_WIDTH = 100
  const MAP_HEIGHT = 100
  const WALL_STEP = 8
  const CORRIDOR_STEP = 2

  const ROOM_MAX_RADIUS = WALL_STEP - CORRIDOR_STEP - 1
  const ROOM_SIZE = Math.PI * ROOM_MAX_RADIUS ** 2
  const ROOM_SIZE_MIN = 0.5
  const ROOM_SIZE_MAX = 0.75

  // Generate Maze
  let globalMap = profile(generateMaze)(MAP_WIDTH, MAP_HEIGHT, WALL_STEP, CORRIDOR_STEP)

  // Generate rooms
  // prettier-ignore
  const {roomsTiles} = profile(generateRoomsAtIntersections)(globalMap, WALL_STEP, CORRIDOR_STEP, ROOM_MAX_RADIUS, ROOM_SIZE, ROOM_SIZE_MIN, ROOM_SIZE_MAX)

  // Remove corridors from map borders
  profile(fillMapBorders)(globalMap, CORRIDOR_STEP, TileType.WALL)

  // Remove isolated corridors
  profile(removeIsolatedCorridors)(globalMap)

  // Connect clusters, which were created because of removing the corridors from map borders
  const clusters = profile(findIsolatedClusters)(globalMap)
  profile(connectClusters)(globalMap, clusters, WALL_STEP, CORRIDOR_STEP)

  // Create secret corridors
  profile(generateSecretCorridorsFromRoomOrigins)(globalMap, WALL_STEP)

  // Place traps
  profile(placeTraps)(globalMap, 10)

  // Add slides
  profile(
    () => roomsTiles.forEach((roomTiles) => placeSlideInRoom(globalMap, roomTiles)),
    'addSlides',
  )()

  // Add ladders
  profile(placeLadders)(globalMap, 10)

  // Shrink map
  profile(shrinkMap)(globalMap, CORRIDOR_STEP)

  // Export
  writeFileSync(
    'outputSecret.png',
    profile(renderGameMapToImage)(
      globalMap,
      secretTileColorMapping,
      secretEdgeColorMapping,
      secretTileTextMapping,
    ),
  )
  writeFileSync(
    'outputPublic.png',
    profile(renderGameMapToImage)(
      globalMap,
      publicTileColorMapping,
      publicEdgeColorMapping,
      publicTileTextMapping,
    ),
  )
  writeFileSync('output.json', JSON.stringify(globalMap))
}

generateMap()
