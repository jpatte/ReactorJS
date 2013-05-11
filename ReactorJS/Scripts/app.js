var App = (function () {
    function App() { }
    App.Framerate = 30;
    App.prototype.start = function (canvas) {
        var _this = this;
        this.parameters = new Reactor.SimulationParameters();
        this.scene = canvas.get(0).getContext("2d");
        this.engine = new Reactor.Engine(this.parameters);
        setInterval(function () {
            _this.update();
            _this.draw();
        }, 1000 / App.Framerate);
    };
    App.prototype.update = function () {
        this.engine.update(1000 / App.Framerate);
    };
    App.prototype.draw = function () {
        this.scene.clearRect(0, 0, this.parameters.sceneWidth, this.parameters.sceneHeight);
        this.engine.render(this.scene);
    };
    return App;
})();
//@ sourceMappingURL=app.js.map
