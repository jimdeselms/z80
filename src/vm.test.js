const config = require('./z80')
const { buildAssembler } = require('./assembler/assemblerBuilder')
const { buildVm } = require('./vm/vmBuilder')

describe('vm', () => {
    describe('instructions', () => {
        describe('HALT', () => {
            it('halts', () => {
                const state  = runProgram("halt")
                expect(state).toMatchObject({
                    isHalted: true,
                    IP: 1
                })
            })
        })

        describe('LD', () => {

            it('ld r, n', () => {
                expect(runProgram("ld a, 50")).toMatchObject({ A: 50 })
                expect(runProgram("ld b, 1")).toMatchObject({ B: 1 })
                expect(runProgram("Ld c, 2")).toMatchObject({ C: 2 })
                expect(runProgram("LD D, 3")).toMatchObject({ D: 3 })
                expect(runProgram("LD E, 3")).toMatchObject({ E: 3 })
                expect(runProgram("LD H, 3")).toMatchObject({ H: 3 })
                expect(runProgram("LD L, 3")).toMatchObject({ L: 3 })
            })

            it("ld r, r'", () => {
                expect(runProgram("ld a, 1; ld a, a")).toMatchObject({ A: 1 })
                expect(runProgram("ld a, 1; ld b, a")).toMatchObject({ A: 1, B: 1 })
                expect(runProgram("ld a, 1; ld c, a")).toMatchObject({ A: 1, C: 1 })
                expect(runProgram("ld a, 1; ld d, a")).toMatchObject({ A: 1, D: 1 })
                expect(runProgram("ld a, 1; ld e, a")).toMatchObject({ A: 1, E: 1 })
                expect(runProgram("ld a, 1; ld h, a")).toMatchObject({ A: 1, H: 1 })
                expect(runProgram("ld a, 1; ld l, a")).toMatchObject({ A: 1, L: 1 })

                expect(runProgram("ld b, 5; ld a, b")).toMatchObject({ B: 5, A: 5 })
                expect(runProgram("ld b, 5; ld b, b")).toMatchObject({ B: 5 })
                expect(runProgram("ld b, 5; ld c, b")).toMatchObject({ B: 5, C: 5 })
                expect(runProgram("ld b, 5; ld d, b")).toMatchObject({ B: 5, D: 5 })
                expect(runProgram("ld b, 5; ld e, b")).toMatchObject({ B: 5, E: 5 })
                expect(runProgram("ld b, 5; ld h, b")).toMatchObject({ B: 5, H: 5 })
                expect(runProgram("ld b, 5; ld l, b")).toMatchObject({ B: 5, L: 5 })

                expect(runProgram("ld c, 7; ld a, c")).toMatchObject({ C: 7, A: 7 })
                expect(runProgram("ld c, 7; ld b, c")).toMatchObject({ C: 7, B: 7 })
                expect(runProgram("ld c, 7; ld c, c")).toMatchObject({ C: 7 })
                expect(runProgram("ld c, 7; ld d, c")).toMatchObject({ C: 7, D: 7 })
                expect(runProgram("ld c, 7; ld e, c")).toMatchObject({ C: 7, E: 7 })
                expect(runProgram("ld c, 7; ld h, c")).toMatchObject({ C: 7, H: 7 })
                expect(runProgram("ld c, 7; ld l, c")).toMatchObject({ C: 7, L: 7 })

            })

            it('LD A, 50', () => {
                const state = runProgram("LD A, 25")
                expect(state).toMatchObject({ 
                    A: 25,
                    IP: 3 // add 1 for final HALT
                })
            })

            it('LD r, (HL)', () => {
                runProgram("LD A, (HL)", { 
                    setup: { 
                        state: { HL: 20 },
                        memory: { 20: 123 }
                    },
                    expect: {
                        state: { A: 123 }
                    }
                })
            })

            it('LD A, (BC)', () => {
                const vm = createVm("LD A, (BC)")
                vm.state.BC = 25
                vm.loadMemory(25, [90])

                vm.run();
                expect(vm.state).toMatchObject({
                    A: 90
                })
            })

            it('LD A, (DE)', () => {
                const vm = createVm("LD A, (DE)")
                vm.state.DE = 40
                vm.loadMemory(40, [25])

                vm.run();
                expect(vm.state).toMatchObject({
                    A: 25
                })
            })

            it('LD r, (IX+2)', () => {
                const vm = createVm("LD C, (IX+2)")
                vm.state.IX = 30
                vm.loadMemory(32, [12])

                vm.run();
                expect(vm.state).toMatchObject({
                    C: 12
                })
            })

            it('LD r, (IY+5)', () => {
                const vm = createVm("LD E, (IY+5)")
                vm.state.IY = 15
                vm.loadMemory(20, [22])

                vm.run();
                expect(vm.state).toMatchObject({
                    E: 22
                })
            })

            it('LD (IX+2), r', () => {
                runProgram("LD (IX+2), B", {
                    setup: { state: { B: 22, IX: 15 }},
                    expect: { memory: { 17: 22 }}
                })
            })

            it('LD (IY+5), r', () => {
                const vm = createVm("LD (IY+5), B")
                vm.state.B = 22
                vm.state.IY = 25

                vm.run();
                expect(vm.state.memory[30]).toBe(22)
            })

            it('LD (HL), r', () => {
                const vm = createVm("LD (HL), C")
                vm.state.HL = 20
                vm.state.C = 5

                vm.run();
                expect(vm.state.memory[20]).toBe(5)
            })

            it ('LD (HL), n', () => {
                const vm = createVm("LD (HL), 27")
                vm.state.HL = 50
                vm.run()
                expect(vm.state.memory[50]).toBe(27)
            })
            
            it ('LD (IX+d), n', () => {
                const vm = createVm("LD (IX+3), 14")
                vm.state.IX = 25
                vm.run()
                expect(vm.state.memory[28]).toBe(14)
            })

            it ('LD (IY+d), n', () => {
                runProgram("LD (IY+7), 22", {
                    setup: { state: { IY: 30 }},
                    expect: { memory: { 37: 22 }}
                })
            })

            it ('LD A, I', () => {
                runProgram("LD A, I", {
                    setup: { state: { I: 23 }},
                    expect: { state: { A: 23 }}
                })
            })

            it ('LD A, R', () => {
                runProgram("LD A, R", {
                    setup: { state: { R: 23 }},
                    expect: { state: { A: 23 }}
                })
            })

            it ('LD I, A', () => {
                const vm = createVm("LD I, A")
                vm.state.A = 23
                vm.run()
                expect(vm.state.I).toBe(23)
            })

            it ('LD R, A', () => {
                const vm = createVm("LD R, A")
                vm.state.A = 117
                vm.run()
                expect(vm.state.R).toBe(117)
            })

            it ("LD dd, nn", () => {
                expect(runProgram("LD BC, 5000")).toMatchObject({ BC: 5000 })
                expect(runProgram("LD DE, 1234")).toMatchObject({ DE: 1234 })
                expect(runProgram("LD HL, 9999")).toMatchObject({ HL: 9999 })
                expect(runProgram("LD SP, 14233")).toMatchObject({ SP: 14233 })
            })

            it ("LD IX, nn", () => {
                expect(runProgram("LD IX, 5000")).toMatchObject({ IX: 5000 })
            })

            it ("LD IY, nn", () => {
                expect(runProgram("LD IY, 2000")).toMatchObject({ IY: 2000 })
            })

            it ("LD HL, (nn)", () => {
                const vm = createVm("LD HL, (20)")
                vm.state.memory[20] = 15
                vm.run()
                expect(vm.state.memory[20]).toBe(15)
            })

            it ("LD dd, (nn)", () => {
                runProgram("LD BC, (30)", {
                    setup: { memory: { 30: 0x12, 31: 0x13 }},
                    expect: { state: { BC: 0x1312 }}
                })
                runProgram("LD DE, (30)", {
                    setup: { memory: { 30: 0x12, 31: 0x13 }},
                    expect: { state: { DE: 0x1312 }}
                })
                runProgram("LD HL, (30)", {
                    setup: { memory: { 30: 0x12, 31: 0x13 }},
                    expect: { state: { HL: 0x1312 }}
                })
                runProgram("LD SP, (30)", {
                    setup: { memory: { 30: 0x12, 31: 0x13 }},
                    expect: { state: { SP: 0x1312 }}
                })
            })

            it ("LD IX, (nn)", () => {
                runProgram("LD IX, (25)", {
                    setup: { memory: { 25: 0x22, 26: 0x33 }},
                    expect: { state: { IX: 0x3322 }}
                })
            })

            it ("LD IY, (nn)", () => {
                runProgram("LD IY, (25)", {
                    setup: { memory: { 25: 0x20, 26: 0x25 }},
                    expect: { state: { IY: 0x2520 }}
                })
            })

            it ("LD (nn), HL", () => {
                runProgram("LD (16h), HL", { 
                    setup: { state: { HL: 0x1234 }},
                    expect: { memory: { 0x16: 0x34, 0x17: 0x12 }}
                });
            })

            it ("LD (nn), BC", () => {
                runProgram("LD (16h), BC", { 
                    setup: { state: { BC: 0x1234 }},
                    expect: { memory: { 0x16: 0x34, 0x17: 0x12 }}
                });
            })

            it ("LD (nn), DE", () => {
                runProgram("LD (16h), DE", { 
                    setup: { state: { DE: 0x1234 }},
                    expect: { memory: { 0x16: 0x34, 0x17: 0x12 }}
                });
            })

            it ("LD (nn), SP", () => {
                runProgram("LD (16h), SP", { 
                    setup: { state: { SP: 0x1234 }},
                    expect: { memory: { 0x16: 0x34, 0x17: 0x12 }}
                });
            })

            it ("LD (nn), IX", () => {
                runProgram("LD (16h), IX", { 
                    setup: { state: { IX: 0x1234 }},
                    expect: { memory: { 0x16: 0x34, 0x17: 0x12 }}
                });
            })

            it ("LD (nn), IY", () => {
                runProgram("LD (16h), IY", { 
                    setup: { state: { IY: 0x1234 }},
                    expect: { memory: { 0x16: 0x34, 0x17: 0x12 }}
                });
            })

            it ("LD SP, HL", () => {
                runProgram("LD SP, HL", { 
                    setup: { state: { HL: 5000 }},
                    expect: { state: { SP: 5000 }}
                })
            })

            it ("LD SP, IX", () => {
                runProgram("LD SP, IX", { 
                    setup: { state: { IX: 5000 }},
                    expect: { state: {SP: 5000}}
                })
            })

            it ("LD SP, IY", () => {
                runProgram("LD SP, IY", { 
                    setup: { state: { IY: 2000 }},
                    expect: { state: { SP: 2000 }}
                })
            })
        })

        describe("PUSH", () => {
            it ("PUSH BC", () => {
                runProgram("PUSH BC", {
                    setup: {
                        state: { BC: 0x2030, SP: 20 }
                    },
                    expect: {
                        state: { SP: 18 },
                        memory: {
                            18: 0x30,
                            19: 0x20
                        }
                    }
                })
            })

            it ("PUSH IX", () => {
                runProgram("PUSH IX", {
                    setup: {
                        state: { IX: 0x2030, SP: 20 }
                    },
                    expect: {
                        state: { SP: 18 },
                        memory: {
                            18: 0x30,
                            19: 0x20
                        }
                    }
                })
            })

            it ("PUSH IY", () => {
                runProgram("PUSH IY", {
                    setup: {
                        state: { IY: 0x2030, SP: 20 }
                    },
                    expect: {
                        state: { SP: 18 },
                        memory: {
                            18: 0x30,
                            19: 0x20
                        }
                    }
                })
            })
        })
        
        describe("POP", () => {
            it ("POP rr", () => {
                runProgram("POP BC", {
                    setup: { state: { SP: 20 }, memory: { 20: 0x01, 21: 0x02 }},
                    expect: { state: { BC: 0x0201, SP: 22 }}
                })
                runProgram("POP DE", {
                    setup: { state: { SP: 20 }, memory: { 20: 0x01, 21: 0x02 }},
                    expect: { state: { DE: 0x0201, SP: 22 }}
                })
                runProgram("POP HL", {
                    setup: { state: { SP: 20 }, memory: { 20: 0x01, 21: 0x02 }},
                    expect: { state: { HL: 0x0201, SP: 22 }}
                })
                runProgram("POP AF", {
                    setup: { state: { SP: 20 }, memory: { 20: 0x01, 21: 0x02 }},
                    expect: { state: { AF: 0x0201, SP: 22 }}
                })
            })

            it ("POP IX", () => {
                runProgram("POP IX", {
                    setup: { state: { SP: 25 }, memory: { 25: 0x15, 26: 0x30 }},
                    expect: { state: { IX: 0x3015, SP: 27 }}
                })
            })

            it ("POP IY", () => {
                runProgram("POP IY", {
                    setup: { state: { SP: 25 }, memory: { 25: 0x15, 26: 0x30 }},
                    expect: { state: { IY: 0x3015, SP: 27 }}
                })
            })
        })

        it('NOP', () => {
            const state = runProgram("NOP")
            // Add one for the final HALT
            expect(state).toMatchObject({ 
                IP: 2 // add 1 for final HALT
            })
        })
    })

    describe('timing', () => {
        // Since a ld takes 2 cycles, we should expect each of these to take two steps to complete.
        it('three instructions', () => {
            const program = `
                LD A, 1
                LD A, 2
                NOP
                LD A, 3`

            const vm = createVm(program)

            vm.step();
            expect(vm.state.A).toBe(0)

            vm.step();
            expect(vm.state.A).toBe(1)

            vm.step();
            expect(vm.state.A).toBe(1)

            vm.step();
            expect(vm.state.A).toBe(2)

            vm.step();
            expect(vm.state.A).toBe(2)

            vm.step();
            expect(vm.state.A).toBe(2)

            vm.step();
            expect(vm.state.A).toBe(3)
        })
    })

    describe("ex", () => {
        it("EX DE, HL", () => {
            runProgram("EX DE, HL", {
                setup: {
                    state: { DE: 1234, HL: 2345 }
                },
                expect: {
                    state: { DE: 2345, HL: 1234 }
                }
            })
        })

        it("EX AF, AF'", () => {
            runProgram("EX AF, AF'", {
                setup: {
                    state: { AF: 9999, "AF'": 2222 }
                },
                expect: {
                    state: { AF: 2222, "AF'": 9999 }
                }
            })
        })

        it ("EX (SP), HL", () => {
            runProgram("EX (SP), HL", {
                setup: {
                    state: { SP: 25, HL: 0x3322 },
                    memory: { 25: 0x20, 26: 0x40 }
                },
                expect: {
                    state: { SP: 25, HL: 0x4020 },
                    memory: { 25: 0x22, 26: 0x33 }
                }
            })
        })

        it ("EX (SP), IX", () => {
            runProgram("EX (SP), IX", {
                setup: {
                    state: { SP: 25, IX: 0x3322 },
                    memory: { 25: 0x20, 26: 0x40 }
                },
                expect: {
                    state: { SP: 25, IX: 0x4020 },
                    memory: { 25: 0x22, 26: 0x33 }
                }
            })
        })

        it ("EX (SP), IY", () => {
            runProgram("EX (SP), IY", {
                setup: {
                    state: { SP: 25, IY: 0x3322 },
                    memory: { 25: 0x20, 26: 0x40 }
                },
                expect: {
                    state: { SP: 25, IY: 0x4020 },
                    memory: { 25: 0x22, 26: 0x33 }
                }
            })
        })
    })

    it("exx", () => {
        runProgram("EXX", {
            setup: {
                state: { BC: 1000, "BC'": 100, DE: 2000, "DE'": 200, HL: 3000, "HL'": 300 }
            },
            expect: {
                state: { BC: 100, "BC'": 1000, DE: 200, "DE'": 2000, HL: 300, "HL'": 3000 }
            }
        })
    })

    describe("LDI(R)", () => {
        it("LDI", () => {
            runProgram("LDI", {
                setup: {
                    state: { DE: 10, HL: 20, BC: 5, HFlag: 1, NFlag: 1, PVFlag: 1 },
                    memory: { 10: 0x20, 20: 0x30 }
                },
                expect: {
                    state: { DE: 11, HL: 21, BC: 4, HFlag: 0, NFlag: 0, PVFlag: 1 },
                    memory: { 10: 0x30, 20: 0x30 }
                }
            })
        }) 
        it("LDI when BC becomes zero", () => {
            runProgram("LDI", {
                setup: {
                    state: { DE: 10, HL: 20, BC: 1, HFlag: 1, NFlag: 1, PVFlag: 1 },
                    memory: { 10: 0x20, 20: 0x30 }
                },
                expect: {
                    state: { DE: 11, HL: 21, BC: 0, HFlag: 0, NFlag: 0, PVFlag: 0 },
                    memory: { 10: 0x30, 20: 0x30 }
                }
            })
        }) 

        it("LDIR", () => {
            runProgram("LDIR", {
                setup: {
                    state: { DE: 10, HL: 20, BC: 3, HFlag: 1, NFlag: 1, PVFlag: 1 },
                    memory: { 20: 0x20, 21: 0x21, 22: 0x22, 23: 0x23 },
                },
                expect: {
                    state: { DE: 13, HL: 23, BC: 0, HFlag: 0, NFlag: 0, PVFlag: 0 },
                    memory: { 10: 0x20, 11: 0x21, 12: 0x22, 13: 0x00, 20: 0x20, 21: 0x21, 22: 0x22, 23: 0x23 }
                }
            })
        })
    })

    describe("LDD(R)", () => {
        it("LDD", () => {
            runProgram("LDD", {
                setup: {
                    state: { DE: 10, HL: 20, BC: 5, HFlag: 1, NFlag: 1, PVFlag: 1 },
                    memory: { 10: 0x20, 20: 0x30 }
                },
                expect: {
                    state: { DE: 9, HL: 19, BC: 4, HFlag: 0, NFlag: 0, PVFlag: 1 },
                    memory: { 10: 0x30, 20: 0x30 }
                }
            })
        }) 
        it("LDD when BC becomes zero", () => {
            runProgram("LDD", {
                setup: {
                    state: { DE: 10, HL: 20, BC: 1, HFlag: 1, NFlag: 1, PVFlag: 1 },
                    memory: { 10: 0x20, 20: 0x30 }
                },
                expect: {
                    state: { DE: 9, HL: 19, BC: 0, HFlag: 0, NFlag: 0, PVFlag: 0 },
                    memory: { 10: 0x30, 20: 0x30 }
                }
            })
        }) 

        it("LDDR", () => {
            runProgram("LDDR", {
                setup: {
                    state: { DE: 13, HL: 23, BC: 3, HFlag: 1, NFlag: 1, PVFlag: 1 },
                    memory: { 20: 0x20, 21: 0x21, 22: 0x22, 23: 0x23 },
                },
                expect: {
                    state: { DE: 10, HL: 20, BC: 0, HFlag: 0, NFlag: 0, PVFlag: 0 },
                    memory: { 10: 0x00, 11: 0x21, 12: 0x22, 13: 0x23, 20: 0x20, 21: 0x21, 22: 0x22, 23: 0x23 }
                }
            })
        })
    })

    describe("CPI(R)", () => {
        it("CPI negative", () => {
            runProgram("CPI", {
                setup: {
                    state: { A: 5, HL: 10, BC: 3 },
                    memory: { 10: 7 }
                },
                expect: {
                    state: { A: 5, HL: 11, BC: 2, SFlag: 1, ZFlag: 0, PVFlag: 1, NFlag: 1 }
                }
            })
        })
        it("CPI same", () => {
            runProgram("CPI", {
                setup: {
                    state: { A: 5, HL: 10, BC: 3 },
                    memory: { 10: 5 }
                },
                expect: {
                    state: { A: 5, HL: 11, BC: 2, SFlag: 0, ZFlag: 1, PVFlag: 1, NFlag: 1 }
                }
            })
        })
        it("CPI positive", () => {
            runProgram("CPI", {
                setup: {
                    state: { A: 5, HL: 10, BC: 3 },
                    memory: { 10: 3 }
                },
                expect: {
                    state: { A: 5, HL: 11, BC: 2, SFlag: 0, ZFlag: 0, PVFlag: 1, NFlag: 1 }
                }
            })
        })
        it("CPIR", () => {
            runProgram("CPIR", {
                setup: {
                    state: { A: 5, HL: 10, BC: 2 },
                },
                expect: {
                    state: { A: 5, HL: 12, BC: 0, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1 }
                }
            })
        })
    })

    describe("CPD(R)", () => {
        it("CPD negative", () => {
            runProgram("CPD", {
                setup: {
                    state: { A: 5, HL: 10, BC: 3 },
                    memory: { 10: 7 }
                },
                expect: {
                    state: { A: 5, HL: 9, BC: 2, SFlag: 1, ZFlag: 0, PVFlag: 1, NFlag: 1 }
                }
            })
        })
        it("CPD same", () => {
            runProgram("CPD", {
                setup: {
                    state: { A: 5, HL: 10, BC: 3 },
                    memory: { 10: 5 }
                },
                expect: {
                    state: { A: 5, HL: 9, BC: 2, SFlag: 0, ZFlag: 1, PVFlag: 1, NFlag: 1 }
                }
            })
        })
        it("CPD positive", () => {
            runProgram("CPD", {
                setup: {
                    state: { A: 5, HL: 10, BC: 3 },
                    memory: { 10: 3 }
                },
                expect: {
                    state: { A: 5, HL: 9, BC: 2, SFlag: 0, ZFlag: 0, PVFlag: 1, NFlag: 1 }
                }
            })
        })
        it("CPDR", () => {
            runProgram("CPDR", {
                setup: {
                    state: { A: 5, HL: 10, BC: 2 },
                },
                expect: {
                    state: { A: 5, HL: 8, BC: 0, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1 }
                }
            })
        })
    })
    
    describe("add", () => {
        it("ADD A, r", () => {
            runProgram("ADD A, A", {
                setup: { state: { A: 10 } },
                expect: { state: { A: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADD A, B", {
                setup: { state: { A: 10, B: 20 } },
                expect: { state: { A: 30, B: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADD A, C", {
                setup: { state: { A: 10, C: 20 } },
                expect: { state: { A: 30, C: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADD A, D", {
                setup: { state: { A: 10, D: 20 } },
                expect: { state: { A: 30, D: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADD A, E", {
                setup: { state: { A: 10, E: 20 } },
                expect: { state: { A: 30, E: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADD A, H", {
                setup: { state: { A: 10, H: 20 } },
                expect: { state: { A: 30, H: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADD A, L", {
                setup: { state: { A: 10, L: 20 } },
                expect: { state: { A: 30, L: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("ADD A, n", () => {
            runProgram("ADD A, 15", {
                setup: { state: { A: 10 } },
                expect: { state: { A: 25, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("ADD A, (HL)", () => {
            runProgram("ADD A, (HL)", {
                setup: { state: { A: 10, HL: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 60, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("ADD A, (IX+2)", () => {
            runProgram("ADD A, (IX+2)", {
                setup: { state: { A: 10, IX: 25 }, memory: { 27: 50 } },
                expect: { state: { A: 60, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("ADD A, (IX)", () => {
            runProgram("ADD A, (IX)", {
                setup: { state: { A: 10, IX: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 60, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("ADD A, (IY+2)", () => {
            runProgram("ADD A, (IY+2)", {
                setup: { state: { A: 10, IY: 25 }, memory: { 27: 50 } },
                expect: { state: { A: 60, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("ADD A, (IY)", () => {
            runProgram("ADD A, (IY)", {
                setup: { state: { A: 10, IY: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 60, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("ADD HL, ss", () => {
            runProgram("ADD HL, BC", {
                setup: { state: { HL: 10000, BC: 9000 }},
                expect: { state: { HL: 19000 }}
            })
            runProgram("ADD HL, DE", {
                setup: { state: { HL: 10001, DE: 9000 }},
                expect: { state: { HL: 19001 }}
            })
            runProgram("ADD HL, HL", {
                setup: { state: { HL: 5000 }},
                expect: { state: { HL: 10000 }}
            })
            runProgram("ADD HL, SP", {
                setup: { state: { HL: 10002, SP: 9000 }},
                expect: { state: { HL: 19002 }}
            })
        })

        it("ADD IX, pp", () => {
            runProgram("ADD IX, BC", {
                setup: { state: { IX: 10000, BC: 9000 }},
                expect: { state: { IX: 19000 }}
            })
            runProgram("ADD IX, DE", {
                setup: { state: { IX: 10001, DE: 9000 }},
                expect: { state: { IX: 19001 }}
            })
            runProgram("ADD IX, IX", {
                setup: { state: { IX: 5000 }},
                expect: { state: { IX: 10000 }}
            })
            runProgram("ADD IX, SP", {
                setup: { state: { IX: 10002, SP: 9000 }},
                expect: { state: { IX: 19002 }}
            })
        })
        it("ADD IY, rr", () => {
            runProgram("ADD IY, BC", {
                setup: { state: { IY: 10000, BC: 9000 }},
                expect: { state: { IY: 19000 }}
            })
            runProgram("ADD IY, DE", {
                setup: { state: { IY: 10001, DE: 9000 }},
                expect: { state: { IY: 19001 }}
            })
            runProgram("ADD IY, IY", {
                setup: { state: { IY: 5000 }},
                expect: { state: { IY: 10000 }}
            })
            runProgram("ADD IY, SP", {
                setup: { state: { IY: 10002, SP: 9000 }},
                expect: { state: { IY: 19002 }}
            })
        })
    })

    describe("adc", () => {
        it("ADC A, r", () => {
            runProgram("ADC A, A", {
                setup: { state: { A: 10, CFlag: 1 } },
                expect: { state: { A: 21, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADC A, B", {
                setup: { state: { A: 10, B: 20 } },
                expect: { state: { A: 30, B: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADC A, C", {
                setup: { state: { A: 10, C: 20, CFlag: 1 } },
                expect: { state: { A: 31, C: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADC A, D", {
                setup: { state: { A: 10, D: 20 } },
                expect: { state: { A: 30, D: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADC A, E", {
                setup: { state: { A: 10, E: 20 } },
                expect: { state: { A: 30, E: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADC A, H", {
                setup: { state: { A: 10, H: 20 } },
                expect: { state: { A: 30, H: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADC A, L", {
                setup: { state: { A: 10, L: 20 } },
                expect: { state: { A: 30, L: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("ADC A, n", () => {
            runProgram("ADC A, 15", {
                setup: { state: { A: 10, CFlag: 0 } },
                expect: { state: { A: 25, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("ADC A, 15", {
                setup: { state: { A: 10, CFlag: 1 } },
                expect: { state: { A: 26, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("ADC A, (HL)", () => {
            runProgram("ADC A, (HL)", {
                setup: { state: { A: 10, HL: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 60, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("ADC A, (IX+2)", () => {
            runProgram("ADC A, (IX+2)", {
                setup: { state: { A: 10, IX: 25, CFlag: 1 }, memory: { 27: 50 } },
                expect: { state: { A: 61, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("ADC A, (IX)", () => {
            runProgram("ADC A, (IX)", {
                setup: { state: { A: 10, IX: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 60, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("ADC A, (IY+2)", () => {
            runProgram("ADC A, (IY+2)", {
                setup: { state: { A: 10, IY: 25 }, memory: { 27: 50 } },
                expect: { state: { A: 60, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("ADC A, (IY)", () => {
            runProgram("ADC A, (IY)", {
                setup: { state: { A: 10, IY: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 60, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("ADC HL, ss", () => {
            runProgram("ADC HL, BC", {
                setup: { state: { HL: 10000, BC: 9000, CFlag: 1 }},
                expect: { state: { HL: 19001 }}
            })
            runProgram("ADC HL, DE", {
                setup: { state: { HL: 10000, DE: 9000, CFlag: 1 }},
                expect: { state: { HL: 19001 }}
            })
            runProgram("ADC HL, HL", {
                setup: { state: { HL: 2000, CFlag: 1 }},
                expect: { state: { HL: 4001 }}
            })
            runProgram("ADC HL, SP", {
                setup: { state: { HL: 10000, SP: 9000, CFlag: 0 }},
                expect: { state: { HL: 19000 }}
            })
        })
    })

    describe("sub", () => {
        it("SUB r", () => {
            runProgram("SUB A", {
                setup: { state: { A: 10 } },
                expect: { state: { A: 0, SFlag: 0, ZFlag: 1, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SUB B", {
                setup: { state: { A: 20, B: 5 } },
                expect: { state: { A: 15, B: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SUB C", {
                setup: { state: { A: 30, C: 20 } },
                expect: { state: { A: 10, C: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SUB D", {
                setup: { state: { A: 30, D: 20 } },
                expect: { state: { A: 10, D: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SUB E", {
                setup: { state: { A: 30, E: 20 } },
                expect: { state: { A: 10, E: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SUB H", {
                setup: { state: { A: 30, H: 20 } },
                expect: { state: { A: 10, H: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SUB L", {
                setup: { state: { A: 30, L: 20 } },
                expect: { state: { A: 10, L: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })

        it("SUB n", () => {
            runProgram("SUB 15", {
                setup: { state: { A: 35 } },
                expect: { state: { A: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })

        it("SUB (HL)", () => {
            runProgram("SUB (HL)", {
                setup: { state: { A: 55, HL: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })

        it("SUB (IX+2)", () => {
            runProgram("SUB (IX+2)", {
                setup: { state: { A: 100, IX: 25 }, memory: { 27: 50 } },
                expect: { state: { A: 50, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })
        it("SUB (IX)", () => {
            runProgram("SUB (IX)", {
                setup: { state: { A: 80, IX: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 30, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })
        it("SUB (IY+2)", () => {
            runProgram("SUB (IY+2)", {
                setup: { state: { A: 65, IY: 25 }, memory: { 27: 50 } },
                expect: { state: { A: 15, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })
        it("SUB (IY)", () => {
            runProgram("SUB (IY)", {
                setup: { state: { A: 55, IY: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })
    })

    describe("sbc", () => {
        it("SBC A, r", () => {
            runProgram("SBC A, A", {
                setup: { state: { A: 10 } },
                expect: { state: { A: 0, SFlag: 0, ZFlag: 1, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SBC A, B", {
                setup: { state: { A: 20, B: 5 } },
                expect: { state: { A: 15, B: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SBC A, C", {
                setup: { state: { A: 30, C: 20 } },
                expect: { state: { A: 10, C: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SBC A, D", {
                setup: { state: { A: 30, D: 20 } },
                expect: { state: { A: 10, D: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SBC A, E", {
                setup: { state: { A: 30, E: 20 } },
                expect: { state: { A: 10, E: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SBC A, H", {
                setup: { state: { A: 30, H: 20 } },
                expect: { state: { A: 10, H: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("SBC A, L", {
                setup: { state: { A: 30, L: 20 } },
                expect: { state: { A: 10, L: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })

        it("SBC A, n", () => {
            runProgram("SBC A, 15", {
                setup: { state: { A: 35 } },
                expect: { state: { A: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })

        it("SBC A, (HL)", () => {
            runProgram("SBC A, (HL)", {
                setup: { state: { A: 55, HL: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })

        it("SBC A, (IX+2)", () => {
            runProgram("SBC A, (IX+2)", {
                setup: { state: { A: 100, IX: 25 }, memory: { 27: 50 } },
                expect: { state: { A: 50, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })
        it("SBC A, (IX)", () => {
            runProgram("SBC A, (IX)", {
                setup: { state: { A: 80, IX: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 30, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })
        it("SBC A, (IY+2)", () => {
            runProgram("SBC A, (IY+2)", {
                setup: { state: { A: 65, IY: 25 }, memory: { 27: 50 } },
                expect: { state: { A: 15, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })
        it("SBC A, (IY)", () => {
            runProgram("SBC A, (IY)", {
                setup: { state: { A: 55, IY: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })
    })

    describe("and", () => {
        it("AND r", () => {
            runProgram("AND A", {
                setup: { state: { A: 10 } },
                expect: { state: { A: 10, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("AND B", {
                setup: { state: { A: 0xFF, B: 0x01 } },
                expect: { state: { A: 0x01, B: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("AND C", {
                setup: { state: { A: 0xFF, C: 0x01 } },
                expect: { state: { A: 0x01, C: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("AND D", {
                setup: { state: { A: 0xFF, D: 0x01 } },
                expect: { state: { A: 0x01, D: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("AND E", {
                setup: { state: { A: 0xFF, E: 0x01 } },
                expect: { state: { A: 0x01, E: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("AND H", {
                setup: { state: { A: 0xFF, H: 0x01 } },
                expect: { state: { A: 0x01, H: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("AND L", {
                setup: { state: { A: 0xFF, L: 0x01 } },
                expect: { state: { A: 0x01, L: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("AND n", () => {
            runProgram("AND 0x1F", {
                setup: { state: { A: 0xF1 } },
                expect: { state: { A: 0x11, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("AND (HL)", () => {
            runProgram("AND (HL)", {
                setup: { state: { A: 0xF1, HL: 15 }, memory: { 15: 0x0F } },
                expect: { state: { A: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("AND (IX+2)", () => {
            runProgram("AND (IX+2)", {
                setup: { state: { A: 0xFF, IX: 25 }, memory: { 27: 0xFF } },
                expect: { state: { A: 0xFF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("AND (IX)", () => {
            runProgram("AND (IX)", {
                setup: { state: { A: 0xFF, IX: 25 }, memory: { 25: 0xFF } },
                expect: { state: { A: 0xFF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("AND (IY+2)", () => {
            runProgram("AND (IY+2)", {
                setup: { state: { A: 0xFF, IY: 25 }, memory: { 27: 0xFF } },
                expect: { state: { A: 0xFF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("AND (IY)", () => {
            runProgram("AND (IY)", {
                setup: { state: { A: 0xFF, IY: 25 }, memory: { 25: 0xFF } },
                expect: { state: { A: 0xFF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
    })

    describe("or", () => {
        it("OR r", () => {
            runProgram("OR A", {
                setup: { state: { A: 10 } },
                expect: { state: { A: 10, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("OR B", {
                setup: { state: { A: 0xE1, B: 0x01 } },
                expect: { state: { A: 0xE1, B: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("OR C", {
                setup: { state: { A: 0xD1, C: 0x01 } },
                expect: { state: { A: 0xD1, C: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("OR D", {
                setup: { state: { A: 0xA1, D: 0x01 } },
                expect: { state: { A: 0xA1, D: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("OR E", {
                setup: { state: { A: 0xF1, E: 0x01 } },
                expect: { state: { A: 0xF1, E: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("OR H", {
                setup: { state: { A: 0xF1, H: 0x01 } },
                expect: { state: { A: 0xF1, H: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("OR L", {
                setup: { state: { A: 0xF1, L: 0x01 } },
                expect: { state: { A: 0xF1, L: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("OR n", () => {
            runProgram("OR 0x1F", {
                setup: { state: { A: 0xF1 } },
                expect: { state: { A: 0xFF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("OR (HL)", () => {
            runProgram("OR (HL)", {
                setup: { state: { A: 0xA1, HL: 15 }, memory: { 15: 0x0F } },
                expect: { state: { A: 0xAF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("OR (IX+2)", () => {
            runProgram("OR (IX+2)", {
                setup: { state: { A: 0xA1, IX: 25 }, memory: { 27: 0xFF } },
                expect: { state: { A: 0xFF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("OR (IX)", () => {
            runProgram("OR (IX)", {
                setup: { state: { A: 0xB1, IX: 25 }, memory: { 25: 0xFF } },
                expect: { state: { A: 0xFF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("OR (IY+2)", () => {
            runProgram("OR (IY+2)", {
                setup: { state: { A: 0xC1, IY: 25 }, memory: { 27: 0x0F } },
                expect: { state: { A: 0xCF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("OR (IY)", () => {
            runProgram("OR (IY)", {
                setup: { state: { A: 0xFF, IY: 25 }, memory: { 25: 0xFF } },
                expect: { state: { A: 0xFF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
    })
    
    describe("xor", () => {
        it("XOR r", () => {
            runProgram("XOR A", {
                setup: { state: { A: 25 } },
                expect: { state: { A: 0, SFlag: 0, ZFlag: 1, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("XOR B", {
                setup: { state: { A: 0xFF, B: 0x01 } },
                expect: { state: { A: 0xFE, B: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("XOR C", {
                setup: { state: { A: 0xFF, C: 0x01 } },
                expect: { state: { A: 0xFE, C: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("XOR D", {
                setup: { state: { A: 0xFF, D: 0x01 } },
                expect: { state: { A: 0xFE, D: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("XOR E", {
                setup: { state: { A: 0xFF, E: 0x01 } },
                expect: { state: { A: 0xFE, E: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("XOR H", {
                setup: { state: { A: 0xFF, H: 0x01 } },
                expect: { state: { A: 0xFE, H: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("XOR L", {
                setup: { state: { A: 0xFF, L: 0x01 } },
                expect: { state: { A: 0xFE, L: 0x01, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("XOR n", () => {
            runProgram("XOR 0x1F", {
                setup: { state: { A: 0x10 } },
                expect: { state: { A: 0x0F, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("XOR (HL)", () => {
            runProgram("XOR (HL)", {
                setup: { state: { A: 0x10, HL: 15 }, memory: { 15: 0x0F } },
                expect: { state: { A: 0x1F, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("XOR (IX+2)", () => {
            runProgram("XOR (IX+2)", {
                setup: { state: { A: 0xFF, IX: 25 }, memory: { 27: 0xFF } },
                expect: { state: { A: 0x00, SFlag: 0, ZFlag: 1, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("XOR (IX)", () => {
            runProgram("XOR (IX)", {
                setup: { state: { A: 0x0F, IX: 25 }, memory: { 25: 0xFF } },
                expect: { state: { A: 0xF0, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("XOR (IY+2)", () => {
            runProgram("XOR (IY+2)", {
                setup: { state: { A: 0xF0, IY: 25 }, memory: { 27: 0x0F } },
                expect: { state: { A: 0xFF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("XOR (IY)", () => {
            runProgram("XOR (IY)", {
                setup: { state: { A: 0xF0, IY: 25 }, memory: { 25: 0x0F } },
                expect: { state: { A: 0xFF, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
    })

    describe("cp", () => {
        it("CP r", () => {
            runProgram("CP A", {
                setup: { state: { A: 25 } },
                expect: { state: { A: 25, SFlag: 0, ZFlag: 1, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("CP B", {
                setup: { state: { A: 0xFF, B: 0x01 } },
                expect: { state: { A: 0xFF, B: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("CP C", {
                setup: { state: { A: 0xFE, C: 0x01 } },
                expect: { state: { A: 0xFE, C: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("CP D", {
                setup: { state: { A: 0xFC, D: 0x01 } },
                expect: { state: { A: 0xFC, D: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("CP E", {
                setup: { state: { A: 0xFD, E: 0x01 } },
                expect: { state: { A: 0xFD, E: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("CP H", {
                setup: { state: { A: 0xFB, H: 0x01 } },
                expect: { state: { A: 0xFB, H: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
            runProgram("CP L", {
                setup: { state: { A: 0xFA, L: 0x01 } },
                expect: { state: { A: 0xFA, L: 0x01, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })

        it("CP n", () => {
            runProgram("CP 0x1F", {
                setup: { state: { A: 0x1F } },
                expect: { state: { A: 0x1F, SFlag: 0, ZFlag: 1, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })

        it("CP (HL)", () => {
            runProgram("CP (HL)", {
                setup: { state: { A: 0x10, HL: 15 }, memory: { 15: 0x0F } },
                expect: { state: { A: 0x10, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })

        it("CP (IX+2)", () => {
            runProgram("CP (IX+2)", {
                setup: { state: { A: 0xFF, IX: 25 }, memory: { 27: 0xFF } },
                expect: { state: { A: 0xFF, SFlag: 0, ZFlag: 1, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })
        it("CP (IX)", () => {
            runProgram("CP (IX)", {
                setup: { state: { A: 0x20, IX: 25 }, memory: { 25: 0x25 } },
                expect: { state: { A: 0x20, SFlag: 1, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 1 } }
            })
        })
        it("CP (IY+2)", () => {
            runProgram("CP (IY+2)", {
                setup: { state: { A: 0xF0, IY: 25 }, memory: { 27: 0x0F } },
                expect: { state: { A: 0xF0, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })
        it("CP (IY)", () => {
            runProgram("CP (IY)", {
                setup: { state: { A: 0xF0, IY: 25 }, memory: { 25: 0x0F } },
                expect: { state: { A: 0xF0, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 1, CFlag: 0 } }
            })
        })
    })

    describe("inc", () => {
        it("INC r", () => {
            runProgram("INC A", { setup: { state: { A: 25 } }, expect: { state: { A: 26 }} })
            runProgram("INC B", { setup: { state: { B: 25 } }, expect: { state: { B: 26 }} })
            runProgram("INC C", { setup: { state: { C: 25 } }, expect: { state: { C: 26 }} })
            runProgram("INC D", { setup: { state: { D: 25 } }, expect: { state: { D: 26 }} })
            runProgram("INC E", { setup: { state: { E: 25 } }, expect: { state: { E: 26 }} })
            runProgram("INC L", { setup: { state: { L: 25 } }, expect: { state: { L: 26 }} })
            runProgram("INC H", { setup: { state: { H: 25 } }, expect: { state: { H: 26 }} })
        })

        it("INC (HL)", () => {
            runProgram("INC (HL)", { 
                setup: { state: { HL: 25 }, memory: { 25: 15 } }, 
                expect: { memory: { 25: 16 } }
            })
        })

        it("INC (IX+d)", () => {
            runProgram("INC (IX+1)", { 
                setup: { state: { IX: 25 }, memory: { 26: 15 } }, 
                expect: { memory: { 26: 16 } }
            })
        })

        it("INC (IY+d)", () => {
            runProgram("INC (IY+1)", { 
                setup: { state: { IY: 25 }, memory: { 26: 15 } }, 
                expect: { memory: { 26: 16 } }
            })
        })

        it("INC ss", () => {
            runProgram("INC BC", { 
                setup: { state: { BC: 25 }}, 
                expect: { state: { BC: 26 } }
            })
            runProgram("INC DE", { 
                setup: { state: { DE: 25 }}, 
                expect: { state: { DE: 26 } }
            })
            runProgram("INC HL", { 
                setup: { state: { HL: 25 }}, 
                expect: { state: { HL: 26 } }
            })
            runProgram("INC SP", { 
                setup: { state: { SP: 25 }}, 
                expect: { state: { SP: 26 } }
            })
        })

        it("INC IX", () => {
            runProgram("INC IX", { 
                setup: { state: { IX: 25 }}, 
                expect: { state: { IX: 26 } }
            })
        })
        it("INC IY", () => {
            runProgram("INC IY", { 
                setup: { state: { IY: 25 }}, 
                expect: { state: { IY: 26 } }
            })
        })
    })

    describe("dec", () => {
        it("DEC r", () => {
            runProgram("DEC A", { setup: { state: { A: 25 } }, expect: { state: { A: 24 }} })
            runProgram("DEC B", { setup: { state: { B: 25 } }, expect: { state: { B: 24 }} })
            runProgram("DEC C", { setup: { state: { C: 25 } }, expect: { state: { C: 24 }} })
            runProgram("DEC D", { setup: { state: { D: 25 } }, expect: { state: { D: 24 }} })
            runProgram("DEC E", { setup: { state: { E: 25 } }, expect: { state: { E: 24 }} })
            runProgram("DEC L", { setup: { state: { L: 25 } }, expect: { state: { L: 24 }} })
            runProgram("DEC H", { setup: { state: { H: 25 } }, expect: { state: { H: 24 }} })
        })

        it("DEC (HL)", () => {
            runProgram("DEC (HL)", { 
                setup: { state: { HL: 25 }, memory: { 25: 15 } }, 
                expect: { memory: { 25: 14 } }
            })
        })

        it("DEC (IX+d)", () => {
            runProgram("DEC (IX+1)", { 
                setup: { state: { IX: 25 }, memory: { 26: 15 } }, 
                expect: { memory: { 26: 14 } }
            })
        })

        it("DEC (IY+d)", () => {
            runProgram("DEC (IY+1)", { 
                setup: { state: { IY: 25 }, memory: { 26: 15 } }, 
                expect: { memory: { 26: 14 } }
            })
        })

        it("DEC ss", () => {
            runProgram("DEC BC", {
                setup: { state: { BC: 12345 }},
                expect: { state: { BC: 12344 }}
            })
            runProgram("DEC DE", {
                setup: { state: { DE: 12345 }},
                expect: { state: { DE: 12344 }}
            })
            runProgram("DEC HL", {
                setup: { state: { HL: 12345 }},
                expect: { state: { HL: 12344 }}
            })
            runProgram("DEC SP", {
                setup: { state: { SP: 12345 }},
                expect: { state: { SP: 12344 }}
            })
        })

        it("DEC IX", () => {
            runProgram("DEC IX", {
                setup: { state: { IX: 12345 }},
                expect: { state: { IX: 12344 }}
            })
        })
        it("DEC IY", () => {
            runProgram("DEC IY", {
                setup: { state: { IY: 12345 }},
                expect: { state: { IY: 12344 }}
            })
        })


    })

    it("DAA", () => {
        runProgram("DAA", {
            setup: { state: { A: 0, CFlag: 0, HFlag: 0 }},
            expect: { state: { A: 0, CFlag: 0, HFlag: 0 }}
        })
        runProgram("DAA", {
            setup: { state: { A: 0x5A, CFlag: 0, HFlag: 0 }},
            expect: { state: { A: 0x60, CFlag: 0, HFlag: 1 }}
        })
        runProgram("DAA", {
            setup: { state: { A: 0x22, CFlag: 1, HFlag: 1 }},
            expect: { state: { A: 0x88, CFlag: 1, HFlag: 0 }}
        })
        runProgram("DAA", {
            setup: { state: { A: 0xA3, CFlag: 0, HFlag: 1 }},
            expect: { state: { A: 0x09, CFlag: 1, HFlag: 0 }}
        })
        runProgram("DAA", {
            setup: { state: { A: 0x79, CFlag: 1, HFlag: 0, NFlag: 1 }},
            expect: { state: { A: 0x19, CFlag: 1, HFlag: 0 }}
        })
    })

    it("CPL", () => {
        runProgram("CPL", {
            setup: { state: { A: 0b00000000 }},
            expect: { state: { A: 0b11111111, HFlag: 1, NFlag: 1 }}
        })
        runProgram("CPL", {
            setup: { state: { A: 0b10101010 }},
            expect: { state: { A: 0b01010101, HFlag: 1, NFlag: 1 }}
        })
    })

    it("NEG", () => {
        runProgram("NEG", {
            setup: { state: { A: 0b00000000 }},
            expect: { state: { A: 0b00000000, HFlag: 0, NFlag: 1 }}
        })
        runProgram("NEG", {
            setup: { state: { A: 255 }},
            expect: { state: { A: 1, HFlag: 0, NFlag: 1 }}
        })
        runProgram("NEG", {
            setup: { state: { A: 0x80 }},
            expect: { state: { A: 0x80, HFlag: 0, NFlag: 1 }}
        })
    })

    it("CCF", () => {
        runProgram("CCF", {
            setup: { state: { CFlag: 1 }},
            expect: { state: { CFlag: 0 }}
        })
        runProgram("CCF", {
            setup: { state: { CFlag: 0 }},
            expect: { state: { CFlag: 1 }}
        })
    })
    it("SCF", () => {
        runProgram("SCF", {
            setup: { state: { CFlag: 1 }},
            expect: { state: { CFlag: 1 }}
        })
        runProgram("CCF", {
            setup: { state: { CFlag: 0 }},
            expect: { state: { CFlag: 1 }}
        })
    })

    it("DI", () => {
        runProgram("DI", {
            setup: { state: { IFF: 1 }},
            expect: { state: { IFF: 0 }}
        })
        runProgram("DI", {
            setup: { state: { IFF: 0 }},
            expect: { state: { IFF: 0 }}
        })
    })

    it("EI", () => {
        runProgram("EI", {
            setup: { state: { IFF: 1 }},
            expect: { state: { IFF: 1 }}
        })
        runProgram("EI", {
            setup: { state: { IFF: 0 }},
            expect: { state: { IFF: 1 }}
        })
    })

    it ("IM 0", () => {
        runProgram("IM 0", {
            setup: { state: { IM0: 0 }},
            expect: { state: { IM0: 1 }},
        })
    })
    it ("IM 1", () => {
        runProgram("IM 1", {
            setup: { state: { IM1: 0 }},
            expect: { state: { IM1: 1 }},
        })
    })
    it ("IM 2", () => {
        runProgram("IM 2", {
            setup: { state: { IM2: 0 }},
            expect: { state: { IM2: 1 }},
        })
    })

    it("RLCA", () => {
        runProgram("RLCA", {
            setup: { state: { CFlag: 0, A: 0b10001000 }},
            expect: { state: { CFlag: 1, A: 0b00010001 }}
        })
        runProgram("RLCA", {
            setup: { state: { A: 0b11111111 }},
            expect: { state: { CFlag: 1, A: 0b11111111 }}
        })
    })

    it("RRCA", () => {
        runProgram("RRCA", {
            setup: { state: { CFlag: 0, A: 0b00010000 }},
            expect: { state: { CFlag: 0, A: 0b00001000 }}
        })
        runProgram("RRCA", {
            setup: { state: { CFlag: 0, A: 0b10010001 }},
            expect: { state: { CFlag: 1, A: 0b11001000 }}
        })
    })

    it("RLA", () => {
        runProgram("RLA", {
            setup: { state: { CFlag: 0, A: 0b10001000 }},
            expect: { state: { CFlag: 1, A: 0b00010000 }}
        })
        runProgram("RLA", {
            setup: { state: { CFlag: 1, A: 0b01110110 }},
            expect: { state: { CFlag: 0, A: 0b11101101 }}
        })
        runProgram("RLA", {
            setup: { state: { A: 0b11111111 }},
            expect: { state: { CFlag: 1, A: 0b11111110 }}
        })
    })

    it("RRA", () => {
        runProgram("RRA", {
            setup: { state: { CFlag: 0, A: 0b00010000 }},
            expect: { state: { CFlag: 0, A: 0b00001000 }}
        })
        runProgram("RRA", {
            setup: { state: { CFlag: 0, A: 0b10010001 }},
            expect: { state: { CFlag: 1, A: 0b01001000 }}
        })
    })

    describe("RLC", () => {
        it("RLC r", () => {
            runProgram("RLC B", {
                setup: { state: { CFlag: 0, B: 0b10001000 }},
                expect: { state: { CFlag: 1, B: 0b00010001 }}
            })
            runProgram("RLC L", {
                setup: { state: { CFlag: 0, L: 0b10001000 }},
                expect: { state: { CFlag: 1, L: 0b00010001 }}
            })
        })
        it("RLC (HL)", () => {
            runProgram("RLC (HL)", {
                setup: { state: { CFlag: 0, HL: 40 }, memory: { 40: 0b00001000 }},
                expect: { state: { CFlag: 0, HL: 40 }, memory: { 40: 0b00010000 }},
            })
        })
        it("RLC (IX+d)", () => {
            runProgram("RLC (IX+4)", {
                setup: { state: { CFlag: 0, IX: 40 }, memory: { 44: 0b00001000 }},
                expect: { state: { CFlag: 0, IX: 40 }, memory: { 44: 0b00010000 }},
            })
        })
        it("RLC (IY+d)", () => {
            runProgram("RLC (IY+4)", {
                setup: { state: { CFlag: 0, IY: 40 }, memory: { 44: 0b10001000 }},
                expect: { state: { CFlag: 1, IY: 40 }, memory: { 44: 0b00010001 }},
            })
        })
    })

    describe("RRC", () => {
        it("RRC r", () => {
            runProgram("RRC B", {
                setup: { state: { CFlag: 0, B: 0b10001001 }},
                expect: { state: { CFlag: 1, B: 0b11000100 }}
            })
            runProgram("RRC L", {
                setup: { state: { CFlag: 0, L: 0b10001001 }},
                expect: { state: { CFlag: 1, L: 0b11000100 }}
            })
        })
        it("RRC (HL)", () => {
            runProgram("RRC (HL)", {
                setup: { state: { CFlag: 0, HL: 40 }, memory: { 40: 0b10001001 }},
                expect: { state: { CFlag: 1, HL: 40 }, memory: { 40: 0b11000100 }},
            })
        })
        it("RRC (IX+d)", () => {
            runProgram("RRC (IX+4)", {
                setup: { state: { CFlag: 0, IX: 40 }, memory: { 44: 0b10001001 }},
                expect: { state: { CFlag: 1, IX: 40 }, memory: { 44: 0b11000100 }},
            })
        })
        it("RRC (IY+d)", () => {
            runProgram("RRC (IY+4)", {
                setup: { state: { CFlag: 0, IY: 40 }, memory: { 44: 0b10001001 }},
                expect: { state: { CFlag: 1, IY: 40 }, memory: { 44: 0b11000100 }},
            })
        })
    })

    describe("RL", () => {
        it ("RL r", () => {
            runProgram("RL A", {
                setup: { state: { CFlag: 0, A: 0b10001000 }},
                expect: { state: { CFlag: 1, A: 0b00010000 }}
            })
            runProgram("RL H", {
                setup: { state: { CFlag: 0, H: 0b10001000 }},
                expect: { state: { CFlag: 1, H: 0b00010000 }}
            })
        })
        it ("RL (HL)", () => {
            runProgram("RL (HL)", {
                setup: { state: { CFlag: 0, HL: 40 }, memory: { 40: 0b10001000 }},
                expect: { state: { CFlag: 1, HL: 40 }, memory: { 40: 0b00010000 }}
            })
        })
        it ("RL (IX+d)", () => {
            runProgram("RL (IX+5)", {
                setup: { state: { CFlag: 0, IX: 40 }, memory: { 45: 0b10001000 }},
                expect: { state: { CFlag: 1, IX: 40 }, memory: { 45: 0b00010000 }}
            })
        })
        it ("RL (IY+d)", () => {
            runProgram("RL (IY+5)", {
                setup: { state: { CFlag: 0, IY: 40 }, memory: { 45: 0b10001000 }},
                expect: { state: { CFlag: 1, IY: 40 }, memory: { 45: 0b00010000 }}
            })
        })
    })

    describe("RR", () => {
        it("RR r", () => {
            runProgram("RR B", {
                setup: { state: { CFlag: 1, B: 0b10001000 }},
                expect: { state: { CFlag: 0, B: 0b11000100 }}
            })
            runProgram("RR L", {
                setup: { state: { CFlag: 1, L: 0b10001000 }},
                expect: { state: { CFlag: 0, L: 0b11000100 }}
            })
        })
        it("RR (HL)", () => {
            runProgram("RR (HL)", {
                setup: { state: { CFlag: 1, HL: 40 }, memory: { 40: 0b10001000 }},
                expect: { state: { CFlag: 0, HL: 40 }, memory: { 40: 0b11000100 }},
            })
        })
        it("RR (IX+d)", () => {
            runProgram("RR (IX+4)", {
                setup: { state: { CFlag: 1, IX: 40 }, memory: { 44: 0b10001000 }},
                expect: { state: { CFlag: 0, IX: 40 }, memory: { 44: 0b11000100 }},
            })
        })
        it("RR (IY+d)", () => {
            runProgram("RR (IY+4)", {
                setup: { state: { CFlag: 1, IY: 40 }, memory: { 44: 0b10001000 }},
                expect: { state: { CFlag: 0, IY: 40 }, memory: { 44: 0b11000100 }},
            })
        })
    })

    describe("SLA", () => {
        it("SLA r", () => {
            runProgram("SLA B", {
                setup: { state: { B: 0b11111111 }},
                expect: { state: { CFlag: 1, B: 0b11111110 }}
            })
            runProgram("SLA L", {
                setup: { state: { L: 0b11111111 }},
                expect: { state: { CFlag: 1, L: 0b11111110 }}
            })
        })
        it("SLA (HL)", () => {
            runProgram("SLA (HL)", {
                setup: { state: { HL: 40 }, memory: { 40: 0b11111111 }},
                expect: { state: { CFlag: 1, HL: 40 }, memory: { 40: 0b11111110 }},
            })
        })
        it("SLA (IX+d)", () => {
            runProgram("SLA (IX+4)", {
                setup: { state: { IX: 40 }, memory: { 44: 0b11111111 }},
                expect: { state: { CFlag: 1, IX: 40 }, memory: { 44: 0b11111110 }},
            })
        })
        it("SLA (IY+d)", () => {
            runProgram("SLA (IY+4)", {
                setup: { state: { IY: 40 }, memory: { 44: 0b11111111 }},
                expect: { state: { CFlag: 1, IY: 40 }, memory: { 44: 0b11111110 }},
            })
        })
    })

    describe("SRA", () => {
        it("SRA r", () => {
            runProgram("SRA B", {
                setup: { state: { B: 0b11111111 }},
                expect: { state: { CFlag: 1, B: 0b10111111 }}
            })
            runProgram("SRA L", {
                setup: { state: { L: 0b11111111 }},
                expect: { state: { CFlag: 1, L: 0b10111111 }}
            })
        })
        it("SRA (HL)", () => {
            runProgram("SRA (HL)", {
                setup: { state: { HL: 40 }, memory: { 40: 0b11111111 }},
                expect: { state: { CFlag: 1, HL: 40 }, memory: { 40: 0b10111111 }},
            })
        })
        it("SRA (IX+d)", () => {
            runProgram("SRA (IX+4)", {
                setup: { state: { IX: 40 }, memory: { 44: 0b11111111 }},
                expect: { state: { CFlag: 1, IX: 40 }, memory: { 44: 0b10111111 }},
            })
        })
        it("SRA (IY+d)", () => {
            runProgram("SRA (IY+4)", {
                setup: { state: { IY: 40 }, memory: { 44: 0b11111111 }},
                expect: { state: { CFlag: 1, IY: 40 }, memory: { 44: 0b10111111 }},
            })
        })
    })

    describe("SRL", () => {
        it("SRL r", () => {
            runProgram("SRL B", {
                setup: { state: { B: 0b11111111 }},
                expect: { state: { CFlag: 1, B: 0b01111111 }}
            })
            runProgram("SRL L", {
                setup: { state: { L: 0b11111111 }},
                expect: { state: { CFlag: 1, L: 0b01111111 }}
            })
        })
        it("SRL (HL)", () => {
            runProgram("SRL (HL)", {
                setup: { state: { HL: 40 }, memory: { 40: 0b11111111 }},
                expect: { state: { CFlag: 1, HL: 40 }, memory: { 40: 0b01111111 }},
            })
        })
        it("SRL (IX+d)", () => {
            runProgram("SRL (IX+4)", {
                setup: { state: { IX: 40 }, memory: { 44: 0b11111111 }},
                expect: { state: { CFlag: 1, IX: 40 }, memory: { 44: 0b01111111 }},
            })
        })
        it("SRL (IY+d)", () => {
            runProgram("SRL (IY+4)", {
                setup: { state: { IY: 40 }, memory: { 44: 0b11111111 }},
                expect: { state: { CFlag: 1, IY: 40 }, memory: { 44: 0b01111111 }},
            })
        })
    })

    it("RLD", () => {
        runProgram("RLD", {
            setup: { state: { HL: 20 }, memory: { 20: 0b00011011 }},
            expect: { state: { HL: 20 }, memory: { 20: 0b00101101 }},
        })
    })
    it("RRD", () => {
        runProgram("RRD", {
            setup: { state: { HL: 20 }, memory: { 20: 0b00011011 }},
            expect: { state: { HL: 20 }, memory: { 20: 0b00110110 }},
        })
    })

    describe("BIT", () => {
        it("BIT b, r", () => {
            runProgram("BIT 5, C", {
                setup: {state: { C: 0b00100000 }},
                expect: { state: { ZFlag: 1 }}
            })
            runProgram("BIT 2, L", {
                setup: {state: { L: 0b00100000 }},
                expect: { state: { ZFlag: 0 }}
            })
            runProgram("BIT 3, H", {
                setup: {state: { H: 0b00001000 }},
                expect: { state: { ZFlag: 1 }}
            })
        })

        it("BIT b, (HL)", () => {
            runProgram("BIT 5, (HL)", {
                setup: {state: { HL: 15 }, memory: { 15: 0b00100000 }},
                expect: { state: { ZFlag: 1 }}
            })
            runProgram("BIT 5, (HL)", {
                setup: {state: { HL: 15 }, memory: { 15: 0b00010000 }},
                expect: { state: { ZFlag: 0 }}
            })
        })
        it("BIT b, (IX+d)", () => {
            runProgram("BIT 5, (IX+2)", {
                setup: {state: { IX: 15 }, memory: { 17: 0b00100000 }},
                expect: { state: { ZFlag: 1 }}
            })
            runProgram("BIT 5, (IX+2)", {
                setup: {state: { IX: 15 }, memory: { 17: 0b00010000 }},
                expect: { state: { ZFlag: 0 }}
            })
        })
        it("BIT b, (IY+d)", () => {
            runProgram("BIT 5, (IY+2)", {
                setup: {state: { IY: 15 }, memory: { 17: 0b00100000 }},
                expect: { state: { ZFlag: 1 }}
            })
            runProgram("BIT 5, (IY+2)", {
                setup: {state: { IY: 15 }, memory: { 17: 0b00010000 }},
                expect: { state: { ZFlag: 0 }}
            })
        })
    })

    describe("SET", () => {
        it("SET b, r", () => {
            runProgram("SET 0, L", {
                setup: {state: { L: 0b00000000 }},
                expect: { state: { L: 0b00000001 }}
            })
            runProgram("SET 1, C", {
                setup: {state: { C: 0b00100000 }},
                expect: { state: { C: 0b00100010 }}
            })
        })
        it("SET b, (HL)", () => {
            runProgram("SET 0, (HL)", {
                setup: {state: { HL: 40 }, memory: {40: 0b00001110 }},
                expect: { memory: { 40: 0b00001111 }}
            })
            runProgram("SET 5, (HL)", {
                setup: {state: { HL: 40 }, memory: {40: 0b00001110 }},
                expect: { memory: { 40: 0b00101110 }}
            })
        })
        it("SET b, (IX+d)", () => {
            runProgram("SET 0, (IX+1)", {
                setup: {state: { IX: 40 }, memory: {41: 0b00001110 }},
                expect: { memory: { 41: 0b00001111 }}
            })
            runProgram("SET 5, (IX+1)", {
                setup: {state: { IX: 40 }, memory: {41: 0b00101110 }},
                expect: { memory: { 41: 0b00101110 }}
            })
        })
        it("SET b, (IY+d)", () => {
            runProgram("SET 0, (IY+1)", {
                setup: {state: { IY: 40 }, memory: {41: 0b00001110 }},
                expect: { memory: { 41: 0b00001111 }}
            })
            runProgram("SET 5, (IY+1)", {
                setup: {state: { IY: 40 }, memory: {41: 0b00101110 }},
                expect: { memory: { 41: 0b00101110 }}
            })
        })
    })
    describe("RES", () => {
        it("RES b, r", () => {
            runProgram("RES 0, L", {
                setup: {state: { L: 0b00000000 }},
                expect: { state: { L: 0b00000000 }}
            })
            runProgram("RES 1, C", {
                setup: {state: { C: 0b00100010 }},
                expect: { state: { C: 0b00100000 }}
            })
        })
        it("RES b, (HL)", () => {
            runProgram("RES 0, (HL)", {
                setup: {state: { HL: 40 }, memory: {40: 0b00001110 }},
                expect: { memory: { 40: 0b00001110 }}
            })
            runProgram("RES 5, (HL)", {
                setup: {state: { HL: 40 }, memory: {40: 0b00001110 }},
                expect: { memory: { 40: 0b00001110 }}
            })
        })
        it("RES b, (IX+d)", () => {
            runProgram("RES 0, (IX+1)", {
                setup: {state: { IX: 40 }, memory: {41: 0b00001111 }},
                expect: { memory: { 41: 0b00001110 }}
            })
            runProgram("RES 5, (IX+1)", {
                setup: {state: { IX: 40 }, memory: {41: 0b00101110 }},
                expect: { memory: { 41: 0b00001110 }}
            })
        })
        it("RES b, (IY+d)", () => {
            runProgram("RES 0, (IY+1)", {
                setup: {state: { IY: 40 }, memory: {41: 0b00001111 }},
                expect: { memory: { 41: 0b00001110 }}
            })
            runProgram("RES 5, (IY+1)", {
                setup: {state: { IY: 40 }, memory: {41: 0b00101110 }},
                expect: { memory: { 41: 0b00001110 }}
            })
        })

        describe("JP", () => {
            it ("JP nn", () => {
                runProgram("JP 20", {
                    step: 3,
                    expect: { IP: 20 }
                })
            })

            it("JP (HL)", () => {
                runProgram("JP (HL)", {
                    step: 1,
                    setup: { state: { HL: 18 }},
                    expect: { state: { IP: 18 }}
                })
            })
            it("JP (IX)", () => {
                runProgram("JP (IX)", {
                    step: 2,
                    setup: { state: { IX: 18 }},
                    expect: { state: { IP: 18 }}
                })
            })
            it("JP (IY)", () => {
                runProgram("JP (IY)", {
                    step: 2,
                    setup: { state: { IY: 18 }},
                    expect: { state: { IP: 18 }}
                })
            })

            it ("JP cc, nn", () => {
                runProgram("JP NZ, 20", {
                    step: 3,
                    setup: { state: { ZFlag: 0 } },
                    expect: { state: { IP: 20 } }
                })
                runProgram("JP Z, 20", {
                    step: 3,
                    setup: { state: { ZFlag: 0 } },
                    expect: { state: { IP: 3 } }
                })
                runProgram("JP NC, 20", {
                    step: 3,
                    setup: { state: { CFlag: 1 } },
                    expect: { state: { IP: 3 } }
                })
                runProgram("JP C, 20", {
                    step: 3,
                    setup: { state: { CFlag: 1 } },
                    expect: { state: { IP: 20 } }
                })
                runProgram("JP PO, 20", {
                    step: 3,
                    setup: { state: { PVFlag: 0 } },
                    expect: { state: { IP: 20 } }
                })
                runProgram("JP PE, 20", {
                    step: 3,
                    setup: { state: { PVFlag: 0 } },
                    expect: { state: { IP: 3 } }
                })
                runProgram("JP P, 20", {
                    step: 3,
                    setup: { state: { SFlag: 1 } },
                    expect: { state: { IP: 3 } }
                })
                runProgram("JP M, 20", {
                    step: 3,
                    setup: { state: { SFlag: 1 } },
                    expect: { state: { IP: 20 } }
                })
            })
        })

        describe("JR", () => {
            it ("JP e", () => {
                runProgram("NOP\nJR 5", {
                    step: 4,
                    expect: { state: { IP: 6 } }
                })
            })

            it("JR cc, e", () => {
                runProgram("NOP\nJR C, 10", {
                    step: 4,
                    setup: { state: { CFlag: 1 }},
                    expect: { state: { IP: 11 }}
                })
                runProgram("NOP\nJR C, 10", {
                    step: 3,
                    setup: { state: { CFlag: 0 }},
                    expect: { state: { IP: 3 }}
                })
                runProgram("NOP\nJR NC, 10", {
                    step: 8,
                    setup: { state: { CFlag: 1 }},
                    expect: { state: { IP: 3 }}
                })
                runProgram("NOP\nJR NC, 10", {
                    step: 4,
                    setup: { state: { CFlag: 0 }},
                    expect: { state: { IP: 11 }}
                })
                runProgram("NOP\nJR Z, 10", {
                    step: 4,
                    setup: { state: { ZFlag: 1 }},
                    expect: { state: { IP: 11 }}
                })
                runProgram("NOP\nJR Z, 10", {
                    step: 3,
                    setup: { state: { ZFlag: 0 }},
                    expect: { state: { IP: 3 }}
                })
                runProgram("NOP\nJR NZ, 10", {
                    step: 3,
                    setup: { state: { ZFlag: 1 }},
                    expect: { state: { IP: 3 }}
                })
                runProgram("NOP\nJR NZ, 10", {
                    step: 4,
                    setup: { state: { ZFlag: 0 }},
                    expect: { state: { IP: 11 }}
                })
            })
        })
        
        it("DJNZ", () => {
            runProgram("NOP\nDJNZ 10", {
                step: 4,
                setup: { state: { B: 2 }},
                expect: { state: { IP: 11, B: 1 }}
            })
            runProgram("NOP\nDJNZ 10", {
                step: 3,
                setup: { state: { B: 1 }},
                expect: { state: { IP: 3, B: 0 }}
            })
        })

        describe("CALL", () => {
            it ("CALL nn", () => {
                runProgram("NOP\nCALL 50", {
                    step: 6,
                    setup: { state: { SP: 20 }},
                    expect: { state: { SP: 18, IP: 50 }, memory: { 19: 0, 18: 1 }}
                })
            })

            it ("CALL cc, nn", () => {
                runProgram("NOP\nCALL Z, 50", {
                    step: 6,
                    setup: { state: { SP: 20, ZFlag: 1 }},
                    expect: { state: { SP: 18, IP: 50 }, memory: { 19: 0, 18: 1 }}
                })
                runProgram("NOP\nCALL Z, 50", {
                    step: 4,
                    setup: { state: { SP: 20, ZFlag: 0 }},
                    expect: { state: { SP: 20, IP: 4 }}
                })
            })
        })

        describe("RET", () => {
            it("RET", () => {
                runProgram("NOP\nRET", {
                    step: 4,
                    setup: { state: { SP: 18 }, memory: { 19: 1, 18: 5 }},
                    expect: { state: { SP: 20, IP: 0x0105 }}
                })
            })

            it ("RET cc", () => {
                runProgram("NOP\nRET C", {
                    step: 4,
                    setup: { state: { SP: 18, CFlag: 1 }, memory: { 19: 1, 18: 5 }},
                    expect: { state: { SP: 20, IP: 0x0105 }}
                })
                runProgram("NOP\nRET C", {
                    step: 2,
                    setup: { state: { SP: 18, CFlag: 0 }, memory: { 19: 1, 18: 5 }},
                    expect: { state: { SP: 18, IP: 2 }}
                })
            })
        })
    })
})

function runProgram(program, opts) {
    opts = opts || {}

    const vm = createVm(program, opts.setup || {})
    if (opts.step) {
        const count = typeof(opts.step) === "number" ? opts.step : 1
        for (let i = 0; i < count; i++) {
            vm.step()
        }
    } else {
        vm.run()
    }

    if (opts.expect) {
        if (opts.expect.state) {
            expect(vm.state).toMatchObject(opts.expect.state)
        }
        if (opts.expect.memory) {
            for (const [address, value] of Object.entries(opts.expect.memory)) {
                expect(vm.state.memory[address]).toBe(value)
            }
        }
    }

    return vm.state
}

function createVm(program, setup) {

    setup = setup || {}

    const assembler = buildAssembler(config)

    const initialImage = assembler.assemble(program + "\nhalt")

    for (const [address, value] of Object.entries(setup.memory || {})) {
        initialImage[address] = value
    }

    for (let i = 0; i < initialImage.length; i++) {
        if (initialImage[i] === undefined) {
            initialImage[i] = 0
        }
    }

    return buildVm(config, { initialImage, state: setup.state})
}
