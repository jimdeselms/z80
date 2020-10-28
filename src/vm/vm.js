const { OPCODES } = require('./instructions')

class Vm {
    constructor({ size, initialImage }) {
        size = size || 100

        this.cyclesToWait = undefined

        this.state = {
            A: 0,
            IP: 0,
            SP: 0,
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

        if (this.cyclesToWait > 0) {
            this.cyclesToWait--
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

    run() {
        while (!this.state.isHalted) {
            this.step()
        }
    }
}

module.exports = Vm
