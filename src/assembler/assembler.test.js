const config = require('../z80')
const { buildAssembler } = require('../assembler/assemblerBuilder')

function createAssembler() {
    const asm = buildAssembler(config)
    return asm
}

describe('assembler', () => {
    it('decimal literal', () => {
        assembleAndVerify('ld A, 200', [0b00111110, 200])
    })
    it('hex literal with H at end', () => {
        assembleAndVerify('ld A, 4FH', [0b00111110, 79])
    })
    it('hex literal with # at beginning', () => {
        assembleAndVerify('ld A, #4F', [0b00111110, 79])
    })
    it('hex literal with # at beginning', () => {
        assembleAndVerify('ld A, 0b0011', [0b00111110, 3])
    })
    it('halt', () => {
        assembleAndVerify('halt', [0b01110110])
    })
    it('raw data', () => {
        assembleAndVerify('#12 #34', [0x12, 0x34])
    })
})

function assembleAndVerify(code, expected) {
    const assembler = createAssembler()
    const bytes = assembler.assemble(code)
    expect(bytes).toEqual(expected)
}