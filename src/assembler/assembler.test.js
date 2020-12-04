const config = require('../z80')
const { buildAssembler } = require('../assembler/assemblerBuilder')

function createAssembler() {
    const asm = buildAssembler(config)
    return asm
}

describe('assembler', () => {
    it('decimal literal', () => {
        const code = createAssembler().assemble('ld A, 200')
        expect(code).toEqual([0b00111110, 200])
    })
    it('hex literal with H at end', () => {
        const code = createAssembler().assemble('ld A, 4FH')
        expect(code).toEqual([0b00111110, 79])
    })
    it('hex literal with # at beginning', () => {
        const code = createAssembler().assemble('ld A, #4F')
        expect(code).toEqual([0b00111110, 79])
    })
    it('hex literal with # at beginning', () => {
        const code = createAssembler().assemble('ld A, 0b0011')
        expect(code).toEqual([0b00111110, 3])
    })
    it('halt', () => {
        const code = createAssembler().assemble('halt')
        expect(code).toEqual([0b01110110])
    })
})