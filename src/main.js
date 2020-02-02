import Phaser from 'phaser'
import playerImage from './player.png'
import tilesImage from './tiles.png'
import tempJson from './temp.json'

function preload() {
  this.load.image('player', playerImage)
  this.load.tilemapTiledJSON('map', tempJson)
  this.load.spritesheet('tiles', tilesImage, { frameWidth: 48, frameHeight: 48 });
}

function create() {
  const map = this.make.tilemap({key: 'map'})
  const groundTiles = map.addTilesetImage('tiles')
  const groundLayer = map.createDynamicLayer('world', groundTiles)
  if (!groundLayer) throw ''
  groundLayer.setCollisionByExclusion([-1])
  this.physics.world.bounds.width = groundLayer.width
  this.physics.world.bounds.height = groundLayer.height

  // const playerImage = this.add.image(400, 150, 'player');
  const player = this.add.sprite(100, 100, 'player')

  this.input.keyboard.on('keydown_A', (event) => {
    player.x -= 10
  })
  this.input.keyboard.on('keydown_D', (event) => {
    player.x += 10
  })
}

const config = {
  type: Phaser.AUTO,
  parent: 'container',
  width: 512,
  height: 384,
  scene: {
    preload: preload,
    create: create
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
