const { RegisterArgument, IntegerArgument } = require("./argument")

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
        return new IntegerArgument(asInt)
    } else if (REGISTERS.includes(arg.toUpperCase())) {
        return new RegisterArgument(arg.toUpperCase())
    } else {
        throw new Error(`can't parse arg ${arg}`)
    }
}

const REGISTER_TO_3BIT = {
    A: 0b111,
    B: 0b000,
    C: 0b001,
    D: 0b010,
    E: 0b011,
    H: 0b100,
    L: 0b101,
}

class AssemblerOpcodes {
    static ld(to, from) {
        if (to.isRegister()) {
            if (from.isInteger()) {
                const byte1 = 0b00000110 | (REGISTER_TO_3BIT[to.register] << 3)
                const value = from.integer

                return [byte1, value];
            }
        }

        throw new Error("Unkonwn case for ld");
    }

    static halt() {
        return [ 0b01110110 ];
    }
}

module.exports = Assembler;