// Cena e câmera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 500, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(500, 500);
document.getElementById("three-container").appendChild(renderer.domElement);

camera.position.z = 7;

// Adicionar luz à cena
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Distribuição dos números de 1 a 12 em cada face do cilindro
const numbers = Array.from({ length: 12 }, (_, i) => i + 1);

// Função para embaralhar os números a cada giro
function getRandomNumbers() {
    return numbers.sort(() => 0.5 - Math.random());
}

// Dimensões e geometria do cilindro
const radiusTop = 1.5;
const radiusBottom = 1.5;
const height = 2.2;
const radialSegments = 12; // Dividir em 12 partes

const discs = [];
for (let i = 0; i < 3; i++) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, 1, true);

    // Criar materiais para cada símbolo e distribui-los ao longo dos segmentos
    const randomSymbols = getRandomSymbols();  // A função getRandomSymbols() já deve estar definida
    const materials = randomSymbols.map(symbol => {
        const material = new THREE.MeshBasicMaterial({ map: symbol });
        material.side = THREE.DoubleSide;  // Certificar-se de que as texturas aparecem em ambos os lados
        return material;
    });

    const disc = new THREE.Mesh(geometry, materials);
    
    // Ajustar as rotações e posições dos cilindros
    disc.rotation.x = Math.PI / 2;  // Girar o cilindro para que fique deitado
    disc.rotation.z = 0;  // Garantir que as faces curvas estejam voltadas para o usuário

    // Espaçar os cilindros corretamente
    disc.position.x = i * 3.0 - 3.0;  // Ajustar a posição no eixo X para espaçar os cilindros

    scene.add(disc);
    discs.push(disc);  // Adicionar o cilindro ao array de cilindros
}

// Animação de rotação
let isSpinning = false;
let spinSpeed = 0.1;

function animate() {
    requestAnimationFrame(animate);

    if (isSpinning) {
        discs.forEach(disc => {
            disc.rotation.y += spinSpeed;  // Girar no eixo Y (correto para girar horizontalmente)
        });
    }

    renderer.render(scene, camera);
}

animate();


// Alternar rotação
function toggleSpin() {
    isSpinning = !isSpinning;
    if (isSpinning) {
        spinSpeed = 0.2;
        setTimeout(stopSpin, 3500); // Parar os cilindros após 3.5 segundos
        updateRandomNumbers();  // Atualizar os números ao girar
    }
}

// Atualizar os números em cada giro
function updateRandomNumbers() {
    discs.forEach(disc => {
        const randomNumbers = getRandomNumbers();
        randomNumbers.forEach((number, index) => {
            const context = disc.material[index].map.image.getContext('2d');
            context.clearRect(0, 0, 256, 256);
            context.fillText(number, 128, 128);
            disc.material[index].map.needsUpdate = true;
        });
    });
}

// Parar os cilindros gradualmente
function stopSpin() {
    let deceleration = 0.005;

    function slowDown() {
        if (spinSpeed > 0) {
            spinSpeed -= deceleration;
            requestAnimationFrame(slowDown);
        } else {
            isSpinning = false;
        }
    }

    slowDown();
}

// Sistema de moedas
let coins = 1000;
function updateCoins() {
    document.getElementById('coin-count').innerText = coins;
}

function deductCoins() {
    if (coins >= 100) {
        coins -= 100;
        updateCoins();
    } else {
        endGame();
    }
}

function endGame() {
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('lever').disabled = true;
}

// Evento do botão de puxar a alavanca
document.getElementById('lever').addEventListener('click', () => {
    if (!isSpinning && coins >= 100) {
        deductCoins();
        toggleSpin();
    }
});

// Evento para recarregar créditos (ainda sem funcionalidade)
document.getElementById('reload-credits').addEventListener('click', () => {
    alert('Recarregar créditos em breve!');
});

// Evento para reiniciar o jogo
document.getElementById('restart-game').addEventListener('click', () => {
    coins = 1000;
    updateCoins();
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('lever').disabled = false;
});

// Iniciar o jogo após a tela inicial
document.getElementById('start-game').addEventListener('click', () => {
    const playerName = document.getElementById('player-name').value;
    if (playerName) {
        document.getElementById('player-display').innerText = `Jogador: ${playerName}`;
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
    } else {
        alert("Por favor, insira seu nome.");
    }
});

updateCoins();
