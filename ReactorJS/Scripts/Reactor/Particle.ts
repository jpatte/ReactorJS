/// <reference path="../Library/all.d.ts" />
/// <reference path="ParticleType.ts" />
/// <reference path="Area.ts" />

module Reactor
{
    export class Particle
    {
        id: number;
        type: ParticleType;
        x: number;
        y: number;
        vx: number;
        vy: number;
        currentArea: Area;

        static idCounter = 0;
        
        constructor(type: ParticleType, x: number, y: number)
        {
            this.id = Particle.idCounter++;
            this.type = type;
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
        }
    }
}