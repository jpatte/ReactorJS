var Reactor;
(function (Reactor) {
    var Engine = (function () {
        function Engine(parameters) {
            this.parameters = parameters;
            this.splitSceneIntoAreas();
            this.createParticles();
        }
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
        Engine.prototype.splitSceneIntoAreas = function () {
            var maxRange = 0;
            for(var pt1 in this.parameters.particleTypes) {
                for(var pt2 in this.parameters.particleTypes) {
                    var attractiveForceRange = this.parameters.attractiveForcesBetweenParticles[pt1][pt2].range;
                    if(attractiveForceRange > maxRange) {
                        maxRange = attractiveForceRange;
                    }
                    var repulsiveForceRange = this.parameters.repulsiveForcesBetweenParticles[pt1][pt2].range;
                    if(repulsiveForceRange > maxRange) {
                        maxRange = repulsiveForceRange;
                    }
                }
            }
            this.areasSize = Math.ceil(maxRange);
            this.nbrAreaRows = Math.ceil(this.parameters.sceneHeight / this.areasSize) + 1;
            this.nbrAreaColumns = Math.ceil(this.parameters.sceneWidth / this.areasSize) + 1;
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
        Engine.prototype.computeAreaNumber = function (p) {
            var row = Math.floor(p.y / this.areasSize + 0.5);
            var column = Math.floor(p.x / this.areasSize + 0.5);
            return this.nbrAreaColumns * row + column;
        };
        Engine.prototype.createParticles = function () {
            var width = this.parameters.sceneWidth;
            var height = this.parameters.sceneHeight;
            this.particles = new Reactor.ParticleSet();
            for(var typeName in this.parameters.particleTypes) {
                var particleType = this.parameters.particleTypes[typeName];
                var nbrParticlesToCreate = this.parameters.particleGenerationScenario.initialNbrParticles[typeName];
                for(var i = 0; i < nbrParticlesToCreate; i++) {
                    var particle = new Reactor.Particle(particleType, MathUtils.random() * width, MathUtils.random() * height);
                    this.particles.push(particle);
                    this.onParticleMoved(particle);
                }
            }
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
            var force = this.parameters.repulsiveForcesBetweenParticles[p1.type.name][p2.type.name];
            var range = force.range;
            var amplitude = force.amplitude;
            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var distance2 = dx * dx + dy * dy;
            if(distance2 > range * range) {
                return;
            }
            if(dx >= 0) {
                f.x += amplitude * (range - dx) / range;
            } else {
                f.x -= amplitude * (range + dx) / range;
            }
            if(dy >= 0) {
                f.y += amplitude * (range - dy) / range;
            } else {
                f.y -= amplitude * (range + dy) / range;
            }
        };
        Engine.prototype.addInfluenceFromWalls = function (particle, f) {
            var range = this.parameters.wallsForce.range;
            var amplitude = this.parameters.wallsForce.amplitude;
            if(particle.x <= range) {
                f.x = amplitude * (range - particle.x) / range;
            } else if(particle.x >= this.parameters.sceneWidth - range) {
                f.x = amplitude * (this.parameters.sceneWidth - range - particle.x) / range;
            }
            if(particle.y <= range) {
                f.y = amplitude * (range - particle.y) / range;
            } else if(particle.y >= this.parameters.sceneHeight - range) {
                f.y = amplitude * (this.parameters.sceneHeight - range - particle.y) / range;
            }
        };
        return Engine;
    })();
    Reactor.Engine = Engine;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=Engine.js.map
