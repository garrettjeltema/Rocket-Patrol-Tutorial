class Play extends Phaser.Scene {
    constructor() {
        super("playScene")
    }

    create() {
        // place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0)
        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0)
        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0)

        // add rocket (p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0)

        // add spaceships (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0)
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship',  0, 20).setOrigin(0, 0)
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0, 0)

        // smaller, faster ship
        this.ship04 = new Spaceship(this, game.config.width + borderUISize*9, borderUISize*4 + borderPadding*6, 'smallship', 0, 50).setOrigin(0, 0)

        // define timer
        this.timer = this.time.addEvent({
            delay: game.settings.gameTimer,
            args: [],
            startAt: 0,
            timeScale: 1,
            paused: false
        })

        // define keys
        keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)

        // initialize score
        this.p1Score = 0

        // display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig)

        // display high score
        this.highScore = this.add.text(game.config.width/2, borderUISize + borderPadding*2, highScore, highScoreConfig)
        
        // GAME OVER flag
        this.gameOver = false

        this.bgm = this.sound.add('music', {
            mute: false,
            volume: 2,
            rate: 1,
            loop: true
        })
        this.bgm.play()

        // 60-second play clock
        // scoreConfig.fixedWidth = 0
        // this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
        //     this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5)
        //     this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or <- for Menu', scoreConfig).setOrigin(0.5)
        //     this.gameOver = true
        // }, null, this)
    }

    update() {
        // check key input for restart
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyRESET)) {
            this.bgm.stop()
            this.scene.restart()
        }
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene")
        }
        

        // display timer
        let clockConfig = {
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
        if(!this.gameOver) {
            this.elapsed = this.timer.getRemainingSeconds()
            this.elapsed = Math.ceil(this.elapsed)
            this.timeLeft = this.add.text(game.config.width-140, borderUISize + borderPadding*2, this.elapsed, clockConfig)
        }

        // different config to end screen
        clockConfig.fixedWidth = 0
        if(this.timer.getRemainingSeconds() == 0) {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', clockConfig).setOrigin(0.5)
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or <- for Menu', clockConfig).setOrigin(0.5)
            this.gameOver = true
        }

        this.starfield.tilePositionX -= 4

        if(!this.gameOver) {
            this.p1Rocket.update()
            this.ship01.update()
            this.ship02.update()
            this.ship03.update()
            this.ship04.update()
        }

        // high score update
        if(this.p1Score > highScore) {
            highScore = this.p1Score
        }

        // check collisions
        if(this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset()
            this.shipExplode(this.ship03)
        }
        if(this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset()
            this.shipExplode(this.ship02)
        }
        if(this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset()
            this.shipExplode(this.ship01)
        }
        if(this.checkCollision(this.p1Rocket, this.ship04)) {
            this.p1Rocket.reset()
            this.shipExplode(this.ship03)
        }

        // check misses
        if(this.checkMiss(this.p1Rocket)) {
            this.timer.delay = this.timer.delay - 3000
        }
    }

    checkCollision(rocket, ship) {
        // simple AABB (Axis-Aligned Bounding Box) checking
        if (rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship.y) {
            return true
        } else {
            return false
        }
    }

    checkMiss(rocket) {
        if(rocket.y <= borderUISize * 3 + borderPadding + 1) {
            return true
        } else {
            return false
        }
    }
    
    shipExplode(ship) {
        // temporarily hide ship
        ship.alpha = 0
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0)
        boom.anims.play('explode')              // play explode animation
        boom.on('animationcomplete', () => {    // callback after anim completes
            ship.reset()                        // reset ship position
            ship.alpha = 1                      // make ship visible again
            boom.destroy()                      // remove explosion sprite
        })
        // score add and text update and time add
        this.p1Score += ship.points
        this.scoreLeft.text = this.p1Score
        this.timer.delay = this.timer.delay + 3000

        this.sound.play('sfx-explosion')
    }
}