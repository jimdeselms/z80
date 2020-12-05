const z80 = require('./src/z80')
const { buildVm } = require('./src/vm/vmBuilder')
const fs = require('fs').promises;

async function run() {
    const rom = await fs.readFile('./pacman.bin')
    
    const vm = buildVm(z80, { 
        initialImage: rom,
        size: 16000,
        trace: true
    })

    vm.run()
}

run().catch(console.error)