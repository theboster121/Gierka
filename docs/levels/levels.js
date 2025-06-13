// levels/levels.js
export class LevelManager {
    constructor() {
        this.categories = ['easy', 'medium', 'hard'];
        this.levels = { easy: [], medium: [], hard: [] };
        this.currentLevel = null;
    }
    async loadLevelList(difficulty) {
        // Pobierz listę plików dla danej trudności
        const files = [1,2,3,4,5].map(i => `levels/${difficulty}/level${i}.json`);
        this.levels[difficulty] = files;
    }
    async loadRandomLevel(difficulty) {
        if (!this.levels[difficulty] || this.levels[difficulty].length === 0) {
            await this.loadLevelList(difficulty);
        }
        const files = this.levels[difficulty];
        const idx = Math.floor(Math.random() * files.length);
        return this.loadLevelFromFile(files[idx]);
    }
    async loadLevelFromFile(path) {
        const response = await fetch(path);
        const data = await response.json();
        this.currentLevel = data;
        return data;
    }
    // API do dodawania nowych paczek poziomów
    addLevelPack(difficulty, fileList) {
        if (!this.levels[difficulty]) this.levels[difficulty] = [];
        this.levels[difficulty].push(...fileList);
    }
}
