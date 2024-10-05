let scene, camera, renderer, cylinders = [], spinning = false;
let spinSpeed = [0, 0, 0];  // Velocidades individuais para cada cilindro
let stopOrder = [false, false, false];  // Controle de parada de cada cilindro
let spinStartTime = 0;
let coins = 1000;
const sectionsPerReel = 12; // 12 seções numeradas no cilindro

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
    if (!spinning && coins > 0) {
        spinning = true;
        spinStartTime = performance.now();
        spinSpeed = [0.1, 0.12, 0.08];  // Velocidades diferentes para cada rolo
        stopOrder = [false, false, false];
        deductCoins();
    }
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
                }
            }
            cylinders[i].rotation.x += spinSpeed[i];
        }

        // Espera todos os cilindros pararem antes de encerrar o jogo
        if (elapsed > 3.5 && stopOrder.every(status => status)) {
            spinning = false;
            highlightResult();  // Exibe o destaque da linha de sorteio

            if (coins <= 0) {
                endGame();
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
    coins -= 100;
    document.getElementById('coin-count').innerText = coins;
    
    if (coins <= 0) {
        endGame();
    }
}

// Mostra o fim de jogo quando os créditos chegam a 0 e os rolos param
function endGame() {
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('lever').disabled = true;
}

// Reinicia o jogo e reseta os créditos
function restartGame() {
    coins = 1000;
    document.getElementById('coin-count').innerText = coins;
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('lever').disabled = false;
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
