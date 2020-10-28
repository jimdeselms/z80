const { RegisterArgument, IntegerArgument } = require("./argument")

const registers = ["A", "B", "C", "D", "E", "H", "L"]

class Assembler {

    static assembleLine(line) {
        const parts = line
            .replace('\t', ' ')
            .split(' ')
            .map(l => l.trim())
            .filter(l => l.length > 0)

        const args = parts.slice(1).map(parseArg)

        return AssemblerOpcodes[parts[0]](...args)    
    }
}

function parseArg(arg) {
    const asInt = parseInt(arg)
    if (!isNaN(asInt)) {
        return new IntegerArgument(asInt)
    } else if (registers.includes(arg.toUpperCase())) {
        return new RegisterArgument(arg.toUpperCase())
    } else {
        throw new Error(`can't parse arg ${arg}`)
    }
}


class AssemblerOpcodes {
    static ld(from, to) {
        return `LD ${from.register} ${to.integer}`
    }
}

module.exports = Assembler;