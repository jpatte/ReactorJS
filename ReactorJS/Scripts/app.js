var App = (function () {
    function App() { }
    App.Framerate = 30;
    App.prototype.init = function (canvas) {
        this.parameters = new Reactor.SimulationParameters();
        this.scene = canvas.get(0).getContext("2d");
    };
    App.prototype.start = function () {
        var _this = this;
        this.startTimeMs = Date.now();
        this.totalElapsedTimeMs = 0;
        this.engine = new Reactor.Engine(this.parameters);
        setInterval(function () {
            _this.update();
            _this.draw();
        }, 1000 / App.Framerate);
    };
    App.prototype.update = function () {
        var nowMs = Date.now();
        var newTotalElapsedTimeMs = nowMs - this.startTimeMs;
        var elapsedTimeMs = newTotalElapsedTimeMs - this.totalElapsedTimeMs;
        this.totalElapsedTimeMs = newTotalElapsedTimeMs;
        this.engine.update(elapsedTimeMs, newTotalElapsedTimeMs);
    };
    App.prototype.draw = function () {
        this.scene.clearRect(0, 0, this.parameters.sceneWidth, this.parameters.sceneHeight);
        this.engine.render(this.scene);
    };
    return App;
})();
//@ sourceMappingURL=app.js.map
