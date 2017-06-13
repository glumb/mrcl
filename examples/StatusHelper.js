import Table from 'cli-table'


export default class StatusHelper {
  constructor(mrcl, fullsize = true) {
    if (fullsize) {
      const table = new Table({
        head: ['MRIL', 'sending', 'sent', 'executing', 'executed'],
        colWidths: [70, 15, 15, 15, 15],
      })
    }

    const MRCLTable = new Table({
      head: ['queue size', 'sent commands', 'freeReceiveBuffer'],
      colWidths: [15, 15, 15],
    })

    function displayMRCLTable() {
      MRCLTable.splice(0, MRCLTable.length)

      MRCLTable.push([mrcl.getCommandsQueue().length, mrcl.getSentCommands().length, mrcl.getFreeReceiveBuffer()])

      console.log(MRCLTable.toString())
    }

    function displayCommandTable() {
      table.splice(0, table.length)

      mrcl.getCommands().forEach((c) => {
        table.push([c.getMRIL().getRawInstruction(), (c.isSending()) ? 'x' : '', (c.isSent()) ? 'x' : '', (c.getMRIL().isExecuting()) ? 'x' : '', (c.getMRIL().isExecuted()) ? 'x' : ''])
      })

      console.log(table.toString())
    }

    function display() {
      console.log('\x1Bc')
      displayMRCLTable()
      if (fullsize) {
        displayCommandTable()
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
