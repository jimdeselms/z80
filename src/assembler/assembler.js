const { get3BitRegisterCode, bit16ToBytes, get2BitRegisterCode } = require('../helpers')
const { RegisterArgument, RegisterIndirectArgument, ImmediateArgument, ImmediateIndirectArgument } = require("./argument")

const REGISTERS = ["A", "B", "C", "D", "E", "H", "L", "I", "R"]
const WORD_REGISTERS = ["BC", "DE", "HL", "SP"]
const INDEX_REGISTERS = ["IX", "IY"]

const ALL_REGISTERS = [...REGISTERS, ...WORD_REGISTERS, ...INDEX_REGISTERS]

class Assembler {
    static assemble(code) {
        const result = [];

        const lines = code
            .replace('\r', '')
            .replace(';', '\n')
            .split('\n')
            .map(l => l.trim())
            .filter(line => line.length > 0 && line[0] !== '#')

        for (const line of lines) {
            result.push(...assembleLine(line))
        }

        return result;
    }
}

function assembleLine(line) {
    const parts = line
        .replace('\t', ' ')
        .replace(',', '')
        .split(' ')
        .map(l => l.trim())
        .filter(l => l.length > 0)

    const args = parts.slice(1).map(parseArg)

    return AssemblerOpcodes[parts[0].toLowerCase()](...args)    
}

function parseArg(arg) {
    const asInt = parseInt(arg)
    if (!isNaN(asInt)) {
        return new ImmediateArgument(asInt)
    } else if (ALL_REGISTERS.includes(arg.toUpperCase())) {
        return new RegisterArgument(arg.toUpperCase())
    } else if (arg.startsWith("(") && arg.endsWith(")")) {
        const inside = arg.slice(1, -1).toUpperCase()
        if (!isNaN(parseInt(inside))) {
            return new ImmediateIndirectArgument(parseInt(inside))
        } else if (inside.indexOf('+') > -1) {
            const [register, offset] = inside.split('+').map(part => part.trim())
            // TODO: Fail if the offset isn't a number, or is out of range.
            return new RegisterIndirectArgument(register, parseInt(offset))
        } else if (inside.indexOf('-') > -1) {
            const [register, offset] = inside.split('+').map(part => part.trim())
            return new RegisterIndirectArgument(register, -offset)
        } else {
            return new RegisterIndirectArgument(inside)
        }
    } else {
        throw new Error(`can't parse arg ${arg}`)
    }
}

class AssemblerOpcodes {
    static ld(to, from) {
        switch (to.kind) {
            case "register": {
                switch (from.kind) {
                    case "immediate": {
                        if (WORD_REGISTERS.includes(to.register)) {
                            const opcode = 0b00000001 | get2BitRegisterCode(to.register, 2)
                            const [low, high] = bit16ToBytes(from.integer)

                            return [opcode, low, high]
                        } else if (INDEX_REGISTERS.includes(to.register)) {
                            const opcode = to.register === "IX" ? 0b11011101 : 0b11111101
                            const [low, high] = bit16ToBytes(from.integer)

                            return [opcode, 0b00100001, low, high]
                        } else {
                            const byte1 = 0b00000110 | get3BitRegisterCode(to.register, 2)
                            const value = from.integer
            
                            return [byte1, value]
                        }
                    }
                    case "register": {
                        if (from.register === "I" && to.register === "A") {
                            return [0b11101101, 0b01010111]
                        } else if (from.register === "R" && to.register === "A") {
                            return [0b11101101, 0b01011111]
                        } else if (from.register === "A" && to.register ==="I") {
                            return [0b11101101, 0b01000111]
                        } else if (from.register === "A" && to.register ==="R") {
                            return [0b11101101, 0b01001111]
                        } else {
                            const byte = 0b01000000 | get3BitRegisterCode(to.register, 2) | get3BitRegisterCode(from.register, 5)
                            return [byte]
                        }
                    }
                    case "registerIndirect": {
                        switch (from.register) {
                            case "HL": {
                                const opcode = 0b01000110 | get3BitRegisterCode(to.register, 2)
                                return [opcode]
                            }
                            case "BC": {
                                if (to.register !== "A") throw new Error("Expected register A, not " + to.register)
                                return [0b00001010];
                            }
                            case "DE": {
                                if (to.register !== "A") throw new Error("Expected register A, not " + to.register)
                                return [0b00011010];
                            }
                        }
                    }
                    case "registerIndirectWithOffset": {
                        switch (from.register) {
                            case "IX": {
                                const opcode = 0b11011101
                                const register = 0b01000110 | get3BitRegisterCode(to.register, 2)
                                return [opcode, register, from.offset]
                            }
                            case "IY": {
                                const opcode = 0b11111101
                                const register = 0b01000110 | get3BitRegisterCode(to.register, 2)
                                return [opcode, register, from.offset]
                            }
                        }
                    }
                    case "immediateIndirect": {
                        const [low, high] = bit16ToBytes(from.integer)

                        switch (to.register) {
                            case "HL": return [0b00101010, low, high]
                            case "BC": return [0b11101101, 0b01001011, low, high]
                            case "DE": return [0b11101101, 0b01011011, low, high]
                            case "HL": return [0b11101101, 0b01101011, low, high]
                            case "SP": return [0b11101101, 0b01111011, low, high]
                            case "IX": return [0b11011101, 0b00101010, low, high]
                            case "IY": return [0b11111101, 0b00101010, low, high]
                        }
                    }
                }
            }
            case "registerIndirect": {
                switch (from.kind) {
                    case "register": {
                        const byte = 0b01110000 | get3BitRegisterCode(from.register, 5)
                        return [byte]
                    }
                    case "immediate": {
                        const opcode = 0b00110110
                        const value = from.integer

                        return [opcode, value]
                    }
                }
            }
            case "registerIndirectWithOffset": {
                switch (from.kind) {
                    case "register": {
                        const opcode = to.register === "IX" ? 0b11011101
                            : to.register === "IY" ? 0b11111101
                            : undefined;
                        
                        const register = 0b01110000 | get3BitRegisterCode(from.register, 5)

                        return [opcode, register, to.offset]
                    }
                    case "immediate": {
                        const opcode = to.register === "IX" ? 0b11011101
                            : to.register === "IY" ? 0b11111101
                            : undefined;

                        return [opcode, 0b00110110, to.offset, from.integer]
                    }
                }
            }
            case "immediateIndirect": {
                switch (from.kind) {
                    case "register": {
                        switch (from.register) {
                            case "A": return [0b00110010, ...bit16ToBytes(to.integer)]
                            case "HL": return [0b00100010, ...bit16ToBytes(to.integer)]
                        }
                    }
                }
            }

        }

        throw new Error("Unkonwn case for ld");
    }

    static halt() {
        return [ 0b01110110 ];
    }

    static nop() {
        return [ 0b00000000 ];
    }
}

module.exports = Assembler;