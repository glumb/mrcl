/**
 * This test shows how to control a robot running the MRC - MicroPede Robot controller (github.com/glumb/mrc)
 * a file is read and send line by line to the robot, respecting queue size
 */

 import debug from 'debug'
 import readline from 'readline'
 import fs from 'fs'
 import MRCL, {
  MRCP,
  MRIL,
  protocol,
  SerialTransport,
} from '../src/index'

 import StatusHelper from './StatusHelper'
 const log = debug('readFile')

 const file = process.argv[2]

 if (!file) {
   throw 'specify a file from which to reat the MRIL from'
 }

 console.log(`reading file: ${file}`)

 const transport = new SerialTransport({
   port: '/dev/cu.usbmodem2936941', // on mac, do ls /dev/{tty,cu}.* to list the ports
   bausRate: 9600,
 })

 // transport.onReceive(msg => console.log(msg))

 const mrcl = new MRCL(transport, {
   autoTransmit: true,
 })


 const helper = new StatusHelper(mrcl)

 const lineReader = readline.createInterface({
   input: fs.createReadStream(file),
 })

 let mril

 lineReader.on('line', (line) => {
   console.log('reading line: ', line)
   if (line.trim().length == 0) return // skip empty lines

   mril = new MRIL(line)
   const cmd = new MRCP(protocol.MRCP.WRITE, mril)
   mrcl.send(cmd)
 }).on('close', () => {
   mril.onExecuted(() => {
     console.log('file read and all commands executed')
     setTimeout(() => { // to be able to daraw the table one more time and show all instructions as executed
       process.exit(0)
     }, 10)
   })
 })
