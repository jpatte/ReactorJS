var Reactor;
(function (Reactor) {
    var BondEndPoint = (function () {
        function BondEndPoint(name) {
            this.name = name;
            this.bond = null;
            this.boundParticle = null;
            this.boundEndPoint = null;
        }
        BondEndPoint.prototype.isBound = function () {
            return (this.bond != null);
        };
        return BondEndPoint;
    })();
    Reactor.BondEndPoint = BondEndPoint;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=BondEndPoint.js.map
