const REGISTER_TO_THREEBIT = {
    A: 0b111,
    B: 0b000,
    C: 0b001,
    D: 0b010,
    E: 0b011,
    H: 0b100,
    L: 0b101,
}

const THREEBIT_TO_REGISTER = {
    0b111: "A",
    0b000: "B",
    0b001: "C",
    0b010: "D",
    0b011: "E",
    0b100: "H",
    0b101: "L",
}

const WORD_REGISTER_TO_TWOBIT = {
    BC: 0b00,
    DE: 0b01,
    HL: 0b10,
    SP: 0b11
}

const TWOBIT_TO_WORD_REGISTER = {
    0b00: "BC",
    0b01: "DE",
    0b10: "HL",
    0b11: "SP"
}

function get3BitRegisterCode(register, atBit) {
    return REGISTER_TO_THREEBIT[register] << (5 - atBit)
}

function getRegisterFromOpcode(opcode, atBit) {
    const code = (opcode >> (5 - atBit)) & 0b00000111
    return THREEBIT_TO_REGISTER[code]
}

function get2BitRegisterCode(register, atBit) {
    return WORD_REGISTER_TO_TWOBIT[register] << (6 - atBit)
}

function bit16ToBytes(number) {
    return [ number & 0x00FF, number >> 8 & 0xFF ]
}

function bytesToBit16(low, high) {
    return (high << 8 | low & 0x00FF) & 0x0000FFFF
}

module.exports = {
    bit16ToBytes,
    bytesToBit16,
    get3BitRegisterCode,
    get2BitRegisterCode,
    getRegisterFromOpcode,
    REGISTER_TO_THREEBIT
}