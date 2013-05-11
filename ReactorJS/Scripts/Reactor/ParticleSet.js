var Reactor;
(function (Reactor) {
    var ParticleSet = (function () {
        function ParticleSet(particles) {
            this.hash = {
            };
            if(particles) {
                _.each(particles, this.push);
            }
        }
        ParticleSet.prototype.push = function (particle) {
            this.hash[particle.id] = particle;
        };
        ParticleSet.prototype.remove = function (particle) {
            return delete this.hash[particle.id];
        };
        ParticleSet.prototype.each = function (action) {
            for(var id in this.hash) {
                action(this.hash[id]);
            }
        };
        return ParticleSet;
    })();
    Reactor.ParticleSet = ParticleSet;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=ParticleSet.js.map
