
<img src="https://cloud.githubusercontent.com/assets/3062564/24833060/720e582c-1cbe-11e7-833a-916da3948e28.png" alt="mrcl" width="70">

# mrcl
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/glumb/mrcl/master/LICENSE.md)
[![Travis](https://img.shields.io/travis/glumb/mrcl.svg)](https://travis-ci.org/glumb/mrcl)
[![npm](https://img.shields.io/npm/v/mrcl.svg)](https://www.npmjs.com/package/mrcl)
[![Codecov](https://img.shields.io/codecov/c/github/glumb/mrcl.svg)]()

🤖 microPede robot control library. A lightweight JavaScript library that uses [mrcp](//github.com/glumb/mrcp) to control the robot.

```js
import {Transport, MRCL, MRIL, MRCP, protocolDefinitions as pd } from 'mrcl'

const trans = new Transport.Serial({port:'/dev/tty', baud: 3600})
const mrcl = new MRCL(trans)

const moveInstruction = new MRIL('M00 X10 Y-10 Z 15 A0 B-3.1 C3.1')
const command1 = new MRCP(pd.MRCP.QUEUE, moveInstruction)

const getPosInstruction = new MRIL('X Y Z A B C')
const command2 = new MRCP(pd.MRCP.EXECUTE, getPosInstruction)


mrcl.send(command1)
mrcl.send(command2)
```

```js
import {Transport, MRCL, MRIL, MRCP, protocolDefinitions as pd } from 'mrcl'

const trans = new Transport.Serial({port:'/dev/tty', baud: 3600})
const mrcl = new MRCL(trans)

// read file and send to robot
for ( const line of fs.readLinesOfFile('./prog1.mril')){
  const mril = new MRIL(line)
  const cmd = new MRCP(pd.MRCP.QUEUE, mril)
  mrcl.send(cmd)
}
```

## MRIB - Instruction Builder
The Instruction Builder is used to programmatically construct MRIL instructions.

```js
import {MRIB, Transport} from 'mrcl'

const trans = new Transport.Serial({port:'/dev/tty', baud: 3600})
const mrib = new MRIB(trans)

mrib.queue() // queue in. execute(). write().
    .setVelocity(15)
    .moveLinear(10, 10, 15, 3.1, 0, -3.1)
    .moveX(15, ()=>console.log('moved to X 15'))
    .moveP2P(20, 5, 0)
    .moveRelativeX(1)
```

## Methods
### SerialTransport(config)

**config**

```JS
{
port: '', // serial port
baudRate: 3600,
}
```

### MRIL(instruction)

Prepares the MRIL instruction for transmission. This involves removing whitespace/comments and adding a command number to be able to monitor the commands execution state. If an instruction with a command number is passed, the number will be removed.

```JavaScript
const mril = new MRIL("X15 Y-10 Z5")
```

**instruction**

MRIL instruction string

#### .on(event, callback)

```JavaScript
mril.on('executed', ()=>console.log('executed'))
```

**event**

Used to monitor the MRILs state.

+ `sending` - transmission started
+ `sent` - transmission finished
+ `executing` - execution on MRC started
+ `executed` - command executed on MRC

**callback**

Called when event triggers.

#### .getRawInstruction()

Returns the instruction passed to the constructor.

#### .getInstruction()

Returns the prepared instruction. (no comments/whitespace, added command number)

### MRCP(executionType, mril)

```JavaScript
const mrcp = new MRCP(protocol.MRCP.WRITE, mril)
```

**executionType**

How to execute the instruction on MRC. Available options defined in protocolDefinitions `import {protocol} from MRIL`.

+ `protocol.MRCP.EXECUTE` - execute immediately, useful for queries like 'get x position'
+ `protocol.MRCP.QUEUE` - queue in
+ `protocol.MRCP.WRITE` - write to EEPROM

**mril**

MRIL object.

### MRCL(transport, options)

```JavaScript
const mrcl = new MRCL(transport)
```

**transport**

Transport object

**options** (optional)

```JS
{
  autoTransmit: true, // default true. If false, call mrcl.transmit() to start sending
}
```

#### .send(mrcl)

Transmit instruction.

#### .getFreeReceiveBuffer()

Returns free MRC receive buffer.

#### .getSentCommands()

#### .getCommands()

## todo
+ documentation
