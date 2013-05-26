var Reactor;
(function (Reactor) {
    var NaturalParticlesMovementComponent = (function () {
        function NaturalParticlesMovementComponent(parameters) {
            this.maxInfluenceRange = 0;
            this.parameters = parameters;
        }
        NaturalParticlesMovementComponent.prototype.addInfluenceOnParticle = function (particle, particlesNearby) {
            particle.fx += this.parameters.heatLevel * MathUtils.random2();
            particle.fy += this.parameters.heatLevel * MathUtils.random2();
            particle.fx += -particle.type.viscosity * particle.vx;
            particle.fy += -particle.type.viscosity * particle.vy;
        };
        return NaturalParticlesMovementComponent;
    })();
    Reactor.NaturalParticlesMovementComponent = NaturalParticlesMovementComponent;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=NaturalParticlesMovementComponent.js.map
