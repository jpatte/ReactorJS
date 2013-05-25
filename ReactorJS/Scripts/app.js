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
        var engine = new Reactor.Engine(this.parameters);
        var generator = new Reactor.ParticleGenerator(this.parameters);
        generator.newParticle = function (p) {
            return engine.addParticle(p);
        };
        this.components = [
            engine, 
            generator, 
            new FramerateCounter(), 
            
        ];
        setInterval(function () {
            _this.update();
            _this.draw();
        }, 1000 / App.Framerate);
    };
    App.prototype.update = function () {
        var nowMs = Date.now();
        var newTotalElapsedTimeMs = (nowMs - this.startTimeMs) / 1;
        var elapsedTimeMs = newTotalElapsedTimeMs - this.totalElapsedTimeMs;
        this.totalElapsedTimeMs = newTotalElapsedTimeMs;
        _.each(this.components, function (c) {
            return c.update(elapsedTimeMs, newTotalElapsedTimeMs);
        });
    };
    App.prototype.draw = function () {
        var _this = this;
        this.scene.clearRect(0, 0, this.parameters.sceneWidth, this.parameters.sceneHeight);
        _.each(this.components, function (c) {
            return c.render(_this.scene);
        });
    };
    return App;
})();
//@ sourceMappingURL=app.js.map
