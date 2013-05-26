/// <reference path="../../Library/all.d.ts" />
/// <reference path="../../Utils/MathUtils.ts" />
/// <reference path="../../Utils/Vector2.ts" />
/// <reference path="../Base/EngineComponent.ts" />
/// <reference path="../SimulationParameters.ts" />

module Reactor
{
    export class NaturalParticlesMovementComponent implements EngineComponent
    {
        parameters: SimulationParameters;
        maxInfluenceRange = 0;

        constructor(parameters: SimulationParameters)
        {
            this.parameters = parameters;
        }

        addInfluenceOnParticle(particle: Particle, particlesNearby: Particle[]): void
        {
            // global agitation
            particle.fx += this.parameters.heatLevel * MathUtils.random2();
            particle.fy += this.parameters.heatLevel * MathUtils.random2();

            // viscosity
            particle.fx += - particle.type.viscosity * particle.vx;
            particle.fy += - particle.type.viscosity * particle.vy;
        }
    }
}