const Assembler = require('./assembler')

describe('assembler', () => {
    it('is a thing!', () => {
        const code = Assembler.assembleLine('ld A 200')
        expect(code).toBe("LD A 200")
    })
})