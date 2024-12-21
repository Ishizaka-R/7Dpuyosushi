// puyo.js

class Puyo {
    static create(type, x, y) {
        const puyo = document.createElement("div");
        puyo.className = `puyo ${type}`;
        puyo.style.left = `${x * Config.cellSize}px`;
        puyo.style.top = `${y * Config.cellSize}px`;
        return puyo;
    }
}
