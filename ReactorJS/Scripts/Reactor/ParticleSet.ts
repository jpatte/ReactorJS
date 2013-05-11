/// <reference path="../Library/all.d.ts" />
/// <reference path="Particle.ts" />

module Reactor
{
    export class ParticleSet
    {
        private hash: {};

        constructor(particles?: Particle[])
        {
            this.hash = {};
            if(particles)
                _.each(particles, this.push);
        }

        push(particle: Particle): void
        {
            this.hash[particle.id] = particle;
        }

        remove(particle: Particle): bool
        {
            return delete this.hash[particle.id];
        }

        each(action: (p:Particle) => void): void
        {
            for(var id in this.hash)
                action(this.hash[id]);
        }
    }
}