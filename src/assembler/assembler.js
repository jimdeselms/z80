const { get3BitRegisterCode, bit16ToBytes, get2BitRegisterCode } = require('../helpers')
const { RegisterArgument, RegisterIndirectArgument, ImmediateArgument, ImmediateIndirectArgument } = require("./argument")

const REGISTERS = ["A", "B", "C", "D", "E", "H", "L", "I", "R"]
const WORD_REGISTERS = ["BC", "DE", "HL", "SP", "AF", "AF'", "BC'", "DE'", "HL'"]
const INDEX_REGISTERS = ["IX", "IY"]

const ALL_REGISTERS = [...REGISTERS, ...WORD_REGISTERS, ...INDEX_REGISTERS]

class Assembler {
    constructor(assemblerConfig) {
        this.assemblerConfig = assemblerConfig
    }

    assemble(code) {
        const result = [];

        const lines = code
            .replace('\r', '')
            .replace(';', '\n')
            .split('\n')
            .map(l => l.trim())
            .filter(line => line.length > 0 && line[0] !== '#')

        for (const line of lines) {
            result.push(...assembleLine(line, this.assemblerConfig))
        }

        return result;
    }
}

const THREE_BIT_REGISTER_CODES = {
    'A': 0b111,
    'B': 0b000,
    'C': 0b001,
    'D': 0b010,
    'E': 0b011,
    'H': 0b100,
    'L': 0b101,
}

function assembleLine(line, assemblerConfig) {
    const parts = line
        .replace('\t', ' ')
        .replace(',', '')
        .split(' ')
        .map(l => l.trim())
        .filter(l => l.length > 0)

    const opcode = parts[0].toUpperCase()
    const args = parts.slice(1).map(parseArg)

    const matchingRule = findMatch(opcode, args, assemblerConfig)
    if (!matchingRule) {
        throw new Error("Failed to find matching assembly rule")
    }

    const result = []

    for (const code of matchingRule) {
        const num = getCodeAsNumber(code, args)
        result.push(num)
    }
    return result
}

function findMatch(opcode, args, assemblerConfig) {
    let currNode = assemblerConfig[opcode]
    if (!currNode) {
        throw new Error(`Opcode ${opcode} not found`)
    }

    const matchingNode = currNode.find(rule => argsMatchRule(args, rule))
    if (matchingNode) {
        return matchingNode.bits
    }

    throw new Error("No matching rule found for " + opcode)
}

function argsMatchRule(args, rule) {
    if (args.length !== rule.args.length) return false

    for (let i = 0; i < args.length; i++) {
        if (!args[i].matchesArg(rule.args[i])) {
            return false
        }
    }
    return true
}

function getCodeAsNumber(code, args) {
    let result = parseInt(code
        .replace(/n/g, "0")
        .replace(/N/g, "0")
        .replace(/r/g, "0")
        .replace(/R/g, "0"), 2)

    if (code === "dddddddd" || code === "nnnnnnnn") {
        const arg0 = args[0]
        if (arg0 && (arg0.kind === "immediate" || arg0.kind == "immediateIndirect")) {
            return arg.integer
        }
    }

    if (code === "DDDDDDDD" || code === "NNNNNNNN") {
        const arg1 = args[1]
        if (arg1 && (arg1.kind === "immediate" || arg1.kind == "immediateIndirect")) {
            return arg1.integer
        }
    }

    if (stringMatchesPattern(code, "  rrr   ")) {
        const arg0 = args[0]
        if (arg0 && arg0.kind === "register") {
            code = code.replace("rrr", "000")
            result |= (THREE_BIT_REGISTER_CODES[arg0.register] << 3)
        }
    }

    if (stringMatchesPattern(code, "     rrr")) {
        const arg0 = args[0]
        if (arg0 && arg0.kind === "register") {
            code = code.replace("rrr", "000")
            result |= (THREE_BIT_REGISTER_CODES[arg0.register])
        }
    }

    if (stringMatchesPattern(code, "  RRR   ")) {
        const arg1 = args[1]
        if (arg1 && arg1.kind === "register") {
            code = code.replace("RRR", "000")
            result |= (THREE_BIT_REGISTER_CODES[arg1.register] << 3)
        }
    }

    if (stringMatchesPattern(code, "     RRR")) {
        const arg1 = args[0]
        if (arg1 && arg1.kind === "register") {
            code = code.replace("RRR", "000")
            result |= (THREE_BIT_REGISTER_CODES[arg1.register])
        }
    }

    return result
}

function stringMatchesPattern(string, pattern) {
    for (let i = 0; i < string.length; i++) {
        if (pattern[i] !== string[i] && !(pattern[i] == ' ' && (string[i] === '1' || string[i] === '0'))) {
            return false            
        }
    }
    return true
}

function parseIntArg(arg) {
    if (arg.endsWith("H")) {
        arg = "0x" + arg.replace("H", "")
    }
    return parseInt(arg)
}

function parseArg(arg) {
    const asInt = parseIntArg(arg)
    if (!isNaN(asInt)) {
        return new ImmediateArgument(asInt)
    } else if (ALL_REGISTERS.includes(arg.toUpperCase())) {
        return new RegisterArgument(arg.toUpperCase())
    } else if (arg.startsWith("(") && arg.endsWith(")")) {
        const inside = arg.slice(1, -1).toUpperCase()
        if (!isNaN(parseIntArg(inside))) {
            return new ImmediateIndirectArgument(parseIntArg(inside))
        } else if (inside.indexOf('+') > -1) {
            const [register, offset] = inside.split('+').map(part => part.trim())
            // TODO: Fail if the offset isn't a number, or is out of range.
            return new RegisterIndirectArgument(register, parseIntArg(offset))
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
                        } else if (from.register === "HL" && to.register === "SP") {
                            return [0b11111001]
                        } else if (from.register === "IX" && to.register === "SP") {
                            return [0b11011101, 0b11111001]
                        } else if (from.register === "IY" && to.register === "SP") {
                            return [0b11111101, 0b11111001]
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
                            case "BC": return [0b11101101, 0b01000011, ...bit16ToBytes(to.integer)]
                            case "DE": return [0b11101101, 0b01010011, ...bit16ToBytes(to.integer)]
                            case "HL": return [0b11101101, 0b01100011, ...bit16ToBytes(to.integer)]
                            case "SP": return [0b11101101, 0b01110011, ...bit16ToBytes(to.integer)]
                            case "IX": return [0b11011101, 0b00100010, ...bit16ToBytes(to.integer)]
                            case "IY": return [0b11111101, 0b00100010, ...bit16ToBytes(to.integer)]
                        }
                    }
                }
            }
        }
        throw new Error("Unkonwn case for ld");
    }

    static push(from) {
        switch(from.kind) {
            case "register": {
                switch (from.register) {
                    case "BC": return [0b11000101]
                    case "DE": return [0b11010101]
                    case "HL": return [0b11100101]
                    case "AF": return [0b11110101]
                    case "IX": return [0b11011101, 0b11100101]
                    case "IY": return [0b11111101, 0b11100101]
                }
            }
        }
    }

    static pop(to) {
        switch (to.kind) {
            case "register": {
                switch (to.register) {
                    case "BC": return [0b11000001]
                    case "DE": return [0b11010001]
                    case "HL": return [0b11100001]
                    case "AF": return [0b11110001]
                    case "IX": return [0b11011101, 0b11100001]
                    case "IY": return [0b11111101, 0b11100001]
                }
            }
        }
    }

    static ex(to, from) {
        if (to.kind === "register" && from.kind === "register") {
            if (to.register === "DE" && from.register === "HL") {
                return [0b11101011]
            } else if (to.register === "AF" && from.register === "AF'") {
                return [0b00001000]
            }
        } else if (to.kind === "registerIndirect" && from.kind === "register") {
            if (to.register === "SP" && from.register === "HL") {
                return [0b11100011]
            } else if (to.register === "SP" && from.register === "IX") {
                return [0b11011101, 0b11100011]
            } else if (to.register === "SP" && from.register === "IY") {
                return [0b11111101, 0b11100011]
            }


        }
    }

    static exx() {
        return [0b11011001]
    }

    static halt() {
        return [ 0b01110110 ];
    }

    static nop() {
        return [ 0b00000000 ];
    }

    static ldi() {
        return [ 0b11101101, 0b10100000 ]
    }

    static ldir() {
        return [ 0b11101101, 0b10110000 ]
    }

    static ldd() {
        return [ 0b11101101, 0b10101000 ]
    }

    static lddr() {
        return [ 0b11101101, 0b10111000 ]
    }

    static cpi() {
        return [ 0b11101101, 0b10100001 ]
    }

    static cpir() {
        return [ 0b11101101, 0b10110001 ]
    }

    static cpd() {
        return [ 0b11101101, 0b10101001 ]
    }

    static cpdr() {
        return [ 0b11101101, 0b10111001 ]
    }

    static add(to, from) {
        if (to.kind === "register" && to.register === "A") {
            switch (from.kind) {
                case "register": {
                    switch (from.register) {
                        case "A": return [0b10000111]
                        case "B": return [0b10000000]
                        case "C": return [0b10000001]
                        case "D": return [0b10000010]
                        case "E": return [0b10000011]
                        case "H": return [0b10000100]
                        case "L": return [0b10000101]
                    }
                }
                case "immediate": {
                    return [0b11000110, from.integer]
                }
                case "registerIndirect": {
                    switch (from.register) {
                        case "HL": return [0b10000110]
                    }
                }
                case "registerIndirectWithOffset": {
                    switch (from.register) {
                        case "IX": return [0b11011101, 0b10000110, from.offset]
                        case "IY": return [0b11111101, 0b10000110, from.offset]
                    }
                }
            }
        }
    }

    static adc(to, from) {
        if (to.kind === "register" && to.register === "A") {
            switch (from.kind) {
                case "register": {
                    switch (from.register) {
                        case "A": return [0b10001111]
                        case "B": return [0b10001000]
                        case "C": return [0b10001001]
                        case "D": return [0b10001010]
                        case "E": return [0b10001011]
                        case "H": return [0b10001100]
                        case "L": return [0b10001101]
                    }
                }
                case "immediate": {
                    return [0b11001110, from.integer]
                }
                case "registerIndirect": {
                    switch (from.register) {
                        case "HL": return [0b10001110]
                    }
                }
                case "registerIndirectWithOffset": {
                    switch (from.register) {
                        case "IX": return [0b11011101, 0b10001110, from.offset]
                        case "IY": return [0b11111101, 0b10001110, from.offset]
                    }
                }
            }
        }
    }

    static sub(to, from) {
        if (to.kind === "register" && to.register === "A") {
            switch (from.kind) {
                case "register": {
                    switch (from.register) {
                        case "A": return [0b10010111]
                        case "B": return [0b10010000]
                        case "C": return [0b10010001]
                        case "D": return [0b10010010]
                        case "E": return [0b10010011]
                        case "H": return [0b10010100]
                        case "L": return [0b10010101]
                    }
                }
                case "immediate": {
                    return [0b11010110, from.integer]
                }
                case "registerIndirect": {
                    switch (from.register) {
                        case "HL": return [0b10010110]
                    }
                }
                case "registerIndirectWithOffset": {
                    switch (from.register) {
                        case "IX": return [0b11011101, 0b10010110, from.offset]
                        case "IY": return [0b11111101, 0b10010110, from.offset]
                    }
                }
            }
        }
    }

    static sbc(to, from) {
        if (to.kind === "register" && to.register === "A") {
            switch (from.kind) {
                case "register": {
                    switch (from.register) {
                        case "A": return [0b10011111]
                        case "B": return [0b10011000]
                        case "C": return [0b10011001]
                        case "D": return [0b10011010]
                        case "E": return [0b10011011]
                        case "H": return [0b10011100]
                        case "L": return [0b10011101]
                    }
                }
                case "immediate": {
                    return [0b11011110, from.integer]
                }
                case "registerIndirect": {
                    switch (from.register) {
                        case "HL": return [0b10011110]
                    }
                }
                case "registerIndirectWithOffset": {
                    switch (from.register) {
                        case "IX": return [0b11011101, 0b10011110, from.offset]
                        case "IY": return [0b11111101, 0b10011110, from.offset]
                    }
                }
            }
        }
    }

    static and(to, from) {
        if (to.kind === "register" && to.register === "A") {
            switch (from.kind) {
                case "register": {
                    switch (from.register) {
                        case "A": return [0b10100111]
                        case "B": return [0b10100000]
                        case "C": return [0b10100001]
                        case "D": return [0b10100010]
                        case "E": return [0b10100011]
                        case "H": return [0b10100100]
                        case "L": return [0b10100101]
                    }
                }
                case "immediate": {
                    return [0b11100110, from.integer]
                }
                case "registerIndirect": {
                    switch (from.register) {
                        case "HL": return [0b10100110]
                    }
                }
                case "registerIndirectWithOffset": {
                    switch (from.register) {
                        case "IX": return [0b11011101, 0b10100110, from.offset]
                        case "IY": return [0b11111101, 0b10100110, from.offset]
                    }
                }
            }
        }
    }
    static or(to, from) {
        if (to.kind === "register" && to.register === "A") {
            switch (from.kind) {
                case "register": {
                    switch (from.register) {
                        case "A": return [0b10110111]
                        case "B": return [0b10110000]
                        case "C": return [0b10110001]
                        case "D": return [0b10110010]
                        case "E": return [0b10110011]
                        case "H": return [0b10110100]
                        case "L": return [0b10110101]
                    }
                }
                case "immediate": {
                    return [0b11110110, from.integer]
                }
                case "registerIndirect": {
                    switch (from.register) {
                        case "HL": return [0b10110110]
                    }
                }
                case "registerIndirectWithOffset": {
                    switch (from.register) {
                        case "IX": return [0b11011101, 0b10110110, from.offset]
                        case "IY": return [0b11111101, 0b10110110, from.offset]
                    }
                }
            }
        }
    }
    static xor(to, from) {
        if (to.kind === "register" && to.register === "A") {
            switch (from.kind) {
                case "register": {
                    switch (from.register) {
                        case "A": return [0b10101111]
                        case "B": return [0b10101000]
                        case "C": return [0b10101001]
                        case "D": return [0b10101010]
                        case "E": return [0b10101011]
                        case "H": return [0b10101100]
                        case "L": return [0b10101101]
                    }
                }
                case "immediate": {
                    return [0b11101110, from.integer]
                }
                case "registerIndirect": {
                    switch (from.register) {
                        case "HL": return [0b10101110]
                    }
                }
                case "registerIndirectWithOffset": {
                    switch (from.register) {
                        case "IX": return [0b11011101, 0b10101110, from.offset]
                        case "IY": return [0b11111101, 0b10101110, from.offset]
                    }
                }
            }
        }
    }
    static cp(from) {
        switch (from.kind) {
            case "register": {
                switch (from.register) {
                    case "A": return [0b10111111]
                    case "B": return [0b10111000]
                    case "C": return [0b10111001]
                    case "D": return [0b10111010]
                    case "E": return [0b10111011]
                    case "H": return [0b10111100]
                    case "L": return [0b10111101]
                }
            }
            case "immediate": {
                return [0b11111110, from.integer]
            }
            case "registerIndirect": {
                switch (from.register) {
                    case "HL": return [0b10111110]
                }
            }
            case "registerIndirectWithOffset": {
                switch (from.register) {
                    case "IX": return [0b11011101, 0b10111110, from.offset]
                    case "IY": return [0b11111101, 0b10111110, from.offset]
                }
            }
        }
    }

    static inc(dest) {
        switch (dest.kind) {
            case "register": {
                switch (dest.register) {
                    case "A": return [ 0b00111100 ]
                    case "B": return [ 0b00000100 ]
                    case "C": return [ 0b00001100 ]
                    case "D": return [ 0b00010100 ]
                    case "E": return [ 0b00011100 ]
                    case "L": return [ 0b00101100 ]
                    case "H": return [ 0b00100100 ]
                }
            }
            case "registerIndirect": {
                switch (dest.register) {
                    case "HL": return [ 0b00110100 ]
                }
            }
            case "registerIndirectWithOffset": {
                switch (dest.register) {
                    case "IX": return [0b11011101, 0b00110100, dest.offset]
                    case "IY": return [0b11111101, 0b00110100, dest.offset]
                }
            }
        }
    }

    static dec(dest) {
        switch (dest.kind) {
            case "register": {
                switch (dest.register) {
                    case "A": return [ 0b00111101 ]
                    case "B": return [ 0b00000101 ]
                    case "C": return [ 0b00001101 ]
                    case "D": return [ 0b00010101 ]
                    case "E": return [ 0b00011101 ]
                    case "L": return [ 0b00101101 ]
                    case "H": return [ 0b00100101 ]
                }
            }
            case "registerIndirect": {
                switch (dest.register) {
                    case "HL": return [ 0b00110101 ]
                }
            }
            case "registerIndirectWithOffset": {
                switch (dest.register) {
                    case "IX": return [0b11011101, 0b00110101, dest.offset]
                    case "IY": return [0b11111101, 0b00110101, dest.offset]
                }
            }
        }
    }
}

module.exports = Assembler;