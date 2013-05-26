/// <reference path="../Particle.ts" />

module Reactor
{
    export interface EngineComponent 
    {
        maxInfluenceRange: number;
        addInfluenceOnParticle(particle: Particle, particlesNearby: Particle[]): void;
    }
}
