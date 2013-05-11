var Reactor;
(function (Reactor) {
    var Engine = (function () {
        function Engine(sceneWidth, sceneHeight) {
            this.sceneWidth = sceneWidth;
            this.sceneHeight = sceneHeight;
            this.splitSceneIntoAreas();
            this.createParticles();
        }
        Engine.prototype.splitSceneIntoAreas = function () {
            this.areasSize = Math.ceil(10);
            this.nbrAreaRows = Math.ceil(this.sceneHeight / this.areasSize) + 1;
            this.nbrAreaColumns = Math.ceil(this.sceneWidth / this.areasSize) + 1;
            this.areas = [];
            var counter = 0;
            for(var r = 0; r < this.nbrAreaRows; r++) {
                for(var c = 0; c < this.nbrAreaColumns; c++) {
                    this.areas.push(new Reactor.Area(counter++, r, c));
                }
            }
            this.limbo = new Reactor.Area(-1, -1, -1);
        };
        Engine.prototype.getSurroundingAreas = function (row, column) {
            var _this = this;
            var neighbors = [];
            if(row < 0) {
                return neighbors;
            }
            var hasLeft = (column > 0);
            var hasTop = (row > 0);
            var hasRight = (column < this.nbrAreaColumns - 1);
            var hasBottom = (row < this.nbrAreaRows - 1);
            var addNeighbor = function (r, c) {
                return neighbors.push(_this.areas[r * _this.nbrAreaColumns + c]);
            };
            if(hasTop) {
                if(hasLeft) {
                    addNeighbor(row - 1, column - 1);
                }
                addNeighbor(row - 1, column);
                if(hasRight) {
                    addNeighbor(row - 1, column + 1);
                }
            }
            if(hasLeft) {
                addNeighbor(row, column - 1);
            }
            addNeighbor(row, column);
            if(hasRight) {
                addNeighbor(row, column + 1);
            }
            if(hasBottom) {
                if(hasLeft) {
                    addNeighbor(row + 1, column - 1);
                }
                addNeighbor(row + 1, column);
                if(hasRight) {
                    addNeighbor(row + 1, column + 1);
                }
            }
            return neighbors;
        };
        Engine.prototype.createParticles = function () {
            var particleType1 = new Reactor.ParticleType(1);
            particleType1.color = '#F00';
            var particleType2 = new Reactor.ParticleType(2);
            particleType2.color = '#00F';
            this.particles = new Reactor.ParticleSet();
            for(var i = 0; i < 200; i++) {
                var particle = new Reactor.Particle(MathUtils.random() > 0.5 ? particleType2 : particleType1, MathUtils.random() * this.sceneWidth, MathUtils.random() * this.sceneHeight);
                this.particles.push(particle);
                this.onParticleMoved(particle);
            }
        };
        Engine.prototype.computeAreaNumber = function (p) {
            var row = Math.floor(p.y / this.areasSize + 0.5);
            var column = Math.floor(p.x / this.areasSize + 0.5);
            return this.nbrAreaColumns * row + column;
        };
        Engine.prototype.update = function (dt) {
            var _this = this;
            this.particles.each(function (p) {
                _this.updateParticlePosition(p, dt);
                _this.onParticleMoved(p);
            });
        };
        Engine.prototype.render = function (scene) {
            this.particles.each(function (p) {
                scene.fillStyle = p.type.color;
                var size = p.type.size;
                scene.fillRect(p.x - size / 2, p.y - size / 2, p.type.size, p.type.size);
            });
        };
        Engine.prototype.updateParticlePosition = function (particle, dt) {
            var f = this.computeInfluenceOnParticle(particle);
            particle.vx += f.x / particle.type.mass * dt;
            particle.vy += f.y / particle.type.mass * dt;
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
        };
        Engine.prototype.onParticleMoved = function (particle) {
            var previousArea = particle.currentArea;
            var newArea = this.areas[this.computeAreaNumber(particle)];
            if(!newArea) {
                newArea = this.limbo;
            }
            if(previousArea != newArea) {
                if(previousArea) {
                    previousArea.particles.remove(particle);
                }
                newArea.particles.push(particle);
                particle.currentArea = newArea;
            }
        };
        Engine.prototype.computeInfluenceOnParticle = function (particle) {
            var f = {
                x: particle.type.agitation * MathUtils.random2() - particle.type.viscosity * particle.vx,
                y: particle.type.agitation * MathUtils.random2() - particle.type.viscosity * particle.vy
            };
            this.addInfluenceFromOtherParticles(particle, f);
            this.addInfluenceFromWalls(particle, f);
            return f;
        };
        Engine.prototype.addInfluenceFromOtherParticles = function (p1, f) {
            var _this = this;
            var surroundingAreas = this.getSurroundingAreas(p1.currentArea.row, p1.currentArea.column);
            _.each(surroundingAreas, function (area) {
                area.particles.each(function (p2) {
                    if(p1.id != p2.id) {
                        _this.addInfluenceFromParticle(p1, p2, f);
                    }
                });
            });
        };
        Engine.prototype.addInfluenceFromParticle = function (p1, p2, f) {
            var range = 10;
            var range2 = range * range;
            var maxForce = 0.001;
            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var distance2 = dx * dx + dy * dy;
            if(distance2 > range2) {
                return;
            }
            if(dx >= 0) {
                f.x += maxForce * (range - dx) / range;
            } else {
                f.x += -maxForce * (range + dx) / range;
            }
            if(dy >= 0) {
                f.y += maxForce * (range - dy) / range;
            } else {
                f.y += -maxForce * (range + dy) / range;
            }
        };
        Engine.prototype.addInfluenceFromWalls = function (particle, f) {
            var range = 5;
            var maxForce = 0.005;
            if(particle.x <= range) {
                f.x = maxForce * (range - particle.x) / range;
            } else if(particle.x >= this.sceneWidth - range) {
                f.x = maxForce * (this.sceneWidth - range - particle.x) / range;
            }
            if(particle.y <= range) {
                f.y = maxForce * (range - particle.y) / range;
            } else if(particle.y >= this.sceneHeight - range) {
                f.y = maxForce * (this.sceneHeight - range - particle.y) / range;
            }
        };
        return Engine;
    })();
    Reactor.Engine = Engine;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=Engine.js.map
