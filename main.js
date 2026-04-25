import { Player } from './player.js';
import { EnemySystem } from './enemies.js';
import { ShootingSystem } from './shooting.js';
import { ParticleSystem } from './particles.js';
import { FXSystem } from './fx.js';
import { UI } from './ui.js';
import { AudioEngine } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let gameWidth = 800, gameHeight = 600;

class Game {
  constructor() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.ui = new UI(10);
    this.fx = new FXSystem();
    this.particles = new ParticleSystem();
    this.audio = new AudioEngine();

    this.player = new Player(gameWidth/2, gameHeight-110);