var Reactor;
(function (Reactor) {
    var SimulationParameters = (function () {
        function SimulationParameters() {
            this.sceneWidth = 480;
            this.sceneHeight = 320;
            this.heatLevel = 500;
            var redParticleType = new Reactor.ParticleType('red');
            redParticleType.color = '#F00';
            redParticleType.size = 5;
            redParticleType.mass = 1;
            redParticleType.viscosity = 2;
            var blueParticleType = new Reactor.ParticleType('blue');
            blueParticleType.color = '#00F';
            blueParticleType.size = 5;
            blueParticleType.mass = 1;
            blueParticleType.viscosity = 2;
            this.particleTypes = {
            };
            this.particleTypes['red'] = redParticleType;
            this.particleTypes['blue'] = blueParticleType;
            this.particleGenerationScenario = new ParticleGenerationScenario();
            this.particleGenerationScenario.initialNbrParticles = {
                'red': 150,
                'blue': 150
            };
            this.wallsForce = {
                range: 5,
                amplitude: 2000
            };
            var defaultAttractiveForce = {
                range: 5,
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
            var defaulRepulsiveForce = {
                range: 20,
                amplitude: 50
            };
            this.repulsiveForcesBetweenParticles = {
                'red': {
                    'red': defaulRepulsiveForce,
                    'blue': defaulRepulsiveForce
                },
                'blue': {
                    'red': defaulRepulsiveForce,
                    'blue': defaulRepulsiveForce
                }
            };
        }
        return SimulationParameters;
    })();
    Reactor.SimulationParameters = SimulationParameters;    
    var ParticleGenerationScenario = (function () {
        function ParticleGenerationScenario() { }
        return ParticleGenerationScenario;
    })();
    Reactor.ParticleGenerationScenario = ParticleGenerationScenario;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=SimulationParameters.js.map
