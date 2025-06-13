// player/player.js
export class Player {
    constructor(x, y, spriteSheet, input) {
        // Pozycja i fizyka
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 28;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.speed = 2.5;
        this.jumpPower = 8;
        this.gravity = 0.5;
        this.maxFall = 12;
        this.friction = 0.8;
        this.grounded = false;
        this.jumping = false;
        this.jumpHeld = false;
        this.jumpTime = 0;
        this.maxJumpTime = 16; // klatki
        this.input = input; // obiekt wejścia
        // Animacje
        this.spriteSheet = spriteSheet;
        this.animations = this.createAnimations();
        this.currentAnim = 'idle';
        this.animFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 6;
        // Rzucanie oszczepem
        this.javelins = [];
        this.throwCooldown = 0;
        // Debug
        this.debug = false;
    }

    createAnimations() {
        // Przykład: { idle: [{x:0,y:0}], run: [...], jump: [...], throw: [...] }
        return {
            idle: [{x:0,y:0}],
            run: [{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0}],
            jump: [{x:0,y:1}],
            throw: [{x:1,y:1},{x:2,y:1}]
        };
    }

    update(input, world, movingPlatforms, camera) {
        // --- Ruch poziomy ---
        let moveX = 0, moveY = 0;
        if (input.isDown('a')) moveX -= 1;
        if (input.isDown('d')) moveX += 1;
        if (input.isDown('w')) moveY -= 1;
        if (input.isDown('s')) moveY += 1;
        // Diagonalny ruch (opcjonalnie, tu tylko poziomy)
        this.ax = moveX * this.speed;
        // --- Skok ---
        if (input.isPressed(' ')) {
            if (this.grounded) {
                this.vy = -this.jumpPower;
                this.jumping = true;
                this.jumpHeld = true;
                this.jumpTime = 0;
            }
        }
        if (input.isDown(' ')) {
            if (this.jumping && this.jumpTime < this.maxJumpTime) {
                this.vy -= 0.25; // regulowana wysokość
                this.jumpTime++;
            }
        } else {
            this.jumping = false;
        }
        // --- Grawitacja ---
        this.vy += this.gravity;
        if (this.vy > this.maxFall) this.vy = this.maxFall;
        // --- Friction ---
        if (!moveX) this.vx *= this.friction;
        // --- Aktualizacja prędkości ---
        this.vx = this.ax;
        // --- Kolizje z mapą ---
        this.grounded = false;
        this.x += this.vx;
        if (this.collideWorld(world)) {
            this.x -= this.vx;
            this.vx = 0;
        }
        this.y += this.vy;
        if (this.collideWorld(world)) {
            this.y -= this.vy;
            if (this.vy > 0) this.grounded = true;
            this.vy = 0;
        }
        // --- Kolizje z ruchomymi platformami ---
        // (do rozbudowy)
        // --- Rzucanie oszczepem ---
        if (input.isPressed('s') && this.throwCooldown <= 0) {
            this.throwJavelin(camera);
            this.throwCooldown = 20;
        }
        if (this.throwCooldown > 0) this.throwCooldown--;
        // --- Aktualizacja oszczepów ---
        for (const javelin of this.javelins) {
            // Rzut łukiem (parabola)
            javelin.vy += 0.25; // grawitacja oszczepu
            javelin.x += javelin.vx;
            javelin.y += javelin.vy;
            javelin.life--;
            // Kolizja z ramką kamery
            if (camera && camera.checkJavelinCollision(javelin)) {
                javelin.life = 0;
            }
        }
        // Usuwanie martwych oszczepów
        this.javelins = this.javelins.filter(j => j.life > 0);
        // --- Animacje ---
        this.updateAnimation(input);
        // --- Debug ---
        if (input.isPressed('f3')) this.debug = !this.debug;
    }

    updateAnimation(input) {
        if (!this.grounded) this.currentAnim = 'jump';
        else if (input.isDown('a') || input.isDown('d')) this.currentAnim = 'run';
        else this.currentAnim = 'idle';
        if (input.isPressed('s')) this.currentAnim = 'throw';
        this.animTimer++;
        if (this.animTimer >= this.animSpeed) {
            this.animFrame = (this.animFrame + 1) % this.animations[this.currentAnim].length;
            this.animTimer = 0;
        }
    }

    throwJavelin(camera) {
        // Kierunek rzutu
        let dir = this.input.isDown('d') ? 1 : (this.input.isDown('a') ? -1 : (this.facing || 1));
        this.facing = dir;
        // Startowa prędkość (łuk)
        const speed = 10;
        const angle = this.input.isDown('w') ? -Math.PI/4 : (this.input.isDown('s') ? Math.PI/4 : 0);
        const vx = Math.cos(angle) * speed * dir;
        const vy = Math.sin(angle) * speed;
        this.javelins.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx,
            vy,
            life: 120
        });
    }

    collideWorld(world) {
        // Prosta detekcja kolizji z kafelkami (do rozbudowy)
        // world: { isSolid(x, y) }
        const left = Math.floor(this.x / 32);
        const right = Math.floor((this.x + this.width - 1) / 32);
        const top = Math.floor(this.y / 32);
        const bottom = Math.floor((this.y + this.height - 1) / 32);
        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                if (world.isSolid(x, y)) return true;
            }
        }
        return false;
    }

    render(ctx, camera) {
        // Animacja sprite
        const frame = this.animations[this.currentAnim][this.animFrame];
        if (this.spriteSheet && frame) {
            ctx.drawImage(
                this.spriteSheet,
                frame.x * 32, frame.y * 32, 32, 32,
                this.x - camera.x, this.y - camera.y, this.width, this.height
            );
        } else {
            ctx.fillStyle = '#0af';
            ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
        }
        // Debug: bounding box
        if (this.debug) {
            ctx.strokeStyle = 'lime';
            ctx.strokeRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
        }
        // Debug: javelins
        for (const javelin of this.javelins) {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(javelin.x - camera.x, javelin.y - camera.y, 12, 4);
        }
    }

    // API
    getPosition() { return { x: this.x, y: this.y }; }
    setPosition(x, y) { this.x = x; this.y = y; }
    setInput(input) { this.input = input; }
    setSpriteSheet(sheet) { this.spriteSheet = sheet; }
    enableDebug(val) { this.debug = val; }
}
