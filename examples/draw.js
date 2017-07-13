/**
 * Robot coordinates - top-down
 *  ----> y
 * |
 * V x          ^ y
 *              |
 *       x <----
 * svg coordinates
 *
 * SVG
 * width and height set the dimensions of the drawings in cm
 * <svg width="10" height="10">
 * do not use % (width="12%")
 *
 */

import cheerio from 'cheerio'
import { svgPathProperties } from 'svg-path-properties'
import MRCL, {
  MRIB,
  SerialTransport,
} from '../src/index'
import MRILCompressor from './MRILCompressor'
import StatusHelper from './StatusHelper'

const transport = new SerialTransport({
  port: '/dev/cu.usbmodem2936941', // on mac, do ls /dev/{tty,cu}.* to list the ports
  baudRate: 9600,
})

const mrcl = new MRCL(transport, {
  autoTransmit: true,
})

const helper = new StatusHelper(mrcl, 'list')

const mrib = new MRIB(mrcl)

// const $ = cheerio.load(`
//   <svg width="3" height="3" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
//       <path d="M100,100L0,100L0,0L100,0L100,100" style="fill:none;stroke:rgb(14,229,76);stroke-width:8.33px;"/>
//       <path d="M150,150L0,150L0,0L150,0L150,150" style="fill:none;stroke:rgb(14,229,76);stroke-width:8.33px;"/>
//   </svg>
// `)

const $ = cheerio.load(`
  <svg width="10" height="10" viewBox="0 0 400 400" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
  <path id="Spiral" stroke-width="2" fill="none" stroke="maroon" d="M200 200 S 200.5 200 201.1 200.2 201.5 200.4 202 200.7 202.4 201.1 202.8 201.5 203.1 202.1 203.3 202.7 203.5 203.3 203.6 204 203.5 204.7 203.4 205.4 203.2 206.1 202.9 206.9 202.5 207.6 201.9 208.3 201.3 209 200.6 209.6 199.8 210.1 198.9 210.6 197.9 211 196.8 211.3 195.7 211.5 194.6 211.6 193.3 211.5 192.1 211.4 190.8 211.1 189.6 210.7 188.3 210.1 187.1 209.4 185.9 208.6 184.7 207.6 183.6 206.5 182.6 205.2 181.7 203.9 181 202.4 180.3 200.8 179.8 199.2 179.4 197.4 179.1 195.6 179.1 193.7 179.2 191.8 179.5 189.8 179.9 187.8 180.6 185.9 181.4 184 182.5 182.1 183.7 180.3 185.1 178.5 186.7 176.9 188.4 175.4 190.3 174 192.4 172.8 194.6 171.7 196.9 170.8 199.4 170.1 201.9 169.7 204.5 169.4 207.2 169.4 209.9 169.6 212.6 170 215.3 170.7 218 171.6 220.6 172.8 223.2 174.2 225.7 175.9 228 177.8 230.2 179.9 232.2 182.3 234.1 184.8 235.8 187.5 237.2 190.5 238.4 193.5 239.3 196.7 240 200 240.4 203.4 240.5 206.8 240.3 210.3 239.8 213.9 239 217.4 237.9 220.8 236.4 224.2 234.7 227.5 232.7 230.7 230.3 233.7 227.7 236.5 224.9 239.2 221.7 241.6 218.4 243.8 214.8 245.7 211.1 247.3 207.2 248.5 203.1 249.5 199 250.1 194.7 250.4 190.4 250.3 186.1 249.8 181.8 249 177.5 247.8 173.3 246.2 169.3 244.2 165.3 241.9 161.6 239.2 158 236.2 154.7 232.9 151.6 229.3 148.9 225.4 146.4 221.2 144.3 216.8 142.6 212.2 141.3 207.4 140.3 202.5 139.8 197.5 139.7 192.4 140 187.2 140.8 182.1 142 177 143.6 172 145.7 167.1 148.2 162.4 151.1 157.8 154.5 153.5 158.2 149.5 162.3 145.7 166.7 142.3 171.4 139.2 176.4 136.5 181.6 134.2 187.1 132.4 192.8 131 198.5 130.1 204.4 129.7 210.4 129.8 216.3 130.4 222.2 131.5 228.1 133.1 233.9 135.2 239.4 137.9 244.8 141 250 144.5 254.8 148.5 259.4 153 263.5 157.8 267.3 163 270.6 168.5 273.5 174.4 275.9 180.5 277.8 186.8 279.2 193.4 280 200 280.3 206.7 279.9 213.5 279 220.3 277.6 227 275.5 233.6 272.9 240.1 269.7 246.3 266 252.3 261.8 258 257.1 263.4 251.9 268.4 246.3 272.9 240.3 277 233.9 280.6 227.2 283.7 220.2 286.2 213 288.1 205.6 289.4 198.1 290.1 190.5 290.2 182.9 289.6 175.3 288.4 167.8 286.5 160.5 284 153.3 280.8 146.4 277.1 139.8 272.7 133.6 267.8 127.7 262.4 122.3 256.4 117.4 250 113.1 243.2 109.3 235.9 106.1 228.4 103.5 220.5 101.6 212.4 100.4 204.2 99.8 195.8 100 187.4 100.9 178.9 102.5 170.6 104.8 162.3 107.8 154.2 111.5 146.4 115.9 138.9 120.9 131.7 126.5 124.9 132.7 118.6 139.4 112.8 146.7 107.6 154.4 103 162.4 99 170.9 95.7 179.6 93.1 188.6 91.3 197.7 90.2 206.9 89.8 216.2 90.3 225.5 91.5 234.6 93.5 243.6 96.3 252.4 99.8 260.9 104.1 269 109.1 276.7 114.8 284 121.1 290.7 128.1 296.8 135.7 302.4 143.7 307.2 152.3 311.3 161.2 314.7 170.6 317.3 180.2 319 190 320 200 320.1 210.1 319.4 220.2 317.8 230.2 315.3 240.2 312.1 249.9 308 259.4 303.1 268.5 297.4 277.2 291 285.4 283.9 293.1 276.1 300.3 267.7 306.7 258.8 312.5 249.4 317.5 239.6 321.7 229.4 325.1 218.9 327.7 208.1 329.3 197.3 330.1 186.3 330 175.4 328.9 164.6 326.9 153.9 324 143.5 320.2 133.3 315.5 123.6 309.9 114.3 303.6 105.6 296.4 97.5 288.5 90 279.9 83.2 270.7 77.2 260.9 72.1 250.7 67.8 239.9 64.4 228.8 61.9 217.4 60.4 205.9 59.9 194.1 60.3 182.4 61.8 170.6 64.2 159 67.6 147.6 72 136.4 77.3 125.7 83.5 115.4 90.6 105.6 98.5 96.4 107.2 87.8 116.6 80 126.7 73 137.3 66.8 148.5 61.5 160.1 57.2 172.1 53.8 184.4 51.5 196.9 50.2 209.4 49.9 222 50.7 234.6 52.5 247 55.4 259.1 59.4 270.9 64.4 282.3 70.3 293.2 77.2 303.5 85.1 313.1 93.8 322 103.3 330.2 113.5 337.4 124.5 343.7 136 349.1 148.1 353.4 160.6 356.7 173.5 358.9 186.7 358.9 186.7"></path>
  </svg>
`)

const stepWidth = 0.05

const $svg = $('svg').first()

const scaleWidth = $svg.attr('width') / $svg.attr('viewBox').split(' ')[2]
const scaleHeight = $svg.attr('height') / $svg.attr('viewBox').split(' ')[3]

const startPositionX = 25
const startPositionY = $svg.attr('width') / 2
const velocity = 100
const zPosition = 0


console.log(scaleHeight)
console.log(scaleWidth)

const Compressor = new MRILCompressor()

mrib.comment('Draw')
mrib.moveP2PAngles(0, 0, 0, 0, 0, 0, 150)
mrib.moveP2P(startPositionX, 0, 5, 0, 180, 0, 50)

$('path').each((index, el) => {
  const path = $(el).attr('d')
  const properties = svgPathProperties(path)
  const length = properties.getTotalLength()

  mrib.comment(`Path ${index}`)

  for (let i = 0; i < length; i += stepWidth / scaleHeight) {
    const point = properties.getPointAtLength(i)
    const tangent = properties.getTangentAtLength(i)
    const xRobot = -point.y * scaleHeight + startPositionX
    const yRobot = -point.x * scaleWidth + startPositionY

    // console.log(point)
    // console.log(xRobot, yRobot)
    mrib.setVelocity(velocity).moveLinear(xRobot, yRobot)

    if (i == 0) {
      mrib.setVelocity(5).moveToZ(0)
    }
  }
  mrib.setVelocity(15).moveToZ(5)
})
// console.log(mrib.dump().join('\n'))
mrib.queue()
const i = 0
mrib.dump().forEach((line) => {
  const message = Compressor.compress(line)
  if (message.length > 0) {
    mrib.createMRIL(message)
  }
})
