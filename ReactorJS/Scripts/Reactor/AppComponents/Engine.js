var Reactor;
(function (Reactor) {
    var Engine = (function () {
        function Engine(parameters) {
            this.parameters = parameters;
            this.particles = new Reactor.ParticleSet();
            this.components = [
                new Reactor.NaturalParticlesMovementComponent(parameters), 
                new Reactor.WallsEffectComponent(parameters), 
                new Reactor.ParticlesInteractionsComponent(parameters), 
                new Reactor.ParticlesBondingComponent(parameters), 
                
            ];
        }
        Engine.prototype.init = function () {
            this.splitSceneIntoAreas();
        };
        Engine.prototype.update = function (elapsedTimeMs, totalElapsedTimeMs) {
            var _this = this;
            this.particles.each(function (p) {
                _this.computeInfluenceOnParticle(p);
            });
            this.particles.each(function (p) {
                _this.updateParticlePosition(p, elapsedTimeMs);
                _this.updateParticleCurrentArea(p);
            });
        };
        Engine.prototype.render = function (scene) {
            scene.beginPath();
            this.particles.each(function (p) {
                scene.fillStyle = p.type.color;
                var size = p.type.size;
                scene.fillRect(p.x - size / 2, p.y - size / 2, p.type.size, p.type.size);
                _.each(p.bondEndPoints, function (ep) {
                    if(ep.isBound() && p.id < ep.boundParticle.id) {
                        scene.strokeStyle = ep.bond.color;
                        scene.moveTo(p.x, p.y);
                        scene.lineTo(ep.boundParticle.x, ep.boundParticle.y);
                    }
                });
            });
            scene.closePath();
            scene.stroke();
        };
        Engine.prototype.addParticle = function (particle) {
            this.particles.push(particle);
            this.updateParticleCurrentArea(particle);
        };
        Engine.prototype.removeParticle = function (particle) {
            this.particles.remove(particle);
            if(particle.currentArea) {
                particle.currentArea.particles.remove(particle);
                particle.currentArea = null;
            }
        };
        Engine.prototype.splitSceneIntoAreas = function () {
            var _this = this;
            var maxRange = _.reduce(this.components, function (m, c) {
                return Math.max(m, c.maxInfluenceRange);
            }, 0);
            this.areasSize = Math.ceil(maxRange + 5);
            this.nbrAreaRows = Math.ceil(this.parameters.sceneHeight / this.areasSize) + 1;
            this.nbrAreaColumns = Math.ceil(this.parameters.sceneWidth / this.areasSize) + 1;
            this.areas = [];
            var counter = 0;
            for(var r = 0; r < this.nbrAreaRows; r++) {
                for(var c = 0; c < this.nbrAreaColumns; c++) {
                    this.areas.push(new Reactor.Area(counter++, r, c));
                }
            }
            _.each(this.areas, function (a) {
                return a.surroundingAreas = _this.getSurroundingAreas(a.row, a.column);
            });
            this.limbo = new Reactor.Area(-1, -1, -1);
            this.limbo.surroundingAreas = [];
        };
        Engine.prototype.getSurroundingAreas = function (row, column) {
            var _this = this;
            var hasLeft = (column > 0);
            var hasTop = (row > 0);
            var hasRight = (column < this.nbrAreaColumns - 1);
            var hasBottom = (row < this.nbrAreaRows - 1);
            var neighbors = [];
            var addNeighbor = function (r, c, cond) {
                if(cond) {
                    neighbors.push(_this.areas[r * _this.nbrAreaColumns + c]);
                }
            };
            addNeighbor(row - 1, column - 1, hasTop && hasLeft);
            addNeighbor(row - 1, column, hasTop);
            addNeighbor(row - 1, column + 1, hasTop && hasRight);
            addNeighbor(row, column - 1, hasLeft);
            addNeighbor(row, column, true);
            addNeighbor(row, column + 1, hasRight);
            addNeighbor(row + 1, column - 1, hasBottom && hasLeft);
            addNeighbor(row + 1, column, hasBottom);
            addNeighbor(row + 1, column + 1, hasBottom && hasRight);
            return neighbors;
        };
        Engine.prototype.computeAreaNumber = function (p) {
            var row = Math.floor(p.y / this.areasSize + 0.5);
            var column = Math.floor(p.x / this.areasSize + 0.5);
            return this.nbrAreaColumns * row + column;
        };
        Engine.prototype.updateParticlePosition = function (particle, elapsedTimeMs) {
            var dt = elapsedTimeMs / 1000;
            particle.vx += particle.fx / particle.type.mass * dt;
            particle.vy += particle.fy / particle.type.mass * dt;
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
        };
        Engine.prototype.updateParticleCurrentArea = function (particle) {
            var previousArea = particle.currentArea;
            var newArea = this.areas[this.computeAreaNumber(particle)] || this.limbo;
            if(previousArea != newArea) {
                if(previousArea) {
                    previousArea.particles.remove(particle);
                }
                newArea.particles.push(particle);
                particle.currentArea = newArea;
            }
        };
        Engine.prototype.computeInfluenceOnParticle = function (particle) {
            var particlesNearby = this.getParticlesNearby(particle);
            particle.fx = particle.fy = 0;
            _.each(this.components, function (c) {
                return c.addInfluenceOnParticle(particle, particlesNearby);
            });
        };
        Engine.prototype.getParticlesNearby = function (p1) {
            var particlesNearby = [];
            _.each(p1.currentArea.surroundingAreas, function (area) {
                area.particles.each(function (p2) {
                    if(p1.id != p2.id) {
                        particlesNearby.push(p2);
                    }
                });
            });
            return particlesNearby;
        };
        return Engine;
    })();
    Reactor.Engine = Engine;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=Engine.js.map
