var App = (function () {
    function App() { }
    App.FPS = 30;
    App.prototype.start = function (canvas) {
        var _this = this;
        this.scene = canvas.get(0).getContext("2d");
        this.sceneWidth = canvas.width();
        this.sceneHeight = canvas.height();
        this.engine = new Reactor.Engine(this.sceneWidth, this.sceneHeight);
        setInterval(function () {
            _this.update();
            _this.draw();
        }, 1000 / App.FPS);
    };
    App.prototype.update = function () {
        this.engine.update(1000 / App.FPS);
    };
    App.prototype.draw = function () {
        this.scene.clearRect(0, 0, this.sceneWidth, this.sceneHeight);
        this.engine.render(this.scene);
    };
    return App;
})();
//@ sourceMappingURL=app.js.map
