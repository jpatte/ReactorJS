var Reactor;
(function (Reactor) {
    var SimulationParameters = (function () {
        function SimulationParameters() {
            this.sceneWidth = 500;
            this.sceneHeight = 300;
            this.heatLevel = 500;
            var redParticleType = {
                name: 'red',
                color: '#F00',
                size: 5,
                mass: 1,
                viscosity: 2,
                bondEndPointNames: [
                    'r'
                ]
            };
            var blueParticleType = {
                name: 'blue',
                color: '#00F',
                size: 5,
                mass: 1,
                viscosity: 2,
                bondEndPointNames: [
                    'b'
                ]
            };
            this.particleTypes = {
                'red': redParticleType,
                'blue': blueParticleType
            };
            this.particleGenerationScenario = "start\n" + "  drop 150 'blue' anywhere immediately\n" + "after 5 seconds\n" + "  drop 100 'red' at the center in 10 seconds\n" + "end";
            this.wallsForce = {
                range: 5,
                amplitude: 2000
            };
            var defaultBond = {
                color: '#000',
                amplitude: 50,
                neutralRange: 20,
                maxRange: 30
            };
            this.possibleBondsBetweenEndPoints = {
                'r': {
                    'r': null,
                    'b': defaultBond
                },
                'b': {
                    'r': defaultBond,
                    'b': null
                }
            };
            var defaultAttractiveForce = {
                range: 25,
                amplitude: 0
            };
            this.attractiveForcesBetweenParticles = {
                'red': {
                    'red': defaultAttractiveForce,
                    'blue': defaultAttractiveForce
                },
                'blue': {
                    'red': defaultAttractiveForce,
                    'blue': defaultAttractiveForce
                }
            };
            var defaultRepulsiveForce = {
                range: 15,
                amplitude: 50
            };
            this.repulsiveForcesBetweenParticles = {
                'red': {
                    'red': defaultRepulsiveForce,
                    'blue': defaultRepulsiveForce
                },
                'blue': {
                    'red': defaultRepulsiveForce,
                    'blue': defaultRepulsiveForce
                }
            };
        }
        return SimulationParameters;
    })();
    Reactor.SimulationParameters = SimulationParameters;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=SimulationParameters.js.map
