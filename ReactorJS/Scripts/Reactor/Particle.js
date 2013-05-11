var Reactor;
(function (Reactor) {
    var Particle = (function () {
        function Particle(type, x, y) {
            this.id = Particle.idCounter++;
            this.type = type;
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
        }
        Particle.idCounter = 0;
        return Particle;
    })();
    Reactor.Particle = Particle;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=Particle.js.map
