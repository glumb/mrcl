import debug from 'debug'
import EventEmitter from 'events'
import protocol from '../src/protocolDefinitions'

let numberOfMessages = 1

export default class MRIL extends EventEmitter {
  constructor(instruction = '') {
    super()

    this.instruction = instruction
    this.bytes = 0
    this.preparedMRILMessage = ''
    this.number = numberOfMessages++

    this.mrcp

    this.state = {
      executing: false,
      executed: false,
    }


    // remove whitespace and number
    this.preparedMRILMessage = instruction.split(' ').join('')
      .replace(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}\\d+`, 'gi'), '')

    if (this.preparedMRILMessage.indexOf('#') >= 0) { // remove comment
      this.preparedMRILMessage = this.preparedMRILMessage.substring(0, this.preparedMRILMessage.indexOf('#'))
    }

    this.preparedMRILMessage = protocol.MRIL.COMMAND_NUMBER + this.number + this.preparedMRILMessage

    this.bytes = this.preparedMRILMessage.length
  }
/**
 * the instruction send to the robot
 * @return {[string]} preparedMRILMessage
 */
  getInstruction() {
    return this.preparedMRILMessage
  }
/**
 * the instruction used to construct the MRIL object. (number and spacing may differ)
 * @return {[type]} raw instruction
 */
  getRawInstruction() {
    return this.instruction
  }

  setExecuting() {
    this.state.executing = true
    this.emit('executing')
  }

  isExecuting() {
    return this.state.executing
  }

  onExecuting(cb) {
    this.on('executing', cb)
  }

  setExecuted(response = '') {
    this.state.executed = true
    this.response = response
    this.emit('executed', response)
  }

  isExecuted() {
    return this.state.executed
  }

  onExecuted(cb) {
    this.on('executed', cb)
  }

  getNumber() {
    return this.number
  }

  getBytes() {
    return this.bytes
  }

}
