module App
{
    export interface Component 
    {
        update(elapsedTimeMs: number, totalElapsedTimeMs: number): void;        
        render(scene: CanvasRenderingContext2D): void;
    }
}
