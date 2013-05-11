var Reactor;
(function (Reactor) {
    var ParticleType = (function () {
        function ParticleType(name) {
            this.name = name;
            this.color = '#000';
            this.size = 5;
            this.agitation = 0.0005;
            this.mass = 1;
            this.viscosity = 0.001;
        }
        return ParticleType;
    })();
    Reactor.ParticleType = ParticleType;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=ParticleType.js.map
