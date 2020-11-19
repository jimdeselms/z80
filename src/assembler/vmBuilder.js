const Assembler = require("./assembler")

function buildVm(config) {
    const vmConfig = {}
    
    for (const [pattern, rule] of Object.entries(config.instructions)) {
        const instruction = parsePattern(pattern)
        addInstruction(rule, vmConfig)    
    }

    return new Assembler(assemblerConfig)
}

function addInstruction(rule, vmConfig) {
    // Get the paths of binary codes that leads us to a handler:
    // e.g.: [ [0b01001100, 0b00001000 ], ]
    for (const [path, handler] of getPathsAndHandlers(rule)) {
        let currNode = vmConfig

        for (const i = 0; i < path.length; i++) {
            const key = path[i]
            let node = currNode[key]
            if (!node) {
                node = {}
                currNode[key] = node
            }
            currNode = node
        }
    
        currNode.handler = handler
    }
}

function addAllPathsAndHandlers(rule, vmConfig) {

    addPathsAndHandlers(rule, 0, vmConfig)
}

function addPathsAndHandlers(rule, i, currNode) {
    for (const [code, args] of getAllPossibleCodesForPattern(rule.bits[i])) {
        const childNode = currNode[code]
        if (args.length > 0) {
            childNode.args = args
        }

        const remainingPatterns = rule.bits.slice(i + 1)
        if (remainingPatterns.find(p => isNaN(parseInt(p, 2)))) {
            addPathsAndHandlers(rule, i+1, childNode)
        } else {
            childNode.handler = {
                exec: rule.exec,
                cycles: rule.cycles,
                getArgs: buildGetArgsFunc(remainingPatterns, i)
            }
        }
    }
}

function buildGetArgsFunc(remainingPatterns, ipOffset) {
    if (remainingPatterns.length === 0) {
        return undefined
    }

    function buildFunclet(p, i) {
        switch (p) {
            case "LLLLLLLL": 
            case "llllllll": 
                return (state, list) => list.push(state.memory[state.IP + ipOffset + i] | (state.memory[state.IP + ipOffset + i + 1] << 8))
            case "DDDDDDDD": 
            case "dddddddd": 
                return (state, list) => list.push(state.memory[state.IP + ipOffset + i])
            default:
                return () => {}
        }
    }

    const funclets = remainingPatterns.map((p, i) => buildFunclet(p, i))

    return (state) => {
        const list = []

        for (const funclet of funclets) {
            funclet(state, list)
        }

        return list
    }
}

function getAllPossibleCodesForPattern(pattern) {
    const asNumber = parseInt(pattern, 2)
    if (!iaNaN(asNumber)) {
        return [asNumber, []]
    }

    return possibleCodesForPattern("  rrr   ", input, ["B", "C", "D", "E", "H", "L", undefined, "A"])
        || possibleCodesForPattern("  dd    ", input, ["BC", "DE", "HL", "SP"])
        || possibleCodesForPattern("  qq    ", input, ["BC", "DE", "HL", "AF"])
}

function getPossibleCodesForPattern(pattern, startIdx, bits, permutations) {
    for (let i = 0; i < pattern.length; i++) {
        const permutation = permutations[i]
        if (permutation === undefined) continue

        const numStr = pattern.substr(0, startIdx)
            + i.toString(2).padStart(bits, '0')
            + input.substr(startIdx + bits)

        const asByte = parseInt(numStr, 2)

        return [asByte, [permutation]]
    }
}

function stringMatchesPattern(input, pattern, startIdx) {

    if (input.substr(startIdx, pattern.length) !== pattern) {
        return false
    }

    // If we've matched the pattern, then all that's left has to be ones or zeroes.
    const withoutPattern = input.substr(0, startIdx) + input.substr(startIdx + pattern.length)
    return withoutPattern.match(/^[01]*$/)
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

module.exports = {
    buildAssembler
}