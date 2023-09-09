import _ from 'lodash'
import { GameMap, Point, TileType } from '../types'
import { getDistance, getUnvisitedNeighbors } from './common'
import { sample } from '../utils/random'

/**
 * Grows a room from the specified origin point within a game map. The room growth process is limited by the specified maximum size.
 * It starts by setting the origin point as `ROOM_ORIGIN` and then tries to expand the room by converting adjacent `WALL` tiles to `ROOM` tiles.
 * The expansion process respects the constraints of the maximum size and has a safeguard for a maximum number of iterations.
 *
 * @param map - The game map in which the room is to be grown.
 * @param x - The x-coordinate of the origin point from where the room should start growing.
 * @param y - The y-coordinate of the origin point from where the room should start growing.
 * @param maxSize - The maximum size or number of tiles the room can grow to, including the origin.
 * @param maxRadius - The maximum radius around the starting point `(x, y)` within which the room can grow.
 * @returns A new game map with the grown room.
 *
 */
export const growRoom = (
  map: GameMap,
  x: number,
  y: number,
  maxSize: number,
  maxRadius: number,
): GameMap => {
  const newMap = _.cloneDeep(map)
  if (maxSize < 1) {
    return newMap
  }

  const overridableTileTypes = [TileType.WALL, TileType.CORRIDOR]
  const points: Point[] = [{ x, y }]
  const iterationsMax = 10000 // max iterations
  let size = 0
  let iteration = 0

  while (points.length && size < maxSize && iteration < iterationsMax) {
    iteration++

    const current = sample(points)!
    _.remove(points, (point) => point === current)

    const isOverridableTile =
      newMap.tiles[current.x][current.y] === TileType.WALL ||
      newMap.tiles[current.x][current.y] === TileType.CORRIDOR
    const isWithinDistance = getDistance(current, { x, y }) <= maxRadius
    if (isOverridableTile && isWithinDistance) {
      newMap.tiles[current.x][current.y] = TileType.ROOM
      size++

      const neighbors = getUnvisitedNeighbors(current.x, current.y, newMap, 1, overridableTileTypes)
      neighbors.forEach((neighbor) => points.push(neighbor))
    }
  }

  newMap.tiles[x][y] = TileType.ROOM_ORIGIN

  return newMap
}
