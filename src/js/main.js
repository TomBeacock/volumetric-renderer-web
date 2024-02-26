import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { NRRDLoader } from "./nrrd_loader.js";
import { VolumeDataset } from "./volume_dataset.js";
import * as ElementUtil from "./util_element.js";

import vertexShader from "../shaders/volume.vert.js";
import fragmentShader from "../shaders/volume.frag.js";

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
        -0.5, -0.5, -0.5, +0.5, -0.5, -0.5, +0.5, +0.5, -0.5, -0.5, +0.5, -0.5, // Back
        -0.5, -0.5, +0.5, -0.5, -0.5, -0.5, -0.5, +0.5, -0.5, -0.5, +0.5, +0.5, // Left
        +0.5, -0.5, +0.5, -0.5, -0.5, +0.5, -0.5, +0.5, +0.5, +0.5, +0.5, +0.5, // Front
        +0.5, -0.5, -0.5, +0.5, -0.5, +0.5, +0.5, +0.5, +0.5, +0.5, +0.5, -0.5, // Right
        -0.5, +0.5, -0.5, +0.5, +0.5, -0.5, +0.5, +0.5, +0.5, -0.5, +0.5, +0.5, // Top
        -0.5, -0.5, +0.5, +0.5, -0.5, +0.5, +0.5, -0.5, -0.5, -0.5, -0.5, -0.5, // Bottom
    ]);
    const uvs = new Float32Array([
        0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, // Back
        0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, // Left
        1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, // Front
        1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, // Right
        0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, // Top
        0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, // Bottom
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
    const defaultTransferFunc = new THREE.DataTexture(new Uint8Array([255, 255, 255, 0, 255, 255, 255, 100]), 2, 1);
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
            u_density_max: {value: 1.0},
            u_slice_min: {value: new THREE.Vector3(0.0, 0.0, 0.0)},
            u_slice_max: {value: new THREE.Vector3(1.0, 1.0, 1.0)},
            u_volume: {value: defaultVolume},
            u_transfer_func: {value: defaultTransferFunc},
        },
        blending: THREE.AdditiveBlending,
    });
    return new THREE.Mesh(geometry, material);
}

const openFileInput = document.getElementById("open-file-input");
openFileInput.addEventListener("change", (event) => {
    const files = openFileInput.files;
    if(files.length > 0) {
        const fileReader = new FileReader();
        fileReader.addEventListener("load", (event) => {
            try {
                const loader = new NRRDLoader();
                let dataset = loader.parse(event.target.result);
                const volumeTexture = new THREE.Data3DTexture(dataset.data, dataset.xLength, dataset.yLength, dataset.zLength);
                volumeTexture.format = THREE.RedFormat;
                volume.material.uniforms.u_volume.value = volumeTexture;
                volume.material.uniforms.u_volume.value.needsUpdate = true;
                volume.material.needsUpdate = true;
            } catch (error) {
                console.log(error);
            }
        });
        fileReader.readAsArrayBuffer(files[0]);
    }
});

const brightnessField = document.getElementById("brightness-field");
brightnessField.addEventListener("valuechange", (event) => {});

const contrastField = document.getElementById("contrast-field");
contrastField.addEventListener("valuechange", (event) => {});

const colorMapField = document.getElementById("color-map-field");
colorMapField.addEventListener("valuechange", resampleTransferFunction);

const opacityMapField = document.getElementById("opacity-map-field");
opacityMapField.addEventListener("valuechange", resampleTransferFunction);

function resampleTransferFunction() {
    const data = new Uint8Array(256 * 4); // 256 rgba values
    const colorGradient = colorMapField.querySelector(".gradient");
    const opacityGradient = opacityMapField.querySelector(".gradient");
    const step = 100 / 256;
    for(let i = 0; i < 256; i++) {
        const percent = i * step;
        const rgb = ElementUtil.sampleGradient(colorGradient, percent);
        const a =  ElementUtil.sampleGradient(opacityGradient, percent).r;
        data[i * 4 + 0] = rgb.r;
        data[i * 4 + 1] = rgb.g;
        data[i * 4 + 2] = rgb.b;
        data[i * 4 + 3] = a;
    }
    const transferFunc = new THREE.DataTexture(data, 256, 1);
    transferFunc.needsUpdate = true;
    volume.material.uniforms.u_transfer_func.value = transferFunc;
    volume.material.needsUpdate = true;
}

function setSlice(index, min, max) {
    min /= 100;
    max /= 100;
    volume.material.uniforms.u_slice_min.value.setComponent(index, min);
    volume.material.uniforms.u_slice_max.value.setComponent(index, max);
    volume.material.needsUpdate = true;
}

const xSliceField = document.getElementById("x-slice-field");
xSliceField.addEventListener("valuechange", (event) => setSlice(0, event.detail.min, event.detail.max));

const ySliceField = document.getElementById("y-slice-field");
ySliceField.addEventListener("valuechange", (event) => setSlice(1, event.detail.min, event.detail.max));

const zSliceField = document.getElementById("z-slice-field");
zSliceField.addEventListener("valuechange", (event) => setSlice(2, event.detail.min, event.detail.max));

function update()  {
    requestAnimationFrame(update);
    volume.material.uniforms.u_view_matrix.value = camera.matrixWorldInverse;
    volume.material.uniforms.u_camera_position.value = camera.position;
    renderer.render(scene, camera);
}

update();