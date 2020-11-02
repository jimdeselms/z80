const Assembler = require('./assembler/assembler')
const Vm = require('./vm/vm')
const { bit16ToBytes } = require('./helpers')

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

                // expect(runProgram("LD BC, (25)", { memory: { 25: 2000 }})).toMatchObject({ BC: 2000 })
                // expect(runProgram("LD DE, (17)", { memory: { 17: 4096 }})).toMatchObject({ DE: 4096 })
                // expect(runProgram("LD HL, (50)", { memory: { 50: 1234 }})).toMatchObject({ HL: 1234 })
                // expect(runProgram("LD SP, (40)", { memory: { 40: 4999 }})).toMatchObject({ SP: 4999 })
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

            it ("LD (nn), HL", () => {
                runProgram("LD (16h), HL", { 
                    setup: { state: { HL: 0x1234 }},
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
    })

    describe("sub", () => {
        it("SUB A, r", () => {
            runProgram("SUB A, A", {
                setup: { state: { A: 10 } },
                expect: { state: { A: 0, SFlag: 0, ZFlag: 1, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SUB A, B", {
                setup: { state: { A: 20, B: 5 } },
                expect: { state: { A: 15, B: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SUB A, C", {
                setup: { state: { A: 30, C: 20 } },
                expect: { state: { A: 10, C: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SUB A, D", {
                setup: { state: { A: 30, D: 20 } },
                expect: { state: { A: 10, D: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SUB A, E", {
                setup: { state: { A: 30, E: 20 } },
                expect: { state: { A: 10, E: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SUB A, H", {
                setup: { state: { A: 30, H: 20 } },
                expect: { state: { A: 10, H: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SUB A, L", {
                setup: { state: { A: 30, L: 20 } },
                expect: { state: { A: 10, L: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("SUB A, n", () => {
            runProgram("SUB A, 15", {
                setup: { state: { A: 35 } },
                expect: { state: { A: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("SUB A, (HL)", () => {
            runProgram("SUB A, (HL)", {
                setup: { state: { A: 55, HL: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("SUB A, (IX+2)", () => {
            runProgram("SUB A, (IX+2)", {
                setup: { state: { A: 100, IX: 25 }, memory: { 27: 50 } },
                expect: { state: { A: 50, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("SUB A, (IX)", () => {
            runProgram("SUB A, (IX)", {
                setup: { state: { A: 80, IX: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 30, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("SUB A, (IY+2)", () => {
            runProgram("SUB A, (IY+2)", {
                setup: { state: { A: 65, IY: 25 }, memory: { 27: 50 } },
                expect: { state: { A: 15, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("SUB A, (IY)", () => {
            runProgram("SUB A, (IY)", {
                setup: { state: { A: 55, IY: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
    })
    describe("sbc", () => {
        it("SBC A, r", () => {
            runProgram("SBC A, A", {
                setup: { state: { A: 10 } },
                expect: { state: { A: 0, SFlag: 0, ZFlag: 1, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SBC A, B", {
                setup: { state: { A: 20, B: 5 } },
                expect: { state: { A: 15, B: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SBC A, C", {
                setup: { state: { A: 30, C: 20 } },
                expect: { state: { A: 10, C: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SBC A, D", {
                setup: { state: { A: 30, D: 20 } },
                expect: { state: { A: 10, D: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SBC A, E", {
                setup: { state: { A: 30, E: 20 } },
                expect: { state: { A: 10, E: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SBC A, H", {
                setup: { state: { A: 30, H: 20 } },
                expect: { state: { A: 10, H: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
            runProgram("SBC A, L", {
                setup: { state: { A: 30, L: 20 } },
                expect: { state: { A: 10, L: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("SBC A, n", () => {
            runProgram("SBC A, 15", {
                setup: { state: { A: 35 } },
                expect: { state: { A: 20, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("SBC A, (HL)", () => {
            runProgram("SBC A, (HL)", {
                setup: { state: { A: 55, HL: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })

        it("SBC A, (IX+2)", () => {
            runProgram("SBC A, (IX+2)", {
                setup: { state: { A: 100, IX: 25 }, memory: { 27: 50 } },
                expect: { state: { A: 50, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("SBC A, (IX)", () => {
            runProgram("SBC A, (IX)", {
                setup: { state: { A: 80, IX: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 30, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("SBC A, (IY+2)", () => {
            runProgram("SBC A, (IY+2)", {
                setup: { state: { A: 65, IY: 25 }, memory: { 27: 50 } },
                expect: { state: { A: 15, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
        it("SBC A, (IY)", () => {
            runProgram("SBC A, (IY)", {
                setup: { state: { A: 55, IY: 25 }, memory: { 25: 50 } },
                expect: { state: { A: 5, SFlag: 0, ZFlag: 0, PVFlag: 0, NFlag: 0, CFlag: 0 } }
            })
        })
    })
})

function runProgram(program, opts) {
    opts = opts || {}

    const vm = createVm(program, opts.setup || {})
    if (opts.step) {
        vm.step()
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

    const initialImage = Assembler.assemble(program + "\nhalt")

    for (const [address, value] of Object.entries(setup.memory || {})) {
        initialImage[address] = value
    }

    for (let i = 0; i < initialImage.length; i++) {
        if (initialImage[i] === undefined) {
            initialImage[i] = 0
        }
    }

    return new Vm({initialImage, state: setup.state})
}
