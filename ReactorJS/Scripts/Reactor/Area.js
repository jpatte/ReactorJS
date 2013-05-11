var Reactor;
(function (Reactor) {
    var Area = (function () {
        function Area(number, row, column) {
            this.number = number;
            this.row = row;
            this.column = column;
            this.particles = new Reactor.ParticleSet();
        }
        return Area;
    })();
    Reactor.Area = Area;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=Area.js.map
