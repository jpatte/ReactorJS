/// <reference path="../Library/all.d.ts" />
/// <reference path="../Utils/MathUtils.ts" />
/// <reference path="Vector2.d.ts" />
/// <reference path="Area.ts" />
/// <reference path="Particle.ts" />

module Reactor
{
    export class Engine
    {
        particles: ParticleSet;
        areas: Area[];
        limbo: Area;
        sceneWidth: number;
        sceneHeight: number;

        nbrAreaRows: number;
        nbrAreaColumns: number;
        areasSize: number;

        constructor(sceneWidth: number, sceneHeight: number)
        {
            this.sceneWidth = sceneWidth;
            this.sceneHeight = sceneHeight;

            this.splitSceneIntoAreas();
            this.createParticles();
        }

        update(dt: number): void
        {
            this.particles.each((p: Particle) => 
            {
                this.updateParticlePosition(p, dt);
                this.onParticleMoved(p);
            });
        }
        
        render(scene: CanvasRenderingContext2D): void
        {
            this.particles.each((p: Particle) => 
            {
                scene.fillStyle = p.type.color;
                var size = p.type.size;
                scene.fillRect(p.x - size/2, p.y - size/2, p.type.size, p.type.size);
            });
        }

        private splitSceneIntoAreas(): void
        {
            this.areasSize = Math.ceil(10);
            this.nbrAreaRows = Math.ceil(this.sceneHeight / this.areasSize) + 1;
            this.nbrAreaColumns = Math.ceil(this.sceneWidth / this.areasSize) + 1;

            this.areas = [];
            var counter = 0;
            for(var r = 0; r < this.nbrAreaRows; r++)
                for(var c = 0; c < this.nbrAreaColumns; c++)
                    this.areas.push(new Area(counter++, r, c));
            this.limbo = new Area(-1, -1, -1);
        }
        
        private getSurroundingAreas(row: number, column: number): Area[]
        {
            var neighbors = [];
            if(row < 0)
                return neighbors;

            var hasLeft = (column > 0);
            var hasTop = (row > 0);
            var hasRight = (column < this.nbrAreaColumns - 1);
            var hasBottom = (row < this.nbrAreaRows - 1);
            var addNeighbor = (r: number, c: number) => neighbors.push(this.areas[r * this.nbrAreaColumns + c]);

            // top row
            if(hasTop)
            {
                if(hasLeft)
                    addNeighbor(row - 1, column - 1);
                addNeighbor(row - 1, column);
                if(hasRight)
                    addNeighbor(row - 1, column + 1);
            }

            // middle row
            if(hasLeft)
                addNeighbor(row, column - 1);
            addNeighbor(row, column);
            if(hasRight)
                addNeighbor(row, column + 1);

            // bottom row
            if(hasBottom)
            {
                if(hasLeft)
                    addNeighbor(row + 1, column - 1);
                addNeighbor(row + 1, column);
                if(hasRight)
                    addNeighbor(row + 1, column + 1);
            }

            return neighbors;
        }

        private createParticles(): void
        {
            var particleType1 = new ParticleType(1);
            particleType1.color = '#F00';
            var particleType2 = new ParticleType(2);
            particleType2.color = '#00F';

            this.particles = new ParticleSet();
            for(var i = 0; i < 200; i++)
            {
                var particle = new Particle(
                    MathUtils.random() > 0.5 ? particleType2 : particleType1,
                    MathUtils.random() * this.sceneWidth,
                    MathUtils.random() * this.sceneHeight);

                this.particles.push(particle);
                this.onParticleMoved(particle);
            }
        }
        
        private computeAreaNumber(p: Vector2): number
        {
            var row = Math.floor(p.y / this.areasSize + 0.5);
            var column = Math.floor(p.x / this.areasSize + 0.5);
            return this.nbrAreaColumns * row + column;
        }

        private updateParticlePosition(particle: Particle, dt: number): void
        {
            // calculate forces applied to this particle
            var f = this.computeInfluenceOnParticle(particle);

            // integrate applied forces to update the particle's speed 
            particle.vx += f.x / particle.type.mass * dt;
            particle.vy += f.y / particle.type.mass * dt;

            // integrate the particle's speed to update its position 
            particle.x += particle.vx * dt
            particle.y += particle.vy * dt
        }

        private onParticleMoved(particle: Particle): void
        {
            // get previous and new areas based on the particle position
            // (or limbo if the particle has somehow exited the scene)
            var previousArea = particle.currentArea;
            var newArea = this.areas[this.computeAreaNumber(particle)];
            if(!newArea)
                newArea = this.limbo;

            if(previousArea != newArea)
            {
                if(previousArea)
                    previousArea.particles.remove(particle);
                newArea.particles.push(particle);
                particle.currentArea = newArea;
            }
        }

        private computeInfluenceOnParticle(particle: Particle): Vector2
        {
            var f = { 
                x: particle.type.agitation * MathUtils.random2() - particle.type.viscosity * particle.vx, 
                y: particle.type.agitation * MathUtils.random2() - particle.type.viscosity * particle.vy
            };

            this.addInfluenceFromOtherParticles(particle, f);
            this.addInfluenceFromWalls(particle, f);
            return f;
        }

        private addInfluenceFromOtherParticles(p1: Particle, f: Vector2): void
        {
            var surroundingAreas = this.getSurroundingAreas(p1.currentArea.row, p1.currentArea.column);
            _.each(surroundingAreas, (area: Area) =>
            {
                area.particles.each((p2: Particle) => 
                {
                    if(p1.id != p2.id)
                        this.addInfluenceFromParticle(p1, p2, f);
                });
            });
        }

        private addInfluenceFromParticle(p1: Particle, p2: Particle, f: Vector2): void
        {
            // repulsive force
            var range = 10;
            var range2 = range * range;
            var maxForce = 0.001;

            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var distance2 = dx * dx + dy * dy;

            if(distance2 > range2)
                return;

            if(dx >= 0)
                f.x += maxForce * (range - dx) / range;
            else
                f.x += - maxForce * (range + dx) / range;

            if(dy >= 0)
                f.y += maxForce * (range - dy) / range;
            else
                f.y += - maxForce * (range + dy) / range;
        }

        private addInfluenceFromWalls(particle: Particle, f: Vector2): void
        {
            var range = 5;
            var maxForce = 0.005;

            if(particle.x <= range)
                f.x = maxForce * (range - particle.x) / range;
            else if(particle.x >= this.sceneWidth - range)
                f.x = maxForce * (this.sceneWidth - range - particle.x) / range;

            if(particle.y <= range)
                f.y = maxForce * (range - particle.y) / range;
            else if(particle.y >= this.sceneHeight - range)
                f.y = maxForce * (this.sceneHeight - range - particle.y) / range;
        }
    }
}