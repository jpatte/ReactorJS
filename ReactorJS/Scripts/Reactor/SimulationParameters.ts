/// <reference path="../Library/all.d.ts" />
/// <reference path="ParticleSet.ts" />

module Reactor
{
    export class SimulationParameters
    {
        sceneWidth: number;
        sceneHeight: number;
        particleTypes: { [name: string]: ParticleType; };
        particleGenerationScenario: ParticleGenerationScenario;
        wallsForce: LinearForceDescription;
        attractiveForcesBetweenParticles: { [pt1: string]: { [pt2: string]: LinearForceDescription; }; };
        repulsiveForcesBetweenParticles: { [pt1: string]: { [pt2: string]: LinearForceDescription; }; };

        constructor()
        {
            // scene dimensions
            this.sceneWidth = 480;
            this.sceneHeight = 320;

            // particle types
            var redParticleType = new ParticleType('red');
            redParticleType.color = '#F00';
            redParticleType.size = 5;
            redParticleType.agitation = 0.000;
            redParticleType.mass = 1;
            redParticleType.viscosity = 0.001;

            var blueParticleType = new ParticleType('blue');
            blueParticleType.color = '#00F';
            blueParticleType.size = 5;
            blueParticleType.agitation = 0.000;
            blueParticleType.mass = 1;
            blueParticleType.viscosity = 0.001;

            this.particleTypes = {};
            this.particleTypes['red'] = redParticleType;
            this.particleTypes['blue'] = blueParticleType;

            // particles generation
            this.particleGenerationScenario = new ParticleGenerationScenario();
            this.particleGenerationScenario.initialNbrParticles = {
                'red': 100,
                'blue': 100,
            };

            // walls
            this.wallsForce = { range: 5, amplitude: 0.005 };

            // attractive forces
            var defaultAttractiveForce = { range: 5, amplitude: 0 };
            this.attractiveForcesBetweenParticles = {
                'red': {     
                    'red': defaultAttractiveForce,
                    'blue': defaultAttractiveForce,
                },
                'blue': {     
                    'red': defaultAttractiveForce,
                    'blue': defaultAttractiveForce,
                },
            };

            // repulsive forces
            var defaulRepulsiveForce = { range: 10, amplitude: 0.001 };
            this.repulsiveForcesBetweenParticles = {
                'red': {     
                    'red': defaulRepulsiveForce,
                    'blue': defaulRepulsiveForce,
                },
                'blue': {     
                    'red': defaulRepulsiveForce,
                    'blue': defaulRepulsiveForce,
                },
            };
        }
    }

    export class ParticleGenerationScenario
    {
        initialNbrParticles: { [pt: string]: number; };
    }

    export interface LinearForceDescription
    {
        range: number;
        amplitude: number;
    }
}