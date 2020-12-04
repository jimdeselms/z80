const { bit16ToBytes, bytesToBit16 } = require('../helpers')

const z80 = require('../z80')
const MAX_OPCODES = 3

class Vm {
    constructor({ vmConfig, size, state, initialImage }) {

        this.vmConfig = vmConfig

        size = size || 100

        this.cyclesToWait = 0

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

            PC: 0,
            SP: 0,

            IFF: 1,
            IM0: 0,
            IM1: 0,
            IM2: 0,
            IM3: 0,

            "AF'": 0,

            isHalted: false,
            pcWasModified: false,

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
                return (this.F & 0b10000000) >> 7
            },
            set SFlag(value) {
                if (value) {
                    this.F |= 0b10000000
                } else {
                    this.F &= 0b01111111
                }
            },

            get ZFlag() {
                return (this.F & 0b01000000) >> 6
            },
            set ZFlag(value) {
                if (value) {
                    this.F |= 0b01000000
                } else {
                    this.F &= 0b10111111
                }
            },

            get HFlag() {
                return (this.F & 0b00010000) >> 4
            },
            set HFlag(value) {
                if (value) {
                    this.F |= 0b00010000
                } else {
                    this.F &= 0b11101111
                }
            },

            get PVFlag() {
                return (this.F & 0b00000100) >> 2
            },
            set PVFlag(value) {
                if (value) {
                    this.F |= 0b00000100
                } else {
                    this.F &= 0b11111011
                }
            },

            get NFlag() {
                return (this.F & 0b00000010) >> 1
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

            get16BitMemory(address) {
                const low = this.memory[address]
                const high = this.memory[address+1]
                return bytesToBit16(low, high)
            },

            put16BitMemory(address, value) {
                const [low, high] = bit16ToBytes(value)
                this.memory[address] = low
                this.memory[address+1] = high 
            },

            // These represent the various pins
            busackPin: 0,
            get BUSACK(){ return this.busackPin },
            set BUSACK(value) {
                this.busackPin = value
            },

            intPin: 0,
            get INT() { return this.intPin },
            set INT(value) {
                this.intPin = value
            },

            iorqPin: 0,
            get IORQ() { return this.iorqPin },
            set IORQ(value) {
                this.iorqPin = value
            },

            // Non-maskable interrupt
            nmiPin: 0,
            nmiTriggered: 0,
            get NMI() { return this.nmiPin },
            set NMI(value) {
                this.nmiPin = value
                if (value) {
                    this.nmiTriggered = 1
                }
            },

            databusPin: 0,
            get Databus() { return this.databusPin },
            set Databus(value) {
                this.databusPin = value
            },

            rdPin: 0,
            get RD() { return this.rdPin },
            set RD(value) {
                this.rdPin = value
            },
        }

        if (state) {
            for (const [key, value] of Object.entries(state)) {
                this.state[key] = value
            }
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
        // Are we in the middle of another instruction? Then skip this step
        if (typeof(this.wait) === "number" && --this.wait > 0) {
            return
        }

        const args = []
        let currNode = this.vmConfig

        // Find the instruction
        for (let i = 0; i < MAX_OPCODES; i++) {
            const code = this.state.memory[this.state.PC + i]
            currNode = currNode[code]
            if (!currNode) {
                throw new Error("INVALID CODE " + code)
            }
            if (currNode.args) {
                args.push(...currNode.args)
            }
            if (currNode.handler) {
                break
            }
        }

        const handler = currNode.handler

        args.push(...(handler.getArgs ? handler.getArgs(this.state) : []))

        if (this.wait === undefined) {
            if (handler.cycles) {
                const cycles = typeof(handler.cycles) === "number"
                    ? handler.cycles
                    : handler.cycles(this.state, ...args)

                if (cycles > 1) {
                    this.wait = cycles - 1
                }
            }
        }

        if (this.wait > 0) {
            return
        }

        handler.exec(this.state, ...args)
        this.wait = undefined

        // Unless the was a jump or other instruction that modified the PC, we'll
        // move the PC forward for the next instruction
        if (!this.state.pcWasModified) {
            this.state.PC += handler.bytes
        } else {
            this.state.pcWasModified = false
        }

        if (this.nmiTriggered = false) {
            this.handleNonMaskableInterrupt()
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

    handleNonMaskableInterrupt() {
        // NMIs always go to address 0x0066
        this.nmiTriggered = this.nmiPin
        z80.CALL(this.state, 0x0066)
    }
}

module.exports = Vm
