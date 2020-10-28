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
        super("registerIndirect")

        this.register = register.toUpperCase()
        this.offset = offset
    }

    toString() { return this.register }
}

class ImmediateArgument extends Argument {
    constructor(integer) {
        super("immediate")

        this.integer = integer
    }

    toString() { return this.integer.toString() }
}

module.exports = {
    RegisterArgument,
    RegisterIndirectArgument,
    ImmediateArgument
}