let scene, camera, renderer, cylinders = [], spinning = false;
let spinSpeed = [0, 0, 0];  // Velocidades individuais para cada cilindro
let stopOrder = [false, false, false];  // Controle de parada de cada cilindro
let spinStartTime = 0;
let coins = 1000;
let currentBet = 50;
let results = [0, 0, 0]; // Resultados dos cilindros
const sectionsPerReel = 12; // 12 seções numeradas no cilindro

// Statistics
let stats = {
    totalSpins: 0,
    totalWins: 0,
    biggestWin: 0,
    totalWagered: 0,
    totalWon: 0
};

// Sound effects
const sounds = {
    spin: null,
    win: null,
    bigWin: null,
    lose: null
};

// Paytable - Different payouts for different combinations
const paytable = {
    threeMatch: 10,  // 3 of same number = 10x bet
    twoMatch: 2,     // 2 of same number = 2x bet
    sequential: 5,   // Sequential numbers = 5x bet
    lucky7: 20,      // Three 7s = 20x bet
    lucky12: 15      // Three 12s = 15x bet
};

function init() {
    // Cria a cena e a câmera com proporções ajustadas
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    
    // Configura o renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(400, 400);  // Tamanho fixo do renderizador
    document.getElementById('three-container').appendChild(renderer.domElement);

    // Adiciona luz à cena para melhor visualização
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Geometria dos cilindros (discos)
    let geometry = new THREE.CylinderGeometry(4, 4, 2, sectionsPerReel);  // 12 seções no cilindro

    // Cria 3 cilindros com a textura de números aplicada
    for (let i = 0; i < 3; i++) {
        let material = createNumberMaterial();  // Função para criar material numérico

        let cylinder = new THREE.Mesh(geometry, material);
        
        // Posiciona os cilindros com espaçamento
        cylinder.position.x = i * 2.4 - 2.4;  // Posição (-2, 0, 2)

        // Ajusta a rotação dos cilindros no eixo correto
        cylinder.rotation.z = Math.PI / 2;
        cylinders.push(cylinder);
        scene.add(cylinder);
    }

    // Posiciona a câmera para ver os cilindros
    camera.position.z = 13;

    animate();  // Inicia a animação
}

// Cria uma textura numérica para cada cilindro
function createNumberMaterial() {
    let canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 64;
    let context = canvas.getContext('2d');
    
    context.fillStyle = '#ffffff';  // Fundo branco
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#000000';  // Texto preto
    context.font = 'Bold 40px Arial';
    
    // Desenha os números de 1 a 12
    for (let i = 1; i <= 12; i++) {
        context.fillText(i.toString(), (i - 1) * 85, 45);
    }

    return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) });
}

function toggleSpin() {
    if (!spinning && coins >= currentBet) {
        spinning = true;
        spinStartTime = performance.now();
        spinSpeed = [0.1, 0.12, 0.08];  // Velocidades diferentes para cada rolo
        stopOrder = [false, false, false];
        results = [0, 0, 0];
        deductCoins();
        playSound('spin');
        stats.totalSpins++;
        updateStats();
        hideWinMessage();
    }
}

function setBet(amount) {
    if (!spinning) {
        currentBet = amount;
        document.querySelectorAll('.bet-button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        updateBetDisplay();
    }
}

function updateBetDisplay() {
    document.getElementById('current-bet').innerText = currentBet;
}

function animate() {
    requestAnimationFrame(animate);

    if (spinning) {
        let elapsed = (performance.now() - spinStartTime) / 1000;

        // Diferencia o tempo de rotação entre os cilindros
        for (let i = 0; i < 3; i++) {
            if (!stopOrder[i]) {
                if (elapsed < 1 + i * 0.1) {
                    spinSpeed[i] = 0.2 * elapsed;
                } else if (elapsed > 1 && elapsed < 2.5 + i * 0.2) {
                    spinSpeed[i] = 0.2;
                } else if (elapsed > 2.5 + i * 0.2 && spinSpeed[i] > 0) {
                    spinSpeed[i] -= 0.01;
                }

                if (spinSpeed[i] <= 0) {
                    stopOrder[i] = true;
                    spinSpeed[i] = 0;

                    // Alinha o cilindro ao número central
                    const sectionHeight = (2 * Math.PI) / sectionsPerReel;  // Altura de cada seção
                    const finalRotation = Math.round(cylinders[i].rotation.x / sectionHeight) * sectionHeight;
                    cylinders[i].rotation.x = finalRotation;

                    // Determina o número do resultado
                    const section = Math.round(cylinders[i].rotation.x / sectionHeight) % sectionsPerReel;
                    results[i] = (section % 12) + 1;
                    if (results[i] < 1) results[i] = 12;
                }
            }
            cylinders[i].rotation.x += spinSpeed[i];
        }

        // Espera todos os cilindros pararem antes de encerrar o jogo
        if (elapsed > 3.5 && stopOrder.every(status => status)) {
            spinning = false;
            highlightResult();  // Exibe o destaque da linha de sorteio
            checkWin();  // Verifica se ganhou

            if (coins <= 0) {
                setTimeout(() => endGame(), 2000);
            }
        }
    }

    renderer.render(scene, camera);
}

function highlightResult() {
    const resultLine = document.getElementById('result-line');
    resultLine.style.display = 'block';
    setTimeout(() => {
        resultLine.style.display = 'none';
    }, 3000);
}

function deductCoins() {
    coins -= currentBet;
    stats.totalWagered += currentBet;
    updateCoinsDisplay();
    updateStats();
}

function addCoins(amount) {
    coins += amount;
    stats.totalWon += amount;
    animateBalance(amount);
    updateCoinsDisplay();
    updateStats();
}

function updateCoinsDisplay() {
    document.getElementById('coin-count').innerText = coins;
}

function animateBalance(amount) {
    const balanceElement = document.getElementById('coin-count');
    balanceElement.classList.add('balance-update');
    setTimeout(() => {
        balanceElement.classList.remove('balance-update');
    }, 600);
}

function checkWin() {
    const [r1, r2, r3] = results;
    let winAmount = 0;
    let winType = '';

    // Check for three matching numbers
    if (r1 === r2 && r2 === r3) {
        if (r1 === 7) {
            winAmount = currentBet * paytable.lucky7;
            winType = 'LUCKY 7s! 🎰';
        } else if (r1 === 12) {
            winAmount = currentBet * paytable.lucky12;
            winType = 'JACKPOT 12s! 💎';
        } else {
            winAmount = currentBet * paytable.threeMatch;
            winType = `TRIPLE ${r1}s! 🎉`;
        }
    }
    // Check for two matching numbers
    else if (r1 === r2 || r2 === r3 || r1 === r3) {
        winAmount = currentBet * paytable.twoMatch;
        winType = 'PAIR MATCH! 🎯';
    }
    // Check for sequential numbers
    else if (
        (r1 === r2 - 1 && r2 === r3 - 1) ||
        (r1 === r2 + 1 && r2 === r3 + 1) ||
        (r3 === r2 - 1 && r2 === r1 - 1) ||
        (r3 === r2 + 1 && r2 === r1 + 1)
    ) {
        winAmount = currentBet * paytable.sequential;
        winType = 'SEQUENTIAL! 📈';
    }

    if (winAmount > 0) {
        stats.totalWins++;
        if (winAmount > stats.biggestWin) {
            stats.biggestWin = winAmount;
        }
        addCoins(winAmount);
        showWinMessage(winType, winAmount);

        if (winAmount >= currentBet * 5) {
            playSound('bigWin');
            createWinParticles();
        } else {
            playSound('win');
        }
    } else {
        playSound('lose');
        showWinMessage('Try Again!', 0);
    }

    updateStats();
}

function showWinMessage(type, amount) {
    const winMessage = document.getElementById('win-message');
    const winType = document.getElementById('win-type');
    const winAmountEl = document.getElementById('win-amount');

    winType.innerText = type;
    if (amount > 0) {
        winAmountEl.innerText = `+${amount} moedas!`;
        winMessage.classList.add('win');
        winMessage.classList.remove('lose');
    } else {
        winAmountEl.innerText = 'Tente novamente!';
        winMessage.classList.add('lose');
        winMessage.classList.remove('win');
    }

    winMessage.style.display = 'block';
    winMessage.classList.add('show');

    setTimeout(() => {
        winMessage.classList.remove('show');
    }, 3000);
}

function hideWinMessage() {
    const winMessage = document.getElementById('win-message');
    winMessage.style.display = 'none';
    winMessage.classList.remove('show');
}

function createWinParticles() {
    const container = document.querySelector('.slot-machine');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('win-particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 0.5}s`;
        particle.innerText = ['💰', '💎', '⭐', '🎉', '✨'][Math.floor(Math.random() * 5)];
        container.appendChild(particle);

        setTimeout(() => particle.remove(), 2000);
    }
}

function updateStats() {
    document.getElementById('total-spins').innerText = stats.totalSpins;
    document.getElementById('total-wins').innerText = stats.totalWins;
    document.getElementById('biggest-win').innerText = stats.biggestWin;
    const winRate = stats.totalSpins > 0 ? ((stats.totalWins / stats.totalSpins) * 100).toFixed(1) : 0;
    document.getElementById('win-rate').innerText = winRate + '%';
}

function toggleStats() {
    const statsPanel = document.getElementById('stats-panel');
    statsPanel.classList.toggle('show');
}

function togglePaytable() {
    const paytablePanel = document.getElementById('paytable-panel');
    paytablePanel.classList.toggle('show');
}

function playSound(type) {
    // Placeholder for sound effects
    // You can add actual audio files later
    console.log(`Playing sound: ${type}`);
}

// Mostra o fim de jogo quando os créditos chegam a 0 e os rolos param
function endGame() {
    document.getElementById('final-spins').innerText = stats.totalSpins;
    document.getElementById('final-wins').innerText = stats.totalWins;
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('lever').disabled = true;
}

// Reinicia o jogo e reseta os créditos
function restartGame() {
    coins = 1000;
    currentBet = 50;
    stats = {
        totalSpins: 0,
        totalWins: 0,
        biggestWin: 0,
        totalWagered: 0,
        totalWon: 0
    };
    updateCoinsDisplay();
    updateBetDisplay();
    updateStats();
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('lever').disabled = false;
    hideWinMessage();
}

function createStars() {
    const numberOfStars = 100;  // Quantidade de estrelas que serão criadas
    for (let i = 0; i < numberOfStars; i++) {
        let star = document.createElement('div');
        star.classList.add('star');
        
        // Posiciona a estrela de forma aleatória no topo da tela
        star.style.left = `${Math.random() * 100}vw`;  // Randomiza a posição horizontal
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;  // Define a velocidade de queda aleatória
        star.style.animationDelay = `${Math.random() * 5}s`;  // Adiciona um delay aleatório na animação

        document.body.appendChild(star);
    }
}

createStars();  // Chama a função para criar as estrelas

// Inicializa o Three.js
init();
