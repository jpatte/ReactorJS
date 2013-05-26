/// <reference path="../../Library/all.d.ts" />
/// <reference path="../../Utils/MathUtils.ts" />
/// <reference path="../../Utils/Vector2.ts" />
/// <reference path="../../App/Base/Component.ts" />
/// <reference path="../Base/EngineComponent.ts" />
/// <reference path="../Area.ts" />
/// <reference path="../Particle.ts" />
/// <reference path="../SimulationParameters.ts" />
/// <reference path="../EngineComponents/NaturalParticlesMovementComponent.ts" />
/// <reference path="../EngineComponents/WallsEffectComponent.ts" />
/// <reference path="../EngineComponents/MutualInteractionsComponent.ts" />
/// <reference path="../EngineComponents/ParticlesBondingComponent.ts" />
/// <reference path="../EngineComponents/ParticlesInteractionsComponent.ts" />

module Reactor
{
    export class Engine implements App.Component
    {
        parameters: SimulationParameters;
        private areasSize: number;
        private nbrAreaRows: number;
        private nbrAreaColumns: number;
        particles: ParticleSet;
        private areas: Area[];
        private limbo: Area;
        components: EngineComponent[];

        constructor(parameters: SimulationParameters)
        {
            this.parameters = parameters;
            this.particles = new ParticleSet();

            this.components = [
                new NaturalParticlesMovementComponent(parameters),
                new WallsEffectComponent(parameters),
                new ParticlesInteractionsComponent(parameters),
                new ParticlesBondingComponent(parameters),
            ];
        }

        init()
        {
            this.splitSceneIntoAreas();
        }

        update(elapsedTimeMs: number, totalElapsedTimeMs: number): void
        {
            this.particles.each((p: Particle) => 
            {
                this.computeInfluenceOnParticle(p);
            });

            this.particles.each((p: Particle) => 
            {
                this.updateParticlePosition(p, elapsedTimeMs);
                this.updateParticleCurrentArea(p);
            });
        }
        
        render(scene: CanvasRenderingContext2D): void
        {
            scene.beginPath();
            this.particles.each((p: Particle) => 
            {
                scene.fillStyle = p.type.color;
                var size = p.type.size;
                scene.fillRect(p.x - size/2, p.y - size/2, p.type.size, p.type.size);

                _.each(p.bondEndPoints, (ep: BondEndPoint) =>
                {
                    if(ep.isBound() && p.id < ep.boundParticle.id)
                    {
                        scene.strokeStyle = ep.bond.color;
                        scene.moveTo(p.x, p.y);
                        scene.lineTo(ep.boundParticle.x, ep.boundParticle.y);
                    }
                });
            });
            scene.closePath();
            scene.stroke();
        }

        addParticle(particle: Particle): void
        {
            this.particles.push(particle);
            this.updateParticleCurrentArea(particle);
        }

        removeParticle(particle: Particle): void
        {
            this.particles.remove(particle);
            if(particle.currentArea)
            {
                particle.currentArea.particles.remove(particle);
                particle.currentArea = null;
            }
        }

        private splitSceneIntoAreas(): void
        {
            var maxRange = _.reduce(this.components, (m: number, c: EngineComponent) =>
                Math.max(m, c.maxInfluenceRange), 0);

            // determine areas count & size 
            this.areasSize = Math.ceil(maxRange + 5);
            this.nbrAreaRows = Math.ceil(this.parameters.sceneHeight / this.areasSize) + 1;
            this.nbrAreaColumns = Math.ceil(this.parameters.sceneWidth / this.areasSize) + 1;

            // create areas
            this.areas = [];
            var counter = 0;
            for(var r = 0; r < this.nbrAreaRows; r++)
                for(var c = 0; c < this.nbrAreaColumns; c++)
                    this.areas.push(new Area(counter++, r, c));

            // pre-calculate surrounding areas
            _.each(this.areas, (a: Area) => a.surroundingAreas = this.getSurroundingAreas(a.row, a.column));

            // create special 'limbo' area for the region outside the scene
            this.limbo = new Area(-1, -1, -1);
            this.limbo.surroundingAreas = [];
        }
        
        private getSurroundingAreas(row: number, column: number): Area[]
        {
            var hasLeft = (column > 0);
            var hasTop = (row > 0);
            var hasRight = (column < this.nbrAreaColumns - 1);
            var hasBottom = (row < this.nbrAreaRows - 1);

            var neighbors = [];
            var addNeighbor = (r: number, c: number, cond: bool) => {
                if(cond)
                    neighbors.push(this.areas[r * this.nbrAreaColumns + c]);
            };

            addNeighbor(row - 1, column - 1, hasTop && hasLeft);
            addNeighbor(row - 1, column,     hasTop);
            addNeighbor(row - 1, column + 1, hasTop && hasRight);
            addNeighbor(row,     column - 1, hasLeft);
            addNeighbor(row,     column,     true);
            addNeighbor(row,     column + 1, hasRight);
            addNeighbor(row + 1, column - 1, hasBottom && hasLeft);
            addNeighbor(row + 1, column,     hasBottom);
            addNeighbor(row + 1, column + 1, hasBottom && hasRight);
            return neighbors;
        }
        
        private computeAreaNumber(p: Vector2): number
        {
            var row = Math.floor(p.y / this.areasSize + 0.5);
            var column = Math.floor(p.x / this.areasSize + 0.5);
            return this.nbrAreaColumns * row + column;
        }

        private updateParticlePosition(particle: Particle, elapsedTimeMs: number): void
        {
            // get elapsed time interval, in seconds
            var dt = elapsedTimeMs / 1000;

            // integrate applied forces to update the particle's speed 
            particle.vx += particle.fx / particle.type.mass * dt;
            particle.vy += particle.fy / particle.type.mass * dt;

            // integrate the particle's speed to update its position 
            particle.x += particle.vx * dt
            particle.y += particle.vy * dt
        }

        private updateParticleCurrentArea(particle: Particle): void
        {
            var previousArea = particle.currentArea;
            var newArea = this.areas[this.computeAreaNumber(particle)] || this.limbo;

            if(previousArea != newArea)
            {
                if(previousArea)
                    previousArea.particles.remove(particle);
                newArea.particles.push(particle);
                particle.currentArea = newArea;
            }
        }

        private computeInfluenceOnParticle(particle: Particle): void
        {
            var particlesNearby = this.getParticlesNearby(particle);
            particle.fx = particle.fy = 0;
            _.each(this.components, (c: EngineComponent) => 
                c.addInfluenceOnParticle(particle, particlesNearby));
        }

        private getParticlesNearby(p1: Particle): Particle[]
        {
            var particlesNearby = [];
            _.each(p1.currentArea.surroundingAreas, (area: Area) =>
            {
                area.particles.each((p2: Particle) => 
                {
                    if(p1.id != p2.id)
                        particlesNearby.push(p2);
                });
            });
            return particlesNearby;
        }
    }
}