import SerialPort from 'serialport'
import debug from 'debug'
import Transport from './Transport'


const log = debug('SerialTransport')

export default class SerialTransport extends Transport {
  constructor(config = {}) {
    super()

    this.config = Object.assign({
      port: '',
      baudRate: 3600,
    }, config)

    this.SerialPort = new SerialPort(config.port, config)
    this.buffer = []

    this.SerialPort.on('open', (err) => {
      log('serial port open')
      setTimeout(() => {
        if (err) {
          this.emit('error', `Error opening port: ${this.config.port} ${err.message}`)
          log(`Error opening port: ${this.config.port} ${err.message}`)
        } else {
          for (const { data, cb } of this.buffer) {
            log(`transmitting buffer data ${data}`)
            this.transmit(data, cb)
          }
        }
      }, 100)
    })
    // open errors will be emitted as an error event
    this.SerialPort.on('error', (err) => {
      this.emit('error', `Error on port: ${this.config.port} ${err.message}`)
      log('error', `Error on port: ${this.config.port} ${err.message}`)
    })
    this.SerialPort.on('data', (rawData) => {
      const data = rawData.toString()
      log(`receiving data: ${data}`)
      this.emit('receive', data)
    })

    process.stdin.resume()// so the program will not close instantly

    function exitHandler(options, err) {
      log('closing serial port')
      if (err) {
        console.log(err)
      }
      this.SerialPort.close(() => {
        log('serial port closed')
        process.exit()
      })
    }

// catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(this, { exit: true }))

// catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(this, { exit: true }))
  }
  transmit(data, cb) {
    if (!this.SerialPort.isOpen()) {
      this.buffer.push({ data, cb })
    } else {
      // SP Buffers data, if the port is not open
      const buf = new Buffer.from(data, 'ascii') // cant use   this.SerialPort.write(buf,'ascii', cb) before SP 5.0.0
      log(`transmiting data: ${buf.toString()}`)
      this.SerialPort.drain((err) => { // needed to fix abort trap: 6
        this.SerialPort.write(buf, () => {
          this.SerialPort.drain(cb)
        })
      })
    }
  }

  onReceive(cb) {
    this.on('receive', cb)
  }
  onError(cb) {
    this.on('error', cb)
  }
}
