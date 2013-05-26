var Reactor;
(function (Reactor) {
    var ParticlesInteractionsComponent = (function () {
        function ParticlesInteractionsComponent(parameters) {
            this.parameters = parameters;
            var maxRange = 0;
            for(var pt1 in this.parameters.particleTypes) {
                for(var pt2 in this.parameters.particleTypes) {
                    var attractiveForce = this.parameters.attractiveForcesBetweenParticles[pt1][pt2];
                    if(attractiveForce.amplitude != 0 && attractiveForce.range > maxRange) {
                        maxRange = attractiveForce.range;
                    }
                    var repulsiveForce = this.parameters.repulsiveForcesBetweenParticles[pt1][pt2];
                    if(repulsiveForce.amplitude != 0 && repulsiveForce.range > maxRange) {
                        maxRange = repulsiveForce.range;
                    }
                }
            }
            this.maxInfluenceRange = maxRange;
        }
        ParticlesInteractionsComponent.prototype.addInfluenceOnParticle = function (p1, particlesNearby) {
            var _this = this;
            _.each(particlesNearby, function (p2) {
                _this.addInfluenceFromOtherParticle(p1, p2);
            });
        };
        ParticlesInteractionsComponent.prototype.addInfluenceFromOtherParticle = function (p1, p2) {
            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            var repulsiveForce = this.parameters.repulsiveForcesBetweenParticles[p1.type.name][p2.type.name];
            this.addInfluenceFromForce(p1, p2, distance, repulsiveForce);
            var attractiveForce = this.parameters.attractiveForcesBetweenParticles[p1.type.name][p2.type.name];
            this.addInfluenceFromForce(p1, p2, distance, attractiveForce);
        };
        ParticlesInteractionsComponent.prototype.addInfluenceFromForce = function (particle, forceOrigin, distance, force) {
            var range = force.range;
            if(force.amplitude == 0 || distance > range) {
                return;
            }
            var coeff = force.amplitude * (range - distance) / range;
            particle.fx += coeff * (particle.x - forceOrigin.x);
            particle.fy += coeff * (particle.y - forceOrigin.y);
        };
        return ParticlesInteractionsComponent;
    })();
    Reactor.ParticlesInteractionsComponent = ParticlesInteractionsComponent;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=ParticlesInteractionsComponent.js.map
