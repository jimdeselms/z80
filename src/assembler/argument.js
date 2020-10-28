class Argument {
    constructor(kind) {
        this.kind = kind
    }

    toString() { return "???" }
}

class RegisterArgument extends Argument {
    constructor(register) {
        super("register");

        this.register = register.toUpperCase();
    }

    toString() { return this.register }
}

class RegisterIndirectArgument extends Argument {
    constructor(register, offset) {
        super(isNaN(offset) ? "registerIndirect" : "registerIndirectWithOffset")

        this.register = register.toUpperCase()
        this.offset = offset
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

    toString() { return this.integer.toString() }
}

class ImmediateIndirectArgument extends Argument {
    constructor(integer) {
        super("immediateIndirect")

        this.integer = integer
    }

    toString() { return `(${this.integer.toString()})` }
}

module.exports = {
    RegisterArgument,
    RegisterIndirectArgument,
    ImmediateArgument,
    ImmediateIndirectArgument
}