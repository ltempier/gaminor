"use strict";

class Gaminor {
    constructor(json) {
        this.size = [];
        this.balls = [];
        this.obstacles = [];
        this.startDate = 0;
        this.processDate = 0;
        this.buffer = [];

        if (json)
            this.loadJson(json)
    }

    loadJson(json) {
        this.size = json.size;
        this.balls = (json.balls || []).map((b) => {
            return new Ball(b.position, b.vector)
        });
        this.obstacles = (json.obstacles || []).map((o) => {
            return new Obstacle(o.position, o.size)
        });
        this.startDate = json.startDate;
        this.processDate = json.startDate;
        this.buffer = []
    }

    load(filePath) {
        try {
            var f = require('fs').readFileSync(filePath);
            this.loadJson(JSON.parse(f))
        } catch (e) {

        }
    }

    save(filePath) {
        try {
            require('fs').writeFileSync(filePath, JSON.stringify(this.toJson(), null))
        } catch (e) {

        }
    }

    toJson(buffer) {
        var json = {
            startDate: this.processDate,
            size: this.size,
            balls: this.balls.map((ball)=>ball.toJson()),
            obstacles: this.obstacles.map((obstacle)=>obstacle.toJson())
        };
        if (buffer == true)
            json.buffer = this.buffer;
        return json
    }

    process(length) {
        for (var i = 0; i < length; i++) {


            var dt = 1;
            this.balls.forEach((ball)=> {
                ball.process(this.obstacles, this, dt)
            });
            this.processDate += dt;

            var processDateStr = this.processDate.toString();
            if (processDateStr.endsWith("000")) {
                this.buffer.push(this.getValue())
            }

            //var v = this.getValue();
            //if (!this.buffer[v])
            //    this.buffer[v] = [];
            //this.buffer[v].push(this.processDate)

        }
    }

    getValue() {
        return [this.processDate, this.balls.map((ball) => {
            return ball.toString()
        }).join(";")].join("+")
    }

    collision(position) {
        return (position.x <= 0 || position.x >= this.size[0] || position.y <= 0 || position.y >= this.size[1]);
    }

    processCollision(ball) {
        var nextPosition = ball.getNextPosition(0.1);
        if (!this.collision(nextPosition)) {
            ball.position = nextPosition;
        }
        else {
            if (nextPosition.x <= 0) {
                nextPosition.x = 0;

                var dx = nextPosition.x - ball.position.x;
                nextPosition.y = ball.position.y + ball.vector.getDy(dx);
                ball.vector.i *= -1
            }

            if (nextPosition.x >= this.size[0]) {
                nextPosition.x = this.size[0];

                var dx = nextPosition.x - ball.position.x;
                nextPosition.y = ball.position.y + ball.vector.getDy(dx);
                ball.vector.i *= -1
            }

            if (nextPosition.y <= 0) {
                nextPosition.y = 0;

                var dy = nextPosition.y - ball.position.y;
                nextPosition.x = ball.position.x + ball.vector.getDx(dy);
                ball.vector.j *= -1
            }

            if (nextPosition.y >= this.size[1]) {
                nextPosition.y = this.size[1];

                var dy = nextPosition.y - ball.position.y;
                nextPosition.x = ball.position.x + ball.vector.getDx(dy);
                ball.vector.j *= -1
            }

            ball.position = nextPosition;
        }
    }


    processCollision2(ball) {
        var nextPosition = ball.getNextPosition();
        if (!this.collision(nextPosition)) {
            ball.position = nextPosition;
        }
        else {
            var normal;

            if (nextPosition.x <= 0) {
                nextPosition.x = 0;
                nextPosition.y = ball.position.y + ball.vector.getDy(ball.position.x);
                normal = new Vector(1, 0);
            }

            if (nextPosition.y <= 0) {
                nextPosition.y = 0;
                nextPosition.x = ball.position.x + ball.vector.getDx(ball.position.y);
                normal = new Vector(0, 1);
            }


            if (nextPosition.x >= this.size[0]) {
                nextPosition.x = this.size[0];
                var dx = nextPosition.x - ball.position.x;
                nextPosition.y = ball.position.y + ball.vector.getDy(dx);
                normal = new Vector(-1, 0);
            }


            if (nextPosition.y >= this.size[1]) {
                nextPosition.y = this.size[1];
                var dy = nextPosition.y - ball.position.y;
                nextPosition.x = ball.position.x + ball.vector.getDx(dy);
                normal = new Vector(0, -1);
            }


            if (this.collision(nextPosition))
                console.log('io');


            var pscal = (ball.vector.i * normal.i + ball.vector.j * normal.j);
            ball.position = nextPosition;
            ball.vector = new Vector(
                ball.vector.i - 2 * pscal * normal.i,
                ball.vector.j - 2 * pscal * normal.j
            )
        }
    }

    static generateRandomConfig() {
        var size = [randomInt(300, 600), randomInt(300, 600)];
        var json = {
            size: size,
            startDate: 0,
            balls: [],
            obstacles: []
        };

        for (var i = 0; i < randomInt(1, 10); i++) {
            json.balls.push({
                position: {x: randomInt(0, size[0]), y: randomInt(0, size[1])},
                vector: {i: randomInt(-3, 3), j: randomInt(-3, 3)}
            })
        }

        for (var i = 0; i < randomInt(1, 10); i++) {
            json.obstacles.push({
                position: {x: randomInt(0, size[0]), y: randomInt(0, size[1])},
                size: randomInt(10, 100)
            })
        }

        return json;

        function randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
}

class Obstacle {
    constructor(position, size) {
        this.position = new Position(position.x, position.y);
        this.size = size;
    }

    toJson() {
        return {
            position: this.position.toJson(),
            size: this.size
        }
    }

    collision(position) {
        return Math.pow(position.x - this.position.x, 2) + Math.pow(position.y - this.position.y, 2) <= Math.pow(this.size, 2)
    }


    processCollision(ball) {
        var nextPosition = ball.getNextPosition();

        if (this.collision(nextPosition)) {

            var intersection = ball.position.clone();
            var processX = true;
            var max = ball.vector.i;
            if (ball.vector.j > max) {
                processX = false;
                max = ball.vector.j;
            }

            var attempts = 100;
            var dt = max / attempts;

            for (var i = 0; i < attempts; i++) {
                var buffer = new Position();
                if (processX) {
                    buffer.x = ball.position.x + dt;
                    buffer.y = ball.position.y + ball.vector.getDy(dt)
                }
                else {
                    buffer.x = ball.position.x + ball.vector.getDx(dt);
                    buffer.y = ball.position.y + dt
                }

                if (this.collision(buffer))
                    break;

                intersection = buffer
            }

            var normal = new Vector(intersection.x - this.position.x, intersection.y - this.position.y).normalize();
            var pscal = ball.vector.i * normal.i + ball.vector.j * normal.j;

            var nextVector = new Vector(
                ball.vector.i - 2 * pscal * normal.i,
                ball.vector.j - 2 * pscal * normal.j
            );

            ball.vector = nextVector;
            ball.position = intersection
        }
        else {
            ball.position = nextPosition
        }
    }

    //processCollision2(ball) { //not work
    //    var nextPosition = ball.getNextPosition();
    //    if (!this.collision(nextPosition)) {
    //        ball.position = nextPosition
    //    } else if (ball.vector.j !== 0 && ball.vector.i !== 0) {
    //        var a = ball.vector.j / ball.vector.i;
    //        var b = ball.position.y - ball.vector.j / ball.vector.i * ball.position.x;
    //        var cx = this.position.x;
    //        var cy = this.position.y;
    //        var r = this.size;
    //
    //        var A = 1 + a * a;
    //        var B = 2 * (-cx + a * b - a * cy);
    //        var C = cx * cx + cy * cy + b * b - 2 * b * cy - r * r;
    //        var delta = B * B - 4 * A * C;
    //
    //        if (delta > 0) {
    //            var x0 = (-b + Math.sqrt(delta)) / (2 * a);
    //            var x1 = (-b - Math.sqrt(delta)) / (2 * a);
    //
    //            var p0 = new Position(x0, a * x0 + b);
    //            var p1 = new Position(x1, a * x1 + b);
    //
    //            if (Position.getDistance(p1, ball.position) < Position.getDistance(p0, ball.position))
    //                p0 = p1;
    //
    //            nextPosition = p0
    //
    //        } else if (delta == 0) {
    //            var x = -b / (2 * a);
    //            nextPosition.x = x;
    //            nextPosition.y = a * x + b;
    //        } else {
    //            console.log('pb');
    //            this.processCollision(ball)
    //            return;
    //        }
    //
    //        var normal = new Vector(nextPosition.x - this.position.x, nextPosition.y - this.position.y).normalize();
    //        var pscal = ball.vector.i * normal.i + ball.vector.j * normal.j;
    //
    //        var nextVector = new Vector(
    //            ball.vector.i - 2 * pscal * normal.i,
    //            ball.vector.j - 2 * pscal * normal.j
    //        );
    //
    //
    //        nextVector.setLength(ball.vector.getLength());
    //
    //
    //        ball.vector = nextVector;
    //        ball.position = nextPosition
    //    }
    //    else
    //        this.processCollision(ball)
    //}
}


class Ball {
    constructor(position, vector) {
        this.position = new Position(position.x, position.y);
        this.vector = new Vector(vector.i, vector.j);
    }

    toJson() {
        return {
            position: this.position.toJson(),
            vector: this.vector.toJson()
        }
    }

    process(obstacles, gaminor) {

        gaminor.processCollision(this);

        obstacles.forEach((obstacle)=> {
            obstacle.processCollision(this)
        });
    }

    getNextPosition(dt) {
        var v = this.vector.normalize();
        if (dt > 0)
            v.setLength(dt);
        var nextPosition = this.position.clone();

        nextPosition.add(v);
        return nextPosition
    }

    toString() {
        return [Ball.round(this.position.x), Ball.round(this.position.y)].join(":")
    }

    static round(value) {
        var factor = 1000;
        return Math.round(value * factor) / factor;
    }
}


class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toJson() {
        return {
            x: this.x,
            y: this.y
        }
    }

    clone() {
        return new Position(this.x, this.y)
    }

    add(vector) {
        this.x = this.x + vector.i;
        this.y = this.y + vector.j;
    }

    static getDistance(p1, p2) {
        var v = new Vector(p1.x - p2.x, p1.i - p2.j);
        return v.getLength()

    }
}

class Vector {
    constructor(i, j) {
        this.i = i;
        this.j = j;
    }

    toJson() {
        return {
            i: this.i,
            j: this.j
        }
    }

    clone() {
        return new Vector(this.i, this.j)
    }

    getDy(x) {
        return x * this.j / this.i
    }

    getDx(y) {
        return y * this.i / this.j
    }

    getLength() {
        return Math.sqrt(Math.pow(this.i, 2) + Math.pow(this.j, 2))
    }

    setLength(length) {
        var f = length / this.getLength();
        this.i *= f;
        this.j *= f
    }

    normalize() {
        var r = this.getLength();
        return new Vector(this.i / r, this.j / r);
    }

    //rotateDegree(degrees) {
    //    var radians = Math.PI / 180 * degrees;
    //    this.rotate(radians)
    //}
    //
    //rotate(radians) {
    //
    //    if (radians == 0 || radians == 2 * Math.PI)
    //        return;
    //
    //    var r = this.getLength();
    //
    //    var a = this.getSlope() + radians;
    //    var ca = Math.cos(a);
    //    var sa = Math.sin(a);
    //
    //    this.i = Gaminor.round(ca * r);
    //    this.j = Gaminor.round(sa * r);
    //}
}


try {
    module.exports = {
        Gaminor: Gaminor,
        Ball: Ball,
        Obstacle: Obstacle,
        Vector: Vector,
        Position: Position
    };
} catch (e) {

}
