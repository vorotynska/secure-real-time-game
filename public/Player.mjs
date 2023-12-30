class Player {
  constructor({
    x,
    y,
    score,
    id
  }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.w = 20;
    this.h = 20;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case 'up':
        this.y -= speed;
        break;
      case 'down':
        this.y += speed;
        break;
      case 'left':
        this.x -= speed;
        break;
      case 'right':
        this.x += speed;
        break;
    }
  }

  collision(item) {
    if (this.x < item.x + item.w &&
      this.x + this.w > item.x &&
      this.y < item.y + item.h &&
      this.h + this.y > item.y) {
      return true;
    }
    return false;
  }
  draw(context, img) {
    context.drawImage(img, this.x, this.y, this.w, this.h)
  }

  calculateRank(arr) {
    arr.sort((a, b) => a.score > b.score);
    let currentBank = arr.findIndex(x => x.id === this.id) + 1;
    let totalPlayers = arr.length
    return `Rank: ${currentBank} / ${totalPlayers}`
  }
}

try {
  module.exports = Player;
} catch (e) {
  console.error(e);
}

export default Player;