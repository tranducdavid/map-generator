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
 * Grows a room from a specified point on the map, creating a connected area of tiles constrained by given size and radius.
 *
 * This function expands from the provided start point, converting overridable tiles like `WALL` and `CORRIDOR`
 * into room tiles. The growth respects the provided `maxSize` and `maxRadius` parameters to ensure the room doesn't
 * exceed the intended boundaries.
 *
 * As the room grows, corridors completely enclosed by rooms or walls are converted into room tiles. Similarly, walls
 * that are entirely surrounded by rooms will also be transformed into room tiles.
 *
 * The function is also responsible for setting the room's origin, defining its edges, and placing reinforced doors
 * at appropriate locations on the room's boundaries.
 *
 * @param {GameMap} map - The starting game map where the room will grow.
 * @param {number} x - The x-coordinate of the starting point for room growth.
 * @param {number} y - The y-coordinate of the starting point for room growth.
 * @param {number} maxSize - The upper limit on the number of tiles the room can span.
 * @param {number} maxRadius - The furthest distance (in tiles) the room can grow from its origin.
 * @returns {{ map: GameMap; roomTiles: Point[] }} - The modified map with the new room and a list of the room's tiles.
 *
 * @example
 * const { updatedMap, roomTiles } = growRoom(initialMap, 5, 5, 20, 4);
 */
export const growRoom = (
  map: GameMap,
  x: number,
  y: number,
  maxSize: number,
  maxRadius: number,
): { map: GameMap; roomTiles: Point[] } => {
  if (maxSize < 1) {
    return { map, roomTiles: [] }
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

  return { map, roomTiles }
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
 * @returns {{ map: GameMap; roomsTiles: Point[][] }} - The modified map with the rooms.
 */
export const generateRoomsAtIntersections = (
  map: GameMap,
  wallStep: number,
  corridorStep: number,
  roomMaxRadius: number,
  roomSize: number,
  roomSizeMin: number,
  roomSizeMax: number,
): { map: GameMap; roomsTiles: Point[][] } => {
  const possibleIntersections = shuffle(getPossibleIntersections(map, wallStep))
  const roomsTiles: Point[][] = []

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
      const result = growRoom(map, intersection.x, intersection.y, currentRoomSize, roomMaxRadius)
      roomsTiles.push(result.roomTiles)
    }
  }

  return { map, roomsTiles }
}
