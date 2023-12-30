class Collectible {
  constructor({
    x,
    y,
    value,
    id
  }) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.w = 10;
    this.h = 10;
  }
  draw(context, img) {
    context.drawImage(img, this.x, this.y, this.w, this.h)
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch (e) {
  console.error(e)
}

export default Collectible;