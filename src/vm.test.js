const Assembler = require('./assembler/assembler')
const Vm = require('./vm/vm')

describe('vm', () => {
    it('halts', () => {
        const state  = runProgram("halt")
        expect(state.isHalted).toBe(true)
    })

    it('ld a, 50', () => {
        const state = runProgram("ld a, 50")
        expect(state.A).toBe(50)
    })
})

function runProgram(...lines) {
    lines = lines.join('\n')

    if (!lines.toLowerCase().endsWith("halt)")) {
        lines += "\nhalt"
    }

    const initialImage = Assembler.assemble(lines)
    const vm = new Vm({initialImage})
    vm.run()
    return vm.state
}
