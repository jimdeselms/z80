class Instructions {
    static halt(state) {
        state.isHalted = true
    }

    static ldIntegerToRegister(state, register) {
        const value = state.memory[state.IP++]
        state[register] = value
    }

    static ldRegisterToRegister(state, to, from) {
        state[to] = state[from]
    }

    static nop() {
    }
}

const OPCODES = {
    // NOP
    0b00000000: { code: Instructions.nop, cycles: 1 },

    // HALT
    0b01110110: { code: Instructions.halt, cycles: 1 },
    
    // LD r, n
    0b00111110: { code: state => Instructions.ldIntegerToRegister(state, "A"), cycles: 2 },
    0b00000110: { code: state => Instructions.ldIntegerToRegister(state, "B"), cycles: 2 },
    0b00001110: { code: state => Instructions.ldIntegerToRegister(state, "C"), cycles: 2 },
    0b00010110: { code: state => Instructions.ldIntegerToRegister(state, "D"), cycles: 2 },
    0b00011110: { code: state => Instructions.ldIntegerToRegister(state, "E"), cycles: 2 },
    0b00100110: { code: state => Instructions.ldIntegerToRegister(state, "H"), cycles: 2 },
    0b00101110: { code: state => Instructions.ldIntegerToRegister(state, "L"), cycles: 2 },

    // LD r, r'
    0b01111111: { code: state => Instructions.ldRegisterToRegister(state, "A", "A"), cycles: 1 },
    0b01111000: { code: state => Instructions.ldRegisterToRegister(state, "A", "B"), cycles: 1 },
    0b01111001: { code: state => Instructions.ldRegisterToRegister(state, "A", "C"), cycles: 1 },
    0b01111010: { code: state => Instructions.ldRegisterToRegister(state, "A", "D"), cycles: 1 },
    0b01111011: { code: state => Instructions.ldRegisterToRegister(state, "A", "E"), cycles: 1 },
    0b01111100: { code: state => Instructions.ldRegisterToRegister(state, "A", "H"), cycles: 1 },
    0b01111101: { code: state => Instructions.ldRegisterToRegister(state, "A", "L"), cycles: 1 },

    0b01000111: { code: state => Instructions.ldRegisterToRegister(state, "B", "A"), cycles: 1 },
    0b01000000: { code: state => Instructions.ldRegisterToRegister(state, "B", "B"), cycles: 1 },
    0b01000001: { code: state => Instructions.ldRegisterToRegister(state, "B", "C"), cycles: 1 },
    0b01000010: { code: state => Instructions.ldRegisterToRegister(state, "B", "D"), cycles: 1 },
    0b01000011: { code: state => Instructions.ldRegisterToRegister(state, "B", "E"), cycles: 1 },
    0b01000100: { code: state => Instructions.ldRegisterToRegister(state, "B", "H"), cycles: 1 },
    0b01000101: { code: state => Instructions.ldRegisterToRegister(state, "B", "L"), cycles: 1 },

    0b01001111: { code: state => Instructions.ldRegisterToRegister(state, "C", "A"), cycles: 1 },
    0b01001000: { code: state => Instructions.ldRegisterToRegister(state, "C", "B"), cycles: 1 },
    0b01001001: { code: state => Instructions.ldRegisterToRegister(state, "C", "C"), cycles: 1 },
    0b01001010: { code: state => Instructions.ldRegisterToRegister(state, "C", "D"), cycles: 1 },
    0b01001011: { code: state => Instructions.ldRegisterToRegister(state, "C", "E"), cycles: 1 },
    0b01001100: { code: state => Instructions.ldRegisterToRegister(state, "C", "H"), cycles: 1 },
    0b01001101: { code: state => Instructions.ldRegisterToRegister(state, "C", "L"), cycles: 1 },

    0b01010111: { code: state => Instructions.ldRegisterToRegister(state, "D", "A"), cycles: 1 },
    0b01010000: { code: state => Instructions.ldRegisterToRegister(state, "D", "B"), cycles: 1 },
    0b01010001: { code: state => Instructions.ldRegisterToRegister(state, "D", "C"), cycles: 1 },
    0b01010010: { code: state => Instructions.ldRegisterToRegister(state, "D", "D"), cycles: 1 },
    0b01010011: { code: state => Instructions.ldRegisterToRegister(state, "D", "E"), cycles: 1 },
    0b01010100: { code: state => Instructions.ldRegisterToRegister(state, "D", "H"), cycles: 1 },
    0b01010101: { code: state => Instructions.ldRegisterToRegister(state, "D", "L"), cycles: 1 },

    0b01011111: { code: state => Instructions.ldRegisterToRegister(state, "E", "A"), cycles: 1 },
    0b01011000: { code: state => Instructions.ldRegisterToRegister(state, "E", "B"), cycles: 1 },
    0b01011001: { code: state => Instructions.ldRegisterToRegister(state, "E", "C"), cycles: 1 },
    0b01011010: { code: state => Instructions.ldRegisterToRegister(state, "E", "D"), cycles: 1 },
    0b01011011: { code: state => Instructions.ldRegisterToRegister(state, "E", "E"), cycles: 1 },
    0b01011100: { code: state => Instructions.ldRegisterToRegister(state, "E", "H"), cycles: 1 },
    0b01011101: { code: state => Instructions.ldRegisterToRegister(state, "E", "L"), cycles: 1 },

    0b01100111: { code: state => Instructions.ldRegisterToRegister(state, "H", "A"), cycles: 1 },
    0b01100000: { code: state => Instructions.ldRegisterToRegister(state, "H", "B"), cycles: 1 },
    0b01100001: { code: state => Instructions.ldRegisterToRegister(state, "H", "C"), cycles: 1 },
    0b01100010: { code: state => Instructions.ldRegisterToRegister(state, "H", "D"), cycles: 1 },
    0b01100011: { code: state => Instructions.ldRegisterToRegister(state, "H", "E"), cycles: 1 },
    0b01100100: { code: state => Instructions.ldRegisterToRegister(state, "H", "H"), cycles: 1 },
    0b01100101: { code: state => Instructions.ldRegisterToRegister(state, "H", "L"), cycles: 1 },

    0b01101111: { code: state => Instructions.ldRegisterToRegister(state, "L", "A"), cycles: 1 },
    0b01101000: { code: state => Instructions.ldRegisterToRegister(state, "L", "B"), cycles: 1 },
    0b01101001: { code: state => Instructions.ldRegisterToRegister(state, "L", "C"), cycles: 1 },
    0b01101010: { code: state => Instructions.ldRegisterToRegister(state, "L", "D"), cycles: 1 },
    0b01101011: { code: state => Instructions.ldRegisterToRegister(state, "L", "E"), cycles: 1 },
    0b01101100: { code: state => Instructions.ldRegisterToRegister(state, "L", "H"), cycles: 1 },
    0b01101101: { code: state => Instructions.ldRegisterToRegister(state, "L", "L"), cycles: 1 },
}

module.exports = {
    OPCODES
}