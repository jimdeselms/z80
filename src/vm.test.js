const Assembler = require('./assembler/assembler')
const Vm = require('./vm/vm')

describe('vm', () => {
    describe('instructions', () => {
        it('halts', () => {
            const state  = runProgram("halt")
            expect(state).toMatchObject({
                isHalted: true,
                IP: 1
            })
        })

        it('ld a, 50', () => {
            const state = runProgram("ld a, 50")
            expect(state).toMatchObject({ 
                A: 50,
                IP: 3 // add 1 for final HALT
            })
        })

        it('LD A, 50', () => {
            const state = runProgram("LD A, 25")
            expect(state).toMatchObject({ 
                A: 25,
                IP: 3 // add 1 for final HALT
            })
        })

        it('NOP', () => {
            const state = runProgram("NOP")
            // Add one for the final HALT
            expect(state).toMatchObject({ 
                IP: 2 // add 1 for final HALT
            })
        })
    })

    describe('timing', () => {
        // Since a ld takes 2 cycles, we should expect each of these to take two steps to complete.
        it('three instructions', () => {
            const vm = createVm("LD A, 1", "LD A, 2", "NOP", "LD A, 3")

            vm.step();
            expect(vm.state.A).toBe(0)

            vm.step();
            expect(vm.state.A).toBe(1)

            vm.step();
            expect(vm.state.A).toBe(1)

            vm.step();
            expect(vm.state.A).toBe(2)

            vm.step();
            expect(vm.state.A).toBe(2)

            vm.step();
            expect(vm.state.A).toBe(2)

            vm.step();
            expect(vm.state.A).toBe(3)
        })
    })
})

function runProgram(...lines) {
    const vm = createVm(...lines)
    vm.run()
    return vm.state
}

function createVm(...lines) {
    lines = lines.join('\n')

    if (!lines.toLowerCase().endsWith("halt)")) {
        lines += "\nhalt"
    }

    const initialImage = Assembler.assemble(lines)
    return new Vm({initialImage})
}