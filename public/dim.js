const CANVASWIDTH = 640;
const CANVASHEIGHT = 480;
const BORDER = 10;
const TITLE = 50;

export default {
    canvasH: CANVASHEIGHT,
    canvasW: CANVASWIDTH,
    gameAreaX: CANVASWIDTH - 2 * BORDER,
    gameAreaY: CANVASHEIGHT - 2 * BORDER - TITLE,
    minX: BORDER,
    minY: TITLE + BORDER,
    maxX: CANVASWIDTH - BORDER,
    maxY: CANVASHEIGHT - BORDER
}