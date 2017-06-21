import debug from 'debug'
import EventEmitter from 'events'
import protocol from '../src/protocolDefinitions'

const log = debug('MRCL')

export default class MRCL extends EventEmitter {
  /**
   * constructor - MicroPede Robot Control Library
   * used to construct and send MRIL commands to the robot controller
   * flow control and response handling are used to send and monitor the current execution state of MRIL
   *
   * @param  {Transport} Transport  a transport (Serial, TCP) class that supports send(d, cb) onData(d) methods
   * @param  {object} config = {}   configuration
   */

  constructor(Transport, config = {}) {
    const c = Object.assign({
      autoTransmit: true,
    }, config)

    super()

    this.transport = Transport
    this.transport.onReceive(this._assembleResponse.bind(this))
    this.freeReceiveBuffer = 300 // -1 to receive the the buffersize once

    this.responseByteBuffer = ''
    this.frameStarted = false

    this.commands = []
    this.commandQueue = []
    this.sentCommands = [] // used for checking executing/ed

    this.autoTransmit = c.autoTransmit
    this.retryTransmitTimeout = 1000

    this.transmitInterval = false

    this.numberOfMessages = 0
  }

  /**
   * send - sends or queues a MRCP command based on command type (queue, execzte, write)
   *
   * @param  {MRCP} mrcp mrcp object
   */
  send(mrcp) {
    if (mrcp.getCommand() === protocol.MRCP.QUEUE_IN) {
      log(`queueing in mrcp: ${mrcp.getMessage()}`)
      this.queueMRCP(mrcp)
    } else {
      log(`queueing in mrcp: ${mrcp.getMessage()}`)
      this.sendMRCP(mrcp)
    }
  }

  /**
   * queueMRCP - add MRCP to send queue
   *
   * @param  {string|array} mril MRIL message
   * @return {MRCL}         MRCL
   */
  queueMRCP(mrcp) {
    if (Array.isArray(mrcp)) {
      for (const command of mrcp) {
        this.queueMRCP(command)
      }
    } else {
      this.commandQueue.push(mrcp)
      this.commands.push(mrcp)
      if (this.autoTransmit) {
        this._transmitQueue()
      }
    }

    return this
  }

  /**
   * sendMRIL - directly send MRIL
   *
   * @param  {string}   mril MRIL message
   * @return {MRCL}     MRCL
   */
  sendMRCP(mrcp) {
    this.commands.push(mrcp)
    this._transmit(mrcp)

    return this
  }

  /**
   * _transmitQueue - rate limited transmission of command queue
   *
   */
  _transmitQueue() { // todo transmit immidiately on nt queue in
    if (this.commandQueue.length > 0) {
      const mrcp = this.commandQueue.shift()
      log(`trying to transmit: ${mrcp.getMessage()}`)

      // rate limiting
      if (mrcp.getBytes() > this.freeReceiveBuffer) {
        this.commandQueue.unshift(mrcp)

        log(`receive Buffer full. command: ${mrcp.getBytes()} buffer: ${this.freeReceiveBuffer}`)
        if (!this.transmitInterval) {
          this.transmitInterval = true
          this.transport.transmit(protocol.MRCP.START_FRAME + protocol.MRCP.FREE_MRIL_BUFFER + protocol.MRCP.END_FRAME,
            () => {
              // after sent:
              setTimeout(() => {
                this.transmitInterval = false
                this._transmitQueue()
              }, this.retryTransmitTimeout)
            })
        }
      } else {
        this.freeReceiveBuffer -= mrcp.getMRIL().getBytes() // prediction

        this._transmit(mrcp, () => {
          this._transmitQueue()
        })
      }
    }
  }

  /**
   * _transmit - send MRCP object using Transport
   *
   * @param  {Message}  mrcp MRCP message object
   * @param  {function} cb   called when sending is complete
   */
  _transmit(mrcp, cb) {
    mrcp.setSending()
    this.emit('command:sending', mrcp)

    this.transport.transmit(mrcp.getMessage(), (err) => {
      // set this before sending is done. Sent might return late and thus the command might return executed before 'is is maked as sent'
      this.sentCommands.push(mrcp)
      mrcp.setSent()
      this.emit('command:sent', mrcp)

      if (cb) {
        cb()
      }
    })
  }

  /**
   * _assembleResponse - combines response char or string into a response message
   *
   * @param  {string} resp transport response
   */
  _assembleResponse(resp) {
    log(`response: ${resp}`)
    if (resp.length == 0) {
      return
    }
    const response = resp.split(' ').join('')
    for (let i = 0, len = response.length; i < len; i++) {
      // read the incoming byte:
      const incomingByte = response[i].toUpperCase()

      if (!this.frameStarted || (incomingByte === protocol.MRCP.START_FRAME)) {
        this.frameStarted = true
        this.responseByteBuffer = ''
      }

      if (this.frameStarted) {
        if (incomingByte === protocol.MRCP.START_FRAME) {
          // dont save the start byte
        } else if (incomingByte === protocol.MRCP.END_FRAME) { // message complete. write to messagequeue
          log(`Frame end: ${this.responseByteBuffer}`)

          this._parseCommand(this.responseByteBuffer)
          this.responseByteBuffer = ''
          this.frameStarted = false
        } else if (((incomingByte.charCodeAt(0) >= 48) && (incomingByte.charCodeAt(0) <= 57)) || // numbers
          ((incomingByte.charCodeAt(0) >= 65) && (incomingByte.charCodeAt(0) <= 90)) || // letters
          ((incomingByte.charCodeAt(0) >= 43) && (incomingByte.charCodeAt(0) <= 46))) // + . , -
        {
          this.responseByteBuffer += incomingByte
          // console.log(this.responseByteBuffer)
        } else {
          log(`I received unknow char: ${incomingByte} [${incomingByte.charCodeAt(0)}]`)
        }
      }
    }
  }

  /**
   * _parseCommand - parses the assembled response
   *
   * @param  {string} command returned from robot controller
   */
  _parseCommand(command) {
    switch (command.charAt(0)) {
      case protocol.MRCP.FREE_MRIL_BUFFER:
        // this.freeReceiveBuffer = +command.substring(1) // not reliable, the B response may come in delayed, resulting in a false buffer value
        // just set it to an initial value
        if (this.freeReceiveBuffer < 0) this.freeReceiveBuffer = +command.substring(1)
        log(`free receive buffer: ${this.freeReceiveBuffer}`)
        this.emit('free-buffer-changed', this.freeReceiveBuffer)
        this._transmitQueue()
        break
      case protocol.MRIL.COMMAND_NUMBER: {
        const match = command.match(/N(0|1|2)(\d+)(.*)/i)
        const number = +match[2]
        const responseType = +match[1]
        log(`command number: ${number}`)
        log(`response type: ${responseType}`)
        for (const mrcp of this.sentCommands) {
          const mril = mrcp.getMRIL()
          if (mril.getNumber() === number) {
            switch (responseType) {
              case 0:
                log(`command number: ${number} executing`)
                mril.setExecuting()
                this.emit('command:executing', mril)
                break
              case 1:
                log(`command number: ${number} executed`)
                if (match.length === 4) { // has payload
                  mril.setExecuted(match[3])
                } else {
                  mril.setExecuted(match[3])
                }
                this.emit('command:executed', mril)

                // see buffer explanation above
                this.freeReceiveBuffer += mril.getBytes()
                log(`free receive buffer: ${this.freeReceiveBuffer}`)
                this.emit('free-buffer-changed', this.freeReceiveBuffer)
                this._transmitQueue()
                break
              case 2:
                log(`unknown response type (N): ${responseType}`)
              //  TODO implement error
                break
              default:
                console.log(`unknown command: ${command}`)
            }
          }
        }
      }

        break
      default:

    }
  }

  getCommandsQueue() {
    return this.commandQueue
  }

  getSentCommands() {
    return this.sentCommands
  }

  getCommands() {
    return this.commands
  }

  getFreeReceiveBuffer() {
    return this.freeReceiveBuffer
  }

  /**
   * transmit - enqueues the command queue. Only neccesary if autoTrasmit == false
   *
   * @return {MRCL}
   */
  transmit() {
    this._transmitQueue()
    return this
  }
}
