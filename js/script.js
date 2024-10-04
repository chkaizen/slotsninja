let scene, camera, renderer, cylinders = [], spinning = false;
let spinSpeed = 0.05;

function init() {
    // Inicializando a cena
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / 300, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, 300);
    document.getElementById('three-container').appendChild(renderer.domElement);

    // Criando cilindros (usando Three.js)
    for (let i = 0; i < 3; i++) {
        let geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
        let material = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
        let cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.x = i * 15 - 15; // espaçamento entre os cilindros
        cylinders.push(cylinder);
        scene.add(cylinder);
    }

    camera.position.z = 50;

    animate();
}

function toggleSpin() {
    spinning = !spinning;  // Alterna entre girar ou parar
}

function animate() {
    requestAnimationFrame(animate);

    if (spinning) {
        // Faz os cilindros girarem
        cylinders.forEach(cylinder => {
            cylinder.rotation.y += spinSpeed;
        });
    }

    renderer.render(scene, camera);
}

// Detectar plataforma (PC ou Mobile)
function detectPlatform() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        console.log("Dispositivo Móvel Detectado");
        return 'mobile';
    } else {
        console.log("Dispositivo Desktop Detectado");
        return 'desktop';
    }
}

init();
