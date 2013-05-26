var App;
(function (App) {
    var FramerateCounter = (function () {
        function FramerateCounter() {
            this.currentSecond = 0;
            this.previousFrameCounter = 0;
            this.currentFrameCounter = 0;
        }
        FramerateCounter.prototype.init = function () {
        };
        FramerateCounter.prototype.update = function (elapsedTimeMs, totalElapsedTimeMs) {
            var sec = Math.floor(totalElapsedTimeMs / 1000);
            if(sec == this.currentSecond) {
                this.currentFrameCounter++;
            } else {
                this.previousFrameCounter = this.currentFrameCounter;
                this.currentFrameCounter = 0;
                this.currentSecond = sec;
            }
        };
        FramerateCounter.prototype.render = function (scene) {
            scene.fillStyle = '#000';
            scene.fillText('FPS: ' + this.previousFrameCounter, 10, 10);
        };
        return FramerateCounter;
    })();
    App.FramerateCounter = FramerateCounter;    
})(App || (App = {}));
//@ sourceMappingURL=FramerateCounter.js.map
