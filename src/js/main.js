import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

import vertexShader from "../shaders/volume.vert.js"
import fragmentShader from "../shaders/volume.frag.js"

const scene = new THREE.Scene();
const viewport = document.getElementById("viewport");

const camera = new THREE.PerspectiveCamera(75, viewport.offsetWidth / viewport.offsetHeight, 0.1, 1000);
const controls = new OrbitControls(camera, viewport);
controls.zoomSpeed = 1.5;
camera.position.set(0, 0, 2);
controls.update();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(viewport.offsetWidth, viewport.offsetHeight);
renderer.setClearColor(new THREE.Color(0x1b1b1b));
viewport.appendChild(renderer.domElement);

const volume = create_volume_mesh();
scene.add(volume);

const resize_observer = new ResizeObserver(() => {
    camera.aspect = viewport.offsetWidth / viewport.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewport.offsetWidth, viewport.offsetHeight);
    renderer.render(scene, camera);
});

resize_observer.observe(viewport);

function create_volume_mesh() {
    const positions = new Float32Array([
        -0.5, -0.5, -0.5, -0.5, +0.5, -0.5, +0.5, +0.5, -0.5, +0.5, -0.5, -0.5, // Back
        -0.5, -0.5, +0.5, -0.5, +0.5, +0.5, -0.5, +0.5, -0.5, -0.5, -0.5, -0.5, // Left
        +0.5, -0.5, +0.5, +0.5, +0.5, +0.5, -0.5, +0.5, +0.5, -0.5, -0.5, +0.5, // Front
        +0.5, -0.5, -0.5, +0.5, +0.5, -0.5, +0.5, +0.5, +0.5, +0.5, -0.5, +0.5, // Right
        -0.5, +0.5, -0.5, -0.5, +0.5, +0.5, +0.5, +0.5, +0.5, +0.5, +0.5, -0.5, // Top
        -0.5, -0.5, +0.5, -0.5, -0.5, -0.5, +0.5, -0.5, -0.5, +0.5, -0.5, +0.5, // Bottom
    ]);
    const uvs = new Float32Array([
        0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // Back
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, // Left
        1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, // Front
        1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, // Right
        0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, // Top
        0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, // Bottom
    ]);
    const indices = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23,
    ];
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("tex_coords", new THREE.BufferAttribute(uvs, 3));
    geometry.setIndex(indices);

    const defaultVolume = new THREE.Data3DTexture(new Uint8Array([255]), 1, 1, 1);
    defaultVolume.format = THREE.RedFormat;
    defaultVolume.needsUpdate = true;
    const defaultTransferFunc = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    defaultTransferFunc.needsUpdate = true;

    const material = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            u_projection_matrix: {value: camera.projectionMatrix},
            u_view_matrix: {value: camera.matrixWorldInverse},
            u_camera_position: {value: camera.position.clone()},
            u_density_min: {value: 0.0},
            u_density_max: {value: 255.0},
            u_slice_min: {value: new THREE.Vector3(0.0, 0.0, 0.0)},
            u_slice_max: {value: new THREE.Vector3(1.0, 1.0, 1.0)},
            u_volume: { value: defaultVolume},
            u_transfer_func: { value: defaultTransferFunc},
        }
    });
    return new THREE.Mesh(geometry, material);
}

function update()  {
    requestAnimationFrame(update);
    volume.material.uniforms.u_view_matrix.value = camera.matrixWorldInverse;
    volume.material.uniforms.u_camera_position.value = camera.position;
    renderer.render(scene, camera);
}

update();