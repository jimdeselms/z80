class Argument {
    isRegister() { return false }
    isInteger() { return false }
    toString() { return "???" }
}

class RegisterArgument extends Argument {
    constructor(register) {
        super();

        this.register = register.toUpperCase();
    }

    isRegister() { return true }

    toString() { return this.register }
}

class IntegerArgument extends Argument {
    constructor(integer) {
        super();

        this.integer = integer;
    }

    isInteger() { return true; }

    toString() { return this.integer.toString() }
}

module.exports = {
    RegisterArgument,
    IntegerArgument
}