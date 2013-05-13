/// <reference path="../Library/all.d.ts" />
/// <reference path="../Utils/MathUtils.ts" />
/// <reference path="Area.ts" />
/// <reference path="Particle.ts" />
/// <reference path="SimulationParameters.ts" />
/// <reference path="Vector2.ts" />

module Reactor
{
    export class Engine
    {
        parameters: SimulationParameters;
        areasSize: number;
        nbrAreaRows: number;
        nbrAreaColumns: number;

        particles: ParticleSet;
        areas: Area[];
        limbo: Area;

        constructor(parameters: SimulationParameters)
        {
            this.parameters = parameters;

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

        private createParticles(): void
        {
            var width = this.parameters.sceneWidth;
            var height = this.parameters.sceneHeight;
            this.particles = new ParticleSet();

            for(var typeName in this.parameters.particleTypes)
            {
                var particleType = this.parameters.particleTypes[typeName];
                var nbrParticlesToCreate = this.parameters.particleGenerationScenario.initialNbrParticles[typeName];
                for(var i = 0; i < nbrParticlesToCreate; i++)
                {
                    var particle = new Particle(particleType,
                        MathUtils.random() * width,
                        MathUtils.random() * height);

                    this.particles.push(particle);
                    this.onParticleMoved(particle);
                }
            }
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
                x: this.parameters.heatLevel * MathUtils.random2() - particle.type.viscosity * particle.vx, 
                y: this.parameters.heatLevel * MathUtils.random2() - particle.type.viscosity * particle.vy
            };

            this.addInfluenceFromOtherParticles(particle, f);
            this.addInfluenceFromWalls(particle, f);
            return f;
        }

        private addInfluenceFromOtherParticles(p1: Particle, f: Vector2): void
        {
            _.each(p1.currentArea.surroundingAreas, (area: Area) =>
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
            // are these particles linked together ?
            var activeBond: BondDescription = null;
            var boundEndPoint: BondEndPoint = _.find(p1.bondEndPoints, (endPoint: BondEndPoint) => endPoint.boundParticle == p2);

            if(boundEndPoint)
                activeBond = boundEndPoint.bond;

            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if(activeBond)
            {
                // these particles are linked.
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
                }
            }
            else
            {
                // these particles are not linked.
                // do they both have a free matching endpoint ?
                _.each(p1.bondEndPoints, (endPoint: BondEndPoint) =>
                {
                    if(activeBond || endPoint.isBound())
                        return;

                    _.each(p2.bondEndPoints, (otherEndPoint: BondEndPoint) =>
                    {
                        if(activeBond || otherEndPoint.isBound())
                            return;

                        var possibleBond: BondDescription =
                            this.parameters.possibleBondsBetweenEndPoints[endPoint.name][otherEndPoint.name];

                        if(possibleBond && distance <= possibleBond.maxRange)
                        {
                            // the particles have matching endpoints and are close enough to be bound.
                            // so let's bind them
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

            if(activeBond)
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