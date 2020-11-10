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
        return type === "r" || type === "r'" || type === this.register
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
            || (type === "(IX+d)" && this.register === "(IY+d)")
            || (type === "(IY+D)" && this.register === "(IY+d)")
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
        return type === "n"
    }

    toString() { return this.integer.toString() }
}

class ImmediateIndirectArgument extends Argument {
    constructor(integer) {
        super("immediateIndirect")

        this.integer = integer
    }

    matchesArg(type) {
        return type === "(n)"
    }

    toString() { return `(${this.integer.toString()})` }
}

module.exports = {
    RegisterArgument,
    RegisterIndirectArgument,
    ImmediateArgument,
    ImmediateIndirectArgument
}