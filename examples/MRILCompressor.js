/**
 * The compressor is used to minimize the MRIL instructions bytes sent to the MRC by removing redundant commands
 * X15 Y10 Z10 A0 B0
 * X15 Y20 Z10 B0 B0
 * X16 Z10 B0
 *
 * => will be compressed to
 * X15 Y10 Z10 A0 B0
 * Y20
 * X16
 */

 export default class MRILCompressor {
   constructor() {
     this.symbols = {}
   }
   compress(mril) {
     // strip comments
     mril = mril.substring(mril.indexOf('#') + 1)

     const regex = /([a-zA-Z])\s*(-?\d*\.?\d+)/ig

     const response = []
     let match = []
     while ((match = regex.exec(mril)) !== null) {
       const symbol = match[1].toUpperCase()
       const value = match[2]
       if (!this.symbols.hasOwnProperty(symbol) || this.symbols[symbol] !== value) {
         this.symbols[symbol] = value
         response.push(symbol, value)
       }
     }

     return response.join('')
   }
   expand(mril) {
     const regex = /([a-zA-Z])\s*(-?\d*\.?\d+)/ig

     let match = []
     while ((match = regex.exec(mril)) !== null) {
       const symbol = match[1].toUpperCase()
       const value = match[2]
       if (!this.symbols.hasOwnProperty(symbol) || this.symbols[symbol] !== value) {
         this.symbols[symbol] = `${value}`
       }
     }
     console.log(this.symbols)
     console.log(Object.keys(this.symbols))
     return Object.keys(this.symbols).reduce((acc, val) => `${acc} ${val} ${this.symbols[val]} `, '').trim()
   }

   reset() {
     this.symbols = {}
   }
 }
