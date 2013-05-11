/// <reference path="Library/all.d.ts" />
/// <reference path="Reactor/Engine.ts" />

class App
{
    static Framerate = 30;

    scene: CanvasRenderingContext2D;

    parameters: Reactor.SimulationParameters;
    engine: Reactor.Engine;

    start(canvas: JQuery): void
    {
        this.parameters = new Reactor.SimulationParameters();

        this.scene = canvas.get(0).getContext("2d");

        this.engine = new Reactor.Engine(this.parameters);

        setInterval(() => {
          this.update();
          this.draw();
        }, 1000/App.Framerate);
    }

    update(): void 
    {
        this.engine.update(1000/App.Framerate);
    }

    draw(): void 
    {
        this.scene.clearRect(0, 0, this.parameters.sceneWidth, this.parameters.sceneHeight);
  
        this.engine.render(this.scene);
    }
}

