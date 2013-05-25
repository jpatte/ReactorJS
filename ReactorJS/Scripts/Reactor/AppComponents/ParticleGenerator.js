var Reactor;
(function (Reactor) {
    var ParticleGenerator = (function () {
        function ParticleGenerator(parameters) {
            this.newParticle = function (p) {
            };
            this.parameters = parameters;
            this.parseScenario(parameters.particleGenerationScenario);
            this.isStarted = false;
        }
        ParticleGenerator.prototype.update = function (elapsedTimeMs, totalElapsedTimeMs) {
            if(!this.isStarted) {
                this.currentActionSet.start(totalElapsedTimeMs);
                this.isStarted = true;
            }
            if(!this.currentActionSet) {
                return;
            }
            var completed = this.currentActionSet.update(elapsedTimeMs, totalElapsedTimeMs);
            if(completed) {
                this.currentActionSet = this.currentActionSet.next;
                if(this.currentActionSet) {
                    this.currentActionSet.start(totalElapsedTimeMs);
                }
            }
        };
        ParticleGenerator.prototype.render = function (scene) {
        };
        ParticleGenerator.prototype.parseScenario = function (scenario) {
            var _this = this;
            var lines = scenario.split("\n");
            var currentLineIndex = 1;
            var actionSet = new GeneratorActionSet(0);
            this.currentActionSet = actionSet;
            var line = lines[currentLineIndex];
            while(!/^end\s*$/g.test(line)) {
                if(/^\s+/.test(line)) {
                    line = line.trim();
                    var match = /^drop (\d+) '(\S+)' (anywhere|at the center|at the edges)\s+/g.exec(line);
                    if(match.length != 4) {
                        throw new Error("Unable to parse line: " + line);
                    }
                    var action = new GeneratorAction();
                    action.dropParticle = function (p) {
                        return _this.newParticle(p);
                    };
                    action.nbrParticlesToGenerate = parseInt(match[1]);
                    action.particleType = this.parameters.particleTypes[match[2]];
                    switch(match[3]) {
                        case 'anywhere':
                            action.getNewParticleLocation = function () {
                                return _this.getNewPositionAnywhere();
                            };
                            break;
                        case 'at the center':
                            action.getNewParticleLocation = function () {
                                return _this.getNewPositionAtTheCenter();
                            };
                            break;
                        case 'at the edges':
                            action.getNewParticleLocation = function () {
                                return _this.getNewPositionAtTheEdges();
                            };
                            break;
                    }
                    if(/ immediately\s*$/g.test(line)) {
                        action.durationMs = 0;
                    } else {
                        match = /\s+in (\d+) (millisecond|second|minute|hour)s?\s*$/g.exec(line);
                        if(match.length != 3) {
                            throw new Error("Unable to parse line: " + line);
                        }
                        action.durationMs = this.readDuration(match[1], match[2]);
                    }
                    actionSet.actions.push(action);
                } else {
                    var match = /^after (\d+) (millisecond|second|minute|hour)s?\s*$/g.exec(line);
                    if(match.length != 3) {
                        throw new Error("Unable to parse line: " + line);
                    }
                    var delay = this.readDuration(match[1], match[2]);
                    var newActionSet = new GeneratorActionSet(delay);
                    if(actionSet) {
                        actionSet.next = newActionSet;
                    } else {
                        this.currentActionSet = newActionSet;
                    }
                    actionSet = newActionSet;
                }
                currentLineIndex++;
                line = lines[currentLineIndex];
            }
        };
        ParticleGenerator.prototype.readDuration = function (value, unit) {
            var duration = parseInt(value);
            switch(unit) {
                case 'second':
                    duration = duration * 1000;
                    break;
                case 'minute':
                    duration = duration * 60000;
                    break;
                case 'hour':
                    duration = duration * 3600000;
                    break;
            }
            return duration;
        };
        ParticleGenerator.prototype.getNewPositionAnywhere = function () {
            return {
                x: MathUtils.random() * this.parameters.sceneWidth,
                y: MathUtils.random() * this.parameters.sceneHeight
            };
        };
        ParticleGenerator.prototype.getNewPositionAtTheCenter = function () {
            return {
                x: MathUtils.random2() * 10 + this.parameters.sceneWidth / 2,
                y: MathUtils.random2() * 10 + this.parameters.sceneHeight / 2
            };
        };
        ParticleGenerator.prototype.getNewPositionAtTheEdges = function () {
            var edge = MathUtils.random();
            if(edge < 0.5) {
                return {
                    x: (edge < 0.25 ? MathUtils.random() * 10 : this.parameters.sceneWidth - MathUtils.random() * 10),
                    y: MathUtils.random() * this.parameters.sceneHeight
                };
            } else {
                return {
                    x: MathUtils.random() * this.parameters.sceneWidth,
                    y: (edge < 0.75 ? MathUtils.random() * 10 : this.parameters.sceneHeight - MathUtils.random() * 10)
                };
            }
        };
        return ParticleGenerator;
    })();
    Reactor.ParticleGenerator = ParticleGenerator;    
    var GeneratorActionSet = (function () {
        function GeneratorActionSet(delayMs) {
            this.delayMs = 0;
            this.actions = [];
            this.next = null;
            this.isWaiting = true;
            this.delayMs = delayMs;
            this.actions = [];
        }
        GeneratorActionSet.prototype.start = function (totalElapsedTimeMs) {
            this.startMs = totalElapsedTimeMs;
            this.isWaiting = true;
        };
        GeneratorActionSet.prototype.update = function (elapsedTimeMs, totalElapsedTimeMs) {
            if(this.isWaiting) {
                if(totalElapsedTimeMs - this.startMs < this.delayMs) {
                    return false;
                }
                this.isWaiting = false;
                _.each(this.actions, function (action) {
                    return action.start(totalElapsedTimeMs);
                });
            }
            var allActionsCompleted = true;
            _.each(this.actions, function (action) {
                if(!action.isCompleted) {
                    var completed = action.update(elapsedTimeMs, totalElapsedTimeMs);
                    if(!completed) {
                        allActionsCompleted = false;
                    }
                }
            });
            return allActionsCompleted;
        };
        return GeneratorActionSet;
    })();
    Reactor.GeneratorActionSet = GeneratorActionSet;    
    var GeneratorAction = (function () {
        function GeneratorAction() {
            this.isCompleted = false;
        }
        GeneratorAction.prototype.start = function (totalElapsedTimeMs) {
            this.startMs = totalElapsedTimeMs;
            this.isCompleted = false;
            this.nbrGeneratedParticles = 0;
        };
        GeneratorAction.prototype.update = function (elapsedTimeMs, totalElapsedTimeMs) {
            var target;
            if(this.durationMs == 0) {
                target = this.nbrParticlesToGenerate;
            } else {
                var elapsedTimeSinceStartMs = totalElapsedTimeMs - this.startMs;
                target = Math.floor(this.nbrParticlesToGenerate * elapsedTimeSinceStartMs / this.durationMs);
                if(target > this.nbrParticlesToGenerate) {
                    target = this.nbrParticlesToGenerate;
                }
            }
            for(var i = this.nbrGeneratedParticles; i < target; i++) {
                this.dropParticle(new Reactor.Particle(this.particleType, this.getNewParticleLocation()));
            }
            this.nbrGeneratedParticles = target;
            this.isCompleted = this.nbrGeneratedParticles >= this.nbrParticlesToGenerate;
            return this.isCompleted;
        };
        return GeneratorAction;
    })();
    Reactor.GeneratorAction = GeneratorAction;    
})(Reactor || (Reactor = {}));
//@ sourceMappingURL=ParticleGenerator.js.map
