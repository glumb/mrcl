/**
 * This test shows how to control a robot running the MRC - MicroPede Robot controller (github.com/glumb/mrc)
 */
import SerialPort from 'serialport'
import debug from 'debug'
import inquirer from 'inquirer'
import CliTable from 'cli-table'
import readline from 'readline'
import MRCL, {
  MRIB,
  SerialTransport,
} from '../src/index'

import StatusHelper from './StatusHelper'

const prompt = inquirer.createPromptModule()
let x = 18
let y = 0
let z = 5
let a = 0
let b = 180
let c = 0
let step = 1
let programm = ''

SerialPort.list((err, ports) => {
  prompt([
    {
      type: 'list',
      name: 'port',
      message: 'Select serial port',
      choices: ports.map(el => el.comName),
    },
  ]).then((answers) => {
    const port = answers.port

    const transport = new SerialTransport({
      port,
      bausRate: 9600,
    })
    const mrcl = new MRCL(transport, {
      autoTransmit: true,
    })

    const log = debug('test')

    const mrib = new MRIB(mrcl)
    mrib.execute().moveP2P(x, y, z, a, b, c, 200)


    const Table = new CliTable({
      head: ['x', 'y', 'z', 'a', 'b', 'c', 'step'],
      colWidths: [10, 10, 10, 10, 10, 10, 10],
    })

    function displayTable() {
      process.stdout.write('\x1B[1;1f') // reset cursor
      Table.splice(0, Table.length)

      Table.push([x.toFixed(3), y.toFixed(3), z.toFixed(3), a.toFixed(3), b.toFixed(3), c.toFixed(3), step])

      console.log(Table.toString())
    }
    displayTable()
    process.stdout.write('\x1Bc') // clear screen
    console.log('Use W,A,S,D to move the robot in X,Y plane.')
    console.log('Use Q,E to lift and lower.')
    console.log('Hold down SHIFT to change the orientation A,B,C.')
    console.log('1-5 set the step. use ENTER to safe the current position.')

    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c') {
        process.stdout.write('\x1Bc') // clear screen
        console.log(programm)
        process.exit()
      } else if (key.shift) {
        switch (key.name) {
          case 'w':
            a += step
            break
          case 's':
            a -= step
            break
          case 'a':
            b += step
            break
          case 'd':
            b -= step
            break
          case 'e':
            c += step
            break
          case 'q':
            c -= step
            break
          default:
            break
        }
      } else {
        switch (key.name) {
          case 'w':
            x += step
            break
          case 's':
            x -= step
            break
          case 'a':
            y += step
            break
          case 'd':
            y -= step
            break
          case 'e':
            z += step
            break
          case 'q':
            z -= step
            break
          case '1':
            step = 0.02
            break
          case '2':
            step = 0.2
            break
          case '3':
            step = 0.5
            break
          case '4':
            step = 1
            break
          case '5':
            step = 1.5
            break
          case '6':
            step = 3
            break
          case '7':
            step = 5
            break
          case 'return':
            console.log(`added instruction: X ${x.toFixed(3)}Y ${y.toFixed(3)}Z ${z.toFixed(3)}A ${a.toFixed(3)}B ${b.toFixed(3)}C ${c.toFixed(3)}`)
            programm += `X ${x.toFixed(3)}Y ${y.toFixed(3)}Z ${z.toFixed(3)}A ${a.toFixed(3)}B ${b.toFixed(3)}C ${c.toFixed(3)}\n`
            break

          default:
            console.log(key)
        }
      }
      mrib.execute().moveP2P(x, y, z, a, b, c, 200)
      displayTable()
    })
  })
})
