 import debug from 'debug'
 import readline from 'readline'
 import fs from 'fs'
 import inquirer from 'inquirer'

 import MRILCompressor from './MRILCompressor'
 import color from './Colors'

 import StatusHelper from './StatusHelper'
 const log = debug('readFile')


 function sendFile(options) {
   const { source, target, mode } = options
   console.log(`reading file: ${source} => ${target}`)

   const lineReader = readline.createInterface({
     input: fs.createReadStream(source),
   })

   let mril
   const Compressor = new MRILCompressor()

   fs.open(target, 'wx', (err, fd) => {
     if (err) {
       if (err.code === 'EEXIST') {
         console.error('myfile already exists')
         return
       }

       throw err
     }


     lineReader.on('line', (line) => {
       console.log('reading line: ', color.FgGreen, line, color.Reset)
       const modifiedLine = (mode === 'Compress') ?
                            Compressor.compress(line) :
                            Compressor.expand(line)
       if (modifiedLine.length === 0) return // skip empty lines

       console.log('writing line: ', color.FgYellow, modifiedLine, color.Reset)
       fs.write(fd, `${modifiedLine}\r`, () => {

       })
     }).on('close', () => {
       fs.close(fd, () => {

       })
     })
   })
 }

// Processing configuration. File, port, method
 const prompt = inquirer.createPromptModule()


 prompt([
   {
     type: 'list',
     name: 'mode',
     message: 'Select a mode',
     choices: [
       {
         name: 'Compress',
       },
       {
         name: 'Uncompress',
       },
     ],
   },
   {
     type: 'input',
     name: 'source',
     default: 'example.mril',
     message: 'Source file',
   },
   {
     type: 'input',
     name: 'target',
     default: 'example.mod.mril',
     message: 'Target file',
   },
 ]).then(sendFile)
