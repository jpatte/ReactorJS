var App;
(function (App) {
    var Application = (function () {
        function Application() { }
        Application.Framerate = 30;
        Application.prototype.init = function (canvas) {
            this.parameters = new Reactor.SimulationParameters();
            this.scene = canvas.get(0).getContext("2d");
        };
        Application.prototype.start = function () {
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
                new App.FramerateCounter(), 
                
            ];
            _.each(this.components, function (c) {
                return c.init();
            });
            setInterval(function () {
                _this.update();
                _this.render();
            }, 1000 / Application.Framerate);
        };
        Application.prototype.update = function () {
            var nowMs = Date.now();
            var newTotalElapsedTimeMs = (nowMs - this.startTimeMs) / 1;
            var elapsedTimeMs = newTotalElapsedTimeMs - this.totalElapsedTimeMs;
            this.totalElapsedTimeMs = newTotalElapsedTimeMs;
            _.each(this.components, function (c) {
                return c.update(elapsedTimeMs, newTotalElapsedTimeMs);
            });
        };
        Application.prototype.render = function () {
            var _this = this;
            this.scene.clearRect(0, 0, this.parameters.sceneWidth, this.parameters.sceneHeight);
            _.each(this.components, function (c) {
                return c.render(_this.scene);
            });
        };
        return Application;
    })();
    App.Application = Application;    
})(App || (App = {}));
//@ sourceMappingURL=Application.js.map
