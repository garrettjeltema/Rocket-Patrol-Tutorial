// Name: Garrett Jeltema
// Title: Rocket Patrol: Mind Blown
// Hours: 6
// Mods Chosen: Added Timer, Timing/Scoring Mechanism, High Score, Background Music, 


let config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    scene: [ Menu, Play ]
}
let game = new Phaser.Game(config)

// reserve keyboard bindings
let keyFIRE, keyRESET, keyLEFT, keyRIGHT

let borderUISize = game.config.height / 15
let borderPadding = borderUISize / 3

// high score config
let highScore = 0

let highScoreConfig = {
    fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
}