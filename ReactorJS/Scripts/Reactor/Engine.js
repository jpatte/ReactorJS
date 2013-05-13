var Reactor;
(function (Reactor) {
    var Engine = (function () {
        function Engine(parameters) {
            var _this = this;
            this.parameters = parameters;
            this.particles = new Reactor.ParticleSet();
            this.generator = new Reactor.ParticleGenerator(parameters);
            this.generator.newParticle = function (p) {
                _this.particles.push(p);
                _this.onParticleMoved(p);
            };
            this.splitSceneIntoAreas();
        }
        Engine.prototype.update = function (dt) {
            var _this = this;
            this.generator.update();
            this.particles.each(function (p) {
                _this.updateParticlePosition(p, dt);
                _this.onParticleMoved(p);
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
        Engine.prototype.splitSceneIntoAreas = function () {
            var _this = this;
            var maxRange = 0;
            for(var ep1 in this.parameters.possibleBondsBetweenEndPoints) {
                for(var ep2 in this.parameters.possibleBondsBetweenEndPoints[ep1]) {
                    var bond = this.parameters.possibleBondsBetweenEndPoints[ep1][ep2];
                    if(bond && bond.maxRange > maxRange) {
                        maxRange = bond.maxRange;
                    }
                }
            }
            for(var pt1 in this.parameters.particleTypes) {
                for(var pt2 in this.parameters.particleTypes) {
                    var attractiveForce = this.parameters.attractiveForcesBetweenParticles[pt1][pt2];
                    if(attractiveForce.amplitude != 0 && attractiveForce.range > maxRange) {
                        maxRange = attractiveForce.range;
                    }
                    var repulsiveForce = this.parameters.repulsiveForcesBetweenParticles[pt1][pt2];
                    if(repulsiveForce.amplitude != 0 && repulsiveForce.range > maxRange) {
                        maxRange = repulsiveForce.range;
                    }
                }
            }
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
                x: this.parameters.heatLevel * MathUtils.random2() - particle.type.viscosity * particle.vx,
                y: this.parameters.heatLevel * MathUtils.random2() - particle.type.viscosity * particle.vy
            };
            this.addInfluenceFromOtherParticles(particle, f);
            this.addInfluenceFromWalls(particle, f);
            return f;
        };
        Engine.prototype.addInfluenceFromOtherParticles = function (p1, f) {
            var _this = this;
            _.each(p1.currentArea.surroundingAreas, function (area) {
                area.particles.each(function (p2) {
                    if(p1.id != p2.id) {
                        _this.addInfluenceFromParticle(p1, p2, f);
                    }
                });
            });
        };
        Engine.prototype.addInfluenceFromParticle = function (p1, p2, f) {
            var _this = this;
            var activeBond = null;
            var boundEndPoint = _.find(p1.bondEndPoints, function (endPoint) {
                return endPoint.boundParticle == p2;
            });
            if(boundEndPoint) {
                activeBond = boundEndPoint.bond;
            }
            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if(activeBond) {
                if(distance > activeBond.maxRange) {
                    var otherEndPoint = boundEndPoint.boundEndPoint;
                    otherEndPoint.bond = null;
                    otherEndPoint.boundParticle = null;
                    otherEndPoint.boundEndPoint = null;
                    boundEndPoint.bond = null;
                    boundEndPoint.boundParticle = null;
                    boundEndPoint.boundEndPoint = null;
                    activeBond = null;
                }
            } else {
                _.each(p1.bondEndPoints, function (endPoint) {
                    if(activeBond || endPoint.isBound()) {
                        return;
                    }
                    _.each(p2.bondEndPoints, function (otherEndPoint) {
                        if(activeBond || otherEndPoint.isBound()) {
                            return;
                        }
                        var possibleBond = _this.parameters.possibleBondsBetweenEndPoints[endPoint.name][otherEndPoint.name];
                        if(possibleBond && distance <= possibleBond.maxRange) {
                            activeBond = possibleBond;
                            endPoint.bond = activeBond;
                            endPoint.boundParticle = p2;
                            endPoint.boundEndPoint = otherEndPoint;
                            otherEndPoint.bond = activeBond;
                            otherEndPoint.boundParticle = p1;
                            otherEndPoint.boundEndPoint = endPoint;
                        }
                    });
                });
            }
            if(activeBond) {
                this.addInfluenceFromBond(p1, p2, distance, activeBond, f);
            } else {
                var repulsiveForce = this.parameters.repulsiveForcesBetweenParticles[p1.type.name][p2.type.name];
                this.addInfluenceFromForce(p1, p2, distance, repulsiveForce, f);
                var attractiveForce = this.parameters.attractiveForcesBetweenParticles[p1.type.name][p2.type.name];
                this.addInfluenceFromForce(p1, p2, distance, attractiveForce, f);
            }
        };
        Engine.prototype.addInfluenceFromForce = function (forceTarget, forceOrigin, distance, force, f) {
            var range = force.range;
            if(force.amplitude == 0 || distance > range) {
                return;
            }
            var coeff = force.amplitude * (range - distance) / range;
            f.x += coeff * (forceTarget.x - forceOrigin.x);
            f.y += coeff * (forceTarget.y - forceOrigin.y);
        };
        Engine.prototype.addInfluenceFromBond = function (target, end, distance, bond, f) {
            var coeff = bond.amplitude * (bond.neutralRange - distance) / bond.neutralRange;
            f.x += coeff * (target.x - end.x);
            f.y += coeff * (target.y - end.y);
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
