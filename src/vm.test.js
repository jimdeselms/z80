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

        it('ld r, n', () => {
            expect(runProgram("ld a, 50")).toMatchObject({ A: 50 })
            expect(runProgram("ld b, 1")).toMatchObject({ B: 1 })
            expect(runProgram("Ld c, 2")).toMatchObject({ C: 2 })
            expect(runProgram("LD D, 3")).toMatchObject({ D: 3 })
            expect(runProgram("LD E, 3")).toMatchObject({ E: 3 })
            expect(runProgram("LD H, 3")).toMatchObject({ H: 3 })
            expect(runProgram("LD L, 3")).toMatchObject({ L: 3 })
        })

        it("ld r, r'", () => {
            expect(runProgram("ld a, 1", "ld a, a")).toMatchObject({ A: 1 })
            expect(runProgram("ld a, 1", "ld b, a")).toMatchObject({ A: 1, B: 1 })
            expect(runProgram("ld a, 1", "ld c, a")).toMatchObject({ A: 1, C: 1 })
            expect(runProgram("ld a, 1", "ld d, a")).toMatchObject({ A: 1, D: 1 })
            expect(runProgram("ld a, 1", "ld e, a")).toMatchObject({ A: 1, E: 1 })
            expect(runProgram("ld a, 1", "ld h, a")).toMatchObject({ A: 1, H: 1 })
            expect(runProgram("ld a, 1", "ld l, a")).toMatchObject({ A: 1, L: 1 })

            expect(runProgram("ld b, 5", "ld a, b")).toMatchObject({ B: 5, A: 5 })
            expect(runProgram("ld b, 5", "ld b, b")).toMatchObject({ B: 5 })
            expect(runProgram("ld b, 5", "ld c, b")).toMatchObject({ B: 5, C: 5 })
            expect(runProgram("ld b, 5", "ld d, b")).toMatchObject({ B: 5, D: 5 })
            expect(runProgram("ld b, 5", "ld e, b")).toMatchObject({ B: 5, E: 5 })
            expect(runProgram("ld b, 5", "ld h, b")).toMatchObject({ B: 5, H: 5 })
            expect(runProgram("ld b, 5", "ld l, b")).toMatchObject({ B: 5, L: 5 })

            expect(runProgram("ld c, 7", "ld a, c")).toMatchObject({ C: 7, A: 7 })
            expect(runProgram("ld c, 7", "ld b, c")).toMatchObject({ C: 7, B: 7 })
            expect(runProgram("ld c, 7", "ld c, c")).toMatchObject({ C: 7 })
            expect(runProgram("ld c, 7", "ld d, c")).toMatchObject({ C: 7, D: 7 })
            expect(runProgram("ld c, 7", "ld e, c")).toMatchObject({ C: 7, E: 7 })
            expect(runProgram("ld c, 7", "ld h, c")).toMatchObject({ C: 7, H: 7 })
            expect(runProgram("ld c, 7", "ld l, c")).toMatchObject({ C: 7, L: 7 })

        })

        it('LD A, 50', () => {
            const state = runProgram("LD A, 25")
            expect(state).toMatchObject({ 
                A: 25,
                IP: 3 // add 1 for final HALT
            })
        })

        it('LD r, (HL)', () => {
            const vm = createVm("LD A, (HL)")
            vm.state.HL = 20
            vm.loadMemory(20, [123])

            vm.run();
            expect(vm.state).toMatchObject({
                A: 123
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