var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('sky', 'img/sky.png');
    game.load.image('ground', 'img/platform.png');
    game.load.image('star', 'img/star.png');
    game.load.spritesheet('dude', 'img/dude.png', 32, 48);
}

//GaussSense
var gs;
var pre_intensity;

//Group
var platforms;
var stars;

//Sprite
var player;
var score;
var labelScore;

//for add Ledge
var dir;
var vol;

function create() {
    pre_intensity = 0;
    score = 0;
    dir = true;
    vol = 40;
    labelScore = game.add.text(20, 20, "0", { font: "50px Arial", fill: "#ffffff" });

    gs = new GaussSense();

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.sprite(0, 0, 'sky');

    stars = game.add.group();
    stars.enableBody = true;

    platforms = game.add.group();
    platforms.enableBody = true;

    var floor = platforms.create(0, game.world.height-64, 'ground');
    floor.name = 'floor';
    floor.scale.setTo(2, 2);
    floor.body.immovable = true;
    addLedge();
    var timer = game.time.events.loop(3000, addLedge, this);

    player = game.add.sprite(32, game.world.height - 150, 'dude');
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
}

function update() {
    if(player.y > game.world.height-50) {
        console.log('dead');
    }
    setVol();
    setCollide();
    control();
    game.world.bringToTop(labelScore);
}

function restart() {
    console.log('bla');
}

function setCollide() {
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
}

function control() {
    if(gs.isConnected()) {
        var north = gs.getNorthPoint();
        if(north != null) {
            if (north.x < 0.4 && north.x >0) {
                player.body.velocity.x = -150;
                player.animations.play('left');
            }
            else if (north.x > 0.6) {
                player.body.velocity.x = 150;
                player.animations.play('right');
            }
            else {
                player.animations.stop();
                player.frame = 4;
            }
            if (pre_intensity - north.intensity > 8) {
                player.body.velocity.y = -350;
            }
            pre_intensity = north.intensity;
        }
    }
}

function setVol() {
    platforms.forEach(function(pl) {
        pl.body.velocity.y = vol;
        pl.body.velocity.x = 0;
    });
    if(player.body.touching.down) {
        player.body.gravity.y = 0;
        player.body.velocity.y = 20;
    }
    else {
        player.body.gravity.y = 300;
    }
    stars.forEach(function(s) {
        if(s != undefined) {
            if(s.body.touching.down) {
                s.body.gravity.y = 0;
                s.body.velocity.y = 20;
            }
            else {
                s.body.gravity.y = 300;
            }
        }
    });
    player.body.velocity.x = 0;
}

function rand() {
    return Math.floor(Math.random()*1000);
}

function collectStar(player, star) {
    star.kill();
    score += 10;
    labelScore.text = score;
}

function addStar() {
    var x = (dir)? rand()%200: rand()%200+600;
    var nstar = stars.create(x, rand()%80, 'star');
    nstar.body.gravity.y = 500;
}

function addLedge() {
    var x = (dir)? -rand()%150: rand()%150+400;
    var ledge = platforms.create(x, 100, 'ground');
    ledge.checkWorldBounds = true;
    ledge.outOfBoundsKill = true;
    vol++;
    addStar();
    dir = !dir;
}
