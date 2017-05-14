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
    console.log(port.comName, 'use this as the "port" paramter for the SerialTransport instance')
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

const helper = new StatusHelper(mrcl)


 // for (let i = 0; i < 3; i++) {
 //   mrib.queue()
 //   .moveLinear(10, 10, 10, 0, 180, 0, 10, () => console.log('done'))
 //   .moveLinear(10, -10, 10, 0, 180, 0, 20)
 //   .moveP2P(15, 0, 15, 0, 90, 0, 3)
 // }
 //


function moveInaCircle(x, y, z, r, amountOfSteps) {
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

  for (let i = 0; i < 360; i += (360 / amountOfSteps)) {
    const { x: xRel, y: yRel } = relativeCoordinatesForCircle(r, i)

    mrib.queue().moveP2P(x + xRel, y + yRel, z, 0, 180, 0, 0.001)
  }
}

moveInaCircle(18, 0, 18, 4, 30)
moveInaCircle(18, 0, 18, 4, 40)
moveInaCircle(18, 0, 18, 4, 50)
moveInaCircle(18, 0, 18, 4, 60)
moveInaCircle(18, 0, 18, 4, 70)
  // .moveP2P(20, 29, 10, () => console.log('P2P'))
  // .setVelocity(5)
  // .execute().moveP2P(1, 2, 3)
  // .queue()
  // .pose(0, Math.PI / 2, 0, () => console.log('pose'))
  // .moveLinear(1, 1, 1)

// displayCommandTable()
// mrcl.queueMRIL(['Q M0 X29 Y29E', 'Q M0 X29 Y29E', 'Q M0 X29 Y29E', 'Q M0 X29 Y29E', 'Q M0 X29 Y29E'])
// mrcl.queueMRIL('Q M0 X29 Y29E', () => {
//   log('EXECUTEEDDDMUHHHHHUHUHUHUHUHUHUHLOLOLOLOLLOL')
// }).transmit()
// mrcl.sendMRIL('Q M0 X0 Y0 Z0').sendMRIL('Q M01 X01 Y01 Z01')
// log('YOLO END OF FILEEEE')

// const move = ( X, Y, Z, cb) => mrcl.halt().moveP2P(X, Y, Z).done(cb)
// mrcl.while(condition => mrcl.getIO(IO => condition(IO[0] == 1)),
//   (done) => {
//     mrcl.moveLinearRelative(-1).done(done)
//   },
// )
// mrcl.getAngles()
// mrcl.getPose()
// mrcl.halt()
