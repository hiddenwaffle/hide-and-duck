import Phaser from 'phaser'
import tilesImage from './tiles.png'
import tempJson from './temp.json'
import backgroundImage from './background.png'

let player = null
let mobs = null
let cursors = null
let obstructed = false
let hidden = false
let mobOverlap = false
let completed = false
let caughtTimer = -1
let caughtText = null
let completedText = null

function preload() {
  this.load.tilemapTiledJSON('map', tempJson)
  this.load.spritesheet('tiles', tilesImage, { frameWidth: 48, frameHeight: 48 });
  this.load.image('background', backgroundImage)
}

function create() {
  const map = this.make.tilemap({key: 'map'})
  const tiles = map.addTilesetImage('tiles')

  const background = this.add.image(0, 0, 'background')
  background.setScale(6)

  const groundLayer = map.createDynamicLayer('ground', tiles)
  groundLayer.setCollisionByExclusion([-1])
  this.physics.world.bounds.width = groundLayer.width
  this.physics.world.bounds.height = groundLayer.height

  const doorLayer = map.createStaticLayer('door', tiles)
  // Continued after player initialization...

  player = this.physics.add.sprite(100, 100, 'tiles')
  player.setCollideWorldBounds(true)
  this.physics.add.collider(groundLayer, player)

  // ...continued from before player initialization
  // I think the indices starts at 1 instead of 0?
  doorLayer.setTileIndexCallback(9, activeDoor, this)
  this.physics.add.overlap(player, doorLayer)

  const obstructionsLayer = map.createStaticLayer('obstructions', tiles)
  // I think the indices starts at 1 instead of 0?
  obstructionsLayer.setTileIndexCallback(7, activeObstruction, this)
  obstructionsLayer.setTileIndexCallback(8, activeObstruction, this)
  this.physics.add.overlap(player, obstructionsLayer)

  // Caught Condition Text
  caughtText = this.add.text(0, 0, 'CAUGHT', {
    font: '72px Arial Black',
    fill: '#fff'
  })
  caughtText.setStroke('#f00', 16);
  caughtText.setShadow(2, 2, '#333333', 2, true, true)
  caughtText.visible = false
  // Completed Condition Text
  completedText = this.add.text(0, 0, 'SUCCESS', {
    font: '74px Arial Black',
    fill: '#fff'
  })
  completedText.setStroke('#00f', 16);
  completedText.setShadow(2, 2, '#333333', 2, true, true)
  completedText.visible = false

  this.anims.create({
    key: 'stand',
    frames: this.anims.generateFrameNumbers('tiles', { frames: [0]}),
    frameRate: 1,
    repeat: -1
  })
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('tiles', { frames: [1, 2]}),
    frameRate: 6,
    repeat: -1
  })
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('tiles', { frames: [1, 2]}),
    frameRate: 6,
    repeat: -1
  })
  this.anims.create({
    key: 'duck',
    frames: this.anims.generateFrameNumbers('tiles', { frames: [10]}),
    frameRate: 1,
    repeat: -1
  })
  this.anims.create({
    key: 'caught',
    frames: this.anims.generateFrameNumbers('tiles', { frames: [3]}),
    frameRate: 1,
    repeat: -1
  })
  this.anims.create({
    key: 'mobLeft',
    frames: this.anims.generateFrameNumbers('tiles', { frames: [4, 5]}),
    frameRate: 6,
    repeat: -1
  })
  this.anims.create({
    key: 'mobRight',
    frames: this.anims.generateFrameNumbers('tiles', { frames: [4, 5]}),
    frameRate: 6,
    repeat: -1
  })

  // TODO: Place mobs in right places
  mobs = this.physics.add.group()
  for (let x = 300; x <= 412; x += 100) {
    const mob = mobs.create(x, 100, 'tiles')
    this.physics.add.collider(groundLayer, mob)
    mob.direction = -1 // custom property
    mobs.add(mob)
  }
  for (let x = 768; x <= 968; x += 200) {
    const mob = mobs.create(x, 100, 'tiles')
    this.physics.add.collider(groundLayer, mob)
    mob.direction = -1 // custom property
    mobs.add(mob)
  }
  this.physics.add.overlap(player, mobs, activeMob, null, this)

  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
  this.cameras.main.startFollow(player)
  this.cameras.main.roundPixels = true

  cursors = this.input.keyboard.createCursorKeys()
}

function update(time, delta) {
  if (caughtTimer > 0) {
    caughtTimer -= delta
    if (caughtTimer <= 0) {
      caughtTimer = -1
      caughtText.visible = false
      player.x = 100
      player.y = 100
    }
  } else {
    if (cursors.down.isDown && player.body.onFloor()) {
      player.setVelocity(0)
      player.anims.play('duck', true)
      if (obstructed) {
        hidden = true
      }
    } else {
      if (cursors.left.isDown) {
        player.setVelocityX(-8 * delta)
        player.anims.play('left', true)
      } else if (cursors.right.isDown) {
        player.setVelocityX(8 * delta)
        player.anims.play('right', true)
      } else {
        player.setVelocityX(0)
        player.anims.play('stand')
      }
      if (cursors.up.isDown && player.body.onFloor()) {
        player.setVelocityY(-250)
      }
    }
  }
  // TODO:
  // https://stackoverflow.com/questions/51029337/create-a-parallax-auto-scroll-background-in-phaser-3

  if (mobOverlap && !hidden) {
    player.setVelocity(0)
    player.anims.play('caught', true)
    caughtTimer = 45
    caughtText.x = player.x - 150
    caughtText.y = player.y - 96
    caughtText.visible = true
  }

  mobs.children.iterate((mob) => {
    // Patrol back and forth
    if (mob.body.onFloor()) {
      if (mob.body.blocked.left || mob.body.blocked.right) {
        mob.direction *= -1
      }
      mob.setVelocityX(mob.direction * 8 * delta)
      mob.anims.play('mobLeft', true)
    }
  })

  // Reset variables for next loop
  obstructed = false
  hidden = false
  mobOverlap = false
}

function activeObstruction(sprite, tile) {
  const diff = tile.pixelX - sprite.x
  if (diff > -48 && diff < 0) {
    obstructed = true
  }
}

function activeDoor(sprite, tile) {
  if (!completed) {
    completedText.x = player.x - 150
    completedText.y = player.y - 96
    completedText.visible = true
  }
  completed = true
}

function activeMob(sprite, tile) {
  mobOverlap = true
}

const config = {
  type: Phaser.AUTO,
  parent: 'container',
  width: 512,
  height: 384,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config)
