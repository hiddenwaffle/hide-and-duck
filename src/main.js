import Phaser from 'phaser'

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
  // this.load.image("logo", logoImg);
}

function create() {
  // const logo = this.add.image(400, 150, "logo");
}
