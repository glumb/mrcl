// import 'babel-polyfill'
import 'mocha/mocha'
import {
  expect,
} from 'chai'

import {
  MRIB,
  MRCL,
  protocol,
} from '../src/index'

import Transport from './TransportMock'

let Mrcl
let Mrib
let Tp
beforeEach(() => {
  // create a new Tp instance to remove al prior listeners
  Tp = new Transport()
  Mrcl = new MRCL(Tp)
  Mrib = new MRIB(Mrcl)
})

describe('MRIB', () => {
  describe('#delay', () => {
    it('should send a wait command', () => {
      Tp.on('transmit', (data) => {
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) < 0) {
          expect(data).to.include(protocol.MRIL.WAIT)
          expect(data).to.include(123)
        }
      })

      Mrib.delay(123)
    })
  })
  describe('#moveLinear', () => {
    it('should send move command', () => {
      Tp.on('transmit', (data) => {
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) < 0) {
          expect(data).to.include(`${protocol.MRIL.MOVEMENT_METHOD}01`)
          expect(data).to.include(10)
          expect(data).to.include(20)
          expect(data).to.include(30)
        }
      })

      Mrib.moveLinear(10, 20, 30)
    })
    it('should send move command including velocity', () => {
      Tp.on('transmit', (data) => {
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) < 0) {
          expect(data).to.include(`${protocol.MRIL.MOVEMENT_METHOD}01`)
          expect(data).to.include(`${protocol.MRIL.VELOCITY}99`)
          expect(data).to.include(10)
          expect(data).to.include(20)
          expect(data).to.include(99)
        }
      })

      Mrib.moveLinear(10, 20, 30, 40, 50, 60, 99)
    })
    it('should execute the callback on successfull command execution', (done) => {
      let number

      Tp.on('transmit', (data, sentCb) => {
        // command was successfully sent
        sentCb()

        // grep command number
        number = data.match(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}(\\d+)`, 'gi'))
        if (number) {
          number = number[0].substring(1)
        }
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) !== 1) {
          Tp.emit('receive', `${protocol.MRCPR.START_FRAME + protocol.MRIL.COMMAND_NUMBER}1${number}${protocol.MRCPR.END_FRAME}`)
        }
      })

      Mrib.moveLinear(10, 20, 30, 40, 50, 60, 99, () => {
        done()
      })
    })
    it('should execute the callback on successfull command execution (only X,Y given)', (done) => {
      let number

      Tp.on('transmit', (data, sentCb) => {
        // command was successfully sent
        sentCb()

        // grep command number
        number = data.match(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}(\\d+)`, 'gi'))
        if (number) {
          number = number[0].substring(1)
        }
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) !== 1) {
          Tp.emit('receive', `${protocol.MRCPR.START_FRAME + protocol.MRIL.COMMAND_NUMBER}1${number}${protocol.MRCPR.END_FRAME}`)
        }
      })

      Mrib.moveLinear(10, 20, () => {
        done()
      })
    })
    it('should execute the callback on successfull queue command execution (only X,Y given)', (done) => {
      let number

      Tp.on('transmit', (data, sentCb) => {
        // command was successfully sent
        sentCb()

        // grep command number
        number = data.match(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}(\\d+)`, 'gi'))
        if (number) {
          number = number[0].substring(1)
        }
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) !== 1) {
          Tp.emit('receive', `${protocol.MRCPR.START_FRAME + protocol.MRIL.COMMAND_NUMBER}1${number}${protocol.MRCPR.END_FRAME}`)
        }
      })


      Mrib.queue().moveLinear(10, 20, () => {
        done()
      })

      // send free receive buffer
      Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}200${protocol.MRCP.END_FRAME}`)
    })
  })
  describe('#getPose', () => {
    it('should execute the callback on successfull queue command execution and pass the response data', (done) => {
      let number

      Tp.on('transmit', (data, sentCb) => {
        // command was successfully sent
        sentCb()

        // grep command number
        number = data.match(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}(\\d+)`, 'gi'))
        if (number) {
          number = number[0].substring(1)
        }
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) !== 1) {
          Tp.emit('receive', `${protocol.MRCPR.START_FRAME + protocol.MRIL.COMMAND_NUMBER}1${number}${protocol.MRIL.X}-0.5${protocol.MRIL.Y}6${protocol.MRIL.Z}7${protocol.MRIL.A}8${protocol.MRIL.B}9${protocol.MRIL.C}10${protocol.MRCPR.END_FRAME}`)
        }
      })


      Mrib.execute().getPose((pose) => {
        expect(pose.x).to.equal(-0.5)
        expect(pose.y).to.equal(6)
        expect(pose.z).to.equal(7)
        expect(pose.a).to.equal(8)
        expect(pose.b).to.equal(9)
        expect(pose.c).to.equal(10)
        done()
      })

      // send free receive buffer
      Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}200${protocol.MRCP.END_FRAME}`)
    })
  })
  describe('#getAngles', () => {
    it('should execute the callback on successfull queue command execution and pass the response data', (done) => {
      let number

      Tp.on('transmit', (data, sentCb) => {
        // command was successfully sent
        sentCb()

        // grep command number
        number = data.match(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}(\\d+)`, 'gi'))
        if (number) {
          number = number[0].substring(1)
        }
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) !== 1) {
          Tp.emit('receive', `${protocol.MRCPR.START_FRAME + protocol.MRIL.COMMAND_NUMBER}1${number}${protocol.MRIL.ANGLE}013${protocol.MRIL.ANGLE}1-0.5${protocol.MRIL.ANGLE}22${protocol.MRIL.ANGLE}33${protocol.MRIL.ANGLE}44${protocol.MRIL.ANGLE}55${protocol.MRCPR.END_FRAME}`)
        }
      })


      Mrib.execute().getAngles((angles) => {
        expect(angles[0]).to.equal(13)
        expect(angles[1]).to.equal(-0.5)
        expect(angles[2]).to.equal(2)
        expect(angles[3]).to.equal(3)
        expect(angles[4]).to.equal(4)
        expect(angles[5]).to.equal(5)
        done()
      })

      // send free receive buffer
      Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}200${protocol.MRCP.END_FRAME}`)
    })
  })
  describe('#moveP2P', () => {
    it('should send P2P move command', () => {
      Tp.on('transmit', (data) => {
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) < 0) {
          expect(data).to.include(`${protocol.MRIL.MOVEMENT_METHOD}00`)
          expect(data).to.include(10)
          expect(data).to.include(20)
          expect(data).to.include(30)
        }
      })

      Mrib.moveP2P(10, 20, 30)
    })
  })
})
