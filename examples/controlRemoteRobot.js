/**
 * This test shows how to control a robot running the MRC - MicroPede Robot controller (github.com/glumb/mrc)
 */
import SerialPort from 'serialport'
import debug from 'debug'
import MRCL, {
  MRIB,
  SerialTransport,
} from '../src/index'

import StatusHelper from './StatusHelper'

SerialPort.list((err, ports) => {
  ports.forEach((port) => {
    console.log(port.comName, 'use this as the "port" parameter for the SerialTransport instance')
    console.log(port.manufacturer)
  })
})

const transport = new SerialTransport({
  port: '/dev/cu.usbmodem2936941', // on mac, do ls /dev/{tty,cu}.* to list the ports
  bausRate: 9600,
})

const mrcl = new MRCL(transport, {
  autoTransmit: true,
})

const log = debug('test')

const mrib = new MRIB(mrcl)

const helper = new StatusHelper(mrcl, false)

function relativeCoordinatesForCircle(r, angle) {
  angle %= 360
  let x
  let y
  if (angle < 90) {
    angle %= 90
    x = r * Math.cos(angle / 180 * Math.PI)
    y = r * Math.sin(angle / 180 * Math.PI)
  } else if (angle < 180) {
    angle %= 90
    x = r * -Math.sin(angle / 180 * Math.PI)
    y = r * Math.cos(angle / 180 * Math.PI)
  } else if (angle < 270) {
    angle %= 90
    x = r * -Math.cos(angle / 180 * Math.PI)
    y = r * -Math.sin(angle / 180 * Math.PI)
  } else {
    angle %= 90
    x = r * Math.sin(angle / 180 * Math.PI)
    y = r * -Math.cos(angle / 180 * Math.PI)
  }
  return { x, y }
}


function moveInaCircle(x, y, z, r, amountOfSteps) {
  mrib.clearQueue()
  for (let i = 0; i < 360; i += (360 / amountOfSteps)) {
    const { x: xRel, y: yRel } = relativeCoordinatesForCircle(r, i)

    mrib.queue().moveP2P(x + xRel, y + yRel, z, 0, 180, 0, 150)
  }
}

function moveInaHelix(x, y, z, r, h, amountOfSteps) {
  mrib.clearQueue()
  for (let i = 0; i < 360; i += (360 / amountOfSteps)) {
    const { x: xRel, y: yRel } = relativeCoordinatesForCircle(r, i)

    mrib.queue().moveP2P(x + xRel, y + yRel, z + i * h / 360, 0, 180, 0, 150)
  }
}

const x = 19.5
const y = 0
const z = -5
const radius = 3.5

// moveInaCircle(x, y, z, radius, 30)
// moveInaCircle(x, y, z, radius, 40)
// moveInaCircle(x, y, z, radius, 50)
// moveInaCircle(x, y, z, radius, 60)
// moveInaCircle(x, y, z, radius, 70)

const pitch = 2
const height = 10
for (let i = 0; i < height; i += pitch) {
  moveInaHelix(x, y, z + i, radius, pitch, 60)
}
