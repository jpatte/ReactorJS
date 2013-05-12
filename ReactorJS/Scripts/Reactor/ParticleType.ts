/// <reference path="../Library/all.d.ts" />

module Reactor
{
    export class ParticleType
    {
        name: string;
        color: string;
        size: number;
        mass: number;
        viscosity: number;

        constructor(name: string)
        {
            this.name = name;
        }
    }
}