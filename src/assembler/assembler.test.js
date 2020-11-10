const config = require('../config')
const { buildAssembler } = require('../assembler/assemblerBuilder')

function createAssembler() {
    const asm = buildAssembler(config)
    return asm
}

describe('assembler', () => {
    describe('ld', () => {
        it('ld A, 200', () => {
            const code = createAssembler().assemble('ld A, 200')
            expect(code).toEqual([0b00111110, 200])
        })
    })

    describe('halt', () => {
        it('halt', () => {
            const code = createAssembler().assemble('halt')
            expect(code).toEqual([0b01110110])
        })
    })
})