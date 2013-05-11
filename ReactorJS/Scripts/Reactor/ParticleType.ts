/// <reference path="../Library/all.d.ts" />

module Reactor
{
    export class ParticleType
    {
        name: string;
        color: string;
        size: number;
        agitation: number;
        mass: number;
        viscosity: number;

        constructor(name: string)
        {
            this.name = name;
            this.color = '#000';
            this.size = 5;
            this.agitation = 0.0005;
            this.mass = 1;
            this.viscosity = 0.001;
        }
    }
}