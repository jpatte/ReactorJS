var Reactor;
(function (Reactor) {
    var ParticlesBondingComponent = (function () {
        function ParticlesBondingComponent(parameters) {
            this.parameters = parameters;
            var maxRange = 0;
            for(var ep1 in this.parameters.possibleBondsBetweenEndPoints) {
                for(var ep2 in this.parameters.possibleBondsBetweenEndPoints[ep1]) {
                    var bond = this.parameters.possibleBondsBetweenEndPoints[ep1][ep2];
                    if(bond && bond.maxRange > maxRange) {
                        maxRange = bond.maxRange;
                    }
                }
            }
            this.maxBondRange = maxRange;
            this.maxInfluenceRange = maxRange;
        }
        ParticlesBondingComponent.prototype.addInfluenceOnParticle = function (p1, particlesNearby) {
            var _this = this;
            var boundParticles = p1.bondEndPoints.filter(function (ep) {
                return ep.isBound();
            }).map(function (ep) {
                return ep.boundParticle;
            });
            _.each(particlesNearby, function (p2) {
                var p2Index = boundParticles.indexOf(p2);
                var bondExists = (p2Index >= 0);
                if(bondExists) {
                    boundParticles.splice(p2Index, 1);
                }
                _this.addInfluenceFromOtherParticle(p1, p2, bondExists);
            });
            _.each(boundParticles, function (p2) {
                _this.addInfluenceFromOtherParticle(p1, p2, true);
            });
        };
        ParticlesBondingComponent.prototype.addInfluenceFromOtherParticle = function (p1, p2, bondExists) {
            var _this = this;
            var activeBond = null;
            var boundEndPoint = null;
            if(bondExists) {
                boundEndPoint = _.find(p1.bondEndPoints, function (endPoint) {
                    return endPoint.boundParticle == p2;
                });
                activeBond = boundEndPoint.bond;
            }
            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if(bondExists) {
                if(distance > activeBond.maxRange) {
                    var otherEndPoint = boundEndPoint.boundEndPoint;
                    otherEndPoint.bond = null;
                    otherEndPoint.boundParticle = null;
                    otherEndPoint.boundEndPoint = null;
                    boundEndPoint.bond = null;
                    boundEndPoint.boundParticle = null;
                    boundEndPoint.boundEndPoint = null;
                    activeBond = null;
                    bondExists = false;
                }
            } else {
                _.each(p1.bondEndPoints, function (endPoint) {
                    if(bondExists || endPoint.isBound()) {
                        return;
                    }
                    _.each(p2.bondEndPoints, function (otherEndPoint) {
                        if(bondExists || otherEndPoint.isBound() || distance > _this.maxBondRange) {
                            return;
                        }
                        var possibleBond = _this.parameters.possibleBondsBetweenEndPoints[endPoint.name][otherEndPoint.name];
                        if(possibleBond && distance <= possibleBond.maxRange) {
                            endPoint.bond = possibleBond;
                            endPoint.boundParticle = p2;
                            endPoint.boundEndPoint = otherEndPoint;
                            otherEndPoint.bond = possibleBond;
                            otherEndPoint.boundParticle = p1;
                            otherEndPoint.boundEndPoint = endPoint;
                            activeBond = possibleBond;
                            bondExists = true;
                        }
                    });
                });
            }
            if(bondExists) {
                this.addInfluenceFromBond(p1, p2, distance, activeBond);
            }
        };
        ParticlesBondingComponent.prototype.addInfluenceFromBond = function (particle, boundParticle, distance, bond) {
            var coeff = bond.amplitude * (bond.maxRange - distance) / bond.maxRange;
            particle.fx += coeff * (particle.x - boundParticle.x);
            particle.fy += coeff * (particle.y - boundParticle.y);
        };
        return ParticlesBondingComponent;
    })();
    Reactor.ParticlesBondingComponent = ParticlesBondingComponent;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=ParticlesBondingComponent.js.map
