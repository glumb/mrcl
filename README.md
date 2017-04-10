
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

## MRIB
```js
import {MRIB, Transport} from 'mrcl'

const trans = new Transport.Serial({port:'/dev/tty', baud: 3600})
const mrib = new MRIB(trans)

mrib.setVelocity(15)
    .moveLinear(10, 10, 15, 3.1, 0, -3.1)
    .moveX(15, ()=>console.log('moved to X 15'))
    .moveP2P(20, 5, 0)
    .moveRelativeX(1)
```
## MRIL

## MRCP

## MRCL
