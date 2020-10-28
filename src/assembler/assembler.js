const { get3BitRegisterCode } = require('../helpers')
const { RegisterArgument, RegisterIndirectArgument, ImmediateArgument } = require("./argument")

const REGISTERS = ["A", "B", "C", "D", "E", "H", "L"]

class Assembler {
    static assemble(code) {
        const result = [];

        const lines = code
            .replace('\r', '')
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
    } else if (REGISTERS.includes(arg.toUpperCase())) {
        return new RegisterArgument(arg.toUpperCase())
    } else if (arg.startsWith("(") && arg.endsWith(")")) {
        const inside = arg.slice(1, -1).toUpperCase()
        if (inside.indexOf('+') > -1) {
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
                        const byte1 = 0b00000110 | get3BitRegisterCode(to.register, 2)
                        const value = from.integer
        
                        return [byte1, value]
                    }
                    case "register": {
                        const byte = 0b01000000 | get3BitRegisterCode(to.register, 2) | get3BitRegisterCode(from.register, 5)
                        return [byte]
                    }
                    case "registerIndirect": {
                        switch (from.register) {
                            case "HL": {
                                const opcode = 0b01000110 | get3BitRegisterCode(to.register, 2)
                                return [opcode]
                            }
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