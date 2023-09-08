import { createCanvas } from 'canvas'
import { GameMap } from './types'
import { tileColorMapping, edgeColorMapping } from './mappings'

const TILE_SIZE = 16
const BODER_WIDTH = 2

export const renderGameMapToImage = (map: GameMap): Buffer => {
  const canvas = createCanvas(
    map.tiles.length * TILE_SIZE,
    map.tiles[0].length * TILE_SIZE,
  )
  const ctx = canvas.getContext('2d')

  map.tiles.forEach((row, x) => {
    row.forEach((tile, y) => {
      ctx.fillStyle = tile ? tileColorMapping[tile] : '#FFFFFF' // White for null tiles
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
    })
  })

  map.edges.forEach((row, x) => {
    row.forEach((edge, y) => {
      if (edge) {
        if (edge.top && edgeColorMapping[edge.top]) {
          ctx.fillStyle = edgeColorMapping[edge.top]
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, BODER_WIDTH)
        }
        if (edge.right && edgeColorMapping[edge.right]) {
          ctx.fillStyle = edgeColorMapping[edge.right]
          ctx.fillRect(
            (x + 1) * TILE_SIZE - BODER_WIDTH,
            y * TILE_SIZE,
            BODER_WIDTH,
            TILE_SIZE,
          )
        }
        if (edge.bottom && edgeColorMapping[edge.bottom]) {
          ctx.fillStyle = edgeColorMapping[edge.bottom]
          ctx.fillRect(
            x * TILE_SIZE,
            (y + 1) * TILE_SIZE - BODER_WIDTH,
            TILE_SIZE,
            BODER_WIDTH,
          )
        }
        if (edge.left && edgeColorMapping[edge.left]) {
          ctx.fillStyle = edgeColorMapping[edge.left]
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, BODER_WIDTH, TILE_SIZE)
        }
      }
    })
  })

  return canvas.toBuffer()
}
