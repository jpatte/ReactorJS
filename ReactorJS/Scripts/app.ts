/// <reference path="Library/all.d.ts" />
/// <reference path="Base/AppComponent.ts" />
/// <reference path="Components/FramerateCounter.ts" />
/// <reference path="Reactor/Engine.ts" />
/// <reference path="Reactor/ParticleGenerator.ts" />

class App
{
    static Framerate = 30;

    scene: CanvasRenderingContext2D;

    parameters: Reactor.SimulationParameters;
    components: Reactor.AppComponent[];

    private startTimeMs: number;
    private totalElapsedTimeMs: number;

    init(canvas: JQuery): void
    {
        this.parameters = new Reactor.SimulationParameters();

        this.scene = canvas.get(0).getContext("2d");
    }

    start(): void 
    {
        this.startTimeMs = Date.now();
        this.totalElapsedTimeMs = 0;

        var engine = new Reactor.Engine(this.parameters);
        var generator = new Reactor.ParticleGenerator(this.parameters);
        generator.newParticle = (p: Reactor.Particle) => engine.addParticle(p);

        this.components = [
            engine,
            generator,
            new FramerateCounter(),
        ];
        
        setInterval(() => {
          this.update();
          this.draw();
        }, 1000/App.Framerate);
    }

    private update(): void 
    {
        var nowMs = Date.now();
        var newTotalElapsedTimeMs = (nowMs - this.startTimeMs)/1;
        var elapsedTimeMs = newTotalElapsedTimeMs - this.totalElapsedTimeMs;
        this.totalElapsedTimeMs = newTotalElapsedTimeMs
        
        _.each(this.components, (c: Reactor.AppComponent) => c.update(elapsedTimeMs, newTotalElapsedTimeMs));
    }

    private draw(): void 
    {
        this.scene.clearRect(0, 0, this.parameters.sceneWidth, this.parameters.sceneHeight);
  
        _.each(this.components, (c: Reactor.AppComponent) => c.render(this.scene));
    }
}
