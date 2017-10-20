"use strict";

class GaminorClient extends Gaminor {

    constructor(json) {
        super();

        this.size = json.size;
        this.balls = (json.balls || []).map((b) => {
            return new BallClient(b.position, b.vector)
        });
        this.obstacles = (json.obstacles || []).map((o) => {
            return new ObstacleClient(o.position, o.size)
        });
        this.startDate = json.startDate;
        this.processDate = json.startDate;

        this.init();
        this.draw()
    }

    processDelay(length, delay) {
        var i = 0;
        var interval = setInterval(()=> {
            if (i > length && interval)
                clearInterval(interval);
            this.next();
            i++
        }, delay);
    }

    next() {
        super.process(1);
        this.draw(10);
    }

    init() {
        paper.project.clear();


        var rect = new paper.Path.Rectangle(0, 0, this.size[0], this.size[1]);
        rect.fillColor = 'white';
        rect.strokeColor = 'black';


        this.obstacles.forEach(function (obstacle) {
            obstacle.draw()
        });
        this._ballLayer = new paper.Layer()
    }

    draw(length) {

        length = (length == null) ? 0 : length;

        this._ballLayer.removeChildren(0, this._ballLayer.children.length - length);
        this._ballLayer.activate();

        this.balls.forEach((ball, idx)=> {
            ball.draw()
        })
    }
}

class BallClient extends Ball {

    constructor(position, vector, color) {
        super(position, vector);
        this.color = color || "black"
    }

    draw(direction) {
        var rect = new paper.Path.Rectangle(this.position.x - 1, this.position.y - 1, 2, 2);
        rect.fillColor = this.color;

        if (direction === true) {
            var dirPath = new paper.Path();
            dirPath.strokeColor = 'black';
            dirPath.moveTo(new paper.Point(this.position));
            dirPath.lineTo(new paper.Point(this.getNextPosition()));
        }
    }
}

class ObstacleClient extends Obstacle {

    draw() {
        var circle = new paper.Path.Circle(new paper.Point(this.position), this.size);
        circle.fillColor = 'red';
        circle.strokeColor = 'black';
    }
}
