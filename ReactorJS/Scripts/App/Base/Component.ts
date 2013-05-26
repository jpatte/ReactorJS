module App
{
    export interface Component 
    {
        init();
        update(elapsedTimeMs: number, totalElapsedTimeMs: number): void;        
        render(scene: CanvasRenderingContext2D): void;
    }
}
