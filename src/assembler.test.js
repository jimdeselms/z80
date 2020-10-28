const Assembler = require('./assembler')

describe('assembler', () => {
    it('is a thing!', () => {
        const code = Assembler.assembleLine('ld 500 200')
        expect(code).toBe("LD 500 200")
    })
})