var Reactor;
(function (Reactor) {
    var ParticleGenerator = (function () {
        function ParticleGenerator(parameters) {
            this.parameters = parameters;
            this.isInitialized = false;
            this.newParticle = function (p) {
            };
        }
        ParticleGenerator.prototype.update = function () {
            if(this.isInitialized) {
                return;
            }
            var width = this.parameters.sceneWidth;
            var height = this.parameters.sceneHeight;
            for(var typeName in this.parameters.particleTypes) {
                var particleType = this.parameters.particleTypes[typeName];
                var nbrParticlesToCreate = this.parameters.particleGenerationScenario.initialNbrParticles[typeName];
                for(var i = 0; i < nbrParticlesToCreate; i++) {
                    var particle = new Reactor.Particle(particleType, MathUtils.random() * width, MathUtils.random() * height);
                    this.newParticle(particle);
                }
            }
            this.isInitialized = true;
        };
        return ParticleGenerator;
    })();
    Reactor.ParticleGenerator = ParticleGenerator;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=ParticleGenerator.js.map
