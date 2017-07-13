import Table from 'cli-table'
import Colors from './colors'

export default class StatusHelper {
  constructor(mrcl, view = 'status') {
    switch (view) {
      case 'fullsize': {
        this.instructionStatusTable = new Table({
          head: ['MRIL', 'sending', 'sent', 'executing', 'executed'],
          colWidths: [70, 15, 15, 15, 15],
        })
      }
      case 'status':
        {
          this.queueStatusTable = new Table({
            head: ['queue size', 'sent commands', 'freeReceiveBuffer'],
            colWidths: [15, 15, 15],
          })
        }
        break
      default:

    }

    // DISPLAY MODES

    const displayQueueStatus = () => {
      this.queueStatusTable.splice(0, this.queueStatusTable.length)

      this.queueStatusTable.push([mrcl.getCommandsQueue().length, mrcl.getSentCommands().length, mrcl.getFreeReceiveBuffer()])

      console.log(this.queueStatusTable.toString())
    }

    const displayInstuctionStatus = () => {
      this.instructionStatusTable.splice(0, this.instructionStatusTable.length)

      mrcl.getCommands().forEach((c) => {
        this.instructionStatusTable.push([c.getMRIL().getRawInstruction(), (c.isSending()) ? 'x' : '', (c.isSent()) ? 'x' : '', (c.getMRIL().isExecuting()) ? 'x' : '', (c.getMRIL().isExecuted()) ? 'x' : ''])
      })

      console.log(this.instructionStatusTable.toString())
    }

    const displayList = () => {
      const numberOfLinesToDisplay = process.stdout.rows
      const numberOfExecutedLines = Math.floor((numberOfLinesToDisplay - 1) / 2)
      const numberOfFutureLines = Math.floor((numberOfLinesToDisplay - 1) / 2)
      const commands = mrcl.getCommands()
      let lastExecutedInstruction = 0
      for (let i = 0; i < commands.length; i++) {
        if (commands[i].getMRIL().isExecuted()) {
          lastExecutedInstruction = i
          if (i + 1 < commands.length && !commands[i + 1].getMRIL().isExecuted()) {
            break
          }
        }
      }

      // const startIndex = Math.max(lastExecutedInstruction - numberOfExecutedLines + 1, 0)
      // const endIndex = Math.min(lastExecutedInstruction + numberOfFutureLines + 2, commands.length)
      // const lines = commands.slice(startIndex, endIndex)
      const startIndex = Math.max(Math.min(lastExecutedInstruction - numberOfExecutedLines + 1, commands.length - numberOfLinesToDisplay), 0)
      const endIndex = Math.min(startIndex + numberOfLinesToDisplay - 1, commands.length)
      const lines = commands.slice(startIndex, endIndex)

      for (const line of lines) {
        let color = Colors.Reset
        if (line.getMRIL().isExecuted()) {
          color = Colors.Reset
        } else if (line.getMRIL().isExecuting()) {
          color = Colors.FgGreen
        } else if (line.isSent()) {
          color = Colors.FgYellow
        }

        // pad the line with spaces to not have to reset the terminal (performance)
        console.log(color, line.getMRIL().getRawInstruction(), ' '.repeat(process.stdout.columns - line.getMRIL().getRawInstruction().length - 3), Colors.Reset)
      }
    }

    // clear screen
    console.log('\x1Bc')

    const display = () => {
      process.stdout.write('\x1B[1;1f') // reset cursor
      switch (view) {
        case 'fullsize':
          displayInstuctionStatus()
        case 'status':
          displayQueueStatus()
          break
        case 'list':
          displayList()
          break
        default:
          displayList()
      }
    }

    mrcl.on('command:executed', (c) => {
      display()
    })
    mrcl.on('command:executing', (c) => {
      display()
    })
    mrcl.on('command:sending', (c) => {
      display()
    })
    mrcl.on('command:sent', (c) => {
      display()
    })
  }


}
