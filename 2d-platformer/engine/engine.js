// engine/engine.js
import { Player } from '../player/player.js';
import { Camera } from '../camera/camera.js';
import { LevelManager } from '../levels/levels.js';

export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 32;
        this.levelManager = new LevelManager();
        this.level = null;
        this.player = null;
        this.camera = null;
        this.mapWidth = 0;
        this.mapHeight = 0;
        this.isLoaded = false;
    }

    async start() {
        await this.loadLevel(0);
        requestAnimationFrame(this.loop.bind(this));
    }

    async loadLevel(index) {
        // Załaduj poziom z pliku JSON (na razie tylko level1)
        const response = await fetch('./levels/level1.json');
        const levelData = await response.json();
        this.level = levelData;
        this.mapWidth = 25; // przykładowa szerokość mapy w kafelkach
        this.mapHeight = 15; // przykładowa wysokość mapy w kafelkach
        this.player = new Player(levelData.playerStart.x, levelData.playerStart.y);
        this.camera = new Camera(this.player, this.canvas.width, this.canvas.height, this.mapWidth * this.tileSize, this.mapHeight * this.tileSize);
        this.isLoaded = true;
    }

    loop() {
        if (!this.isLoaded) return requestAnimationFrame(this.loop.bind(this));
        this.update();
        this.render();
        requestAnimationFrame(this.loop.bind(this));
    }

    update() {
        // Przykład: world API do kolizji
        const world = {
            isSolid: (x, y) => false // uproszczone, do rozbudowy
        };
        this.player.update(this.player.input || {isDown:()=>false,isPressed:()=>false}, world, [], this.camera);
        // Przyciąganie ściany (np. klawisz Q)
        if (this.player.input && this.player.input.isDown && this.player.input.isDown('q')) {
            for (const dir of ['left','right','top','bottom']) {
                this.camera.pullLockedWall(dir);
            }
        }
        this.camera.update();
        this.camera.collidePlayer(this.player);
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Renderuj mapę kafelkową z level.tiles
        if (this.level && this.level.tiles) {
            for (let y = 0; y < this.level.tiles.length; y++) {
                for (let x = 0; x < this.level.tiles[y].length; x++) {
                    const tile = this.level.tiles[y][x];
                    if (tile === 1) {
                        ctx.fillStyle = '#888'; // kafelek platformy
                    } else {
                        ctx.fillStyle = (x + y) % 2 === 0 ? '#444' : '#555'; // tło
                    }
                    const screenX = x * this.tileSize - this.camera.x;
                    const screenY = y * this.tileSize - this.camera.y;
                    ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                }
            }
        }
        // Renderuj gracza
        if (this.player) this.player.render(ctx, this.camera);
        // Debug kamery
        if (this.camera && this.camera.debug) this.camera.renderDebug(ctx);
    }
}
