// import 'babel-polyfill'
import 'mocha/mocha'
import {
  expect,
} from 'chai'

import {
  MRCP,
  MRIL,
  MRCL,
  protocol,
} from '../src/index'

import TransportMock from './TransportMock'


let Tp

beforeEach(() => {
  Tp = new TransportMock()
})

describe('MRCL', () => {
  describe('#send', () => {
    // it('should send a command to retrieve buffer size', (done) => {
    //   const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))
    //   const mrcl = new MRCL(Tp)
    //
    //   Tp.once('transmit', (data, sent) => {
    //     sent()
    //     expect(data).to.include(protocol.MRCP.FREE_MRIL_BUFFER)
    //     done()
    //   })
    //   mrcl.send(mrcp)
    // })

    it('should call transmit on Transport for queue', (done) => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))
      const mrcl = new MRCL(Tp)

      Tp.on('transmit', (data, sent) => {
        sent()
        if (data.indexOf('XYZ') >= 0) {
          done()
        }
      })
      mrcl.send(mrcp)
      Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}1000${protocol.MRCP.END_FRAME}`)
    })

    it('should call transmit on Transport when free buffer size is sufficient', () => {
      // dont rely on received buffer size anymore, since the buffer size may come in delay not representing the current free buffer size
      // const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))
      // const mrcl = new MRCL(Tp)
      //
      // mrcl.send(mrcp)
      // Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}2${protocol.MRCP.END_FRAME}`)
      // expect(mrcl.getCommandsQueue()).to.contain(mrcp)
      // Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}2${protocol.MRCP.END_FRAME}`)
      // expect(mrcl.getCommandsQueue()).to.contain(mrcp)
      // Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}20${protocol.MRCP.END_FRAME}`)
      // expect(mrcl.getCommandsQueue()).to.not.contain(mrcp)
    })

    it('should call transmit on Transport for execute', (done) => {
      const mrcp = new MRCP(protocol.MRCP.EXECUTE, new MRIL('XYZ'))
      const mrcl = new MRCL(Tp)

      Tp.on('transmit', (data) => {
        if (data.indexOf('XYZ') >= 0) {
          done()
        }
      })
      mrcl.send(mrcp)
      Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}1000${protocol.MRCP.END_FRAME}`)
    })

    it('should add the queue mrcp command to queue', () => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))
      const mrcl = new MRCL(Tp, {
        autoTransmit: false,
      })

      mrcl.send(mrcp)

      expect(mrcl.getCommandsQueue()).to.contain(mrcp)

      mrcl.transmit()

      expect(mrcl.getCommandsQueue()).to.not.contain(mrcp)
    })

    it('should not add the execute mrcp command to queue', () => {
      const mrcp = new MRCP(protocol.MRCP.EXECUTE, new MRIL('XYZ'))
      const mrcl = new MRCL(Tp)

      mrcl.send(mrcp)

      expect(mrcl.getCommandsQueue()).to.not.contain(mrcp)
    })
  })
})
