/// <reference path="../../Library/all.d.ts" />
/// <reference path="../Base/Component.ts" />

module App
{
    export class FramerateCounter implements Component
    {
        currentSecond = 0;
        previousFrameCounter = 0;
        currentFrameCounter = 0;

        update(elapsedTimeMs: number, totalElapsedTimeMs: number): void
        {
            var sec = Math.floor(totalElapsedTimeMs / 1000);
            if(sec == this.currentSecond)
            {
                this.currentFrameCounter++;
            }
            else
            {
                this.previousFrameCounter = this.currentFrameCounter;
                this.currentFrameCounter = 0;
                this.currentSecond = sec;
            }
        }
        
        render(scene: CanvasRenderingContext2D): void
        {
            scene.fillStyle = '#000';
            scene.fillText('FPS: ' + this.previousFrameCounter, 10, 10);
        }
    }
}


