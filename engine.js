function initGameData() {
    player = {
        x: 96, y: 96, angle: 0.1, fov: Math.PI / 3,
        walkSpeed: 3.0, crouchSpeed: 1.3,
        rotSpeed: 0.04, isCrouching: false,
        noiseRadius: 0, hp: 100, inSafeZone: true
    };

    // Exactly two terrifying monsters left in the facility
    enemies = [
        { 
            id: 1, type: 'Runner', 
            x: 450, y: 300, angle: 0, speed: 1.3, radius: 12, color: '#e67e22', 
            waypoints: [{x: 450, y: 300}, {x: 200, y: 550}], targetIndex: 0, state: 'PATROL' 
        },
        { 
            id: 2, type: 'Clicker', 
            x: 600, y: 150, angle: Math.PI, speed: 0.8, radius: 14, color: '#9b59b6', 
            waypoints: [{x: 600, y: 150}, {x: 600, y: 500}], targetIndex: 0, state: 'PATROL' 
        }
    ];

    inventory = { alcohol: 3, binding: 2, blades: 2, medkits: 0, shivs: 1 };
    inputs = { moveForward: 0, rotate: 0 };
    updateHUD();
}
