const { TestWatcher } = require("jest")
const { bit16ToBytes, bytesToBit16 } = require("./helpers")

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
            exec(state, n) {
                state.IX = n
            }
        },
        "LD IY, nn": {
            bits: ["11111101", "00100001", "LLLLLLLL", "HHHHHHHH"],
            exec(state, n) {
                state.IY = n
            }
        },
        "LD HL, (nn)": {
            bits: ["00101010", "LLLLLLLL", "HHHHHHHH"],
            exec(state, n) {
                state.HL = state.get16BitMemory(n)
            }
        },
        "LD IX, (nn)": {
            bits: ["11011101", "00101010", "LLLLLLLL", "HHHHHHHH"],
            exec(state, n) {
                state.IX = state.get16BitMemory(n)
            }
        },
        "LD IY, (nn)": {
            bits: ["11111101", "00101010", "LLLLLLLL", "HHHHHHHH"],
            exec(state, n) {
                state.IY = state.get16BitMemory(n)
            }
        },
        "LD (nn), IX": {
            bits: ["11011101", "00100010", "llllllll", "hhhhhhhh"],
            exec(state, n) {
                state.put16BitMemory(n, state.IX)
            }
        },
        "LD (nn), IY": {
            bits: ["11111101", "00100010", "llllllll", "hhhhhhhh"],
            exec(state, n) {
                state.put16BitMemory(n, state.IY)
            }
        },
        "LD (nn), HL": {
            bits: ["00100010", "llllllll", "hhhhhhhh"],
            exec(state, n) {
                state.put16BitMemory(n, state.HL)
            }
        },
        "LD SP, HL": {
            bits: ["11111001"],
            exec(state) {
                state.SP = state.HL
            }
        },
        "LD SP, IX": {
            bits: ["11011101", "11111001"],
            exec(state) {
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
            },
            cycles: 2
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
            exec(state, n) {
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
                state[r] = state.get16BitMemory(n)
            }
        },
        "LD (nn), dd": {
            bits: ["11101101", "01DD0011", "llllllll", "hhhhhhhh"],
            exec(state, r, n) {
                state.put16BitMemory(n, state[r])
            }
        },
        "PUSH IX": {
            bits: ["11011101", "11100101"],
            exec(state) {
                const [low, high] = bit16ToBytes(state.IX)
                state.memory[--state.SP] = high
                state.memory[--state.SP] = low
            }
        },
        "PUSH IY": {
            bits: ["11111101", "11100101"],
            exec(state) {
                const [low, high] = bit16ToBytes(state.IY)
                state.memory[--state.SP] = high
                state.memory[--state.SP] = low
            }
        },
        "PUSH qq": {
            bits: ["11qq0101"],
            exec(state) {
                const [low, high] = bit16ToBytes(state.BC)
                state.memory[--state.SP] = high
                state.memory[--state.SP] = low
            }
        },
        "POP IX": {
            bits: ["11011101", "11100001"],
            exec(state) {
                const value = state.get16BitMemory(state.SP)
                state.SP += 2
                state.IX = value
            }
        },
        "POP IY": {
            bits: ["11111101", "11100001"],
            exec(state) {
                const value = state.get16BitMemory(state.SP)
                state.SP += 2
                state.IY = value
            }
        },
        "POP qq": {
            bits: ["11qq0001"],
            exec(state, r) {
                const value = state.get16BitMemory(state.SP)
                state.SP += 2
                state[r] = value
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
                [state["BC"], state["BC'"]] = [state["BC'"], state["BC"]];
                [state["DE"], state["DE'"]] = [state["DE'"], state["DE"]];
                [state["HL"], state["HL'"]] = [state["HL'"], state["HL"]];
            }
        },
        "LDI": {
            bits: ["11101101", "10100000"],
            exec(state) {
                state.memory[state.DE] = state.memory[state.HL]
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
                state.memory[state.DE] = state.memory[state.HL]
                state.DE++
                state.HL++
                state.BC--
                state.HFlag = 0
                state.PVFlag = state.BC !== 0 ? 1 : 0
                state.NFlag = 0
                if (state.PVFlag) {
                    state.ipWasModified = true
                }
            }
        },
        "LDD": {
            bits: ["11101101", "10101000"],
            exec: LDD
        },
        "LDDR": {
            bits: ["11101101", "10111000"],
            exec(state) {
                LDD(state)
                if (state.PVFlag) {
                    // stay put
                    state.ipWasModified = true
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
            },
            cycles: 1
        },
        "CPI": {
            bits: ["11101101", "10100001"],
            exec: CPI
        },
        "CPIR": {
            bits: ["11101101", "10110001"],
            exec(state) {
                CPI(state)
                if (state.BC !== 0 && state.A !== state.memory[state.HL]) {
                    // Stay put
                    state.ipWasModified = true
                }
            }
        },
        "CPD": {
            bits: ["11101101", "10101001"],
            exec: CPD
        },
        "CPDR": {
            bits: ["11101101", "10111001"],
            exec(state) {
                CPD(state)
                if (state.BC !== 0 && state.A !== state.memory[state.HL]) {
                    // Stay put
                    state.ipWasModified = true
                }
            }
        },
        "ADD A, (HL)": {
            bits: ["10000110"],
            exec: (state) => ADD(state, state.memory[state.HL])
        },
        "ADD A, (IX+d)": {
            bits: ["11011101", "10000110", "DDDDDDDD"],
            exec: (state, d) => ADD(state, state.memory[state.IX + d])
        },
        "ADD A, (IY+d)": {
            bits: ["11111101", "10000110", "DDDDDDDD"],
            exec: (state, d) => ADD(state, state.memory[state.IY + d])
        },
        "ADD A, r": {
            bits: ["10000RRR"],
            exec: (state, r) => ADD(state, state[r])
        },
        "ADD A, n": {
            bits: ["11000110", "NNNNNNNN"],
            exec: (state, n) => ADD(state, n)
        },
        "ADD HL, ss": {
            bits: ["00SS1001"],
            exec: (state, reg) => ADD16(state, state[reg])
        },
        "ADC A, (IX+d)": {
            bits: ["11011101", "10001110", "DDDDDDDD"],
            exec: (state, d) => ADC(state, state.memory[state.IX + d])
        },
        "ADC A, (IY+d)": {
            bits: ["11111101", "10001110", "DDDDDDDD"],
            exec: (state, d) => ADC(state, state.memory[state.IY + d])
        },
        "ADC A, r": {
            bits: ["10001RRR"],
            exec: (state, r) => ADC(state, state[r])
        },
        "ADC A, n": {
            bits: ["11001110", "NNNNNNNN"],
            exec: (state, n) => ADC(state, n)
        },
        "ADC A, (HL)": {
            bits: ["10001110"],
            exec: (state) => ADC(state, state.memory[state.HL])
        },
        "ADC HL, ss": {
            bits: ["11101101", "01SS1010"],
            exec: (state, reg) => ADC16(state, state[reg])
        },
        "SUB (HL)": {
            bits: ["10010110"],
            exec: (state) => SUB(state, state.memory[state.HL])
        },
        "SUB (IX+d)": {
            bits: ["11011101", "10010110", "dddddddd"],
            exec: (state, d) => SUB(state, state.memory[state.IX + d])
        },
        "SUB (IY+d)": {
            bits: ["11111101", "10010110", "dddddddd"],
            exec: (state, d) => SUB(state, state.memory[state.IY + d])
        },
        "SUB r": {
            bits: ["10010rrr"],
            exec: (state, r) => SUB(state, state[r])
        },
        "SUB n": {
            bits: ["11010110", "nnnnnnnn"],
            exec: (state, n) => SUB(state, n)
        },
        "SBC A, r": {
            bits: ["10011RRR"],
            exec: (state, r) => SBC(state, state[r])
        },
        "SBC A, n": {
            bits: ["11011110", "NNNNNNNN"],
            exec: (state, n) => SBC(state, n)
        },
        "SBC A, (HL)": {
            bits: ["10011110"],
            exec: (state) => SBC(state, state.memory[state.HL])
        },
        "SBC A, (IX+d)": {
            bits: ["11011101", "10011110", "DDDDDDDD"],
            exec: (state, d) => SBC(state, state.memory[state.IX + d])
        },
        "SBC A, (IY+d)": {
            bits: ["11111101", "10011110", "DDDDDDDD"],
            exec: (state, d) => SBC(state, state.memory[state.IY + d])
        },

        // AND
        "AND (HL)": {
            bits: ["10100110"],
            exec: (state) => AND(state, state.memory[state.HL])
        },
        "AND (IX+d)": {
            bits: ["11011101", "10100110", "dddddddd"],
            exec: (state, d) => AND(state, state.memory[state.IX + d])
        },
        "AND (IY+d)": {
            bits: ["11111101", "10100110", "dddddddd"],
            exec: (state, d) => AND(state, state.memory[state.IY + d])
        },
        "AND r": {
            bits: ["10100rrr"],
            exec: (state, r) => AND(state, state[r])
        },
        "AND n": {
            bits: ["11100110", "nnnnnnnn"],
            exec: (state, n) => AND(state, n)
        },

        // OR
        "OR (HL)": {
            bits: ["10110110"],
            exec: (state) => OR(state, state.memory[state.HL])
        },
        "OR (IX+d)": {
            bits: ["11011101", "10110110", "dddddddd"],
            exec: (state, d) => OR(state, state.memory[state.IX + d])
        },
        "OR (IY+d)": {
            bits: ["11111101", "10110110", "dddddddd"],
            exec: (state, d) => OR(state, state.memory[state.IY + d])
        },
        "OR r": {
            bits: ["10110rrr"],
            exec: (state, r) => OR(state, state[r])
        },
        "OR n": {
            bits: ["11110110", "nnnnnnnn"],
            exec: (state, n) => OR(state, n)
        },

        // XOR
        "XOR (HL)": {
            bits: ["10101110"],
            exec: (state) => XOR(state, state.memory[state.HL])
        },
        "XOR (IX+d)": {
            bits: ["11011101", "10101110", "dddddddd"],
            exec: (state, d) => XOR(state, state.memory[state.IX + d])
        },
        "XOR (IY+d)": {
            bits: ["11111101", "10101110", "dddddddd"],
            exec: (state, d) => XOR(state, state.memory[state.IY + d])
        },
        "XOR r": {
            bits: ["10101rrr"],
            exec: (state, r) => XOR(state, state[r])
        },
        "XOR n": {
            bits: ["11101110", "nnnnnnnn"],
            exec: (state, n) => XOR(state, n)
        },

        // CP
        "CP (HL)": {
            bits: ["10111110"],
            exec: (state) => CP(state, state.memory[state.HL])
        },
        "CP (IX+d)": {
            bits: ["11011101", "10111110", "dddddddd"],
            exec: (state, d) => CP(state, state.memory[state.IX + d])
        },
        "CP (IY+d)": {
            bits: ["11111101", "10111110", "dddddddd"],
            exec: (state, d) => CP(state, state.memory[state.IY + d])
        },
        "CP r": {
            bits: ["10111rrr"],
            exec: (state, r) => CP(state, state[r])
        },
        "CP n": {
            bits: ["11111110", "nnnnnnnn"],
            exec: (state, n) => CP(state, n)
        },

        // INC
        "INC r": {
            bits: ["00rrr100"],
            exec(state, r) {
                state[r] = INC(state, state[r])
            }
        },
        "INC (HL)": {
            bits: ["00110100"],
            exec(state) {
                state.memory[state.HL] = INC(state, state.memory[state.HL])
            }
        },
        "INC (IX+d)": {
            bits: ["11011101", "00110100", "dddddddd"],
            exec(state, d) {
                state.memory[state.IX + d] = INC(state, state.memory[state.IX + d])
            }
        },
        "INC (IY+d)": {
            bits: ["11111101", "00110100", "dddddddd"],
            exec(state, d) {
                state.memory[state.IY + d] = INC(state, state.memory[state.IY + d])
            }
        },

        // DEC
        "DEC r": {
            bits: ["00rrr101"],
            exec(state, r) {
                state[r] = DEC(state, state[r])
            }
        },
        "DEC (HL)": {
            bits: ["00110101"],
            exec(state) {
                state.memory[state.HL] = DEC(state, state.memory[state.HL])
            }
        },
        "DEC (IX+d)": {
            bits: ["11011101", "00110101", "dddddddd"],
            exec(state, d) {
                state.memory[state.IX + d] = DEC(state, state.memory[state.IX + d])
            }
        },
        "DEC (IY+d)": {
            bits: ["11111101", "00110101", "dddddddd"],
            exec(state, d) {
                state.memory[state.IY + d] = DEC(state, state.memory[state.IY + d])
            }
        },
        "DAA": {
            cycles: 1,
            bits: ["00100111"],
            exec(state) {
                let t = 0

                if (state.HFlag || (state.A & 0x0F) > 9) {
                    t++
                }

                if (state.CFlag || (state.A > 0x99)) {
                    t += 2
                    state.CFlag = 1
                }

                if (state.NFlag && !state.HFlag) {
                    state.HFlag = 0
                } else {
                    if (state.NFlag && state.HFlag) {
                        state.HFlag = (((state.A & 0x0F)) < 6)
                    } else {
                        state.HFlag = ((state.A & 0x0F) >= 0x0A)
                    }
                }

                switch (t) {
                    case 1:
                        state.A += state.NFlag ? 0xFA : 0x06
                        break
                    case 2:
                        state.A += state.NFlag ? 0xA0 : 0x60
                        break
                    case 3:
                        state.A += state.NFlag ? 0x9A : 0x66
                }

                state.A = state.A % 256
                state.SFlag = state.A & 0b10000000
                state.ZFlag = state.A === 0
                state.PVFlag = getParityBit(state.A)

                // if (state.HFlag || (state.A & 0x0F) > 9) {
                //     state.HFlag = 1
                //     state.A += 0x06
                // } else {
                //     state.HFlag = 0
                // }
                
                // if (state.CFlag || ((state.A & 0xF0) >> 4) > 9) {
                //     state.CFlag = 1
                //     state.A += 0x60
                // } else {
                //     state.CFlag = 0
                // }
                // state.A = state.A % 256

                // state.SFlag = state.A > 127
                // state.ZFlag = state.A === 0
                // state.PVFlag = getParityBit(state.A)
            }
        },
        "CPL": {
            bits: ["00101111"],
            exec(state) {
                state.A = ~state.A + 256
                state.HFlag = 1
                state.NFlag = 1
            },
            cycles: 1
        },
        "NEG": {
            bits: ["11101101", "01000100"],
            cycles: 2,
            exec(state) {
                state.CFlag = state.A !== 0x00
                state.PVFlag = state.A !== 0x80
                state.A = ((0 - state.A) + 256) % 256
                state.ZFlag = state.A === 0
                state.HFlag = state.A & 0b00010000
                state.NFlag = 1
                state.SFlag = state.A > 127

            }
        },
        "CCF": {
            bits: ["00111111"],
            cycles: 2,
            exec(state) {
                state.CFlag = !state.CFlag
                state.NFlag = 0
            }
        },
        "SCF": {
            bits: ["00110111"],
            cycles: 2,
            exec(state) {
                state.CFlag = 1
                state.NFlag = 0
                state.HFlag = 0
            }
        },
        "DI": {
            bits: ["11110011"],
            cycles: 1,
            exec(state) {
                state.IFF = 0
            }
        },
        "EI": {
            bits: ["11111011"],
            cycles: 1,
            exec(state) {
                state.IFF = 1
            }
        },
        "IM 0": {
            bits: ["11101101", "01000110"],
            cycles: 2,
            exec(state) {
                state.IM0 = 1                
            }
        },
        "IM 1": {
            bits: ["11101101", "01010110"],
            cycles: 2,
            exec(state) {
                state.IM1 = 1                
            }
        },
        "IM 2": {
            bits: ["11101101", "01011110"],
            cycles: 2,
            exec(state) {
                state.IM2 = 1                
            }
        },
    }        
}

const PARITY_NYBBLES = {
    0b0000: 0,
    0b0001: 1,
    0b0010: 1,
    0b0011: 0,
    0b0100: 1,
    0b0101: 0,
    0b0110: 0,
    0b0111: 1,
    0b1000: 1,
    0b1001: 0,
    0b1010: 0,
    0b1011: 1,
    0b1100: 0,
    0b1101: 1,
    0b1110: 1,
    0b1111: 0,
}

function getParityBit(byte) {
    return PARITY_NYBBLES[byte & 0x0F] ^ PARITY_NYBBLES[(byte & 0xF0) >> 4]
}

function LDD(state) {
    state.memory[state.DE] = state.memory[state.HL]
    state.DE--
    state.HL--
    state.BC--
    state.HFlag = 0
    state.PVFlag = state.BC !== 0 ? 1 : 0
    state.NFlag = 0
}

function CPI(state) {
    const val = state.memory[state.HL]
    const diff = state.A - val
    state.HL++
    state.BC--

    if (diff < 0) {
        state.SFlag = 1
        state.ZFlag = 0
    } else if (diff === 0) {
        state.SFlag = 0
        state.ZFlag = 1
    } else {
        state.SFlag = 0
        state.ZFlag = 0
    }
    state.PVFlag = state.BC !== 0
    state.NFlag = 1

    // TODO: What about HFlag?
}

function CPD(state) {
    const val = state.memory[state.HL]
    const diff = state.A - val
    state.HL--
    state.BC--

    if (diff < 0) {
        state.SFlag = 1
        state.ZFlag = 0
    } else if (diff === 0) {
        state.SFlag = 0
        state.ZFlag = 1
    } else {
        state.SFlag = 0
        state.ZFlag = 0
    }
    state.PVFlag = state.BC !== 0
    state.NFlag = 1

    // TODO: What about HFlag?
}

function ADD(state, value) {
    const result = state.A + value

    state.SFlag = result > 127
    state.ZFlag = result === 0
    state.HFlag = result & 0b00001000
    state.PVFlag = result > 255
    state.NFlag = 0
    state.CFlag = result > 255

    state.A = result % 256
}

function ADC(state, value) {
    ADD(state, value + (state.CFlag ? 1 : 0))
}

function ADD16(state, value) {
    const result = state.HL + value

    state.SFlag = result > 32767
    state.ZFlag = result === 0
    state.HFlag = result & 0b0000100000000000
    state.PVFlag = result > 65535
    state.NFlag = 0
    state.CFlag = result > 65535

    state.HL = result % 65536
}

function ADC16(state, value) {
    ADD16(state, value + (state.CFlag ? 1 : 0))
}


function SUB(state, value) {
    const result = state.A - value

    state.SFlag = result < 0
    state.ZFlag = result === 0
    state.HFlag = result & 0b00010000
    state.PVFlag = result > 255
    state.NFlag = 1
    state.CFlag = result < 0

    state.A = (result+256) % 256
}

function SBC(state, value) {
    SUB(state, value + (state.CFlag ? 1 : 0))
}

function AND(state, value) {
    const result = state.A & value

    state.SFlag = result > 127
    state.ZFlag = result === 0
    state.HFlag = 1
    state.PVFlag = 0
    state.NFlag = 0
    state.CFlag = 0

    state.A = result
}

function OR(state, value) {
    const result = state.A | value

    state.SFlag = result > 127
    state.ZFlag = result === 0
    state.HFlag = 1
    state.PVFlag = 0
    state.NFlag = 0
    state.CFlag = 0

    state.A = result
}

function XOR(state, value) {
    const result = state.A ^ value

    state.SFlag = result > 127
    state.ZFlag = result === 0
    state.HFlag = 1
    state.PVFlag = 0
    state.NFlag = 0
    state.CFlag = 0

    state.A = result
}

function CP(state, value) {
    const diff = state.A - value

    state.SFlag = diff < 0
    state.ZFlag = diff === 0
    state.HFlag = diff & 0b00010000
    state.PVFlag = diff > 255
    state.CFlag = diff < 0
    state.NFlag = 1
}

function INC(state, value) {
    const result = value + 1

    state.SFlag = result > 127
    state.ZFlag = result === 0
    state.HFlag = result & 0b00010000
    state.PVFlag = value === 0x7F
    state.NFlag = 0

    return result % 256
}

function DEC(state, value) {
    const result = value - 1

    state.SFlag = result > 127
    state.ZFlag = result === 0
    state.HFlag = result & 0b00010000
    state.PVFlag = value === 0x7F
    state.NFlag = 1

    return (result + 256) % 256
}