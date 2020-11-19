const { bytesToBit16 } = require("./helpers")

module.exports = {
    instructions: {
        "LD A, I": {
            bits: ["11101101", "01010111"],
            exec(state) {
                state.A = state.I
            }
        },
        "LD A, R": {
            bits: ["11101101", "01011111"],
            exec(state) {
                state.A = state.R
            }
        },
        "LD I, A": {
            bits: ["11101101", "01000111"],
            exec(state) {
                state.I = state.A
            }
        },
        "LD R, A": {
            bits: ["11101101", "01001111"],
            exec(state) {
                state.R = state.A
            }
        },
        "LD IX, nn": {
            bits: ["11011101", "00100001", "LLLLLLLL", "HHHHHHHH"],
            exec(state, r, n) {
                state.IX = n
            }
        },
        "LD IY, nn": {
            bits: ["11111101", "00100001", "LLLLLLLL", "HHHHHHHH"],
            exec(state, r, n) {
                state.IY = n
            }
        },
        "LD HL, (nn)": {
            bits: ["00101010", "LLLLLLLL", "HHHHHHHH"],
            exec(state, r, n) {
                state.HL = state.get16BitMemory(n)
            }
        },
        "LD IX, (nn)": {
            bits: ["11011101", "00101010", "LLLLLLLL", "HHHHHHHH"],
            exec(state, r, n) {
                state.IX = state.memory[n]
            }
        },
        "LD IY, (nn)": {
            bits: ["11111101", "00101010", "LLLLLLLL", "HHHHHHHH"],
            exec(state, r, n) {
                state.IY = state.memory[n]
            }
        },
        "LD (nn), IX": {
            bits: ["11011101", "00100010", "llllllll", "hhhhhhhh"],
            exec(state, n, r) {
                state.memory[n] = state.IX
            }
        },
        "LD (nn), IY": {
            bits: ["11111101", "00100010", "llllllll", "hhhhhhhh"],
            exec(state, n, r) {
                state.memory[n] = state.IY
            }
        },
        "LD (nn), HL": {
            bits: ["00100010", "llllllll", "hhhhhhhh"],
            exec(state, n, r) {
                state.memory[n] = state.HL
            }
        },
        "LD SP, HL": {
            bits: ["11111001"],
            exec(state, n, r) {
                state.SP = state.HL
            }
        },
        "LD SP, IX": {
            bits: ["11011101", "11111001"],
            exec(state, n, r) {
                state.SP = state.IX
            }
        },
        "LD SP, IY": {
            bits: ["11111101", "11111001"],
            exec(state, n, r) {
                state.SP = state.IY
            }
        },
        "LD r, r'": {
            bits: ["01rrrRRR"],
            exec(state, r1, r2) {
                state[r1] = state[r2]
            }
        },
        "LD r, n": {
            bits: ["00rrr110", "NNNNNNNN"],
            exec(state, r, n) {
                state[r] = n
            }
        },
        "LD r, (HL)": {
            bits: ["01rrr110"],
            exec(state, r) {
                state[r] = state.memory[state.HL]
            }
        },
        "LD A, (BC)": {
            bits: ["00001010"],
            exec(state) {
                state.A = state.memory[state.BC]
            }
        },
        "LD A, (DE)": {
            bits: ["00011010"],
            exec(state, r) {
                state.A = state.memory[state.DE]
            }
        },
        "LD r, (IX+d)": {
            bits: ["11011101", "01rrr110", "DDDDDDDD"],
            exec(state, r, d) {
                state[r] = state.memory[state.IX + d]
            }
        },
        "LD r, (IY+d)": {
            bits: ["11111101", "01rrr110", "DDDDDDDD"],
            exec(state, r, d) {
                state[r] = state.memory[state.IY + d]
            }
        },
        "LD (IX+d), r": {
            bits: ["11011101", "01110RRR", "dddddddd"],
            exec(state, r, d) {
                state.memory[state.IX + d] = state[r]
            }
        },
        "LD (IY+d), r": {
            bits: ["11111101", "01110RRR", "dddddddd"],
            exec(state, r, d) {
                state.memory[state.IY + d] = state[r]
            }
        },
        "LD (HL), r": {
            bits: ["01110RRR"],
            exec(state, r) {
                state.memory[state.HL] = state[r]
            }
        },
        "LD (HL), n": {
            bits: ["00110110", "NNNNNNNN"],
            exec(state, r, n) {
                state.memory[state.HL] = n
            }
        },
        "LD (IX+d), n": {
            bits: ["11011101", "00110110", "dddddddd", "NNNNNNNN"],
            exec(state, d, n) {
                state.memory[state.IX + d] = n
            }
        },
        "LD (IY+d), n": {
            bits: ["11111101", "00110110", "dddddddd", "NNNNNNNN"],
            exec(state, d, n) {
                state.memory[state.IY + d] = n
            }
        },
        "LD dd, nn": {
            bits: ["00dd0001", "LLLLLLLL", "HHHHHHHH"],
            exec(state, r, n) {
                state[r] = n
            }
        },
        "LD dd, (nn)": {
            bits: ["11101101", "01dd1011", "LLLLLLLL", "HHHHHHHH"],
            exec(state, r, n) {
                state[r] = state.memory[n]
            }
        },
        "LD (nn), dd": {
            bits: ["11101101", "01DD0011", "llllllll", "hhhhhhhh"],
            exec(state, n, r) {
                state.memory[n] = state[r]
            }
        },
        "PUSH BC": {
            bits: ["11qq0101"],
            exec(state) {
                const [low, high] = bytesToBit16(state.BC)
                state.memory[--state.SP] = high
                state.memory[--state.SP] = low
            }
        },
        "PUSH IX": {
            bits: ["11011101", "11100101"],
            exec(state) {
                const [low, high] = bytesToBit16(state.IX)
                state.memory[--state.SP] = high
                state.memory[--state.SP] = low
            }
        },
        "PUSH IY": {
            bits: ["11111101", "11100101"],
            exec(state) {
                const [low, high] = bytesToBit16(state.IY)
                state.memory[--state.SP] = high
                state.memory[--state.SP] = low
            }
        },
        "POP IX": {
            bits: ["11011101", "11100001"],
            exec(state, r) {
                const [low, high] = bytesToBit16(state.IX)
                state.memory[--state.SP] = high
                state.memory[--state.SP] = low
            }
        },
        "POP IY": {
            bits: ["11111101", "11100001"],
            exec(state, r) {
                const [low, high] = bytesToBit16(state.IY)
                state.memory[--state.SP] = high
                state.memory[--state.SP] = low
            }
        },
        "POP qq": {
            bits: ["11qq0001"],
            exec(state, r) {
                const [low, high] = bytesToBit16(state[r])
                state.memory[--state.SP] = high
                state.memory[--state.SP] = low
            }
        },
        "EX DE, HL": {
            bits: ["11101011"],
            exec(state) {
                [state.DE, state.HL] = [state.HL, state.DE]
            }
        },
        "EX AF, AF'": {
            bits: ["00001000"],
            exec(state) {
                [state.AF, state["AF'"]] = [state["AF'"], state.AF]
            }
        },
        "EX (SP), HL": {
            bits: ["11100011"],
            exec(state) {
                const [lowReg, highReg] = bit16ToBytes(state.HL)
        
                const stackAddr = state.SP
                const lowStack = state.memory[stackAddr]
                const highStack = state.memory[stackAddr+1]
        
                state.HL = bytesToBit16(lowStack, highStack)
                state.memory[stackAddr] = lowReg
                state.memory[stackAddr+1] = highReg
            }
        },
        "EX (SP), IX": {
            bits: ["11011101", "11100011"],
            exec(state) {
                const [lowReg, highReg] = bit16ToBytes(state.IX)
        
                const stackAddr = state.SP
                const lowStack = state.memory[stackAddr]
                const highStack = state.memory[stackAddr+1]
        
                state.IX = bytesToBit16(lowStack, highStack)
                state.memory[stackAddr] = lowReg
                state.memory[stackAddr+1] = highReg
            }
        },
        "EX (SP), IY": {
            bits: ["11111101", "11100011"],
            exec(state) {
                const [lowReg, highReg] = bit16ToBytes(state.IY)
        
                const stackAddr = state.SP
                const lowStack = state.memory[stackAddr]
                const highStack = state.memory[stackAddr+1]
        
                state.IY = bytesToBit16(lowStack, highStack)
                state.memory[stackAddr] = lowReg
                state.memory[stackAddr+1] = highReg
            }
        },
        "EXX": {
            bits: ["11011001"],
            exec(state) {
                [state["BC"], state["BC'"]] = [state["BC'"], state["BC"]]
                [state["DE"], state["DE'"]] = [state["DE'"], state["DE"]]
                [state["HL"], state["HL'"]] = [state["HL'"], state["HL"]]
            }
        },
        "LDI": {
            bits: ["11101101", "10100000"],
            exec(state) {
                state.DE = state.HL
                state.DE++
                state.HL++
                state.BC--
                state.HFlag = 0
                state.PVFlag = state.BC !== 0 ? 1 : 0
                state.NFlag = 0
            }
        },
        "LDIR": {
            bits: ["11101101", "10110000"],
            exec(state) {
                state.DE = state.HL
                state.DE++
                state.HL++
                state.BC--
                state.HFlag = 0
                state.PVFlag = state.BC !== 0 ? 1 : 0
                state.NFlag = 0
                if (state.PVFlag) {
                    state.IP -= 2
                }
            }
        },
        "LDD": {
            bits: ["11101101", "10101000"],
            exec(state) {
                state.DE = state.HL
                state.DE--
                state.HL--
                state.BC--
                state.HFlag = 0
                state.PVFlag = state.BC !== 0 ? 1 : 0
                state.NFlag = 0
            }
        },
        "LDDR": {
            bits: ["11101101", "10111000"],
            exec(state) {
                state.DE = state.HL
                state.DE--
                state.HL--
                state.BC--
                state.HFlag = 0
                state.PVFlag = state.BC !== 0 ? 1 : 0
                state.NFlag = 0
                if (state.PVFlag) {
                    state.IP -= 2
                }
            }
        },
        "HALT": {
            bits: ["01110110"],
            exec(state) {
                state.isHalted = true
            },
            cycles: 1
        },
        "NOP": {
            bits: ["00000000"],
            exec() {
            }
        },
        "CPI": {
            bits: ["11101101", "10100001"]
        },
        "CPIR": {
            bits: ["11101101", "10110001"]
        },
        "CPD": {
            bits: ["11101101", "10101001"]
        },
        "CPDR": {
            bits: ["11101101", "10111001"]
        },
        "ADD A, (HL)": {
            bits: ["10000110"]
        },
        "ADD A, (IX+d)": {
            bits: ["11011101", "10000110", "DDDDDDDD"]
        },
        "ADD A, (IY+d)": {
            bits: ["11111101", "10000110", "DDDDDDDD"]
        },
        "ADD A, r": {
            bits: ["10000RRR"]
        },
        "ADD A, n": {
            bits: ["11000110", "NNNNNNNN"]
        },
        "ADC A, (IX+d)": {
            bits: ["11011101", "10001110", "DDDDDDDD"]
        },
        "ADC A, (IY+d)": {
            bits: ["11111101", "10001110", "DDDDDDDD"]
        },
        "ADC A, r": {
            bits: ["10001RRR"]
        },
        "ADC A, n": {
            bits: ["11001110", "NNNNNNNN"]
        },
        "ADC A, (HL)": {
            bits: ["10001110"]
        },
        "SUB (HL)": {
            bits: ["10010110"]
        },
        "SUB (IX+d)": {
            bits: ["11011101", "10010110", "dddddddd"]
        },
        "SUB (IY+d)": {
            bits: ["11111101", "10010110", "dddddddd"]
        },
        "SUB r": {
            bits: ["10010rrr"]
        },
        "SUB n": {
            bits: ["11010110", "nnnnnnnn"]
        },
        "SBC A, r": {
            bits: ["10011RRR"]
        },
        "SBC A, n": {
            bits: ["11011110", "NNNNNNNN"]
        },
        "SBC A, (HL)": {
            bits: ["10011110"]
        },
        "SBC A, (IX+d)": {
            bits: ["11011101", "10011110", "DDDDDDDD"]
        },
        "SBC A, (IY+d)": {
            bits: ["11111101", "10011110", "DDDDDDDD"]
        },

        // AND
        "AND (HL)": {
            bits: ["10100110"]
        },
        "AND (IX+d)": {
            bits: ["11011101", "10100110", "dddddddd"]
        },
        "AND (IY+d)": {
            bits: ["11111101", "10100110", "dddddddd"]
        },
        "AND r": {
            bits: ["10100rrr"]
        },
        "AND n": {
            bits: ["11100110", "nnnnnnnn"]
        },

        // OR
        "OR (HL)": {
            bits: ["10110110"]
        },
        "OR (IX+d)": {
            bits: ["11011101", "10110110", "dddddddd"]
        },
        "OR (IY+d)": {
            bits: ["11111101", "10110110", "dddddddd"]
        },
        "OR r": {
            bits: ["10110rrr"]
        },
        "OR n": {
            bits: ["11110110", "nnnnnnnn"]
        },

        // XOR
        "XOR (HL)": {
            bits: ["10101110"]
        },
        "XOR (IX+d)": {
            bits: ["11011101", "10101110", "dddddddd"]
        },
        "XOR (IY+d)": {
            bits: ["11111101", "10101110", "dddddddd"]
        },
        "XOR r": {
            bits: ["10101rrr"]
        },
        "XOR n": {
            bits: ["11101110", "nnnnnnnn"]
        },

        // CP
        "CP (HL)": {
            bits: ["10111110"]
        },
        "CP (IX+d)": {
            bits: ["11011101", "10111110", "dddddddd"]
        },
        "CP (IY+d)": {
            bits: ["11111101", "10111110", "dddddddd"]
        },
        "CP r": {
            bits: ["10111rrr"]
        },
        "CP n": {
            bits: ["11111110", "nnnnnnnn"]
        },

        // INC
        "INC r": {
            bits: ["00rrr100"]
        },
        "INC (HL)": {
            bits: ["00110100"]
        },
        "INC (IX+d)": {
            bits: ["11011101", "00110100", "dddddddd"]
        },
        "INC (IY+d)": {
            bits: ["11111101", "00110100", "dddddddd"]
        },

        // DEC
        "DEC r": {
            bits: ["00rrr101"]
        },
        "DEC (HL)": {
            bits: ["00110101"]
        },
        "DEC (IX+d)": {
            bits: ["11011101", "00110101", "dddddddd"]
        },
        "DEC (IY+d)": {
            bits: ["11111101", "00110101", "dddddddd"]
        },
    }        
}
