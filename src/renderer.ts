import { createCanvas } from 'canvas'
import { GameMap, TileType } from './types'
import { tileColorMapping } from './mappings'

export const renderGameMapToImage = (map: GameMap): Buffer => {
  const tileSize = 16
  const canvas = createCanvas(
    map.tiles.length * tileSize,
    map.tiles[0].length * tileSize,
  )
  const ctx = canvas.getContext('2d')

  map.tiles.forEach((row, x) => {
    row.forEach((tile, y) => {
      ctx.fillStyle = tile ? tileColorMapping[tile] : '#FFFFFF'
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
    })
  })

  return canvas.toBuffer()
}
