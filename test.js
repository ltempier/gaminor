"use strict";

var Gaminor = require('./Class').Gaminor;

var json = {
    size: [1000, 250],
    balls: [
        {
            position: {x: 0, y: 0},
            vector: {i: 1, j: 2}
        }
    ],
    obstacles: [
        {
            position: {x: 50, y: 50},
            size: 30
        },
        {
            position: {x: 200, y: 100},
            size: 20
        },
        {
            position: {x: 100, y: 150},
            size: 30
        },
        {
            position: {x: 500, y: 100},
            size: 30
        },
        {
            position: {x: 300, y: 50},
            size: 60
        },
        {
            position: {x: 400, y: 200},
            size: 40
        },
        {
            position: {x: 600, y: 60},
            size: 40
        },
        {
            position: {x: 700, y: 110},
            size: 70
        }
    ],
    startDate: 0
};

var gaminor = new Gaminor(json);

gaminor.process(100000000);

gaminor.save("./test.json");
