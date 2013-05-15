/// <reference path="../Library/all.d.ts" />
/// <reference path="BondDescription.ts" />
/// <reference path="ParticleType.ts" />
/// <reference path="LinearForceDescription.ts" />
/// <reference path="ParticleGenerationScenario.ts" />

module Reactor
{
    export class SimulationParameters
    {
        sceneWidth: number;
        sceneHeight: number;
        heatLevel: number;
        particleTypes: { [name: string]: ParticleType; };
        possibleBondsBetweenEndPoints: { [ep1: string]: { [ep2: string]: BondDescription; }; };
        particleGenerationScenario: string;
        attractiveForcesBetweenParticles: { [pt1: string]: { [pt2: string]: LinearForceDescription; }; };
        repulsiveForcesBetweenParticles: { [pt1: string]: { [pt2: string]: LinearForceDescription; }; };
        wallsForce: LinearForceDescription;

        constructor()
        {
            // scene dimensions
            this.sceneWidth = 500;
            this.sceneHeight = 300;

            // global values
            this.heatLevel = 500;

            // particle types
            var redParticleType: ParticleType =
            {
                name: 'red',
                color: '#F00',
                size: 5,
                mass: 1,
                viscosity: 2,
                bondEndPointNames: ['r']
            };

            var blueParticleType: ParticleType =
            {
                name: 'blue',
                color: '#00F',
                size: 5,
                mass: 1,
                viscosity: 2,
                bondEndPointNames: ['b']
            };

            this.particleTypes = 
            {
                'red': redParticleType,
                'blue': blueParticleType,
            };

            // particles generation
            this.particleGenerationScenario =
                //"start\n" +
                //"  drop 150 blue immediately\n" +
                //"  drop 150 red immediately\n" +
                //"end";

                "start\n" +
                "  drop 150 'blue' anywhere immediately\n" +
                //"  drop 100 'red' anywhere immediately\n" +
                "after 5 seconds\n" +
                "  drop 100 'red' at the center in 10 seconds\n" +
                //"after 10 seconds\n" +
                //"  drop 50 'red' at the edges in 10 seconds\n" +
                "end";

            // walls
            this.wallsForce = { range: 5, amplitude: 2000 };

            // possible bonds
            var defaultBond: BondDescription = 
            {
                color: '#000',
                amplitude: 50,
                neutralRange: 20,
                maxRange: 30,
            };

            this.possibleBondsBetweenEndPoints =
            {
                'r': 
                {     
                    'r': null,
                    'b': defaultBond,
                },
                'b': 
                {     
                    'r': defaultBond,
                    'b': null,
                },
            };

            // attractive forces
            var defaultAttractiveForce = { range: 25, amplitude: 0 };
            this.attractiveForcesBetweenParticles = 
            {
                'red': 
                {     
                    'red': defaultAttractiveForce,
                    'blue': defaultAttractiveForce,
                },
                'blue': 
                {     
                    'red': defaultAttractiveForce,
                    'blue': defaultAttractiveForce,
                },
            };

            // repulsive forces
            var defaultRepulsiveForce = { range: 15, amplitude: 50 };
            this.repulsiveForcesBetweenParticles = 
            {
                'red': 
                {     
                    'red': defaultRepulsiveForce,
                    'blue': defaultRepulsiveForce,
                },
                'blue': 
                {     
                    'red': defaultRepulsiveForce,
                    'blue': defaultRepulsiveForce,
                },
            };
        }
    }
}