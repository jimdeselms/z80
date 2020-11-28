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
            exec: (state, reg) => ADD16(state, "HL", state[reg]),
            cycles: 4
        },
        "ADD IX, pp": {
            bits: ["11011101", "00PP1001"],
            exec: (state, reg) => ADD16(state, "IX", state[reg]),
            cycles: 4
        },
        "ADD IY, rr": {
            bits: ["11111101", "00RR1001"],
            exec: (state, reg) => ADD16(state, "IY", state[reg]),
            cycles: 4
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
            exec: (state, reg) => ADC16(state, "HL", state[reg]),
            cycles: 4
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
        "INC ss": {
            bits: ["00ss0011"],
            exec: (state, reg) => INC16(state, reg),
            cycles: 1
        },
        "INC IX": {
            bits: ["11011101", "00100011"],
            exec: (state) => INC16(state, "IX"),
            cycles: 2
        },
        "INC IY": {
            bits: ["11111101", "00100011"],
            exec: (state) => INC16(state, "IY"),
            cycles: 2
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
        "DEC ss": {
            bits: ["00ss1011"],
            exec: (state, reg) => DEC16(state, reg),
            cycles: 1
        },
        "DEC IX": {
            bits: ["11011101", "00101011"],
            exec: (state) => DEC16(state, "IX"),
            cycles: 1
        },
        "DEC IY": {
            bits: ["11111101", "00101011"],
            exec: (state) => DEC16(state, "IY"),
            cycles: 1
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
        "RLC r": {
            bits: ["11001011", "00000rrr"],
            cycles: 2,
            exec: (state, r) => RLC(state, state[r], v => state[r] = v)
        },
        "RLC (HL)": {
            bits: ["11001011", "00000110"],
            cycles: 4,
            exec: (state) => RLC(state, state.memory[state.HL], v => state.memory[state.HL] = v)
        },
        "RLC (IX+d)": {
            bits: ["11011101", "11001011", "dddddddd", "00000110"],
            cycles: 4,
            exec: (state, d1) => {
                IXIYSpecial(state, state.memory[state.IX + d1], v => state.memory[state.IX + d1] = v)
            }
        },
        "RLC (IY+d)": {
            bits: ["11111101", "11001011", "dddddddd", "00000110"],
            cycles: 4,
            exec: (state, d1) => IXIYSpecial(state, state.memory[state.IY + d1], v => state.memory[state.IY + d1] = v)
        },

        "RL r": {
            bits: ["11001011", "00010rrr"],
            cycles: 2,
            exec: (state, r) => RL(state, state[r], v => state[r] = v)
        },
        "RL (HL)": {
            bits: ["11001011", "00010110"],
            cycles: 4,
            exec: (state) => RL(state, state.HL, v => state.HL = v)
        },
        "RL (HL)": {
            bits: ["11001011", "00010110"],
            cycles: 4,
            exec: (state) => RL(state, state.memory[state.HL], v => state.memory[state.HL] = v)
        },
        "RL (IX+d)": {
            bits: ["11011101", "11001011", "dddddddd", "00010110"],
            cycles: 6,
            exec: (state, d1) => IXIYSpecial(state, state.memory[state.IX + d1], v => state.memory[state.IX + d1] = v)
        },
        "RL (IY+d)": {
            bits: ["11111101", "11001011", "dddddddd", "00010110"],
            cycles: 6,
            exec: (state, d1) => IXIYSpecial(state, state.memory[state.IY + d1], v => state.memory[state.IY + d1] = v)
        },

        "RRC r": {
            bits: ["11001011", "00001rrr"],
            cycles: 2,
            exec: (state, r) => RRC(state, state[r], v => state[r] = v)
        },
        "RRC (HL)": {
            bits: ["11001011", "00001110"],
            cycles: 4,
            exec: (state) => RRC(state, state.memory[state.HL], v => state.memory[state.HL] = v)
        },
        "RRC (IX+d)": {
            bits: ["11011101", "11001011", "dddddddd", "00001110"],
            cycles: 6,
            exec: (state, d1) => {
                IXIYSpecial(state, state.memory[state.IX + d1], v => state.memory[state.IX + d1] = v)
            }
        },
        "RRC (IY+d)": {
            bits: ["11111101", "11001011", "dddddddd", "00001110"],
            cycles: 6,
            exec: (state, d1) => IXIYSpecial(state, state.memory[state.IY + d1], v => state.memory[state.IY + d1] = v)
        },

        "RR r": {
            bits: ["11001011", "00011rrr"],
            cycles: 2,
            exec: (state, r) => RR(state, state[r], v => state[r] = v)
        },
        "RR (HL)": {
            bits: ["11001011", "00011110"],
            cycles: 4,
            exec: (state) => RR(state, state.memory[state.HL], v => state.memory[state.HL] = v)
        },
        "RR (IX+d)": {
            bits: ["11011101", "11001011", "dddddddd", "00011110"],
            cycles: 6,
            exec: (state, d1) => {
                IXIYSpecial(state, state.memory[state.IX + d1], v => state.memory[state.IX + d1] = v)
            }
        },
        "RR (IY+d)": {
            bits: ["11111101", "11001011", "dddddddd", "00011110"],
            cycles: 6,
            exec: (state, d1) => IXIYSpecial(state, state.memory[state.IY + d1], v => state.memory[state.IY + d1] = v)
        },

        "RLCA": {
            bits: ["00000111"],
            cycles: 1,
            exec: (state) => RLC(state, state.A, v => state.A = v)
        },
        "RRCA": {
            bits: ["00001111"],
            cycles: 1,
            exec: (state) => RRC(state, state.A, v => state.A = v)
        },
        "RLA": {
            bits: ["00010111"],
            cycles: 1,
            exec: (state) => RL(state, state.A, v => state.A = v)
        },
        "RRA": {
            bits: ["00011111"],
            cycles: 1,
            exec: (state) => RR(state, state.A, v => state.A = v)
        },

        "SLA r": {
            bits: ["11001011", "00100rrr"],
            cycles: 2,
            exec: (state, r) => SLA(state, state[r], v => state[r] = v)
        },
        "SLA (HL)": {
            bits: ["11001011", "00100110"],
            cycles: 4,
            exec: (state) => SLA(state, state.memory[state.HL], v => state.memory[state.HL] = v)
        },
        "SLA (IX+d)": {
            bits: ["11011101", "11001011", "dddddddd", "00100110"],
            cycles: 6,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IX + d], v => state.memory[state.IX + d] = v)
        },
        "SLA (IY+d)": {
            bits: ["11111101", "11001011", "dddddddd", "00100110"],
            cycles: 6,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IY + d], v => state.memory[state.IY + d] = v)
        },

        "SRA r": {
            bits: ["11001011", "00101rrr"],
            cycles: 2,
            exec: (state, r) => SRA(state, state[r], v => state[r] = v)
        },
        "SRA (HL)": {
            bits: ["11001011", "00101110"],
            cycles: 4,
            exec: (state) => SRA(state, state.memory[state.HL], v => state.memory[state.HL] = v)
        },
        "SRA (IX+d)": {
            bits: ["11011101", "11001011", "dddddddd", "00101110"],
            cycles: 6,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IX + d], v => state.memory[state.IX + d] = v)
        },
        "SRA (IY+d)": {
            bits: ["11111101", "11001011", "dddddddd", "00101110"],
            cycles: 6,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IY + d], v => state.memory[state.IY + d] = v)
        },

        "SRL r": {
            bits: ["11001011", "00111rrr"],
            cycles: 2,
            exec: (state, r) => SRL(state, state[r], v => state[r] = v)
        },
        "SRL (HL)": {
            bits: ["11001011", "00111110"],
            cycles: 4,
            exec: (state) => SRL(state, state.memory[state.HL], v => state.memory[state.HL] = v)
        },
        "SRL (IX+d)": {
            bits: ["11011101", "11001011", "dddddddd", "00111110"],
            cycles: 6,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IX + d], v => state.memory[state.IX + d] = v)
        },
        "SRL (IY+d)": {
            bits: ["11111101", "11001011", "dddddddd", "00111110"],
            cycles: 6,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IY + d], v => state.memory[state.IY + d] = v)
        },

        "RLD": {
            bits: ["11101101", "01101111"],
            cycles: 5,
            exec: RLD
        },
        "RRD": {
            bits: ["11101101", "01100111"],
            cycles: 5,
            exec: RRD
        },

        "BIT b, (HL)": {
            bits: ["11001011", "01bbb110"],
            cycles: 2,
            exec: (state, b) => BIT(state, b, state.memory[state.HL])
        },
        "BIT b, r": {
            bits: ["11001011", "01bbbRRR"],
            cycles: 2,
            exec: (state, b, r) => BIT(state, b, state[r])
        },
        "BIT b, (IX+d)": {
            bits: ["11011101", "11001011", "DDDDDDDD", "01bbb110"],
            cycles: 5,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IX + d], v => state.memory[state.IX + d] = v)
        },
        "BIT b, (IY+d)": {
            bits: ["11111101", "11001011", "DDDDDDDD", "01bbb110"],
            cycles: 5,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IY + d], v => state.memory[state.IY + d] = v)
        },

        "SET b, (HL)": {
            bits: ["11001011", "11bbb110"],
            cycles: 4,
            exec: (state, b) => SET(state, b, state.memory[state.HL], v => state.memory[state.HL] = v)
        },
        "SET b, r": {
            bits: ["11001011", "11bbbRRR"],
            cycles: 2,
            exec: (state, b, r) => SET(state, b, state[r], v => state[r] = v)
        },
        "SET b, (IX+d)": {
            bits: ["11011101", "11001011", "DDDDDDDD", "11bbb110"],
            cycles: 5,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IX + d], v => state.memory[state.IX + d] = v)
        },
        "SET b, (IY+d)": {
            bits: ["11111101", "11001011", "DDDDDDDD", "11bbb110"],
            cycles: 5,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IY + d], v => state.memory[state.IY + d] = v)
        },

        "RES b, (HL)": {
            bits: ["11001011", "10bbb110"],
            cycles: 4,
            exec: (state, b) => RES(state, b, state.memory[state.HL], v => state.memory[state.HL] = v)
        },
        "RES b, r": {
            bits: ["11001011", "10bbbRRR"],
            cycles: 2,
            exec: (state, b, r) => RES(state, b, state[r], v => state[r] = v)
        },
        "RES b, (IX+d)": {
            bits: ["11011101", "11001011", "DDDDDDDD", "10bbb110"],
            cycles: 5,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IX + d], v => state.memory[state.IX + d] = v)
        },
        "RES b, (IY+d)": {
            bits: ["11111101", "11001011", "DDDDDDDD", "10bbb110"],
            cycles: 5,
            exec: (state, d) => IXIYSpecial(state, state.memory[state.IY + d], v => state.memory[state.IY + d] = v)
        },

        // Why is this these notated like "(HL)" when we're not dereferencing HL? Weeerd.
        "JP (HL)": {
            bits: ["11101001"],
            cycles: 1,
            exec: (state) => JP(state, state.HL)
        },
        "JP (IX)": {
            bits: ["11011101", "11101001"],
            cycles: 2,
            exec: (state) => JP(state, state.IX)
        },
        "JP (IY)": {
            bits: ["11111101", "11101001"],
            cycles: 2,
            exec: (state) => JP(state, state.IY)
        },
        "JP nn": {
            bits: ["11000011", "llllllll", "hhhhhhhh"],
            cycles: 3,
            exec: (state, nn) => JP(state, nn)
        },
        "JP cc, nn": {
            bits: ["11ccc010", "LLLLLLLL", "HHHHHHHH"],
            cycles: 3,
            exec: (state, condition, nn) => JPCondition(state, condition, nn)
        },

        "JR C, n": {
            bits: ["00111000", "NNNNNNNN"],
            cycles: (state) => state.CFlag ? 3 : 2,
            exec: (state, n) => JRCondition(state, "C", n)
        },
        "JR NC, n": {
            bits: ["00110000", "NNNNNNNN"],
            cycles: (state) => !state.CFlag ? 3 : 7,
            exec: (state, n) => JRCondition(state, "NC", n)
        },
        "JR Z, n": {
            bits: ["00101000", "NNNNNNNN"],
            cycles: (state) => state.ZFlag ? 3 : 2,
            exec: (state, n) => JRCondition(state, "Z", n)
        },
        "JR NZ, n": {
            bits: ["00100000", "NNNNNNNN"],
            cycles: (state) => !state.ZFlag ? 3 : 2,
            exec: (state, n) => JRCondition(state, "NZ", n)
        },

        "JR n": {
            bits: ["00011000", "nnnnnnnn"],
            cycles: 3,
            exec: (state, n) => JR(state, n)
        },

        "DJNZ, n": {
            bits: ["00010000", "nnnnnnnn"],
            cycles: (state) => state.B === 1 ? 2 : 3,
            exec: (state, n) => DJNZ(state, n)
        },

        "CALL nn": {
            bits: ["11001101", "llllllll", "hhhhhhhh"],
            cycles: 5,
            exec: (state, n) => CALL(state, n)
        },
        "CALL cc, nn": {
            bits: ["11ccc100", "LLLLLLLL", "HHHHHHHH"],
            cycles: (state, cc) => CONDITION_HANDLERS[cc](state) ? 5 : 3,
            exec: (state, cc, nn) => CALLCondition(state, cc, nn)
        }
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

function ADD16(state, destReg, value) {
    const result = state[destReg] + value

    state.SFlag = result > 32767
    state.ZFlag = result === 0
    state.HFlag = result & 0b0000100000000000
    state.PVFlag = result > 65535
    state.NFlag = 0
    state.CFlag = result > 65535

    state[destReg] = result % 65536
}

function ADC16(state, destReg, value) {
    ADD16(state, destReg, value + (state.CFlag ? 1 : 0))
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

function INC16(state, reg) {
    const result = state[reg] + 1

    // TODO: The manual says the condition bits aren't affected, but that documentation LIES, so look it up
    // someplace else to make sure.
    state[reg] = result % 65536
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

function DEC16(state, reg) {
    const result = state[reg] - 1

    // TODO: Like INC16, I'm skeptical that this doesn't affect the condition bits. Verify.

    state[reg] = (result + 65536) % 65536
}

function RLC(state, value, set) {
    state.HFlag = 0
    state.NFlag = 0
    const signBit = (value & 0b10000000) >> 7

    set(((value << 1) & 0xFF) + signBit)
    state.CFlag = signBit
}

function RRC(state, value, set) {
    state.HFlag = 0
    state.NFlag = 0
    const loBit = value & 1

    set(((value >> 1) & 0xFF) | (loBit << 7))
    state.CFlag = loBit
}

function RL(state, value, set) {
    state.HFlag = 0
    state.NFlag = 0
    const prevC = state.CFlag ? 1 : 0
    const signBit = (value & 0b10000000) >> 7

    set(((value << 1) & 0xFF) + prevC)
    state.CFlag = signBit
}

function RR(state, value, set) {
    state.HFlag = 0
    state.NFlag = 0
    const prevC = state.CFlag ? 1 : 0
    const loBit = value & 1

    set(((value >> 1) & 0xFF) | (prevC << 7))
    state.CFlag = loBit
}

function SLA(state, value, set) {
    const hiBit = value & 0b10000000

    const result = (value << 1) & 0xFF

    state.SFlag = result > 127
    state.ZFlag = result === 0
    state.HFlag = 0
    state.PVFlag = getParityBit(result)
    state.NFlag = 0
    state.CFlag = hiBit

    set(result)
}

function SRA(state, value, set) {
    const loBit = value & 1
    const hiBit = value & 0b10000000

    const result = ((value & 0b01111111) >> 1) | hiBit

    state.SFlag = result > 127
    state.ZFlag = result === 0
    state.HFlag = 0
    state.PVFlag = getParityBit(result)
    state.NFlag = 0
    state.CFlag = loBit

    set(result)
}

function SRL(state, value, set) {
    const loBit = value & 1

    const result = value >> 1

    state.SFlag = 0
    state.ZFlag = result === 0
    state.HFlag = 0
    state.PVFlag = getParityBit(result)
    state.NFlag = 0
    state.CFlag = loBit

    set(result)
}

function RLD(state) {
    const value = state.memory[state.HL]
    
    const result = (value & 0b11000000)
        | ((value & 0b00110000) >> 4)
        | ((value & 0b00001100) << 2)
        | ((value & 0b00000011) << 2)
    
    state.memory[state.HL] = result

    state.SFlag = state.A > 127
    state.ZFlag = state.A === 0
    state.HFlag = 0
    state.PVFlag = getParityBit(state.A)
    state.NFlag = 0
    state.CFlag = 0
}

function RRD(state) {
    const value = state.memory[state.HL]
    
    const result = (value & 0b11000000)
        | ((value & 0b00110000) >> 2)
        | ((value & 0b00001100) >> 2)
        | ((value & 0b00000011) << 4)
    
    state.memory[state.HL] = result

    state.SFlag = state.A > 127
    state.ZFlag = state.A === 0
    state.HFlag = 0
    state.PVFlag = getParityBit(state.A)
    state.NFlag = 0
    state.CFlag = 0
}

function IXIYSpecial(state, value, set) {
    switch (state.memory[state.IP + 3]) {
        case 0b00000110: RLC(state, value, set); break;
        case 0b00010110: RL(state, value, set); break;
        case 0b00001110: RRC(state, value, set); break;
        case 0b00011110: RR(state, value, set); break;
        case 0b00100110: SLA(state, value, set); break;
        case 0b00101110: SRA(state, value, set); break;
        case 0b00111110: SRL(state, value, set); break;

        // BIT b, (I*+d)
        case 0b01000110: BIT(state, 0, value); break;
        case 0b01001110: BIT(state, 1, value); break;
        case 0b01010110: BIT(state, 2, value); break;
        case 0b01011110: BIT(state, 3, value); break;
        case 0b01100110: BIT(state, 4, value); break;
        case 0b01101110: BIT(state, 5, value); break;
        case 0b01110110: BIT(state, 6, value); break;
        case 0b01111110: BIT(state, 7, value); break;

        // SET b, (I*+d)
        case 0b11000110: SET(state, 0, value, set); break;
        case 0b11001110: SET(state, 1, value, set); break;
        case 0b11010110: SET(state, 2, value, set); break;
        case 0b11011110: SET(state, 3, value, set); break;
        case 0b11100110: SET(state, 4, value, set); break;
        case 0b11101110: SET(state, 5, value, set); break;
        case 0b11110110: SET(state, 6, value, set); break;
        case 0b11111110: SET(state, 7, value, set); break;

        // RES b, (I*+d)
        case 0b10000110: RES(state, 0, value, set); break;
        case 0b10001110: RES(state, 1, value, set); break;
        case 0b10010110: RES(state, 2, value, set); break;
        case 0b10011110: RES(state, 3, value, set); break;
        case 0b10100110: RES(state, 4, value, set); break;
        case 0b10101110: RES(state, 5, value, set); break;
        case 0b10110110: RES(state, 6, value, set); break;
        case 0b10111110: RES(state, 7, value, set); break;
    }
}

function BIT(state, b, value) {
    state.ZFlag = value & (1 << b)
    state.HFlag = 1
    state.NFlag = 0
}

function SET(state, b, value, set) {
    set(value | (1 << b))
}

function RES(state, b, value, set) {
    set(value & ~(1 << b))
}

const CONDITION_HANDLERS = {
    NZ: (state) => !state.ZFlag,
    Z:  (state) => state.ZFlag,
    NC: (state) => !state.CFlag,
    C:  (state) => state.CFlag,
    PO: (state) => !state.PVFlag,
    PE: (state) => state.PVFlag,
    P:  (state) => !state.SFlag,
    M:  (state) => state.SFlag,
}

function JP(state, newIp) {
    state.IP = newIp
    state.ipWasModified = true
}
function JPCondition(state, condition, newIp) {
    if (CONDITION_HANDLERS[condition](state)) {
        JP(state, newIp)
    }
}

function JR(state, offset) {
    state.IP += offset
    state.ipWasModified = true
}

function JRCondition(state, condition, offset) {
    if (CONDITION_HANDLERS[condition](state)) {
        JR(state, offset)
    }
}

function DJNZ(state, offset) {
    if (--state.B !== 0) {
        state.IP += offset
        state.ipWasModified = true
    }
}

function CALL(state, newIp) {
    state.memory[--state.SP] = state.IP >> 8
    state.memory[--state.SP] = state.IP & 0x00FF
    state.IP = newIp
    state.ipWasModified = true
}

function CALLCondition(state, condition, newIp) {
    if (CONDITION_HANDLERS[condition](state)) {
        CALL(state, newIp)
    }
}