var Reactor;
(function (Reactor) {
    var WallsEffectComponent = (function () {
        function WallsEffectComponent(parameters) {
            this.parameters = parameters;
            this.maxInfluenceRange = this.parameters.wallsForce.range;
        }
        WallsEffectComponent.prototype.addInfluenceOnParticle = function (particle, particlesNearby) {
            var range = this.parameters.wallsForce.range;
            var amplitude = this.parameters.wallsForce.amplitude;
            if(particle.x <= range) {
                particle.fx += amplitude * (range - particle.x) / range;
            } else if(particle.x >= this.parameters.sceneWidth - range) {
                particle.fx += amplitude * (this.parameters.sceneWidth - range - particle.x) / range;
            }
            if(particle.y <= range) {
                particle.fy += amplitude * (range - particle.y) / range;
            } else if(particle.y >= this.parameters.sceneHeight - range) {
                particle.fy += amplitude * (this.parameters.sceneHeight - range - particle.y) / range;
            }
        };
        return WallsEffectComponent;
    })();
    Reactor.WallsEffectComponent = WallsEffectComponent;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=WallsEffectComponent.js.map
