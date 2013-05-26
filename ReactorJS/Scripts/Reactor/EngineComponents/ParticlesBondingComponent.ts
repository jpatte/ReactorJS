/// <reference path="../../Library/all.d.ts" />
/// <reference path="../../Utils/MathUtils.ts" />
/// <reference path="../../Utils/Vector2.ts" />
/// <reference path="../Base/EngineComponent.ts" />
/// <reference path="../SimulationParameters.ts" />

module Reactor
{
    export class ParticlesBondingComponent implements EngineComponent
    {
        parameters: SimulationParameters;
        maxInfluenceRange: number;
        private maxBondRange: number;

        constructor(parameters: SimulationParameters)
        {
            this.parameters = parameters;

            // find max force range between particles
            var maxRange = 0;
            for(var ep1 in this.parameters.possibleBondsBetweenEndPoints)
            {
                for(var ep2 in this.parameters.possibleBondsBetweenEndPoints[ep1])
                {
                    var bond = this.parameters.possibleBondsBetweenEndPoints[ep1][ep2];
                    if(bond && bond.maxRange > maxRange)
                        maxRange = bond.maxRange;
                }
            }
            this.maxBondRange = maxRange;
            this.maxInfluenceRange = maxRange;
        }

        addInfluenceOnParticle(p1: Particle, particlesNearby: Particle[]): void
        {
            var boundParticles: Particle[] = p1.bondEndPoints
                .filter((ep: BondEndPoint) => ep.isBound())
                .map((ep: BondEndPoint) => ep.boundParticle);

            _.each(particlesNearby, (p2: Particle) => 
            {
                // are these particles bound together ?
                var p2Index = boundParticles.indexOf(p2);
                var bondExists = (p2Index >= 0);
                if(bondExists)
                    boundParticles.splice(p2Index, 1);

                this.addInfluenceFromOtherParticle(p1, p2, bondExists);
            });

            // handle all unhandled bound particles 
            _.each(boundParticles, (p2: Particle) => 
            {
                this.addInfluenceFromOtherParticle(p1, p2, true);
            });
        }

        private addInfluenceFromOtherParticle(p1: Particle, p2: Particle, bondExists: bool): void
        {
            // are these particles bound together ?
            var activeBond: BondDescription = null;
            var boundEndPoint: BondEndPoint = null;             
            if(bondExists)
            {
                boundEndPoint = _.find(p1.bondEndPoints, (endPoint: BondEndPoint) => endPoint.boundParticle == p2);
                activeBond = boundEndPoint.bond;
            }

            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if(bondExists)
            {
                // these particles are bound together.
                // are they close enough to maintain the bond ?
                if(distance > activeBond.maxRange)
                {
                    // nope, let's break the bond
                    var otherEndPoint = boundEndPoint.boundEndPoint;
                    otherEndPoint.bond = null;
                    otherEndPoint.boundParticle = null;
                    otherEndPoint.boundEndPoint = null;
                    boundEndPoint.bond = null;
                    boundEndPoint.boundParticle = null;
                    boundEndPoint.boundEndPoint = null;
                    activeBond = null;
                    bondExists = false;
                }
            }
            else
            {
                // these particles are not bound together.
                // do they both have a free matching endpoint ?
                _.each(p1.bondEndPoints, (endPoint: BondEndPoint) =>
                {
                    if(bondExists || endPoint.isBound())
                        return;

                    _.each(p2.bondEndPoints, (otherEndPoint: BondEndPoint) =>
                    {
                        if(bondExists || otherEndPoint.isBound() || distance > this.maxBondRange)
                            return;

                        var possibleBond: BondDescription =
                            this.parameters.possibleBondsBetweenEndPoints[endPoint.name][otherEndPoint.name];

                        if(possibleBond && distance <= possibleBond.maxRange)
                        {
                            // the particles have matching endpoints and are close enough to be bound.
                            // so let's bind them
                            endPoint.bond = possibleBond;
                            endPoint.boundParticle = p2;
                            endPoint.boundEndPoint = otherEndPoint;
                            otherEndPoint.bond = possibleBond;
                            otherEndPoint.boundParticle = p1;
                            otherEndPoint.boundEndPoint = endPoint;
                            activeBond = possibleBond;
                            bondExists = true;
                        }
                    });
                });
            }

            if(bondExists)
            {
                // apply effect of the active bond
                this.addInfluenceFromBond(p1, p2, distance, activeBond);
            }
        }

        private addInfluenceFromBond(particle: Particle, boundParticle: Particle, distance: number, bond: BondDescription): void
        {
            var coeff = bond.amplitude * (bond.maxRange - distance) / bond.maxRange;
            particle.fx += coeff * (particle.x - boundParticle.x);
            particle.fy += coeff * (particle.y - boundParticle.y);
        }

    }
}