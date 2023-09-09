import _ from 'lodash'
import { ALL_DIRECTIONS_TYPES, EdgeType, GameMap, Point, TileType } from '../types'
import {
  allSurroundingTilesOfTypes,
  findNearestTile,
  getDistance,
  getNeighbors,
  getPossibleIntersections,
  getUnvisitedNeighbors,
  isWithinDistanceFromBorder,
} from './common'
import { random, sample, shuffle } from '../utils/random'
import {
  EDGE_CONFIGS,
  createEdgesBetweenTiles,
  findRoomCadidateEdge as findDoorCandidate,
} from './edges'
import { placeSlideInRoom } from './slides'

/**
 * Grows a room from the specified point on the map, creating an area of connected tiles up to a given size and radius.
 *
 * The function works by expanding outwards from the given point, converting tiles of overridable types (e.g., `WALL` and `CORRIDOR`)
 * into room tiles. The growth is controlled by parameters like `maxSize` and `maxRadius`, ensuring the room doesn't exceed the desired
 * boundaries.
 *
 * In addition to growing the room, the function can also transform corridors enclosed by rooms or walls into room tiles, and walls enclosed by rooms into room tiles.
 * It also takes care of setting room origin and edges, and adding reinforced doors on the room's edges.
 *
 * @param {GameMap} map - The initial game map where the room should be grown.
 * @param {number} x - The x-coordinate of the point where the room should start growing.
 * @param {number} y - The y-coordinate of the point where the room should start growing.
 * @param {number} maxSize - The maximum number of tiles the room can occupy.
 * @param {number} maxRadius - The maximum distance from the origin (in tiles) the room can grow.
 * @returns {GameMap} - A new map with the grown room.
 *
 * @example
 * const updatedMap = growRoom(initialMap, 5, 5, 20, 4);
 */
export const growRoom = (
  map: GameMap,
  x: number,
  y: number,
  maxSize: number,
  maxRadius: number,
): GameMap => {
  if (maxSize < 1) {
    return map
  }

  const origin: Point = { x, y }

  const overridableTileTypes = [TileType.WALL, TileType.CORRIDOR]
  const roomTileTypes = [TileType.ROOM, TileType.ROOM_ORIGIN]
  const points: Point[] = [{ x, y }]
  const roomTiles: Point[] = []
  const iterationsMax = 10000 // max iterations
  let size = 0
  let iteration = 0

  // Generate room tiles
  while (points.length && size < maxSize && iteration < iterationsMax) {
    iteration++

    const current = sample(points)!
    _.remove(points, (point) => point === current)

    const isOverridableTile = overridableTileTypes.includes(map.tiles[current.x][current.y]!)
    const isWithinDistance = getDistance(current, { x, y }) <= maxRadius

    if (isOverridableTile && isWithinDistance) {
      map.tiles[current.x][current.y] = TileType.ROOM
      roomTiles.push(current)
      size++

      const neighbors = getUnvisitedNeighbors(current.x, current.y, map, 1, overridableTileTypes)
      neighbors.forEach((neighbor) => points.push(neighbor))
    }
  }

  // Find corridors enclosed by rooms and walls and turn them to room tiles
  // Find walls enclosed by rooms and turn them to room tiles
  roomTiles.forEach((tile) => {
    getNeighbors(tile.x, tile.y, map).forEach((neighbor) => {
      if (
        (map.tiles[neighbor.x][neighbor.y] === TileType.CORRIDOR &&
          allSurroundingTilesOfTypes(map, neighbor.x, neighbor.y, [
            TileType.ROOM,
            TileType.WALL,
          ])) ||
        (map.tiles[neighbor.x][neighbor.y] === TileType.WALL &&
          allSurroundingTilesOfTypes(map, neighbor.x, neighbor.y, [TileType.ROOM]))
      ) {
        map.tiles[neighbor.x][neighbor.y] = TileType.ROOM
      }
    })
  })

  // Set room origin
  map.tiles[x][y] = TileType.ROOM_ORIGIN

  // Add walls
  // prettier-ignore
  map = createEdgesBetweenTiles(map, roomTiles, [TileType.ROOM, TileType.ROOM_ORIGIN], [TileType.WALL], EdgeType.ROOM_WALL, EdgeType.ROOM_WALL, ALL_DIRECTIONS_TYPES, true, false)

  // Add embrasures
  // prettier-ignore
  map = createEdgesBetweenTiles(map, roomTiles, [TileType.ROOM, TileType.ROOM_ORIGIN], [TileType.CORRIDOR], EdgeType.EMBRASURE, EdgeType.EMBRASURE, ALL_DIRECTIONS_TYPES, true, false)

  // Add doors
  EDGE_CONFIGS.forEach((config) => {
    const doorCandidate = findDoorCandidate(config, roomTiles, map, origin)
    if (doorCandidate) {
      map.edges[doorCandidate.x][doorCandidate.y]![config.direction] = EdgeType.REINFORCED_DOOR
    }
  })

  // Add a slide
  map = placeSlideInRoom(map, roomTiles)

  return map
}

/**
 * Generate rooms based on potential intersections.
 *
 * @param globalMap - The current game map.
 * @param wallStep - Indicating the wall's step size.
 * @param corridorStep - Indicating the corridor's step size.
 * @param roomMaxRadius - Indicating the maximum room radius.
 * @param roomSize - Indicating the room's size.
 * @param roomSizeMin - Indicating the minimum size multiplier for the room.
 * @param roomSizeMax - Indicating the maximum size multiplier for the room.
 *
 * @returns The game map.
 */
export const generateRoomsAtIntersections = (
  map: GameMap,
  wallStep: number,
  corridorStep: number,
  roomMaxRadius: number,
  roomSize: number,
  roomSizeMin: number,
  roomSizeMax: number,
): GameMap => {
  const possibleIntersections = shuffle(getPossibleIntersections(map, wallStep))

  while (possibleIntersections.length) {
    const intersection = possibleIntersections.pop()!
    const nearestRoomOrigin = findNearestTile(
      map,
      intersection.x,
      intersection.y,
      TileType.ROOM_ORIGIN,
    )

    if (
      !isWithinDistanceFromBorder(map, intersection, wallStep + corridorStep) &&
      (nearestRoomOrigin == null ||
        getDistance({ x: intersection.x, y: intersection.y }, nearestRoomOrigin) >
          2 * wallStep + corridorStep - 1)
    ) {
      const currentRoomSize = Math.round(roomSize * random(roomSizeMin, roomSizeMax))
      map = growRoom(map, intersection.x, intersection.y, currentRoomSize, roomMaxRadius)
    }
  }

  return map
}
