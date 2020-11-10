module.exports = {
    instructions: {
        "LD r, r'": {
            bits: ["01rrrRRR"],
            handler(state, r1, r2) {
                state[r1] = state[r2]
            }
        },
        "LD r, n": {
            bits: ["00rrr110", "NNNNNNNN"],
            handler(state, r, n) {
                state[r] = n
            }
        },
        "LD r, (HL)": {
            bits: ["01rrr110"],
            handler(state, r) {
                state[r] = state.memory[state.HL]
            }
        },
        "LD r, (IX+d)": {
            bits: ["11011101", "01rrr110", "DDDDDDDD"],
            handler(state, r, d) {
                state[r] = state.memory[state.IX + d]
            }
        },
        "LD r, (IY+d)": {
            bits: ["11011101", "01rrr110", "DDDDDDDD"],
            handler(state, r, d) {
                state[r] = state.memory[state.IY + d]
            }
        },
        "HALT": {
            bits: ["01110110"]
        }
    }        
}