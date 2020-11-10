const Assembler = require("./assembler")

function buildAssembler(config) {
    const assemblerConfig = {}
    
    for (const [pattern, rule] of Object.entries(config.instructions)) {
        const instruction = parsePattern(pattern)
        addInstruction(instruction, assemblerConfig, rule.bits)    
    }

    return new Assembler(assemblerConfig)
}

function addInstruction(instruction, assemblerConfig, bits) {
    let node = assemblerConfig[instruction.opcode]
    if (!node) {
        node = []
        assemblerConfig[instruction.opcode] = node
    }

    node.push({
        args: instruction.args,
        bits
    })
}

function parsePattern(pattern) {
    const parts = pattern
        .replace('\t', ' ')
        .replace(',', '')
        .split(' ')
        .map(l => l.trim())
        .filter(l => l.length > 0)

    const args = parts.slice(1)

    return {
        opcode: parts[0].toUpperCase(),
        args
    }
}

/*
{
    LD: [
        { arg: "d", next: [

        ]}
    ]
}
*/

module.exports = {
    buildAssembler
}