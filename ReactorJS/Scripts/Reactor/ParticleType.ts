/// <reference path="../Library/all.d.ts" />

module Reactor
{
    export class ParticleType
    {
        number: number;
        color: string;
        size: number;
        agitation: number;
        mass: number;
        viscosity: number;

        constructor(number: number)
        {
            this.number = number;
            this.color = '#000';
            this.size = 5;
            this.agitation = 0.0005;
            this.mass = 1;
            this.viscosity = 0.001;
        }
    }
}