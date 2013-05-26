/// <reference path="../../Library/all.d.ts" />
/// <reference path="../../Utils/MathUtils.ts" />
/// <reference path="../../Utils/Vector2.ts" />
/// <reference path="../Base/EngineComponent.ts" />
/// <reference path="../SimulationParameters.ts" />

module Reactor
{
    export class ParticlesInteractionsComponent implements EngineComponent
    {
        parameters: SimulationParameters;
        maxInfluenceRange: number;
        private maxBondRange: number;

        constructor(parameters: SimulationParameters)
        {
            this.parameters = parameters;

            // find max force range between particles
            var maxRange = 0;
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

            this.maxInfluenceRange = maxRange;
        }

        addInfluenceOnParticle(p1: Particle, particlesNearby: Particle[]): void
        {
            _.each(particlesNearby, (p2: Particle) => 
            {
                this.addInfluenceFromOtherParticle(p1, p2);
            });
        }

        private addInfluenceFromOtherParticle(p1: Particle, p2: Particle): void
        {
            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            // apply repulsive/attractive forces
            var repulsiveForce = this.parameters.repulsiveForcesBetweenParticles[p1.type.name][p2.type.name];
            this.addInfluenceFromForce(p1, p2, distance, repulsiveForce);

            var attractiveForce = this.parameters.attractiveForcesBetweenParticles[p1.type.name][p2.type.name];
            this.addInfluenceFromForce(p1, p2, distance, attractiveForce);
        }

        private addInfluenceFromForce(particle: Particle, forceOrigin: Vector2, distance: number, force: LinearForceDescription): void
        {
            var range = force.range;
            if(force.amplitude == 0 || distance > range)
                return;

            var coeff = force.amplitude * (range - distance) / range;
            particle.fx += coeff * (particle.x - forceOrigin.x);
            particle.fy += coeff * (particle.y - forceOrigin.y);
        }
    }
}