const { OPCODES } = require('./instructions')

class Vm {
    constructor({ size, state, initialImage }) {
        size = size || 100

        this.cyclesToWait = undefined

        this.state = {
            A: 0,
            B: 0,
            C: 0,
            D: 0,
            E: 0,
            H: 0,
            L: 0,

            IX: 0,
            IY: 0,

            IP: 0,
            SP: 0,

            isHalted: false,

            get HL() {
                return this.H << 8 | this.L
            },
            set HL(value) {
                this.H = 0x00ff & value >> 8;
                this.L = 0x00ff & value;
            },

            get BC() {
                return this.B << 8 | this.C
            },
            set BC(value) {
                this.B = 0x00ff & value >> 8;
                this.C = 0x00ff & value;
            },

            get DE() {
                return this.D << 8 | this.E
            },
            set DE(value) {
                this.D = 0x00ff & value >> 8;
                this.E = 0x00ff & value;
            },

            // initialize any of the registers
            ...(state || {})
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
        if (this.cyclesToWait > 0) {
            this.cyclesToWait--
            return
        }

        const opcode = this.state.memory[this.state.IP]
        const inst = OPCODES[opcode]
        if (!inst) {
            throw new Error(`Unknown opcode ${opcode}`)
        }

        if (this.cyclesToWait === 0) {
            this.state.IP++
            inst.code(this.state)
            this.cyclesToWait = undefined
        } else {
            if (inst.cycles > 1) {
                this.cyclesToWait = inst.cycles-2
            } else {
                this.state.IP++
                inst.code(this.state)
            }
        }
    }

    loadMemory(address, memory) {
        this.state.memory.splice(address, memory.length, ...memory)
    }

    run() {
        while (!this.state.isHalted) {
            this.step()
        }
    }
}

module.exports = Vm
