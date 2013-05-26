/// <reference path="../../Library/all.d.ts" />
/// <reference path="../../Utils/MathUtils.ts" />
/// <reference path="../../Utils/Vector2.ts" />
/// <reference path="../Base/EngineComponent.ts" />
/// <reference path="../Base/DistancesGrid.ts" />
/// <reference path="../SimulationParameters.ts" />

module Reactor
{
    export class WallsEffectComponent implements EngineComponent
    {
        parameters: SimulationParameters;
        maxInfluenceRange: number;

        constructor(parameters: SimulationParameters)
        {
            this.parameters = parameters;    
               
            this.maxInfluenceRange =  this.parameters.wallsForce.range;
        }

        addInfluenceOnParticle(particle: Particle, particlesNearby: Particle[]): void
        {
            var range = this.parameters.wallsForce.range;
            var amplitude = this.parameters.wallsForce.amplitude;

            if(particle.x <= range)
                particle.fx += amplitude * (range - particle.x) / range;
            else if(particle.x >= this.parameters.sceneWidth - range)
                particle.fx += amplitude * (this.parameters.sceneWidth - range - particle.x) / range;

            if(particle.y <= range)
                particle.fy += amplitude * (range - particle.y) / range;
            else if(particle.y >= this.parameters.sceneHeight - range)
                particle.fy += amplitude * (this.parameters.sceneHeight - range - particle.y) / range;
        }
    }
}