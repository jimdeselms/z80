const EIGHT_BIT_REGISTERS=new Set(["A", "B", "C", "D", "E", "H", "L", "F", "I", "R"])
const SIXTEEN_BIT_DD_REGISTERS = new Set(["HL", "BC", "DE", "SP"])
const SIXTEEN_BIT_QQ_REGISTERS = new Set(["HL", "BC", "DE", "AF"])

class Argument {
    constructor(kind) {
        this.kind = kind
    }

    matchesArg(type) {
        return false
    }

    toString() { return "???" }
}

class RegisterArgument extends Argument {
    constructor(register) {
        super("register");

        this.register = register.toUpperCase();
    }

    matchesArg(type) {
        return type === this.register
            || ((type === "r" || type === "r'") && EIGHT_BIT_REGISTERS.has(this.register))
            || ((type === "dd" || type === "dd'") && SIXTEEN_BIT_DD_REGISTERS.has(this.register))
            || ((type === "qq" || type === "qq'") && SIXTEEN_BIT_QQ_REGISTERS.has(this.register))
    }

    toString() { return this.register }
}

class RegisterIndirectArgument extends Argument {
    constructor(register, offset) {
        super(isNaN(offset) ? "registerIndirect" : "registerIndirectWithOffset")

        this.register = register.toUpperCase()
        this.offset = offset
    }

    matchesArg(type) {
        return (type === "(HL)" && this.register === "HL")
            || (type === "(SP)" && this.register === "SP")
            || (type === "(BC)" && this.register === "BC")
            || (type === "(DE)" && this.register === "DE")
            || (type === "(IX+d)" && this.register === "IX")
            || (type === "(IY+d)" && this.register === "IY")
    }

    toString() { 
        if (this.offset > 0) {
            return `(${this.register}+${this.offset})`
        } else if (this.offset < 0) {
            return `(${this.register}${this.offset})`
        } else {
            return `(${this.register})`
        }
    }
}

class ImmediateArgument extends Argument {
    constructor(integer) {
        super("immediate")

        this.integer = integer
    }

    matchesArg(type) {
        if (type === "n" || type === "nn") return true

        if (parseInt(type) === this.integer) return true

        return false
    }

    toString() { return this.integer.toString() }
}

class ImmediateIndirectArgument extends Argument {
    constructor(integer) {
        super("immediateIndirect")

        this.integer = integer
    }

    matchesArg(type) {
        return type === "(n)" || type === "(nn)"
    }

    toString() { return `(${this.integer.toString()})` }
}

module.exports = {
    RegisterArgument,
    RegisterIndirectArgument,
    ImmediateArgument,
    ImmediateIndirectArgument
}