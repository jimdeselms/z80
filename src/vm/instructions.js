const { bytesToBit16, bit16ToBytes } = require('../helpers')

class Instructions {
    static halt(state) {
        state.isHalted = true
    }

    static ldIntegerToRegister(state, register) {
        const value = state.memory[state.IP++]
        state[register] = value
    }

    static ldInteger16ToRegister(state, to) {
        const low = state.memory[state.IP++]
        const high = state.memory[state.IP++]
        state[to] = bytesToBit16(low, high)
    }

    static ldImmediateIndirectToRegister(state, to, advanceIp) {
        if (advanceIp) {
            state.IP++
        }

        const low = state.memory[state.IP++]
        const high = state.memory[state.IP++]
        const address = bytesToBit16(low, high)
        state[to] = state.memory[address]
    }

    static ldRegisterToImmediateIndirect(state, from, advanceIp) {
        if (advanceIp) {
            state.IP++
        }

        const address = bytesToBit16(state.memory[state.IP++], state.memory[state.IP++])
        const [low, high] = bit16ToBytes(state[from])
        state.memory[address] = low
        state.memory[address+1] = high
    }
    
    static ldInteger16ToIndexRegister(state, to) {
        const next = state.memory[state.IP++]
        const low = state.memory[state.IP++]
        const high = state.memory[state.IP++]

        // TODO: What happens if this doesn't match?
        if (next !== 0b00100001) {
            state.isHalted = true
        } else {
            state[to] = bytesToBit16(low, high)
        }
    }

    static ldRegisterIndirectToRegister(state, to, from) {
        const address = state[from]
        const value = state.memory[address]
        state[to] = value
    }

    static ldImmediateToRegisterIndirect(state, to) {
        const value = state.memory[state.IP++]
        const idx = state[to]
        state.memory[idx] = value
    }

    static ldImmediateToRegisterIndirectWithOffset(state, to) {
        state.IP += 2;

        const offset = state.memory[state.IP++]
        const value = state.memory[state.IP++]

        const idx = state[to] + offset

        state.memory[idx] = value
    }

    static ldRegisterToRegister(state, to, from) {
        state[to] = state[from]
    }

    static ldFromIndexRegisterToRegister(state, to, from) {
        state.IP++
        
        const offset = state.memory[state.IP++]
        const value = state.memory[state[from] + offset]
        state[to] = value
    }
    
    static ldFromRegisterToIndexRegister(state, to, from) {
        state.IP++
        
        const offset = state.memory[state.IP++]
        const value = state[from]
        state.memory[state[to] + offset] = value
    }

    static ldImmediateToIndexRegister(state, register) {
        state.IP++

        const offset = state.memory[state.IP++]
        const value = state.memory[state.IP++]

        state.memory[state[register] + offset] = value
    }

    static ldWordImmediateToRegister(state, register) {
        state.IP++

        const low = state.memory[state.IP++]
        const high = state.memory[state.IP++]

        state[register] = bytesToBit16(low, high)
    }

    static ldFromSpecialRegisterToRegister(state, to, from) {
        state.IP++
        state[to] = state[from]
    }

    static ldRegisterToMemory16BitMemoryLocation(state, from) {
        const idx = bytesToBit16(state.memory[state.IP++], state.memory[state.IP++])
        const value = state[from]
        state.memory[idx] = value
    }

    static ldRegisterToRegisterIndirect(state, to, from) {
        const value = state[from]
        const toAddress = state[to]
        state.memory[toAddress] = value
    }

    static ldRegister16ToRegister16(state, to, from, advanceIp) {
        if (advanceIp) {
            state.IP++
        }
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

    // LD r, (HL)
    0b01111110: { code: state => Instructions.ldRegisterIndirectToRegister(state, "A", "HL"), cycles: 2},
    0b01000110: { code: state => Instructions.ldRegisterIndirectToRegister(state, "B", "HL"), cycles: 2},
    0b01001110: { code: state => Instructions.ldRegisterIndirectToRegister(state, "C", "HL"), cycles: 2},
    0b01010110: { code: state => Instructions.ldRegisterIndirectToRegister(state, "D", "HL"), cycles: 2},
    0b01011110: { code: state => Instructions.ldRegisterIndirectToRegister(state, "E", "HL"), cycles: 2},
    0b01100110: { code: state => Instructions.ldRegisterIndirectToRegister(state, "H", "HL"), cycles: 2},
    0b01101110: { code: state => Instructions.ldRegisterIndirectToRegister(state, "L", "HL"), cycles: 2},

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

    0b11011101: { 
        next: {
            // LD r, (IX+d)
            0b01111110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "A", "IX"), cycles: 5 },
            0b01000110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "B", "IX"), cycles: 5 },
            0b01001110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "C", "IX"), cycles: 5 },
            0b01010110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "D", "IX"), cycles: 5 },
            0b01011110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "E", "IX"), cycles: 5 },
            0b01100110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "H", "IX"), cycles: 5 },
            0b01101110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "L", "IX"), cycles: 5 },

            // LD (IX+d), r
            0b01110111: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IX", "A"), cycles: 5 },
            0b01110000: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IX", "B"), cycles: 5 },
            0b01110001: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IX", "C"), cycles: 5 },
            0b01110010: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IX", "D"), cycles: 5 },
            0b01110011: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IX", "E"), cycles: 5 },
            0b01110100: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IX", "F"), cycles: 5 },
            0b01110101: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IX", "G"), cycles: 5 },

            // LD (IX+d), n
            0b00110110: { code: state => Instructions.ldImmediateToIndexRegister(state, "IX"), cycles: 5 },

            // LD IX, nn
            0b00100001: { code: state => Instructions.ldWordImmediateToRegister(state, "IX"), cycles: 4 },

            // LD IX, (nn)
            0b00101010: { code: state => Instructions.ldImmediateIndirectToRegister(state, "IX", true), cycles: 6 },

            // LD (nn), IX
            0b00100010: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "IX", true), cycles: 6 },

            // LD SP, IX
            0b11111001: { code: state => Instructions.ldRegister16ToRegister16(state, "SP", "IX", true), cycles: 2}
        }
    },

    0b11111101: { 
        next: {
            // LD r, (IY+d)
            0b01111110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "A", "IY"), cycles: 5 },
            0b01000110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "B", "IY"), cycles: 5 },
            0b01001110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "C", "IY"), cycles: 5 },
            0b01010110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "D", "IY"), cycles: 5 },
            0b01011110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "E", "IY"), cycles: 5 },
            0b01100110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "H", "IY"), cycles: 5 },
            0b01101110: { code: state => Instructions.ldFromIndexRegisterToRegister(state, "L", "IY"), cycles: 5 },

            // LD (IY+d), r
            0b01110111: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IY", "A"), cycles: 5 },
            0b01110000: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IY", "B"), cycles: 5 },
            0b01110001: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IY", "C"), cycles: 5 },
            0b01110010: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IY", "D"), cycles: 5 },
            0b01110011: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IY", "E"), cycles: 5 },
            0b01110100: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IY", "F"), cycles: 5 },
            0b01110101: { code: state => Instructions.ldFromRegisterToIndexRegister(state, "IY", "G"), cycles: 5 },

            // LD (IY+d), n
            0b00110110: { code: state => Instructions.ldImmediateToIndexRegister(state, "IY"), cycles: 5},

            // LD IY, nn
            0b00100001: { code: state => Instructions.ldWordImmediateToRegister(state, "IY"), cycles: 4 },

            // LD IY, (nn)
            0b00101010: { code: state => Instructions.ldImmediateIndirectToRegister(state, "IY", true), cycles: 6 },

            // LD (nn), IY
            0b00100010: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "IY", true), cycles: 6 },

            // LD SP, IY
            0b11111001: { code: state => Instructions.ldRegister16ToRegister16(state, "SP", "IY", true), cycles: 2}
        }
    },

    // LD (HL), r
    0b01110111: { code: state => Instructions.ldRegisterToRegisterIndirect(state, "HL", "A"), cycles: 2},
    0b01110000: { code: state => Instructions.ldRegisterToRegisterIndirect(state, "HL", "B"), cycles: 2},
    0b01110001: { code: state => Instructions.ldRegisterToRegisterIndirect(state, "HL", "C"), cycles: 2},
    0b01110010: { code: state => Instructions.ldRegisterToRegisterIndirect(state, "HL", "D"), cycles: 2},
    0b01110011: { code: state => Instructions.ldRegisterToRegisterIndirect(state, "HL", "E"), cycles: 2},
    0b01110100: { code: state => Instructions.ldRegisterToRegisterIndirect(state, "HL", "H"), cycles: 2},
    0b01110101: { code: state => Instructions.ldRegisterToRegisterIndirect(state, "HL", "L"), cycles: 2},

    // LD (HL), n
    0b00110110: { code: state => Instructions.ldImmediateToRegisterIndirect(state, "HL"), cycles: 3},

    // LD A, (BC)
    0b00001010: { code: state => Instructions.ldRegisterIndirectToRegister(state, "A", "BC"), cycles: 2},

    // LD A, (DE)
    0b00011010: { code: state => Instructions.ldRegisterIndirectToRegister(state, "A", "DE"), cycles: 2},

    // LD (nn), A
    0b00110010: { code: state => Instructions.ldRegisterToMemory16BitMemoryLocation(state, "A"), cycles: 4},

    0b11101101: { 
        next: {
            // LD A, I
            0b01010111: { code: state => Instructions.ldFromSpecialRegisterToRegister(state, "A", "I"), cycles: 2},
            // LD A, R
            0b01011111: { code: state => Instructions.ldFromSpecialRegisterToRegister(state, "A", "R"), cycles: 2},
            // LD I, A
            0b01000111: { code: state => Instructions.ldFromSpecialRegisterToRegister(state, "I", "A"), cycles: 2},
            // LD R, A
            0b01001111: { code: state => Instructions.ldFromSpecialRegisterToRegister(state, "R", "A"), cycles: 2},

            // LD dd, (nn)
            0b01001011: { code: state => Instructions.ldImmediateIndirectToRegister(state, "BC", true), cycles: 6},
            0b01011011: { code: state => Instructions.ldImmediateIndirectToRegister(state, "DE", true), cycles: 6},
            0b01101011: { code: state => Instructions.ldImmediateIndirectToRegister(state, "HL", true), cycles: 6},
            0b01111011: { code: state => Instructions.ldImmediateIndirectToRegister(state, "SP", true), cycles: 6},

            // LD (nn), dd
            0b01000011: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "BC", true), cycles: 6},
            0b01010011: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "DE", true), cycles: 6},
            0b01100011: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "HL", true), cycles: 6},
            0b01110011: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "SP", true), cycles: 6},
        }
    },

    // LD dd, nn
    0b00000001: { code: state => Instructions.ldInteger16ToRegister(state, "BC"), cycles: 2},
    0b00010001: { code: state => Instructions.ldInteger16ToRegister(state, "DE"), cycles: 2},
    0b00100001: { code: state => Instructions.ldInteger16ToRegister(state, "HL"), cycles: 2},
    0b00110001: { code: state => Instructions.ldInteger16ToRegister(state, "SP"), cycles: 2},

    // LD HL, (dd)
    0b00101010: { code: state => Instructions.ldImmediateIndirectToRegister(state, "HL"), cycles: 5},

    // LD (nn), HL
    0b00100010: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "HL"), cycles: 5},

    // LD SP, HL
    0b11111001: { code: state => Instructions.ldRegister16ToRegister16(state, "SP", "HL"), cycles: 1},
}

module.exports = {
    OPCODES
}