/// <reference path="Library/all.d.ts" />
/// <reference path="Reactor/Engine.ts" />

class App
{
    static FPS = 30;

    scene: CanvasRenderingContext2D;
    sceneWidth: number;
    sceneHeight: number;

    engine: Reactor.Engine;

    start(canvas: JQuery): void
    {
        this.scene = canvas.get(0).getContext("2d");
        this.sceneWidth = canvas.width();
        this.sceneHeight = canvas.height();

        this.engine = new Reactor.Engine(this.sceneWidth, this.sceneHeight);

        setInterval(() => {
          this.update();
          this.draw();
        }, 1000/App.FPS);
    }

    update(): void 
    {
        this.engine.update(1000/App.FPS);
    }

    draw(): void 
    {
        this.scene.clearRect(0, 0, this.sceneWidth, this.sceneHeight);
  
        this.engine.render(this.scene);
    }
}

