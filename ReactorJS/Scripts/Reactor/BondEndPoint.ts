/// <reference path="../Library/all.d.ts" />
/// <reference path="BondDescription.ts" />
/// <reference path="Particle.ts" />

module Reactor
{
    export class BondEndPoint
    {
        name: string;
        bond: BondDescription;
        boundParticle: Particle;
        boundEndPoint: BondEndPoint;

        constructor(name: string)
        {
            this.name = name;
            this.bond = null;
            this.boundParticle = null;
            this.boundEndPoint = null;
        }

        isBound(): bool
        {
            return (this.bond != null);
        }
    }
}