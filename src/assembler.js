class Assembler {

    static assembleLine(line) {
        const parts = line
            .replace('\t', ' ')
            .split(' ')
            .map(l => l.trim())
            .filter(l => l.length > 0)

        return Assembler[parts[0]](...parts.slice(1))    
    }

    static ld(from, to) {
        return `LD ${from} ${to}`
    }
}

module.exports = Assembler;