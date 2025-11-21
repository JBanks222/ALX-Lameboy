// Button state tracking
const buttonStates = {
    up: false,
    down: false,
    left: false,
    right: false,
    j: false,
    b: false,
    start: false,
    select: false
};

// Get all buttons
const buttons = document.querySelectorAll('button[data-button]');

// Add event listeners to all buttons
buttons.forEach(button => {
    const buttonName = button.getAttribute('data-button');
    
    // Mouse events
    button.addEventListener('mousedown', () => {
        pressButton(buttonName, button);
    });
    
    button.addEventListener('mouseup', () => {
        releaseButton(buttonName, button);
    });
    
    button.addEventListener('mouseleave', () => {
        releaseButton(buttonName, button);
    });
    
    // Touch events for mobile
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        pressButton(buttonName, button);
    });
    
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        releaseButton(buttonName, button);
    });
    
    button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        releaseButton(buttonName, button);
    });
});

// Keyboard controls
const keyMap = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'KeyW': 'up',
    'KeyS': 'down',
    'KeyA': 'left',
    'KeyD': 'right',
    'KeyJ': 'j',
    'KeyB': 'b',
    'Enter': 'start',
    'Shift': 'select'
};

document.addEventListener('keydown', (e) => {
    const buttonName = keyMap[e.code];
    if (buttonName && !buttonStates[buttonName]) {
        const button = document.querySelector(`[data-button="${buttonName}"]`);
        if (button) {
            pressButton(buttonName, button);
        }
    }
});

document.addEventListener('keyup', (e) => {
    const buttonName = keyMap[e.code];
    if (buttonName) {
        const button = document.querySelector(`[data-button="${buttonName}"]`);
        if (button) {
            releaseButton(buttonName, button);
        }
    }
});

// Button press/release functions
function pressButton(buttonName, buttonElement) {
    if (!buttonStates[buttonName]) {
        buttonStates[buttonName] = true;
        buttonElement.classList.add('button-pressed');
        
        // Visual feedback
        updateScreenDisplay(buttonName, true);
        
        // Log button press (for debugging)
        console.log(`Button pressed: ${buttonName}`);
        
        // Trigger custom event
        const event = new CustomEvent('buttonPress', {
            detail: { button: buttonName }
        });
        document.dispatchEvent(event);
    }
}

function releaseButton(buttonName, buttonElement) {
    if (buttonStates[buttonName]) {
        buttonStates[buttonName] = false;
        buttonElement.classList.remove('button-pressed');
        
        // Visual feedback
        updateScreenDisplay(buttonName, false);
        
        // Trigger custom event
        const event = new CustomEvent('buttonRelease', {
            detail: { button: buttonName }
        });
        document.dispatchEvent(event);
    }
}

// Update screen display - now handled by game
function updateScreenDisplay(buttonName, isPressed) {
    // Game handles its own display
}

// Export button states for game use
window.getButtonState = (buttonName) => {
    return buttonStates[buttonName] || false;
};

window.getAllButtonStates = () => {
    return { ...buttonStates };
};

// ============================================
// SPACESHIP GAME
// ============================================

// Canvas setup
const canvas = document.getElementById('gameCanvas');
let ctx = null;

if (canvas) {
    ctx = canvas.getContext('2d');
}

// Set canvas size to match container
function resizeCanvas() {
    if (!canvas) return;
    const screenContent = document.querySelector('.screen-content');
    if (screenContent) {
        const newWidth = screenContent.clientWidth;
        const newHeight = screenContent.clientHeight;
        
        if (newWidth > 0 && newHeight > 0) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            if (!ctx) {
                ctx = canvas.getContext('2d');
            }
        }
    }
}

// Initialize canvas size
if (canvas) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize player position once canvas is ready
    setTimeout(() => {
        if (canvas && canvas.height > 0) {
            player.y = canvas.height / 2 - player.height / 2;
        }
    }, 100);
}

// Mobile detection and optimization
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameover'
let score = 0;
let gameSpeed = 1;
let ultimateBar = 0; // 0-100, fills 10% per kill
let ultimateActive = false; // Whether ultimate laser is currently active
let ultimateLaser = null; // Ultimate laser object

// Audio context for mobile
let audioContextUnlocked = false;

// Load spaceship image
let spaceshipImage = null;
let enemyImage = null;
let splatSound = null;
let ultimateSound = null;
let radioSound = null;
let assetsLoaded = false;

// Unlock audio context for mobile (required for audio to work)
function unlockAudioContext() {
    if (audioContextUnlocked) return;
    
    // Create a silent audio buffer and play it on user interaction
    const unlockAudio = () => {
        if (audioContextUnlocked) return;
        
        try {
            // Try to play a silent sound to unlock audio
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPZgjMGHm7A7+OQQAoUXrTp66hVFApGn+DyvmwhBjGH0fPZgjMGHm7A7+OQQAoUXrTp66hVFApGn+DyvmwhBjGH0fPZgjMGHm7A7+OQQAoUXrTp66hVFApGn+DyvmwhBjGH0fPZgjMGHm7A7+OQQAoUXrTp66hVFApGn+DyvmwhBjGH0fPZgjMGHm7A7+OQ==');
            audio.volume = 0.01;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    audioContextUnlocked = true;
                    console.log('Audio context unlocked for mobile');
                    audio.pause();
                    audio.remove();
                }).catch(() => {
                    // Ignore errors
                });
            }
        } catch (e) {
            // Fallback: just mark as unlocked after first interaction
            audioContextUnlocked = true;
        }
    };
    
    // Unlock on any user interaction
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('touchend', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
}

function loadAssets() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        const totalAssets = 5;
        
        const checkComplete = () => {
            loadedCount++;
            if (loadedCount >= totalAssets) {
                assetsLoaded = true;
                console.log('All assets loaded!');
                resolve();
            }
        };
        
        // Load spaceship (dildo.png)
        const spaceshipImg = new Image();
        spaceshipImg.onload = () => {
            spaceshipImage = spaceshipImg;
            console.log('Spaceship asset (dildo.png) loaded!');
            checkComplete();
        };
        spaceshipImg.onerror = () => {
            console.warn('Failed to load dildo.png, using placeholder');
            spaceshipImage = null;
            checkComplete();
        };
        spaceshipImg.src = 'assets/dildo.png';
        
        // Load enemy (alx_head.svg)
        const enemyImg = new Image();
        enemyImg.onload = () => {
            enemyImage = enemyImg;
            console.log('Enemy asset (alx_head.svg) loaded!');
            checkComplete();
        };
        enemyImg.onerror = () => {
            console.warn('Failed to load alx_head.svg, using placeholder');
            enemyImage = null;
            checkComplete();
        };
        enemyImg.src = 'assets/alx_head.svg';
        
        // Load splat sound (Splat.mp3)
        const audio = new Audio();
        audio.preload = 'auto';
        audio.oncanplaythrough = () => {
            splatSound = audio;
            console.log('Splat sound (Splat.mp3) loaded!');
            checkComplete();
        };
        audio.onerror = () => {
            console.warn('Failed to load Splat.mp3, sound effects disabled');
            splatSound = null;
            checkComplete();
        };
        audio.src = 'sound_effects/Splat.mp3';
        
        // Load ultimate sound (gay_moan.mp3)
        const ultimateAudio = new Audio();
        ultimateAudio.preload = 'auto';
        ultimateAudio.oncanplaythrough = () => {
            ultimateSound = ultimateAudio;
            console.log('Ultimate sound (gay_moan.mp3) loaded!');
            checkComplete();
        };
        ultimateAudio.onerror = () => {
            console.warn('Failed to load gay_moan.mp3, ultimate sound disabled');
            ultimateSound = null;
            checkComplete();
        };
        ultimateAudio.src = 'sound_effects/gay_moan.mp3';
        
        // Load radio sound (ALX-Crazy.mp3)
        const radioAudio = new Audio();
        radioAudio.preload = 'auto';
        radioAudio.oncanplaythrough = () => {
            radioSound = radioAudio;
            console.log('Radio sound (ALX-Crazy.mp3) loaded!');
            checkComplete();
        };
        radioAudio.onerror = () => {
            console.warn('Failed to load ALX-Crazy.mp3, radio sound disabled');
            radioSound = null;
            checkComplete();
        };
        radioAudio.src = 'sound_effects/ALX-Crazy.mp3';
    });
}

// Player spaceship
const player = {
    x: 30,
    y: 0,
    width: 20,
    height: 30,
    speed: 3,
    lastShot: 0
};

// Bullets array
const bullets = [];

// Enemies array
const enemies = [];

// Game functions
function initGame() {
    gameState = 'playing';
    score = 0;
    gameSpeed = 1;
    ultimateBar = 0;
    ultimateActive = false;
    ultimateLaser = null;
    
    // Reset player position
    if (canvas && canvas.height > 0) {
        player.y = canvas.height / 2 - player.height / 2;
        player.x = 30;
    }
    
    // Clear arrays
    bullets.length = 0;
    enemies.length = 0;
    
    // Reset last shot timer
    player.lastShot = 0;
}

function shootBullet() {
    bullets.push({
        x: player.x + player.width,
        y: player.y + player.height / 2,
        width: 6,
        height: 3,
        speed: 5
    });
}

function spawnEnemy() {
    if (!canvas) return;
    enemies.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 30),
        width: 30,
        height: 30,
        speed: 2 + gameSpeed * 0.5
    });
}

function updatePlayer() {
    if (!canvas) return;
    
    // Movement
    if (buttonStates.up && player.y > 0) {
        player.y -= player.speed;
    }
    if (buttonStates.down && player.y + player.height < canvas.height) {
        player.y += player.speed;
    }
    if (buttonStates.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (buttonStates.right && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
    
    // Shooting
    if (buttonStates.j) {
        // Limit shooting rate
        if (!player.lastShot || Date.now() - player.lastShot > 200) {
            shootBullet();
            player.lastShot = Date.now();
        }
    }
    
    // Ultimate ability (B button)
    if (buttonStates.b && ultimateBar >= 100 && !ultimateActive) {
        activateUltimate();
    }
}

function activateUltimate() {
    if (!canvas) return;
    ultimateActive = true;
    ultimateBar = 0;
    
    // Play ultimate sound effect
    if (ultimateSound && audioContextUnlocked) {
        try {
            // Clone and play to allow overlapping sounds
            const soundClone = ultimateSound.cloneNode();
            soundClone.volume = 0.7; // Set volume
            const playPromise = soundClone.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    // Ignore audio play errors
                });
            }
        } catch (e) {
            // Ignore errors
        }
    }
    
    // Create big laser that takes up 50% of screen height
    // Starts narrow at the player and widens as it extends
    const endHeight = canvas.height * 0.5; // 50% of screen at the end
    const startHeight = player.height * 0.8; // Narrow at the player (80% of player height)
    const centerY = player.y + player.height / 2;
    const startY = centerY - startHeight / 2;
    const endY = centerY - endHeight / 2;
    
    ultimateLaser = {
        startX: player.x + player.width, // Start from player
        endX: canvas.width, // Extend to right edge
        startY: startY, // Top of narrow end
        startHeight: startHeight, // Height at narrow end
        endY: endY, // Top of wide end
        endHeight: endHeight, // Height at wide end
        centerY: centerY, // Center line
        duration: 1000, // 1 second
        startTime: Date.now()
    };
}

function updateUltimate() {
    if (!ultimateActive || !ultimateLaser) return;
    
    // Check if ultimate duration is over
    if (Date.now() - ultimateLaser.startTime > ultimateLaser.duration) {
        ultimateActive = false;
        ultimateLaser = null;
        return;
    }
    
    // Destroy all enemies that are hit by the ultimate laser (trapezoid collision)
    if (!canvas) return;
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Check if enemy is within horizontal range
        if (enemy.x + enemy.width > ultimateLaser.startX && enemy.x < ultimateLaser.endX) {
            // Calculate the top and bottom bounds of the laser at the enemy's x position
            // Linear interpolation between start and end
            const t = (enemy.x - ultimateLaser.startX) / (ultimateLaser.endX - ultimateLaser.startX);
            const tClamped = Math.max(0, Math.min(1, t)); // Clamp between 0 and 1
            
            const laserTop = ultimateLaser.startY + (ultimateLaser.endY - ultimateLaser.startY) * tClamped;
            const laserHeight = ultimateLaser.startHeight + (ultimateLaser.endHeight - ultimateLaser.startHeight) * tClamped;
            const laserBottom = laserTop + laserHeight;
            
            // Check if enemy overlaps with the laser at this x position
            if (enemy.y < laserBottom && enemy.y + enemy.height > laserTop) {
                enemies.splice(i, 1);
                score += 50;
                // Don't fill ultimate bar from ultimate kills to prevent infinite loop
            }
        }
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].speed;
        
        // Remove bullets that are off screen
        if (bullets[i].x > canvas.width) {
            bullets.splice(i, 1);
        }
    }
}

function updateEnemies() {
    // Spawn new enemies (reduced rate on mobile for performance)
    const spawnRate = isMobile ? (0.015 + gameSpeed * 0.007) : (0.02 + gameSpeed * 0.01);
    if (Math.random() < spawnRate) {
        spawnEnemy();
    }
    
    // Update existing enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].x -= enemies[i].speed;
        
        // Remove enemies that are off screen
        if (enemies[i].x + enemies[i].width < 0) {
            enemies.splice(i, 1);
            score += 10;
        }
    }
}

function checkCollisions() {
    // Check bullet-enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y) {
                // Collision!
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 50;
                // Fill ultimate bar by 10% per kill
                ultimateBar = Math.min(100, ultimateBar + 10);
                
                // Play splat sound effect
                if (splatSound && audioContextUnlocked) {
                    try {
                        // Clone and play to allow overlapping sounds
                        const soundClone = splatSound.cloneNode();
                        soundClone.volume = 0.5; // Set volume
                        const playPromise = soundClone.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(e => {
                                // Ignore audio play errors
                            });
                        }
                    } catch (e) {
                        // Ignore errors
                    }
                }
                break;
            }
        }
    }
    
    // Check player-enemy collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (player.x < enemies[i].x + enemies[i].width &&
            player.x + player.width > enemies[i].x &&
            player.y < enemies[i].y + enemies[i].height &&
            player.y + player.height > enemies[i].y) {
            // Game over!
            gameState = 'gameover';
        }
    }
}

function render() {
    if (!ctx || !canvas) return;
    
    // Clear canvas
    ctx.fillStyle = '#8b9a46';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === 'menu') {
        // Draw menu
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SPACESHIP', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '12px monospace';
        ctx.fillText('Press START', canvas.width / 2, canvas.height / 2 + 10);
    } else if (gameState === 'playing') {
        // Draw player spaceship (rotated 90 degrees to the right)
        ctx.fillStyle = '#e74c3c';
        if (spaceshipImage && spaceshipImage.complete) {
            try {
                ctx.save();
                // Translate to center of spaceship
                const centerX = player.x + player.width / 2;
                const centerY = player.y + player.height / 2;
                ctx.translate(centerX, centerY);
                // Rotate 90 degrees clockwise (π/2 radians)
                ctx.rotate(Math.PI / 2);
                // Draw image centered at origin (after translation)
                ctx.drawImage(spaceshipImage, -player.height / 2, -player.width / 2, player.height, player.width);
                ctx.restore();
            } catch (e) {
                // Fallback to rectangle if image fails
                ctx.fillRect(player.x, player.y, player.width, player.height);
            }
        } else {
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }
        
        // Draw bullets
        ctx.fillStyle = '#ffffff';
        bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // Draw enemies
        enemies.forEach(enemy => {
            if (enemyImage && enemyImage.complete) {
                try {
                    // Enable image smoothing for better visibility
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
                } catch (e) {
                    // Fallback to rectangle if image fails
                    ctx.fillStyle = '#3498db';
                    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                }
            } else {
                ctx.fillStyle = '#3498db';
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });
        
        // Draw ultimate laser if active (trapezoid shape emanating from dildo)
        if (ultimateActive && ultimateLaser) {
            const startX = ultimateLaser.startX;
            const endX = ultimateLaser.endX;
            const startTop = ultimateLaser.startY;
            const startBottom = ultimateLaser.startY + ultimateLaser.startHeight;
            const endTop = ultimateLaser.endY;
            const endBottom = ultimateLaser.endY + ultimateLaser.endHeight;
            
            // Outer glow (slightly larger trapezoid)
            ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.moveTo(startX - 3, startTop - 2);
            ctx.lineTo(endX + 2, endTop - 2);
            ctx.lineTo(endX + 2, endBottom + 2);
            ctx.lineTo(startX - 3, startBottom + 2);
            ctx.closePath();
            ctx.fill();
            
            // Main laser beam (trapezoid)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.moveTo(startX, startTop);
            ctx.lineTo(endX, endTop);
            ctx.lineTo(endX, endBottom);
            ctx.lineTo(startX, startBottom);
            ctx.closePath();
            ctx.fill();
            
            // Inner bright core (narrower trapezoid)
            const coreStartTop = startTop + ultimateLaser.startHeight * 0.25;
            const coreStartBottom = startBottom - ultimateLaser.startHeight * 0.25;
            const coreEndTop = endTop + ultimateLaser.endHeight * 0.25;
            const coreEndBottom = endBottom - ultimateLaser.endHeight * 0.25;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.beginPath();
            ctx.moveTo(startX, coreStartTop);
            ctx.lineTo(endX, coreEndTop);
            ctx.lineTo(endX, coreEndBottom);
            ctx.lineTo(startX, coreStartBottom);
            ctx.closePath();
            ctx.fill();
        }
        
        // Draw ultimate bar
        const barWidth = 80;
        const barHeight = 8;
        const barX = canvas.width - barWidth - 5;
        const barY = 5;
        
        // Bar background
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Bar fill
        const fillWidth = (barWidth * ultimateBar) / 100;
        if (ultimateBar >= 100) {
            ctx.fillStyle = '#f39c12'; // Orange when ready
        } else {
            ctx.fillStyle = '#3498db'; // Blue when charging
        }
        ctx.fillRect(barX, barY, fillWidth, barHeight);
        
        // Bar border
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Draw score
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score}`, 5, 15);
        
        // Draw ultimate indicator
        if (ultimateBar >= 100) {
            ctx.fillStyle = '#f39c12';
            ctx.font = '10px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('ULTIMATE READY (B)', canvas.width - 5, canvas.height - 5);
        }
    } else if (gameState === 'gameover') {
        // Draw game over screen
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '12px monospace';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 5);
        ctx.fillText('Press START', canvas.width / 2, canvas.height / 2 + 25);
    }
}

// Frame throttling for mobile performance
let lastFrameTime = 0;
const targetFPS = isMobile ? 30 : 60;
const frameInterval = 1000 / targetFPS;

function gameLoop(currentTime) {
    // Throttle updates on mobile
    if (isMobile && currentTime - lastFrameTime < frameInterval) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastFrameTime = currentTime || performance.now();
    
    if (gameState === 'playing') {
        updatePlayer();
        updateBullets();
        updateEnemies();
        updateUltimate();
        checkCollisions();
        
        // Increase difficulty over time
        gameSpeed = 1 + Math.floor(score / 500);
    }
    
    render();
    requestAnimationFrame(gameLoop);
}

// Start button handler
document.addEventListener('buttonPress', (e) => {
    if (e.detail.button === 'start') {
        if (gameState === 'menu' || gameState === 'gameover') {
            initGame();
        }
    }
});

// Initialize
unlockAudioContext(); // Start unlocking audio context for mobile

loadAssets().then(() => {
    console.log('Assets loaded!');
    if (isMobile) {
        console.log('Mobile optimizations enabled');
    }
});

if (canvas) {
    resizeCanvas();
    gameLoop(0);
}

// Radio functionality
// Radio functionality
function playRadio() {
    if (!radioSound) return;
    
    // Mark audio as unlocked when user interacts with radio
    if (!audioContextUnlocked) {
        audioContextUnlocked = true;
    }
    
    // Play the radio sound
    playRadioSound();
}

function playRadioSound() {
    if (!radioSound) return;
    
    try {
        // Stop current playback if playing
        if (!radioSound.paused) {
            radioSound.pause();
            radioSound.currentTime = 0;
        }
        
        // Update radio indicator immediately
        const indicator = document.getElementById('radioIndicator');
        if (indicator) {
            indicator.classList.add('active');
        }
        
        // Play the radio sound
        radioSound.volume = 0.7;
        const playPromise = radioSound.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Successfully playing
            }).catch(e => {
                // If play fails, remove indicator
                if (indicator) {
                    indicator.classList.remove('active');
                }
                console.log('Radio play failed:', e);
            });
        }
        
        // Update indicator when sound ends
        radioSound.onended = () => {
            if (indicator) {
                indicator.classList.remove('active');
            }
        };
    } catch (e) {
        console.log('Error in playRadioSound:', e);
        // Remove indicator on error
        const indicator = document.getElementById('radioIndicator');
        if (indicator) {
            indicator.classList.remove('active');
        }
    }
}

// Radio click handler
const radio = document.getElementById('radio');
if (radio) {
    radio.addEventListener('click', playRadio);
}

// Radio key handler (R key)
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR') {
        playRadio();
    }
});

// Instructions panel toggle
const instructionsPanel = document.getElementById('instructionsPanel');
const instructionsHeader = document.getElementById('instructionsHeader');
const instructionsToggle = document.getElementById('instructionsToggle');

if (instructionsHeader && instructionsPanel) {
    instructionsHeader.addEventListener('click', () => {
        instructionsPanel.classList.toggle('collapsed');
    });
    
    // Prevent toggle button from triggering header click twice
    if (instructionsToggle) {
        instructionsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            instructionsPanel.classList.toggle('collapsed');
        });
    }
}

console.log('Lameboy initialized!');
console.log('Controls:');
console.log('  Arrow Keys or WASD: Move spaceship');
console.log('  J: Shoot');
console.log('  B: Ultimate (when bar is full)');
console.log('  START: Start/Restart game');
console.log('  R or Click Radio: Play ALX-Crazy.mp3');

