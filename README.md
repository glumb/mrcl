
<img src="https://cloud.githubusercontent.com/assets/3062564/24833060/720e582c-1cbe-11e7-833a-916da3948e28.png" alt="mrcl" width="70">

# mrcl
🤖 microPede robot control library. A lightweight JavaScript library that uses [mrcp](/glumb/mrcp) to control the robot.

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
