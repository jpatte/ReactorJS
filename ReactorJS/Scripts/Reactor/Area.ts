/// <reference path="../Library/all.d.ts" />
/// <reference path="ParticleSet.ts" />

module Reactor
{
    export class Area
    {
        number: number;
        row: number;
        column: number;
        particles: ParticleSet;
        surroundingAreas: Area[];

        constructor(number: number, row: number, column: number)
        {
            this.number = number;
            this.row = row;
            this.column = column;
            this.particles = new ParticleSet();
        }
    }
}