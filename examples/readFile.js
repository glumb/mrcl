/**
 * This test shows how to control a robot running the MRC - MicroPede Robot controller (github.com/glumb/mrc)
 * a file is read and send line by line to the robot, respecting queue size
 */

 import debug from 'debug'
 import readline from 'readline'
 import SerialPort from 'serialport'
 import fs from 'fs'
 import inquirer from 'inquirer'
 import MRCL, {
  MRCP,
  MRIL,
  protocol,
  SerialTransport,
} from '../src/index'
 import MRILCompressor from './MRILCompressor'

 import StatusHelper from './StatusHelper'
 const log = debug('readFile')

 const portArg = process.argv[2]
 const fileArg = process.argv[3]
 const modeArg = process.argv[4]


 function sendFile(port, filename, mode = protocol.MRCP.EXECUTE) {
   console.log(`reading file: ${filename}`)

   const transport = new SerialTransport({
     port, // on mac, do ls /dev/{tty,cu}.* to list the ports
     bausRate: 9600,
   })

 // transport.onReceive(msg => console.log(msg))

   const mrcl = new MRCL(transport, {
     autoTransmit: true,
   })


   const helper = new StatusHelper(mrcl, true)

   const lineReader = readline.createInterface({
     input: fs.createReadStream(filename),
   })

   let mril
   const Compressor = new MRILCompressor()

   lineReader.on('line', (line) => {
     console.log('reading line: ', line)
     const compressedLine = Compressor.compress(line)
     if (compressedLine.length === 0) return // skip empty lines
     // remove redundant instructions to save space on eeprom
     mril = new MRIL(compressedLine)
     const cmd = new MRCP(mode, mril)
     mrcl.send(cmd)
   }).on('close', () => {
     mril.onExecuted(() => {
       console.log('file read and all commands executed')
       setTimeout(() => { // to be able to daraw the table one more time and show all instructions as executed
         process.exit(0)
       }, 10)
     })
   })
 }

// Processing configuration. File, port, method
 const prompt = inquirer.createPromptModule()

 if (fileArg && portArg) {
   sendFile(portArg, fileArg, modeArg)
 } else {
   SerialPort.list((err, ports) => {
     prompt([
       {
         type: 'list',
         name: 'port',
         message: 'Select serial port',
         choices: ports.map(el => el.comName),
       },
       {
         type: 'input',
         name: 'file',
         message: 'File to transmit',
       },
       {
         type: 'list',
         name: 'mode',
         message: 'Transfer mode',
         choices: [
           {
             name: 'Execute',
             value: protocol.MRCP.EXECUTE,
           },
           {
             name: 'Queue',
             value: protocol.MRCP.QUEUE,
           },
           {
             name: 'Write to EEPROM',
             value: protocol.MRCP.WRITE,
           },
         ],
       },
     ]).then((answers) => {
       console.log('use the following command to quick upload')
       console.log(`babel-node readFile.js ${answers.port} ${answers.file} ${answers.mode}`)
       sendFile(answers.port, answers.file, answers.mode)
     })
   })
 }
