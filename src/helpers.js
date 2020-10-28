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

function get3BitRegisterCode(register, atBit) {
    return REGISTER_TO_THREEBIT[register] << (5 - atBit)
}

function getRegisterFromOpcode(opcode, atBit) {
    const code = (opcode >> (5 - atBit)) & 0b00000111
    return THREEBIT_TO_REGISTER[code]
}

module.exports = {
    get3BitRegisterCode,
    getRegisterFromOpcode,
    REGISTER_TO_THREEBIT
}