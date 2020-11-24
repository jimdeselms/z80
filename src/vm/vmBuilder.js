const Vm = require("./vm")

function buildVm(config, options) {
    const vmConfig = {}
    
    for (const [ruleName, rule] of Object.entries(config.instructions)) {
        addInstruction(rule, vmConfig)    
    }

    return new Vm({ ...options, vmConfig })
}

function addInstruction(rule, vmConfig) {
    addPathsAndHandlers(rule, 0, vmConfig)
}

const BYTE_VALUE_PATTERNS = new Set(["llllllll", "LLLLLLLL", "dddddddd", "DDDDDDDD", "hhhhhhhhH", "HHHHHHHH", "nnnnnnnn", "NNNNNNNN"])

function addPathsAndHandlers(rule, i, currNode) {
    const allCodes = getAllPossibleCodesForPattern(rule.bits[i])
    for (const [code, args] of allCodes) {
        const childNode = currNode[code] || (currNode[code] = {})
        if (args.length > 0) {
            childNode.args = args
        }

        const remainingPatterns = rule.bits.slice(i + 1)
        if (remainingPatterns[0] !== undefined && !BYTE_VALUE_PATTERNS.has(remainingPatterns[0])) {
            addPathsAndHandlers(rule, i+1, childNode)
        } else {
            childNode.handler = {
                exec: rule.exec,
                cycles: rule.cycles || 1,
                getArgs: buildGetArgsFunc(remainingPatterns, i + 1),
                bytes: rule.bits.length
            }
        }
    }
}

function buildGetArgsFunc(remainingPatterns, ipOffset) {
    function buildFunclet(p, i) {
        switch (p) {
            case "LLLLLLLL": 
            case "llllllll": 
                return (state, list) => list.push(state.memory[state.IP + ipOffset + i] | (state.memory[state.IP + ipOffset + i + 1] << 8))
            case "DDDDDDDD": 
            case "dddddddd": 
            case "NNNNNNNN": 
            case "nnnnnnnn": 
                        return (state, list) => list.push(state.memory[state.IP + ipOffset + i])
            default:
                return () => {}
        }
    }

    const funclets = remainingPatterns
        .map((p, i) => buildFunclet(p, i))
        .filter(f => !!f)

    if (funclets.length === 0) return () => []

    return (state) => {
        const list = []

        for (const funclet of funclets) {
            funclet(state, list)
        }

        return list
    }
}

const THREE_BIT_REGISTER_CODES = ["B", "C", "D", "E", "H", "L", undefined, "A"]

function getAllPossibleCodesForPattern(pattern) {
    if (pattern.match(/^[10]*$/)) {
        return [[parseInt(pattern, 2), []]]
    }

    const result = getPossibleCodesForPattern(pattern, "rrr", 2, THREE_BIT_REGISTER_CODES)
        || getPossibleCodesForPattern(pattern, "dd", 2, ["BC", "DE", "HL", "SP"])
        || getPossibleCodesForPattern(pattern, "ss", 2, ["BC", "DE", "HL", "SP"])
        || getPossibleCodesForPattern(pattern, "qq", 2, ["BC", "DE", "HL", "AF"])
        || getPossibleCodesForPattern(pattern, "pp", 2, ["BC", "DE", "IX", "SP"])
        || getPossibleCodesForPattern(pattern, "rr", 2, ["BC", "DE", "IY", "SP"])
        || getPossibleCodesForPattern(pattern, "rrr", 5, THREE_BIT_REGISTER_CODES)
        || getPossibleCodesForDoubleRegisterPattern(pattern)

    if (!result) throw new Error(`Unrecognized pattern ${pattern}`)

    return result
}

function getPossibleCodesForDoubleRegisterPattern(pattern) {
    if (!stringMatchesPattern(pattern, "rrrRRR", 2)) return undefined

    const result = []

    for (let reg1Code = 0; reg1Code < 8; reg1Code++) {
        const register1 = THREE_BIT_REGISTER_CODES[reg1Code]
        if (register1) {
            for (let reg2Code = 0; reg2Code < 8; reg2Code++) {
                const register2 = THREE_BIT_REGISTER_CODES[reg2Code]

                if (register2) {
                    const numStr = pattern.substr(0, 2)
                        + reg1Code.toString(2).padStart(3, '0')
                        + reg2Code.toString(2).padStart(3, '0')
                    const asByte = parseInt(numStr, 2)

                    result.push([asByte, [register1, register2]])
                }
            }
        }
    }

    return result
}

function getPossibleCodesForPattern(input, pattern, startIdx, permutations) {
    if (!stringMatchesPattern(input.toLowerCase(), pattern, startIdx)) return undefined

    const result = []

    for (let i = 0; i < permutations.length; i++) {
        const permutation = permutations[i]
        if (permutation === undefined) continue

        const numStr = input.substr(0, startIdx)
            + i.toString(2).padStart(pattern.length, '0')
            + input.substr(startIdx + pattern.length)

        const asByte = parseInt(numStr, 2)

        result.push([asByte, [permutation]])
    }

    return result
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
    buildVm
}