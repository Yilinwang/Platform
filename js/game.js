var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.image('sky', 'img/sky.png');
    game.load.image('ground', 'img/platform.png');
    game.load.image('star', 'img/star.png');
    game.load.image('small', 'img/smallplatform.png');
    game.load.image('barrier', 'img/barrier.png');
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
var hp;
var labelHp;
var pre_barrier;
var pre_platform;

//for add Ledge
var dir;
var initvol;
var vol;
var pre_x;

//for game start
var start;
var space;
var timer;
var startText;
var endText;
var initgrav;
var psize;

function create() {
    start = false;
    pre_intensity = 0;
    score = 0;
    dir = true;
    initvol = 40;
    initgrav = 800;
    vol = initvol;
    pre_x = 0;
    psize = 0;
    hp = 100;
    pre_barrier = null;
    pre_platform = null;
    
    labelScore = game.add.text(20, 20, "Score: 0", { font: "20px Arial", fill: "#ffffff" });
    labelHp = game.add.text(20, 60, "HP: 100", { font: "20px Arial", fill: "#ff0000" });
    startText = game.add.text(0, 0, "Press SPACE to start!!", {font: "35px Arial", fill: "#ffffff", boundsAlignH: "center", boundsAlignV: "middle" });
    startText.setShadow(3, 3, "rgba(0, 0, 0, 0.5)", 2);
    startText.setTextBounds(0, 450, 800, 200);
    endText = game.add.text(0, 0, "", {font: "35px Arial", fill: "#ffffff", boundsAlignH: "center", boundsAlignV: "middle" });
    endText.setShadow(3, 3, "rgba(0, 0, 0, 0.5)", 2);
    endText.setTextBounds(0, 200, 800, 200);
    endText.visible = false;
    space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    gs = new GaussSense();

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.sprite(0, 0, 'sky');

    stars = game.add.group();
    stars.enableBody = true;

    platforms = game.add.group();
    platforms.enableBody = true;
    initplatform();

    player = game.add.sprite(32, game.world.height - 200, 'dude');
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0.2;
    //player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
}

function update() {
    if(hp <= 0) {
        restart();
    }
    else {
        game.world.bringToTop(labelScore);
        game.world.bringToTop(startText);
        game.world.bringToTop(endText);
        game.world.bringToTop(labelHp);
        if(start) {
            if(player.y > game.world.height-50) {
                restart();
            }
            setVol();
            setCollide();
            control();
        }
        else {
            startText.visible = true;
            if(space.isDown) {
                player.body.gravity.y = initgrav;
                start = true;
                timer = game.time.events.loop(3000, addLedge, this);
                startText.visible = false;
                endText.visible = false;
            }
            platforms.forEach(function(p) { p.body.velocity.y = 0; });
            player.body.gravity.y = 0;
            player.body.velocity.y = 0;
            player.body.velocity.x = 0;
        }
    }
}

function initplatform() {
    var floor = platforms.create(0, game.world.height-128, 'ground');
    floor.name = 'floor';
    floor.scale.setTo(2, 4);
    floor.body.immovable = true;
    addLedge(400);
    addLedge(300);
    addLedge(200);
    addLedge(100);
    addLedge(0);
}

function render() {
    game.debug.body(player);
    game.debug.body(platforms);
}

function setCollide() {
    //game.physics.arcade.collide(player, platforms);
    game.physics.arcade.overlap(player, platforms, touch, null, this);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
}

function touch(player, platform) {
    if(platform.barrier && platform != pre_barrier) {
        pre_barrier = platform;
        hp -= 50;
        labelHp.text = "HP: "+hp;
    }
    if(!platform.barrier && hp < 100 && platform != pre_platform) {
        hp += 5;
        labelHp.text = "HP: "+hp;
    }
    if(platform.id > score) {
        score = platform.id;
        labelScore.text = "Score: "+score;
    }
    if(player.body.touching.down && platform.body.touching.up) {
        player.body.gravity.y = 0;
        player.body.velocity.y = 0;
    }
    else {
        player.body.gravity.y = initgrav;
    }
    pre_platform = platform;
}

function control() {
    if(gs.isConnected()) {
        /*
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
                player.body.velocity.y = -500;
            }
            pre_intensity = north.intensity;
        }
        */
        var mid = gs.getBipolarMidpoint();
        var north = gs.getNorthPoint();
        if(mid != null) {
            if(mid.angle < -(Math.PI/18)) {
                player.body.velocity.x = -150;
                player.animations.play('left');
            }
            else if (mid.angle > (Math.PI/18)) {
                player.body.velocity.x = 150;
                player.animations.play('right');
            }
            else {
                player.animations.stop();
                player.frame = 4;
            }
            if (pre_intensity - north.intensity > 8) {
                player.body.velocity.y = -625;
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
        player.body.velocity.y = vol;
    }
    else {
        player.body.gravity.y = initgrav;
    }
    stars.forEach(function(s) {
        if(s != undefined) {
            if(s.body.touching.down) {
                s.body.gravity.y = 0;
                s.body.velocity.y = 20;
            }
            else {
                s.body.gravity.y = initgrav;
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
    var x = (dir)? rand()%200+50: rand()%200+550;
    var nstar = stars.create(x, rand()%80, 'star');
    nstar.body.gravity.y = initgrav;
}

function addLedge(height) {
    var x = rand()%550;
    while(Math.abs(x-pre_x) < 150)
        x = rand()%550;
    pre_x = x;
    var ledge;
    if(rand()%5 === 0) {
        ledge = platforms.create(x, height, 'barrier');
        ledge.barrier = true;
    }
    else {
        ledge = platforms.create(x, height, 'small');
        ledge.barrier = false;
    }
    psize++;
    ledge.id = psize;
    ledge.body.setSize(250, 1, 0, 0);
    ledge.checkWorldBounds = true;
    ledge.outOfBoundsKill = true;
    if(score%3 === 0) vol++;
    /*
    if(start) {
        addStar();
    }
    */
    dir = !dir;
}

function restart() {
    start = false;
    vol = initvol;
    platforms.forEach(function(p) { p.kill(); });
    stars.forEach(function(s) { s.kill(); });
    player.x = 32;
    player.y = game.world.height - 200;
    game.time.events.remove(timer);
    endText.visible = true;
    endText.text = "Your final score: "+score;
    score = 0;
    labelScore.text = "Score: "+score;
    pre_barrier = null;
    pre_platform = null;
    psize = 0;
    hp = 100;
    labelHp.text = "HP: "+hp;
    initplatform();
}
