// camera/camera.js
export class Camera {
    constructor(target, viewWidth, viewHeight, worldWidth, worldHeight) {
        this.target = target;
        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.x = 0;
        this.y = 0;
        // Stan blokad ścian: {left, right, top, bottom}
        this.locked = { left: false, right: false, top: false, bottom: false };
        this.lockPos = { left: 0, right: 0, top: 0, bottom: 0 };
        this.lockColor = '#f33';
        this.pullSpeed = 8;
        this.debug = false;
    }
    update() {
        // Wyznacz pozycje ścian
        let left = this.x, right = this.x + this.viewWidth;
        let top = this.y, bottom = this.y + this.viewHeight;
        // Blokowanie ścian
        if (this.locked.left) left = this.lockPos.left;
        else left = this.target.x + this.target.width / 2 - this.viewWidth / 2;
        if (this.locked.right) right = this.lockPos.right;
        else right = this.target.x + this.target.width / 2 + this.viewWidth / 2;
        if (this.locked.top) top = this.lockPos.top;
        else top = this.target.y + this.target.height / 2 - this.viewHeight / 2;
        if (this.locked.bottom) bottom = this.lockPos.bottom;
        else bottom = this.target.y + this.target.height / 2 + this.viewHeight / 2;
        // Ogranicz do świata
        left = Math.max(0, Math.min(left, this.worldWidth - this.viewWidth));
        right = Math.max(this.viewWidth, Math.min(right, this.worldWidth));
        top = Math.max(0, Math.min(top, this.worldHeight - this.viewHeight));
        bottom = Math.max(this.viewHeight, Math.min(bottom, this.worldHeight));
        // Ustaw pozycję kamery
        this.x = left;
        this.y = top;
        // Zapamiętaj aktualne pozycje ścian
        this.frame = { left, right, top, bottom };
    }
    // Sprawdź kolizję oszczepu z ramką kamery
    checkJavelinCollision(javelin) {
        const margin = 2;
        if (!this.locked.left && javelin.x < this.frame.left + margin) {
            this.locked.left = true;
            this.lockPos.left = this.frame.left;
            return 'left';
        }
        if (!this.locked.right && javelin.x > this.frame.right - margin) {
            this.locked.right = true;
            this.lockPos.right = this.frame.right;
            return 'right';
        }
        if (!this.locked.top && javelin.y < this.frame.top + margin) {
            this.locked.top = true;
            this.lockPos.top = this.frame.top;
            return 'top';
        }
        if (!this.locked.bottom && javelin.y > this.frame.bottom - margin) {
            this.locked.bottom = true;
            this.lockPos.bottom = this.frame.bottom;
            return 'bottom';
        }
        return null;
    }
    // Przyciąganie zablokowanej ściany do gracza
    pullLockedWall(dir) {
        if (!this.locked[dir]) return;
        let target;
        if (dir === 'left') target = this.target.x + this.target.width / 2 - this.viewWidth / 2;
        if (dir === 'right') target = this.target.x + this.target.width / 2 + this.viewWidth / 2;
        if (dir === 'top') target = this.target.y + this.target.height / 2 - this.viewHeight / 2;
        if (dir === 'bottom') target = this.target.y + this.target.height / 2 + this.viewHeight / 2;
        // Smooth move
        this.lockPos[dir] += (target - this.lockPos[dir]) / this.pullSpeed;
    }
    // Odblokuj wszystkie ściany
    resetLocks() {
        this.locked = { left: false, right: false, top: false, bottom: false };
    }
    // Kolizja gracza z zablokowaną ścianą
    collidePlayer(player) {
        // left
        if (this.locked.left && player.x < this.frame.left) player.x = this.frame.left;
        if (this.locked.right && player.x + player.width > this.frame.right) player.x = this.frame.right - player.width;
        if (this.locked.top && player.y < this.frame.top) player.y = this.frame.top;
        if (this.locked.bottom && player.y + player.height > this.frame.bottom) player.y = this.frame.bottom - player.height;
    }
    // Debugowanie
    enableDebug(val) { this.debug = val; }
    renderDebug(ctx) {
        ctx.save();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.frame.left, this.frame.top, this.viewWidth, this.viewHeight);
        // Zablokowane ściany
        ctx.strokeStyle = this.lockColor;
        if (this.locked.left) ctx.beginPath(), ctx.moveTo(this.frame.left, this.frame.top), ctx.lineTo(this.frame.left, this.frame.bottom), ctx.stroke();
        if (this.locked.right) ctx.beginPath(), ctx.moveTo(this.frame.right, this.frame.top), ctx.lineTo(this.frame.right, this.frame.bottom), ctx.stroke();
        if (this.locked.top) ctx.beginPath(), ctx.moveTo(this.frame.left, this.frame.top), ctx.lineTo(this.frame.right, this.frame.top), ctx.stroke();
        if (this.locked.bottom) ctx.beginPath(), ctx.moveTo(this.frame.left, this.frame.bottom), ctx.lineTo(this.frame.right, this.frame.bottom), ctx.stroke();
        ctx.restore();
    }
}
