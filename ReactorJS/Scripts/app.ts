/// <reference path="Library/all.d.ts" />
/// <reference path="Reactor/Engine.ts" />

class App
{
    static Framerate = 30;

    scene: CanvasRenderingContext2D;

    parameters: Reactor.SimulationParameters;
    engine: Reactor.Engine;

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
        this.engine = new Reactor.Engine(this.parameters);

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
        
        this.engine.update(elapsedTimeMs, newTotalElapsedTimeMs);
    }

    private draw(): void 
    {
        this.scene.clearRect(0, 0, this.parameters.sceneWidth, this.parameters.sceneHeight);
  
        this.engine.render(this.scene);
    }
}

