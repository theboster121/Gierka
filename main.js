// Punkt wejścia gry
import { Engine } from './engine/engine.js';
import { Player } from './player/player.js';
import { Camera } from './camera/camera.js';
import { LevelManager } from './levels/levels.js';
import { UI } from './ui/ui.js';
import { AudioManager } from './audio/audio.js';
import { Leaderboard } from './leaderboard/leaderboard.js';

// Inicjalizacja gry
window.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('gameCanvas');
    // Wczytaj domyślny poziom tilesowy (easy/level1.json)
    const response = await fetch('./levels/easy/level1.json');
    const levelData = await response.json();
    const engine = new Engine(canvas);
    engine.level = levelData;
    engine.mapWidth = levelData.tiles[0].length;
    engine.mapHeight = levelData.tiles.length;
    engine.player = new Player(levelData.playerStart.x, levelData.playerStart.y);
    engine.camera = new Camera(engine.player, canvas.width, canvas.height, engine.mapWidth * 32, engine.mapHeight * 32);
    engine.isLoaded = true;
    engine.start();
});
