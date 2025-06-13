// ui/ui.js
export class UI {
    constructor(onDifficultySelect) {
        this.onDifficultySelect = onDifficultySelect;
        this.createDifficultyMenu();
    }
    createDifficultyMenu() {
        const menu = document.createElement('div');
        menu.id = 'difficulty-menu';
        menu.style.position = 'absolute';
        menu.style.top = '40px';
        menu.style.left = '50%';
        menu.style.transform = 'translateX(-50%)';
        menu.style.background = '#222';
        menu.style.color = '#fff';
        menu.style.padding = '24px';
        menu.style.borderRadius = '12px';
        menu.style.zIndex = 10;
        menu.innerHTML = '<h2>Select Difficulty</h2>';
        ['easy','medium','hard'].forEach(diff => {
            const btn = document.createElement('button');
            btn.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
            btn.style.margin = '8px';
            btn.onclick = () => {
                menu.remove();
                this.onDifficultySelect(diff);
            };
            menu.appendChild(btn);
        });
        document.body.appendChild(menu);
    }
    render(ctx) {
        // Rysowanie HUD
    }
}
