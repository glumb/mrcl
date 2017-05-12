/**
 * This test shows how to control a robot running the MRC - MicroPede Robot controller (github.com/glumb/mrc)
 * a file is read and send line by line to the robot, respecting queue size
 */

 import debug from 'debug'
 import fs from 'fs'
 import MRCL, {
   MRIB,
  protocol,
  SerialTransport,
} from '../src/index'
 import StatusHelper from './StatusHelper'

 const PickupPosition = { x: 15, y: -15, z: 10, a: 0, b: 180, c: 0 }
 const DeliverPosition = { x: 5, y: -15, z: 10, a: 0, b: 180, c: 0 }


 const transport = new SerialTransport({
   port: '/dev/cu.usbmodem2936941', // on mac, do ls /dev/{tty,cu}.* to list the ports
   bausRate: 9600,
 })

 const mrcl = new MRCL(transport, {
   autoTransmit: true,
 })


 // mril = new MRIL(line)
 // const cmd = new MRCP(protocol.MRCP.QUEUE_IN, mril)
 // mrcl.send(cmd)

 const mrib = new MRIB(mrcl)
 const helper = new StatusHelper(mrcl)

 mrib.queue()
 .setOutput(0, 1).setInput(3, 1)
      .setVelocity(2).moveP2P(PickupPosition.x, PickupPosition.y, PickupPosition.z + 6, PickupPosition.a, PickupPosition.b, PickupPosition.c)
      .setVelocity(5).moveLinear(PickupPosition.x, PickupPosition.y, PickupPosition.z, PickupPosition.a, PickupPosition.b, PickupPosition.c)
      .setVelocity(2).setAdditionalAxis(6, 0)
      .setVelocity(5).moveLinear(PickupPosition.x, PickupPosition.y, PickupPosition.z + 6, PickupPosition.a, PickupPosition.b, PickupPosition.c)
      .setVelocity(5).moveP2P(DeliverPosition.x, DeliverPosition.y, DeliverPosition.z + 6, DeliverPosition.a, DeliverPosition.b, DeliverPosition.c)
                     .moveLinear(DeliverPosition.x, DeliverPosition.y, DeliverPosition.z, DeliverPosition.a, DeliverPosition.b, DeliverPosition.c)
      .setVelocity(3).setAdditionalAxis(6, 1)
      .setVelocity(2).moveP2P(DeliverPosition.x, DeliverPosition.y, DeliverPosition.z + 6, DeliverPosition.a, DeliverPosition.b, DeliverPosition.c)
