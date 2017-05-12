import Table from 'cli-table'


export default class StatusHelper {
  constructor(mrcl) {
    //
    const table = new Table({
      head: ['MRIL', 'sending', 'sent', 'executing', 'executed'],
      colWidths: [70, 15, 15, 15, 15],
    })

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
      console.log('\x1Bc')

      displayMRCLTable()
      table.splice(0, table.length)

      mrcl.getCommands().forEach((c) => {
        table.push([c.getMRIL().getRawInstruction(), (c.isSending()) ? 'x' : '', (c.isSent()) ? 'x' : '', (c.getMRIL().isExecuting()) ? 'x' : '', (c.getMRIL().isExecuted()) ? 'x' : ''])
      })

      console.log(table.toString())
    }

    mrcl.on('command:executed', (c) => {
      displayCommandTable()
    })
    mrcl.on('command:executing', (c) => {
      displayCommandTable()
    })
    mrcl.on('command:sending', (c) => {
      displayCommandTable()
    })
    mrcl.on('command:sent', (c) => {
      displayCommandTable()
    })
  }
}
