let scene, camera, renderer, cylinders = [], spinning = false;
let spinSpeed = [0, 0, 0];  // Velocidades individuais para cada cilindro
let stopOrder = [false, false, false];  // Controle de parada de cada cilindro
let spinStartTime = 0;

function init() {
    // Cria a cena e a câmera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Configura o renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(400, 400);  // Ajusta o tamanho do renderizador
    document.getElementById('three-container').appendChild(renderer.domElement);

    // Adiciona luz à cena
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Geometria dos cilindros (discos)
    let geometry = new THREE.CylinderGeometry(1, 1, 1, 32);  // Diâmetro 1, altura 1 (mais largo)

    // Criar uma textura com os números de 1 a 25
    let texture = createNumberTexture();

    // Cria 3 cilindros com a textura de números aplicada
    for (let i = 0; i < 3; i++) {
        let material = new THREE.MeshBasicMaterial({ map: texture });

        let cylinder = new THREE.Mesh(geometry, material);
        
        // Posiciona os cilindros com espaçamento
        cylinder.position.x = i * 2 - 2;  // Posição horizontal (-2, 0, 2)

        // Alinha os cilindros corretamente no eixo X para rotação
        cylinder.rotation.z = Math.PI / 2;  // Mantém o cilindro rotacionado no eixo Z
        cylinder.rotation.y = 0;  // Mantém os números na face correta sem rotacioná-los mais

        // Adiciona o cilindro à cena
        cylinders.push(cylinder);
        scene.add(cylinder);
    }

    // Posiciona a câmera para ver os cilindros
    camera.position.z = 10;

    animate();  // Inicia a animação
}

// Função para criar uma textura com os números de 1 a 25 distribuídos em uma faixa
function createNumberTexture() {
    let canvas = document.createElement('canvas');
    canvas.width = 1024;  // Largura suficiente para todos os números
    canvas.height = 64;   // Altura fixa

    let context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';  // Fundo branco
    context.fillRect(0, 0, canvas.width, canvas.height);  // Preenche o fundo

    context.fillStyle = '#000000';  // Cor dos números
    context.font = 'Bold 40px Arial';

    // Desenhar os números de 1 a 25 na faixa
    for (let i = 1; i <= 25; i++) {
        let x = (i - 1) * 40;  // Posicionamento horizontal
        context.fillText(i.toString(), x, 45);  // Desenha o número
    }

    return new THREE.CanvasTexture(canvas);  // Converte o canvas para textura
}

function toggleSpin() {
    if (!spinning) {
        // Iniciar giro
        spinning = true;
        spinStartTime = performance.now();  // Captura o tempo de início
        spinSpeed = [0.1, 0.1, 0.1];  // Aceleração inicial
        stopOrder = [false, false, false];  // Reseta as paradas
    }
}

function animate() {
    requestAnimationFrame(animate);  // Rechama a função para criar o loop de animação

    if (spinning) {
        let currentTime = performance.now();
        let elapsed = (currentTime - spinStartTime) / 1000;  // Tempo em segundos

        // Aceleração e desaceleração
        for (let i = 0; i < 3; i++) {
            if (!stopOrder[i]) {
                // Acelera inicialmente e depois desacelera
                if (elapsed < 1) {
                    spinSpeed[i] = 0.2 * elapsed;  // Aumenta a velocidade
                } else if (elapsed > 1 && elapsed < 2.5) {
                    spinSpeed[i] = 0.2;  // Mantém a velocidade constante
                } else if (elapsed > 2.5 && spinSpeed[i] > 0) {
                    spinSpeed[i] -= 0.01;  // Desacelera
                }

                // Verifica se deve parar o cilindro
                if (spinSpeed[i] <= 0) {
                    stopOrder[i] = true;  // Cilindro parou
                    spinSpeed[i] = 0;  // Garante que pare
                }
            }

            // Faz os cilindros girarem no eixo X
            cylinders[i].rotation.x += spinSpeed[i];
        }

        // Para o giro gradualmente após 3.5 segundos
        if (elapsed > 3.5) {
            spinning = false;
        }
    }

    renderer.render(scene, camera);  // Renderiza a cena
}

// Inicializa o Three.js
init();
