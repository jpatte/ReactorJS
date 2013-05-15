/// <reference path="../Library/all.d.ts" />
/// <reference path="../Utils/MathUtils.ts" />
/// <reference path="Area.ts" />
/// <reference path="Particle.ts" />
/// <reference path="SimulationParameters.ts" />
/// <reference path="Vector2.ts" />
/// <reference path="ParticleGenerator.ts" />

module Reactor
{
    export class Engine
    {
        parameters: SimulationParameters;
        areasSize: number;
        nbrAreaRows: number;
        nbrAreaColumns: number;

        generator: ParticleGenerator;
        particles: ParticleSet;
        areas: Area[];
        limbo: Area;

        constructor(parameters: SimulationParameters)
        {
            this.parameters = parameters;

            this.particles = new ParticleSet();
            this.generator = new ParticleGenerator(parameters);
            this.generator.newParticle = (p: Particle) =>
            {
                this.particles.push(p);
                this.onParticleMoved(p);
            };

            this.splitSceneIntoAreas();
        }

        update(elapsedTimeMs: number, totalElapsedTimeMs: number): void
        {
            this.generator.update(elapsedTimeMs, totalElapsedTimeMs);

            this.particles.each((p: Particle) => 
            {
                this.updateParticlePosition(p, elapsedTimeMs);
                this.onParticleMoved(p);
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

        private splitSceneIntoAreas(): void
        {
            // find max force range between particles
            var maxRange = 0;
            for(var ep1 in this.parameters.possibleBondsBetweenEndPoints)
            {
                for(var ep2 in this.parameters.possibleBondsBetweenEndPoints[ep1])
                {
                    var bond = this.parameters.possibleBondsBetweenEndPoints[ep1][ep2];
                    if(bond && bond.maxRange > maxRange)
                        maxRange = bond.maxRange;
                }
            }

            for(var pt1 in this.parameters.particleTypes)
            {
                for(var pt2 in this.parameters.particleTypes)
                {
                    var attractiveForce = this.parameters.attractiveForcesBetweenParticles[pt1][pt2];
                    if(attractiveForce.amplitude != 0 && attractiveForce.range > maxRange)
                        maxRange = attractiveForce.range;

                    var repulsiveForce = this.parameters.repulsiveForcesBetweenParticles[pt1][pt2];
                    if(repulsiveForce.amplitude != 0 && repulsiveForce.range > maxRange)
                        maxRange = repulsiveForce.range;
                }
            }

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
        
        private computeAreaNumber(p: Vector2): number
        {
            var row = Math.floor(p.y / this.areasSize + 0.5);
            var column = Math.floor(p.x / this.areasSize + 0.5);
            return this.nbrAreaColumns * row + column;
        }

        private updateParticlePosition(particle: Particle, elapsedTimeMs: number): void
        {
            // calculate forces applied to this particle
            var f = this.computeInfluenceOnParticle(particle);

            // get elapsed time interval, in seconds
            var dt = elapsedTimeMs / 1000;

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
                x: this.parameters.heatLevel * MathUtils.random2() - particle.type.viscosity * particle.vx, 
                y: this.parameters.heatLevel * MathUtils.random2() - particle.type.viscosity * particle.vy
            };

            this.addInfluenceFromOtherParticles(particle, f);
            this.addInfluenceFromWalls(particle, f);
            return f;
        }

        private addInfluenceFromOtherParticles(p1: Particle, f: Vector2): void
        {
            var boundParticles: Particle[] = p1.bondEndPoints
                .filter((ep: BondEndPoint) => ep.isBound())
                .map((ep: BondEndPoint) => ep.boundParticle);

            _.each(p1.currentArea.surroundingAreas, (area: Area) =>
            {
                area.particles.each((p2: Particle) => 
                {
                    if(p1.id != p2.id)
                    {
                        // are these particles bound together ?
                        var p2Index = boundParticles.indexOf(p2);
                        var bondExists = (p2Index >= 0);
                        if(bondExists)
                            boundParticles.splice(p2Index, 1);

                        this.addInfluenceFromParticle(p1, p2, bondExists, f);
                    }
                });
            });

            // handle all unhandled bound particles 
            _.each(boundParticles, (p2: Particle) => 
            {
                this.addInfluenceFromParticle(p1, p2, true, f);
            });
        }

        private addInfluenceFromParticle(p1: Particle, p2: Particle, bondExists: bool, f: Vector2): void
        {
            // are these particles bound together ?
            var activeBond: BondDescription = null;
            var boundEndPoint: BondEndPoint = null;             
            if(bondExists)
            {
                boundEndPoint = _.find(p1.bondEndPoints, (endPoint: BondEndPoint) => endPoint.boundParticle == p2);
                activeBond = boundEndPoint.bond;
            }

            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if(bondExists)
            {
                // these particles are bound together.
                // are they close enough to maintain the bond ?
                if(distance > activeBond.maxRange)
                {
                    // nope, let's break the bond
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
            }
            else
            {
                // these particles are not bound together.
                // do they both have a free matching endpoint ?
                _.each(p1.bondEndPoints, (endPoint: BondEndPoint) =>
                {
                    if(bondExists || endPoint.isBound())
                        return;

                    _.each(p2.bondEndPoints, (otherEndPoint: BondEndPoint) =>
                    {
                        if(bondExists || otherEndPoint.isBound())
                            return;

                        var possibleBond: BondDescription =
                            this.parameters.possibleBondsBetweenEndPoints[endPoint.name][otherEndPoint.name];

                        if(possibleBond && distance <= possibleBond.maxRange)
                        {
                            // the particles have matching endpoints and are close enough to be bound.
                            // so let's bind them
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

            if(bondExists)
            {
                // apply effect of the active bond
                this.addInfluenceFromBond(p1, p2, distance, activeBond, f);
            }
            else
            {
                // apply repulsive/attractive forces
                var repulsiveForce = this.parameters.repulsiveForcesBetweenParticles[p1.type.name][p2.type.name];
                this.addInfluenceFromForce(p1, p2, distance, repulsiveForce, f);

                var attractiveForce = this.parameters.attractiveForcesBetweenParticles[p1.type.name][p2.type.name];
                this.addInfluenceFromForce(p1, p2, distance, attractiveForce, f);
            }
        }

        private addInfluenceFromForce(forceTarget: Vector2, forceOrigin: Vector2, distance: number, force: LinearForceDescription, f: Vector2): void
        {
            var range = force.range;
            if(force.amplitude == 0 || distance > range)
                return;

            var coeff = force.amplitude * (range - distance) / range;
            f.x += coeff * (forceTarget.x - forceOrigin.x);
            f.y += coeff * (forceTarget.y - forceOrigin.y);
        }

        private addInfluenceFromBond(target: Vector2, end: Vector2, distance: number, bond: BondDescription, f: Vector2): void
        {
            var coeff = bond.amplitude * (bond.neutralRange - distance) / bond.neutralRange;
            f.x += coeff * (target.x - end.x);
            f.y += coeff * (target.y - end.y);
        }

        private addInfluenceFromWalls(particle: Particle, f: Vector2): void
        {
            var range = this.parameters.wallsForce.range;
            var amplitude = this.parameters.wallsForce.amplitude;

            if(particle.x <= range)
                f.x = amplitude * (range - particle.x) / range;
            else if(particle.x >= this.parameters.sceneWidth - range)
                f.x = amplitude * (this.parameters.sceneWidth - range - particle.x) / range;

            if(particle.y <= range)
                f.y = amplitude * (range - particle.y) / range;
            else if(particle.y >= this.parameters.sceneHeight - range)
                f.y = amplitude * (this.parameters.sceneHeight - range - particle.y) / range;
        }
    }
}