import _ from 'lodash'
import { GameMap, Point, TileType } from '../types'
import { getDistance, getNeighbors } from './common'
import { constructCorridor } from './corridors'

/**
 * Finds isolated clusters within a given map.
 *
 * This function identifies isolated parts of the maze (corridors, rooms, and room origins)
 * and returns them as clusters. A cluster is a group of tiles that are connected to each other
 * but isolated from other tiles in the map.
 *
 * @param {GameMap} map - The map to analyze.
 * @returns {Point[][]} A list of clusters where each cluster is a list of points (tiles) belonging to that cluster.
 */
export const findIsolatedClusters = (map: GameMap): Point[][] => {
  const visited: boolean[][] = Array(map.tiles.length)
    .fill(null)
    .map(() => Array(map.tiles[0].length).fill(false))
  const clusters: Point[][] = []

  const floodFill = (x: number, y: number, currentCluster: Point[]) => {
    if (visited[x][y] || map.tiles[x][y] === TileType.WALL) {
      return
    }

    visited[x][y] = true
    currentCluster.push({ x, y })

    getNeighbors(x, y, map).forEach((neighbor) => floodFill(neighbor.x, neighbor.y, currentCluster))
  }

  for (let x = 0; x < map.tiles.length; x++) {
    for (let y = 0; y < map.tiles[0].length; y++) {
      if (
        !visited[x][y] &&
        (map.tiles[x][y] === TileType.CORRIDOR ||
          map.tiles[x][y] === TileType.ROOM ||
          map.tiles[x][y] === TileType.ROOM_ORIGIN)
      ) {
        const cluster: Point[] = []
        floodFill(x, y, cluster)
        if (cluster.length > 0) clusters.push(cluster)
      }
    }
  }

  return clusters
}

/**
 * Retrieves intersection points within a cluster based on a specified wall step.
 *
 * This function scans the vicinity of the cluster in intervals defined by `wallStep` to identify
 * intersection locations. It determines the boundaries of the cluster and then checks
 * tiles within those boundaries at the specified interval. Only tiles that are of type corridor,
 * room, or room origin and that belong to the provided cluster are considered as intersections.
 *
 * @param map - The game map to be scanned for intersections.
 * @param cluster - The cluster of points for which to find intersections.
 * @param wallStep - The interval at which tiles are checked for intersections.
 * @param corridorStep - The size variable which determines the width and height of the corridor rectangle.
 * @returns An array of points indicating intersection locations within the cluster's vicinity.
 */
export const getIntersectionsInCluster = (
  map: GameMap,
  cluster: Point[],
  wallStep: number,
  corridorStep: number,
): Point[] => {
  const points: Point[] = []
  for (
    let x = wallStep + Math.floor(corridorStep / 2);
    x < map.tiles.length - Math.floor(corridorStep / 2);
    x += wallStep
  ) {
    for (
      let y = wallStep + Math.floor(corridorStep / 2);
      y < map.tiles[0].length - Math.floor(corridorStep / 2);
      y += wallStep
    ) {
      // Ensure the coordinates are within the map's boundaries and belong to the cluster.
      if (
        x < map.tiles.length &&
        y < map.tiles[0].length &&
        cluster.some((p) => p.x === x && p.y === y)
      ) {
        // Check if the tile is a corridor, room, or room origin.
        const tileType = map.tiles[x][y]
        if (
          tileType === TileType.CORRIDOR ||
          tileType === TileType.ROOM ||
          tileType === TileType.ROOM_ORIGIN
        ) {
          points.push({ x, y })
        }
      }
    }
  }

  return points
}

/**
 * Connects isolated clusters together by constructing corridors between nearest intersection points.
 *
 * This function ensures that the number of corridors constructed is minimized by employing a strategy
 * similar to the Minimum Spanning Tree.
 *
 * @param {GameMap} map - The map containing the isolated clusters.
 * @param {Point[][]} clusters - The isolated clusters to be connected.
 * @param wallStep - The interval at which tiles are checked for intersections.
 * @param corridorStep - The size variable which determines the width and height of the corridor rectangle.
 */
export const connectClusters = (
  map: GameMap,
  clusters: Point[][],
  wallStep: number,
  corridorStep: number,
): GameMap => {
  while (clusters.length > 1) {
    let nearestClusterIndex = -1
    let currentClusterIndex = 0
    let minDistance = Infinity
    let start: Point = { x: 0, y: 0 }
    let end: Point = { x: 0, y: 0 }

    const currentCluster = clusters[currentClusterIndex]

    // Find the nearest cluster
    for (let i = 0; i < clusters.length; i++) {
      if (i !== currentClusterIndex) {
        const possibleStart = getIntersectionsInCluster(map, currentCluster, wallStep, corridorStep)
        const possibleEnd = getIntersectionsInCluster(map, clusters[i], wallStep, corridorStep)

        for (const s of possibleStart) {
          for (const e of possibleEnd) {
            const distance = getDistance(s, e)
            if (distance < minDistance) {
              minDistance = distance
              start = s
              end = e
              nearestClusterIndex = i
            }
          }
        }
      }
    }

    // Connect the current cluster to the nearest cluster
    map = constructCorridor(map, start, end, corridorStep)

    // Remove the current cluster from the list
    clusters.splice(currentClusterIndex, 1)

    // If the nearest cluster is after the current in the list, decrement its index due to the splice
    if (nearestClusterIndex > currentClusterIndex) {
      nearestClusterIndex--
    }

    // Set the nearest cluster as the new current cluster
    currentClusterIndex = nearestClusterIndex
  }

  return map
}
