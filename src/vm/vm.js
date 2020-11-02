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

            I: 0,
            R: 0,

            IX: 0,
            IY: 0,

            IP: 0,
            SP: 0,

            "AF'": 0,

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

            get AF() {
                return this.A << 8 | this.F
            },
            set AF(value) {
                this.A = 0x00ff & value >> 8;
                this.F = 0x00ff & value;
            },

            get SFlag() {
                return (this.F & 0b10000000) > 7
            },
            set SFlag(value) {
                if (value) {
                    this.F |= 0b10000000
                } else {
                    this.F &= 0b01111111
                }
            },

            get ZFlag() {
                return (this.F & 0b01000000) > 6
            },
            set ZFlag(value) {
                if (value) {
                    this.F |= 0b01000000
                } else {
                    this.F &= 0b10111111
                }
            },

            get HFlag() {
                return (this.F & 0b00010000) > 4
            },
            set HFlag(value) {
                if (value) {
                    this.F |= 0b00010000
                } else {
                    this.F &= 0b11101111
                }
            },

            get PVFlag() {
                return (this.F & 0b00000100) > 2
            },
            set PVFlag(value) {
                if (value) {
                    this.F |= 0b00000100
                } else {
                    this.F &= 0b11111011
                }
            },

            get NFlag() {
                return (this.F & 0b00000010) > 2
            },
            set NFlag(value) {
                if (value) {
                    this.F |= 0b00000010
                } else {
                    this.F &= 0b11111101
                }
            },

            get CFlag() {
                return this.F & 0b00000001
            },
            set CFlag(value) {
                if (value) {
                    this.F |= 0b00000001
                } else {
                    this.F &= 0b11111110
                }
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
            this.state.memory = new Array(size).fill(0)
        }
    }

    step() {
        if (this.cyclesToWait > 0) {
            this.cyclesToWait--
            return
        }

        const opcode1 = this.state.memory[this.state.IP]

        let inst = OPCODES[opcode1]
        if (!inst) {
            throw new Error(`Unknown opcode ${opcode1}`)
        }

        if (inst.next) {
            const opcode2 = this.state.memory[this.state.IP+1] || 0;
            inst = inst.next[opcode2]
            if (!inst) {
                throw new Error(`Unknown opcode ${opcode2} after ${opcode1}`)
            }
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

    stepOneInstruction() {

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
