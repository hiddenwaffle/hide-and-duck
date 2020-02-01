import Phaser from 'phaser'
import playerImage from './player.png'

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 512,
  height: 384,
  scene: {
    preload: preload,
    create: create
  }
};

const game = new Phaser.Game(config);
function preload() {
  this.load.image('player', playerImage)
}

function create() {
  // const playerImage = this.add.image(400, 150, 'player');
  const player = this.add.sprite(100, 100, 'player')

  this.input.keyboard.on('keydown_A', (event) => {
    player.x -= 10
  })
  this.input.keyboard.on('keydown_D', (event) => {
    player.x += 10
  })
}
