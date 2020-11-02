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

    static ldImmediateIndirectToWordRegister(state, to, advanceIp) {
        if (advanceIp) {
            state.IP++
        }

        const low = state.memory[state.IP++]
        const high = state.memory[state.IP++]
        const address = bytesToBit16(low, high)

        const lowByte = state.memory[address]
        const highByte = state.memory[address+1]
        
        state[to] = bytesToBit16(lowByte, highByte)
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

    static pushRegister16(state, register, advanceIp) {
        if (advanceIp) state.IP++

        this.pushWord(state, state[register])
    }

    static popRegister16(state, register, advanceIp) {
        if (advanceIp) state.IP++

        const value = this.popWord(state)

        state[register] = value
    }

    static exRegisters(state, to, from) {
        const swap = state[to]
        state[to] = state[from]
        state[from] = swap
    }

    static exRegisterWithStackIndirect(state, reg, advanceIp) {
        if (advanceIp) state.IP++

        const [lowReg, highReg] = bit16ToBytes(state[reg])
        
        const stackAddr = state.SP
        const lowStack = state.memory[stackAddr]
        const highStack = state.memory[stackAddr+1]

        state[reg] = bytesToBit16(lowStack, highStack)
        state.memory[stackAddr] = lowReg
        state.memory[stackAddr+1] = highReg
    }

    static exx(state) {
        this.exRegisters(state, "BC", "BC'")
        this.exRegisters(state, "DE", "DE'")
        this.exRegisters(state, "HL", "HL'")
    }

    static ldi(state) {
        state.IP++

        state.memory[state.DE] = state.memory[state.HL]
        state.DE = state.DE + 1
        state.HL = state.HL + 1
        state.BC = state.BC - 1

        state.HFlag = 0
        state.PVFlag = state.BC !== 0 ? 1 : 0
        state.NFlag = 0
    }

    static ldir(state) {
        this.ldi(state)

        if (state.PVFlag) {
            state.IP -= 2
        }
    }

    static ldd(state) {
        state.IP++

        state.memory[state.DE] = state.memory[state.HL]
        state.DE = state.DE - 1
        state.HL = state.HL - 1
        state.BC = state.BC - 1

        state.HFlag = 0
        state.PVFlag = state.BC !== 0 ? 1 : 0
        state.NFlag = 0
    }

    static lddr(state) {
        this.ldd(state)

        if (state.PVFlag) {
            state.IP -= 2
        }
    }

    static cpi(state) {
        state.IP++

        const diff = state.A - state.memory[state.HL]
        state.HL = state.HL + 1
        state.BC = state.BC - 1

        state.SFlag = diff < 0 ? 1 : 0
        state.ZFlag = diff === 0 ? 1 : 0

        // TODO: Figure out exactly how the H flag works
        state.HFlag = 0

        state.PVFlag = state.BC !== 0 ? 1 : 0
        state.NFlag = 1
    }

    static cpir(state) {
        this.cpi(state)

        if (state.PVFlag) {
            state.IP -= 2
        }
    }

    static cpd(state) {
        state.IP++

        const diff = state.A - state.memory[state.HL]
        state.HL = state.HL - 1
        state.BC = state.BC - 1

        state.SFlag = diff < 0 ? 1 : 0
        state.ZFlag = diff === 0 ? 1 : 0

        // TODO: Figure out exactly how the H flag works
        state.HFlag = 0

        state.PVFlag = state.BC !== 0 ? 1 : 0
        state.NFlag = 1
    }

    static cpdr(state) {
        this.cpd(state)

        if (state.PVFlag) {
            state.IP -= 2
        }
    }

    static addRegister(state, register, addCarryBit) {
        this.addToAccumulator(state, state[register], addCarryBit)
    }

    static addRegisterIndirect(state, register, addCarryBit) {
        const value = state.memory[state[register]]

        this.addToAccumulator(state, value, addCarryBit)
    }

    static addRegisterIndirectWithOffset(state, register, addCarryBit) {
        state.IP++
        const addr = state[register] + state.memory[state.IP++]
        const value = state.memory[addr]

        this.addToAccumulator(state, value, addCarryBit)
    }

    static addImmediate(state, addCarryBit) {
        const value = state.memory[state.IP++]
        this.addToAccumulator(state, value, addCarryBit)
    }

    static addToAccumulator(state, amount, addCarryBit) {
        const newAmount = state.A + amount + (addCarryBit && state.CFlag ? 1 : 0)

        // TODO: Handle overflow, etc.
        state.A = newAmount

        state.SFlag = newAmount < 0 ? 1 : 0
        state.ZFlag = newAmount === 0 ? 1 : 0
        
        // TODO: what to do with HFlag
        state.PFFlag = newAmount > 127 || newAmount < -128 ? 1 : 0

        // TODO: I think this is wrong too.
        state.CFlag = 0
    }

    static pushByte(state, byte) {
        state.memory[--state.SP] = byte
    }

    static popByte(state) {
        return state.memory[state.SP++]
    }

    static popWord(state) {
        const low = this.popByte(state)
        const high = this.popByte(state)

        return bytesToBit16(low, high)
    }

    static pushWord(state, word) {
        const [low, high] = bit16ToBytes(word)
        this.pushByte(state, high)
        this.pushByte(state, low)
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
            0b00101010: { code: state => Instructions.ldImmediateIndirectToWordRegister(state, "IX", true), cycles: 6 },

            // LD (nn), IX
            0b00100010: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "IX", true), cycles: 6 },

            // LD SP, IX
            0b11111001: { code: state => Instructions.ldRegister16ToRegister16(state, "SP", "IX", true), cycles: 2},

            // PUSH IX
            0b11100101: { code: state => Instructions.pushRegister16(state, "IX", true), cycles: 4 },

            // POP IX
            0b11100001: { code: state => Instructions.popRegister16(state, "IX", true), cycles: 4 },

            // EX (SP), IX
            0b11100011: { code: state => Instructions.exRegisterWithStackIndirect(state, "IX", true), cycles: 6 },

            // ADD A, (IX + d)
            0b10000110: { code: state => Instructions.addRegisterIndirectWithOffset(state, "IX"), cycles: 5},

            // ADC A, (IX + d)
            0b10001110: { code: state => Instructions.addRegisterIndirectWithOffset(state, "IX", true), cycles: 5},
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
            0b00101010: { code: state => Instructions.ldImmediateIndirectToWordRegister(state, "IY", true), cycles: 6 },

            // LD (nn), IY
            0b00100010: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "IY", true), cycles: 6 },

            // LD SP, IY
            0b11111001: { code: state => Instructions.ldRegister16ToRegister16(state, "SP", "IY", true), cycles: 2},

            // PUSH IY
            0b11100101: { code: state => Instructions.pushRegister16(state, "IY", true), cycles: 4 },

            // POP IY
            0b11100001: { code: state => Instructions.popRegister16(state, "IY", true), cycles: 4 },

            // EX (SP), IX
            0b11100011: { code: state => Instructions.exRegisterWithStackIndirect(state, "IY", true), cycles: 6 },

            // ADD A, (IY + d)
            0b10000110: { code: state => Instructions.addRegisterIndirectWithOffset(state, "IY"), cycles: 5},

            // ADC A, (IY + d)
            0b10001110: { code: state => Instructions.addRegisterIndirectWithOffset(state, "IY", true), cycles: 5},
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
            0b01001011: { code: state => Instructions.ldImmediateIndirectToWordRegister(state, "BC", true), cycles: 6},
            0b01011011: { code: state => Instructions.ldImmediateIndirectToWordRegister(state, "DE", true), cycles: 6},
            0b01101011: { code: state => Instructions.ldImmediateIndirectToWordRegister(state, "HL", true), cycles: 6},
            0b01111011: { code: state => Instructions.ldImmediateIndirectToWordRegister(state, "SP", true), cycles: 6},

            // LD (nn), dd
            0b01000011: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "BC", true), cycles: 6},
            0b01010011: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "DE", true), cycles: 6},
            0b01100011: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "HL", true), cycles: 6},
            0b01110011: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "SP", true), cycles: 6},

            // LDI
            0b10100000: { code: state => Instructions.ldi(state), cycles: 4},

            // LDIR
            // TODO: It's only 4 cycles if already at 0.
            0b10110000: { code: state => Instructions.ldir(state), cycles: 5},

            // LDD
            0b10101000: { code: state => Instructions.ldd(state), cycles: 4},

            // LDDR
            // TODO: it's only 4 cycles if already at 0.
            0b10111000: { code: state => Instructions.lddr(state), cycles: 5},

            // CPI
            0b10100001: { code: state => Instructions.cpi(state), cycles: 4},

            // CPIR
            0b10110001: { code: state => Instructions.cpir(state), cycles: 4},

            // CPD
            0b10101001: { code: state => Instructions.cpd(state), cycles: 4},

            // CPDR
            0b10111001: { code: state => Instructions.cpdr(state), cycles: 4},
        }
    },

    // LD dd, nn
    0b00000001: { code: state => Instructions.ldInteger16ToRegister(state, "BC"), cycles: 2},
    0b00010001: { code: state => Instructions.ldInteger16ToRegister(state, "DE"), cycles: 2},
    0b00100001: { code: state => Instructions.ldInteger16ToRegister(state, "HL"), cycles: 2},
    0b00110001: { code: state => Instructions.ldInteger16ToRegister(state, "SP"), cycles: 2},

    // LD HL, (dd)
    0b00101010: { code: state => Instructions.ldImmediateIndirectToWordRegister(state, "HL"), cycles: 5},

    // LD (nn), HL
    0b00100010: { code: state => Instructions.ldRegisterToImmediateIndirect(state, "HL"), cycles: 5},

    // LD SP, HL
    0b11111001: { code: state => Instructions.ldRegister16ToRegister16(state, "SP", "HL"), cycles: 1},

    // PUSH qq
    0b11000101: { code: state => Instructions.pushRegister16(state, "BC"), cycles: 3},
    0b11010101: { code: state => Instructions.pushRegister16(state, "DE"), cycles: 3},
    0b11100101: { code: state => Instructions.pushRegister16(state, "HL"), cycles: 3},
    0b11110101: { code: state => Instructions.pushRegister16(state, "AF"), cycles: 3},

    // POP qq
    0b11000001: { code: state => Instructions.popRegister16(state, "BC"), cycles: 3},
    0b11010001: { code: state => Instructions.popRegister16(state, "DE"), cycles: 3},
    0b11100001: { code: state => Instructions.popRegister16(state, "HL"), cycles: 3},
    0b11110001: { code: state => Instructions.popRegister16(state, "AF"), cycles: 3},

    // EX DE, HL
    0b11101011: { code: state => Instructions.exRegisters(state, "DE", "HL"), cycles: 1},

    // EX AF, AF'
    0b00001000: { code: state => Instructions.exRegisters(state, "AF", "AF'"), cycles: 1},

    // EXX
    0b11011001: { code: state => Instructions.exx(state), cycles: 1},

    // EX (SP), HL
    0b11100011: { code: state => Instructions.exRegisterWithStackIndirect(state, "HL"), cycles: 5},

    // ADD A, r
    0b10000111: { code: state => Instructions.addRegister(state, "A"), cycles: 1},
    0b10000000: { code: state => Instructions.addRegister(state, "B"), cycles: 1},
    0b10000001: { code: state => Instructions.addRegister(state, "C"), cycles: 1},
    0b10000010: { code: state => Instructions.addRegister(state, "D"), cycles: 1},
    0b10000011: { code: state => Instructions.addRegister(state, "E"), cycles: 1},
    0b10000100: { code: state => Instructions.addRegister(state, "H"), cycles: 1},
    0b10000101: { code: state => Instructions.addRegister(state, "L"), cycles: 1},

    // ADD A, n
    0b11000110: { code: state => Instructions.addImmediate(state), cycles: 2},

    // ADD A, (HL)
    0b10000110: { code: state => Instructions.addRegisterIndirect(state, "HL"), cycles: 2}, 

    // ADC A, r
    0b10001111: { code: state => Instructions.addRegister(state, "A", true), cycles: 1},
    0b10001000: { code: state => Instructions.addRegister(state, "B", true), cycles: 1},
    0b10001001: { code: state => Instructions.addRegister(state, "C", true), cycles: 1},
    0b10001010: { code: state => Instructions.addRegister(state, "D", true), cycles: 1},
    0b10001011: { code: state => Instructions.addRegister(state, "E", true), cycles: 1},
    0b10001100: { code: state => Instructions.addRegister(state, "H", true), cycles: 1},
    0b10001101: { code: state => Instructions.addRegister(state, "L", true), cycles: 1},

    // ADC A, n
    0b11001110: { code: state => Instructions.addImmediate(state, true), cycles: 2},

    // ADC A, (HL)
    0b10001110: { code: state => Instructions.addRegisterIndirect(state, "HL", true), cycles: 2}, 
}

module.exports = {
    OPCODES
}