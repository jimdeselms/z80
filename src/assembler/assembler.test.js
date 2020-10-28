const Assembler = require('./assembler')

describe('assembler', () => {
    describe('ld', () => {
        it('ld A, 200', () => {
            const code = Assembler.assemble('ld A, 200')
            expect(code).toEqual([0b00111110, 200])
        })
    })

    describe('halt', () => {
        it('halt', () => {
            const code = Assembler.assemble('halt')
            expect(code).toEqual([0b01110110])
        })
    })
})