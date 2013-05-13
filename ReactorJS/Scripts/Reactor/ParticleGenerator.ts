/// <reference path="../Library/all.d.ts" />
/// <reference path="../Utils/MathUtils.ts" />
/// <reference path="SimulationParameters.ts" />
/// <reference path="ParticleGenerationScenario.ts" />
/// <reference path="Particle.ts" />

module Reactor 
{
    export class ParticleGenerator
    {
        parameters: SimulationParameters;
        isInitialized: bool;
        newParticle: (p: Particle) => void;

        constructor(parameters: SimulationParameters)
        {
            this.parameters = parameters;
            this.isInitialized = false;
            this.newParticle = p => { };
        }

        update(): void
        {
            if(this.isInitialized)
                return;

            var width = this.parameters.sceneWidth;
            var height = this.parameters.sceneHeight;

            for(var typeName in this.parameters.particleTypes)
            {
                var particleType = this.parameters.particleTypes[typeName];
                var nbrParticlesToCreate = this.parameters.particleGenerationScenario.initialNbrParticles[typeName];
                for(var i = 0; i < nbrParticlesToCreate; i++)
                {
                    var particle = new Particle(particleType,
                        MathUtils.random() * width,
                        MathUtils.random() * height);

                    this.newParticle(particle);
                }
            }

            this.isInitialized = true;
        }

    }
}
