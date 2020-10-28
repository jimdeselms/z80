class Instructions {
    static halt(state) {
        state.isHalted = true
    }

    static ldIntegerToRegister(state, register) {
        const value = state.memory[state.ip++]
        state[register] = value
    }
}

const OPCODES = {
    // HALT
    0b01110110: { code: Instructions.halt, cycles: 1 },
    
    // LD r, n
    0b00111110: { code: state => Instructions.ldIntegerToRegister(state, "A"), cycles: 2 }
}

class Vm {
    constructor({ size, initialImage }) {
        size = size || 100

        this.cyclesToWait = 1

        this.state = {
            A: 0,
            ip: 0,
            sp: 0,
            isHalted: false,
        }

        if (initialImage) {
            const diff = size - initialImage.length
            if (diff > 0) {
                this.state.memory = [...initialImage, ...new Array(diff).fill(0)]
            } else {
                this.state.memory = initialImage
            }
        } else {
            this.state.memory = new Array(size)
        }
    }

    step() {
        if (--this.cyclesToWait <= 0) {
            const opcode = this.state.memory[this.state.ip++]
            const inst = OPCODES[opcode]
            if (!inst) {
                throw new Error(`Unknown opcode ${opcode}`)
            }

            this.cyclesToWait = inst.cycles;
            inst.code(this.state)
        }
    }

    run() {
        while (!this.state.isHalted) {
            this.step()
        }
    }
}

module.exports = Vm
