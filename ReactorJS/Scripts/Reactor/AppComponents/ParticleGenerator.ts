/// <reference path="../../Library/all.d.ts" />
/// <reference path="../../Utils/MathUtils.ts" />
/// <reference path="../../Utils/Vector2.ts" />
/// <reference path="../../App/Base/Component.ts" />
/// <reference path="../SimulationParameters.ts" />
/// <reference path="../Particle.ts" />

module Reactor 
{
    export class ParticleGenerator implements App.Component
    {
        newParticle: (p: Particle) => void;
        
        private parameters: SimulationParameters;
        private currentActionSet: GeneratorActionSet;
        private isStarted: bool;

        constructor(parameters: SimulationParameters)
        {
            this.newParticle = p => { };

            this.parameters = parameters;
        }

        init()
        {
            this.parseScenario(this.parameters.particleGenerationScenario);
            this.isStarted = false;
        }

        update(elapsedTimeMs: number, totalElapsedTimeMs: number): void
        {
            if(!this.isStarted)
            {
                this.currentActionSet.start(totalElapsedTimeMs);
                this.isStarted = true;
            }

            if(!this.currentActionSet)
                return;

            var completed = this.currentActionSet.update(elapsedTimeMs, totalElapsedTimeMs);
            if(completed)
            {
                this.currentActionSet = this.currentActionSet.next;
                if(this.currentActionSet)
                    this.currentActionSet.start(totalElapsedTimeMs);
            }
        }

        render(scene: CanvasRenderingContext2D): void
        {
            // nothing to render
        }

        private parseScenario(scenario: string): void
        {
            var lines = scenario.split("\n");
            var currentLineIndex = 1; // skip first line, it should be "start"
            var actionSet: GeneratorActionSet = new GeneratorActionSet(0);
            this.currentActionSet = actionSet;

            var line = lines[currentLineIndex];
            while(!/^end\s*$/g.test(line))
            {
                if(/^\s+/.test(line))
                {
                    line = line.trim();
                    var match = /^drop (\d+) '(\S+)' (anywhere|at the center|at the edges)\s+/g.exec(line);
                    if(match.length != 4)
                        throw new Error("Unable to parse line: " + line);
                 
                    var action = new GeneratorAction();
                    action.dropParticle = p => this.newParticle(p);
                    action.nbrParticlesToGenerate = parseInt(match[1]);
                    action.particleType = this.parameters.particleTypes[match[2]];
                    switch(match[3])
                    {
                        case 'anywhere': action.getNewParticleLocation = () => this.getNewPositionAnywhere(); break;
                        case 'at the center': action.getNewParticleLocation = () => this.getNewPositionAtTheCenter(); break;
                        case 'at the edges': action.getNewParticleLocation = () => this.getNewPositionAtTheEdges(); break;
                    }

                    if(/ immediately\s*$/g.test(line))
                    {
                        action.durationMs = 0;
                    }
                    else
                    {
                        match = /\s+in (\d+) (millisecond|second|minute|hour)s?\s*$/g.exec(line);
                        if(match.length != 3)
                            throw new Error("Unable to parse line: " + line);

                        action.durationMs = this.readDuration(match[1], match[2]);
                    }

                    actionSet.actions.push(action);
                }
                else
                {
                    var match = /^after (\d+) (millisecond|second|minute|hour)s?\s*$/g.exec(line);
                    if(match.length != 3)
                        throw new Error("Unable to parse line: " + line);

                    var delay = this.readDuration(match[1], match[2]);
                    var newActionSet = new GeneratorActionSet(delay);
                    if(actionSet)
                        actionSet.next = newActionSet;
                    else
                        this.currentActionSet = newActionSet;
                    actionSet = newActionSet;
                }

                currentLineIndex++;
                line = lines[currentLineIndex];
            }       
        }

        private readDuration(value: string, unit: string): number
        {
            var duration = parseInt(value);
            switch(unit)
            {
                case 'second': duration = duration * 1000; break;
                case 'minute': duration = duration * 60000; break;
                case 'hour': duration = duration * 3600000; break;
            }
            return duration;
        }
        
        private getNewPositionAnywhere(): Vector2
        {
            return { 
                x: MathUtils.random() * this.parameters.sceneWidth, 
                y: MathUtils.random() * this.parameters.sceneHeight 
            };
        }

        private getNewPositionAtTheCenter(): Vector2
        {
            return { 
                x: MathUtils.random2() * 10 + this.parameters.sceneWidth / 2, 
                y: MathUtils.random2() * 10 + this.parameters.sceneHeight / 2 
            };
        }

        private getNewPositionAtTheEdges(): Vector2
        {
            var edge = MathUtils.random();

            if(edge < 0.5) // left or right
            {
                return {
                    x: (edge < 0.25 ? MathUtils.random() * 10 : this.parameters.sceneWidth - MathUtils.random() * 10),
                    y: MathUtils.random() * this.parameters.sceneHeight
                };
            }
            else // top or bottom
            {
                return { 
                    x: MathUtils.random() * this.parameters.sceneWidth, 
                    y: (edge < 0.75 ? MathUtils.random() * 10 : this.parameters.sceneHeight - MathUtils.random() * 10)
                };
            }       
        }
    }

    export class GeneratorActionSet
    {
        delayMs: number = 0;
        actions: GeneratorAction[] = [];
        next: GeneratorActionSet = null;

        private startMs: number;
        private isWaiting: bool = true;
        
        constructor(delayMs: number)
        {
            this.delayMs = delayMs;
            this.actions = [];
        }
        
        start(totalElapsedTimeMs: number)
        {
            this.startMs = totalElapsedTimeMs;
            this.isWaiting = true;
        }
        
        update(elapsedTimeMs: number, totalElapsedTimeMs: number): bool
        {
            if(this.isWaiting)
            {
                if(totalElapsedTimeMs - this.startMs < this.delayMs)
                    return false;

                this.isWaiting = false;
                _.each(this.actions, (action: GeneratorAction) => action.start(totalElapsedTimeMs));
            }

            var allActionsCompleted = true;
            _.each(this.actions, (action: GeneratorAction) =>
            {
                if(!action.isCompleted)
                {
                    var completed = action.update(elapsedTimeMs, totalElapsedTimeMs);
                    if(!completed)
                        allActionsCompleted = false;
                }
            });

            return allActionsCompleted;
        }
    }

    export class GeneratorAction
    {
        dropParticle: (p: Particle) => void;
        getNewParticleLocation: () => Vector2;

        nbrParticlesToGenerate: number;
        particleType: ParticleType;
        durationMs: number;
        isCompleted: bool = false;

        private startMs: number;
        private nbrGeneratedParticles: number;

        start(totalElapsedTimeMs: number)
        {
            this.startMs = totalElapsedTimeMs;
            this.isCompleted = false;
            this.nbrGeneratedParticles = 0;
        }

        update(elapsedTimeMs: number, totalElapsedTimeMs: number): bool
        {
            var target: number;
            if(this.durationMs == 0)
            {
                target = this.nbrParticlesToGenerate;
            }
            else
            {
                var elapsedTimeSinceStartMs = totalElapsedTimeMs - this.startMs;
                target = Math.floor(this.nbrParticlesToGenerate * elapsedTimeSinceStartMs / this.durationMs);
                if(target > this.nbrParticlesToGenerate)
                    target = this.nbrParticlesToGenerate;
            }

            for(var i = this.nbrGeneratedParticles; i < target; i++)
                this.dropParticle(new Particle(this.particleType, this.getNewParticleLocation()));

            this.nbrGeneratedParticles = target;
            this.isCompleted = this.nbrGeneratedParticles >= this.nbrParticlesToGenerate;
            return this.isCompleted;
        }
    }
}
