const { get3BitRegisterCode, bit16ToBytes, get2BitRegisterCode } = require('../helpers')
const { RegisterArgument, RegisterIndirectArgument, ImmediateArgument, ImmediateIndirectArgument } = require("./argument")

const REGISTERS = ["A", "B", "C", "D", "E", "H", "L", "I", "R"]
const WORD_REGISTERS = ["BC", "DE", "HL", "SP", "AF", "AF'", "BC'", "DE'", "HL'"]
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
}

module.exports = Assembler;