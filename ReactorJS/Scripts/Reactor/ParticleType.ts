module Reactor
{
    export interface ParticleType
    {
        name: string;
        color: string;
        size: number;
        mass: number;
        viscosity: number;
        bondEndPointNames: string[];
    }
}