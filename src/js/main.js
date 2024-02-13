import * as THREE from "three"

const viewport = document.getElementById("viewport");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, viewport.offsetWidth / viewport.offsetHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(viewport.offsetWidth, viewport.offsetHeight);
renderer.setClearColor(new THREE.Color(0x3A3A3A));
viewport.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

const resize_observer = new ResizeObserver(() => {
    camera.aspect = viewport.offsetWidth / viewport.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewport.offsetWidth, viewport.offsetHeight);
    renderer.render(scene, camera);
});

resize_observer.observe(viewport);

function animate()  {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();