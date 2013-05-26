var Reactor;
(function (Reactor) {
    var SimulationParameters = (function () {
        function SimulationParameters() {
            this.sceneWidth = 650;
            this.sceneHeight = 650;
            this.heatLevel = 100;
            var k = 0.5;
            var defaultSize = 5;
            var defaultMass = 1;
            var defaultViscosity = 2;
            this.particleTypes = {
                'water': {
                    name: 'water',
                    color: '#0000ff',
                    size: defaultSize,
                    mass: defaultMass,
                    viscosity: defaultViscosity,
                    bondEndPointNames: []
                },
                'cyto': {
                    name: 'cyto',
                    color: '#eac313',
                    size: defaultSize,
                    mass: defaultMass,
                    viscosity: defaultViscosity,
                    bondEndPointNames: []
                },
                'phobic': {
                    name: 'phobic',
                    color: '#ff0000',
                    size: defaultSize,
                    mass: defaultMass,
                    viscosity: defaultViscosity,
                    bondEndPointNames: [
                        'a'
                    ]
                },
                'philic': {
                    name: 'philic',
                    color: '#bbb',
                    size: defaultSize,
                    mass: defaultMass,
                    viscosity: defaultViscosity,
                    bondEndPointNames: [
                        'b'
                    ]
                }
            };
            this.particleGenerationScenario = "start\n" + "  drop 80 'water' anywhere immediately\n" + "  drop 200 'philic' anywhere immediately\n" + "after 5 seconds\n" + "  drop 200 'phobic' anywhere in 10 seconds\n" + "end";
            this.wallsForce = {
                range: 5,
                amplitude: 200
            };
            var defaultBond = {
                color: '#000',
                amplitude: -k * 8,
                neutralRange: 16,
                maxRange: 30
            };
            this.possibleBondsBetweenEndPoints = {
                'a': {
                    'a': null,
                    'b': defaultBond
                },
                'b': {
                    'a': defaultBond,
                    'b': null
                }
            };
            var nullForce = {
                range: 25,
                amplitude: 0
            };
            this.attractiveForcesBetweenParticles = {
                'water': {
                    'water': nullForce,
                    'cyto': nullForce,
                    'phobic': nullForce,
                    'philic': nullForce
                },
                'cyto': {
                    'water': nullForce,
                    'cyto': nullForce,
                    'phobic': nullForce,
                    'philic': nullForce
                },
                'phobic': {
                    'water': nullForce,
                    'cyto': nullForce,
                    'phobic': nullForce,
                    'philic': nullForce
                },
                'philic': {
                    'water': nullForce,
                    'cyto': nullForce,
                    'phobic': nullForce,
                    'philic': nullForce
                }
            };
            this.repulsiveForcesBetweenParticles = {
                'water': {
                    'water': {
                        range: 15,
                        amplitude: k * 25
                    },
                    'cyto': {
                        range: 40,
                        amplitude: k * 10
                    },
                    'phobic': {
                        range: 30,
                        amplitude: k * 15
                    },
                    'philic': {
                        range: 15,
                        amplitude: k * 20
                    }
                },
                'cyto': {
                    'water': {
                        range: 40,
                        amplitude: k * 10
                    },
                    'cyto': {
                        range: 18,
                        amplitude: k * 20
                    },
                    'phobic': {
                        range: 30,
                        amplitude: k * 15
                    },
                    'philic': {
                        range: 15,
                        amplitude: k * 20
                    }
                },
                'phobic': {
                    'water': {
                        range: 30,
                        amplitude: k * 15
                    },
                    'cyto': {
                        range: 30,
                        amplitude: k * 15
                    },
                    'phobic': {
                        range: 12,
                        amplitude: k * 10
                    },
                    'philic': {
                        range: 25,
                        amplitude: k * 10
                    }
                },
                'philic': {
                    'water': {
                        range: 15,
                        amplitude: k * 20
                    },
                    'cyto': {
                        range: 15,
                        amplitude: k * 20
                    },
                    'phobic': {
                        range: 25,
                        amplitude: k * 10
                    },
                    'philic': {
                        range: 12,
                        amplitude: k * 10
                    }
                }
            };
        }
        return SimulationParameters;
    })();
    Reactor.SimulationParameters = SimulationParameters;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=SimulationParameters.js.map
