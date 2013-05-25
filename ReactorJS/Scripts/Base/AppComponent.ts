module Reactor 
{
    export interface AppComponent 
    {
        update(elapsedTimeMs: number, totalElapsedTimeMs: number): void;        
        render(scene: CanvasRenderingContext2D): void;
    }
}