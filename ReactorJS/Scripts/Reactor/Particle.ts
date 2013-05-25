/// <reference path="../Library/all.d.ts" />
/// <reference path="../Utils/Vector2.ts" />
/// <reference path="BondDescription.ts" />
/// <reference path="BondEndPoint.ts" />
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
        bondEndPoints: BondEndPoint[];

        static idCounter = 0;
        
        constructor(type: ParticleType, position: Vector2)
        {
            this.id = Particle.idCounter++;
            this.type = type;
            this.x = position.x;
            this.y = position.y;
            this.vx = 0;
            this.vy = 0;

            this.bondEndPoints = _.map(type.bondEndPointNames, (name: string) => new BondEndPoint(name));
        }
    }
}