import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { NRRDLoader } from "./nrrd_loader.js";
import { VolumeDataset } from "./volume_dataset.js";
import * as Util from "./util.js";
import * as ElementUtil from "./util_element.js";

import vertexShader from "../shaders/volume.vert.js";
import fragmentShader from "../shaders/volume.frag.js";
import { DICOMLoader } from "./dicom_loader.js";

const scene = new THREE.Scene();
const viewport = document.getElementById("context-container");
const context = document.getElementById("context");

const camera = new THREE.PerspectiveCamera(75, viewport.offsetWidth / viewport.offsetHeight, 0.1, 1000);
const controls = new OrbitControls(camera, context);
controls.zoomSpeed = 1.5;
controls.maxDistance = 10.0;
camera.position.set(0, 0, 2);
controls.update();

const renderer = new THREE.WebGLRenderer({canvas: context, antialias: true});
renderer.setSize(viewport.offsetWidth, viewport.offsetHeight);
renderer.setClearColor(new THREE.Color(0x1b1b1b));

const xAxisLine = createAxisLine(0xff0022, new THREE.Vector3(1, 0, 0));
scene.add(xAxisLine);
const yAxisLine = createAxisLine(0x7bff00, new THREE.Vector3(0, 1, 0));
scene.add(yAxisLine);
const zAxisLine = createAxisLine(0x0099ff, new THREE.Vector3(0, 0, 1));
scene.add(zAxisLine);

const volume = create_volume_mesh();
scene.add(volume);

const resize_observer = new ResizeObserver(() => {
    camera.aspect = viewport.offsetWidth / viewport.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewport.offsetWidth, viewport.offsetHeight);
    renderer.render(scene, camera);
});

resize_observer.observe(viewport);

function createAxisLine(color, axis) {
    const material = new THREE.LineBasicMaterial({color: color, transparent: true, opacity: 0.5, depthTest: false});
    const points = [axis.clone().multiplyScalar(-1000), axis.clone().multiplyScalar(1000)];    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    return line;
}

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
            u_transform_matrix: {value: new THREE.Matrix4()},
            u_inv_transform_matrix: {value: new THREE.Matrix4()},
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

function normalizeValue(type, value) {
    switch(type) {
        case THREE.FloatType: return value;
        case THREE.ByteType: return Util.mapRange(value, -128, 127, 0, 1);
        case THREE.UnsignedByteType: return Util.mapRange(value, 0, 255, 0, 1);
        case THREE.ShortType: return Util.mapRange(value, -32768, 32767, 0, 1);
        case THREE.UnsignedShortType: return Util.mapRange(value, 0, 65535, 0, 1);
        case THREE.IntType: return Util.mapRange(value, -2147483648, 2147483647, 0, 1);
        case THREE.UnsignedIntType: return Util.mapRange(value, 0, 4294967295, 0, 1);
    }
}

let dataset = null;
let currentFrame = 0;
const importingModel = document.getElementById("importing-model");
const player = document.getElementById("player");

function updateScale() {
    const scale_matrix = new THREE.Matrix4().makeScale(dataset.scale.x, dataset.scale.y, dataset.scale.z);
    const inv_scale_matrix = scale_matrix.clone().invert();
    volume.material.uniforms.u_transform_matrix.value = scale_matrix;
    volume.material.uniforms.u_inv_transform_matrix.value = inv_scale_matrix;
    volume.material.needsUpdate = true;
}

function updateFrame() {
    if(dataset == null) {
        return;
    }
    const data = dataset.getFrameData(currentFrame);
    const volumeTexture = new THREE.Data3DTexture(data, dataset.dimensions.x, dataset.dimensions.y, dataset.dimensions.z);
    volumeTexture.format = THREE.RedFormat;
    volumeTexture.type = dataset.type;
    volume.material.uniforms.u_volume.value = volumeTexture;
    volume.material.uniforms.u_volume.value.needsUpdate = true;
    volume.material.uniforms.u_density_min.value = normalizeValue(dataset.type, dataset.min);
    volume.material.uniforms.u_density_max.value = normalizeValue(dataset.type, dataset.max);
    volume.material.needsUpdate = true;
};

function onProgress(progress) {
    const progressBar = importingModel.querySelector(".progress-bar");
    ElementUtil.setProgressBarProgress(progressBar, progress);
}

function onLoad(newDataset) {
    ElementUtil.closeModel(importingModel);
    dataset = newDataset;
    currentFrame = 0;
    ElementUtil.setPlayerFrame(player, currentFrame);
    ElementUtil.setPlayerFrameCount(player, dataset.frameCount);
    player.style.display = dataset.frameCount > 1 ? "" : "none";
    updateScale();
    updateFrame();
}

const openFileInput = document.getElementById("open-file-input");
openFileInput.addEventListener("change", (event) => {
    const files = openFileInput.files;
    if(files.length > 0) {   
        const filename = files[0].name;
        const ext = filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
        let loader;
        switch(ext) {
            case "nrrd": loader = new NRRDLoader(); break;
            case "dcm": loader = new DICOMLoader(); break;
        }
        if(loader !== undefined) {
            try {
                const progressBar = importingModel.querySelector(".progress-bar");
                ElementUtil.setProgressBarProgress(progressBar, 0);
                ElementUtil.showModel(importingModel);
                loader.load(files, onLoad, onProgress);
            } catch(error) {
                console.log(error);
                ElementUtil.closeModel(importingModel);
            }
        }
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

const rotateField = document.getElementById("rotate-field");
rotateField.addEventListener("valuechange", (event) => {
    const scale_matrix = new THREE.Matrix4().makeScale(dataset.scale.x, dataset.scale.y, dataset.scale.z);
    const rotation = event.detail.rotation;
    const euler = new THREE.Euler(
        THREE.MathUtils.degToRad(rotation[0]),
        THREE.MathUtils.degToRad(rotation[1]),
        THREE.MathUtils.degToRad(rotation[2])
    )
    const rotation_matrix = new THREE.Matrix4().makeRotationFromEuler(euler);
    const transform_matrix = new THREE.Matrix4().multiplyMatrices(rotation_matrix, scale_matrix);
    const inv_transform_matrix = transform_matrix.clone().invert();
    volume.material.uniforms.u_transform_matrix.value = transform_matrix;
    volume.material.uniforms.u_inv_transform_matrix.value = inv_transform_matrix;
    volume.material.needsUpdate = true;
});

const xAxisToggleButton = document.getElementById("x-axis-toggle-button");
xAxisToggleButton.addEventListener("toggle", (event) => {
    xAxisLine.visible = event.detail.on;
});
const yAxisToggleButton = document.getElementById("y-axis-toggle-button");
yAxisToggleButton.addEventListener("toggle", (event) => {
    yAxisLine.visible = event.detail.on;
});
const zAxisToggleButton = document.getElementById("z-axis-toggle-button");
zAxisToggleButton.addEventListener("toggle", (event) => {
    zAxisLine.visible = event.detail.on;
});

function update()  {
    const playerFrame = ElementUtil.getPlayerFrame(player);
    if(currentFrame != playerFrame) {
        currentFrame = playerFrame;
        updateFrame();
    }
    volume.material.uniforms.u_view_matrix.value = camera.matrixWorldInverse;
    volume.material.uniforms.u_camera_position.value = camera.position;
    renderer.render(scene, camera);
    requestAnimationFrame(update);
}

resampleTransferFunction();
onLoad(new VolumeDataset(new THREE.Vector3(1, 1, 1), 1, THREE.UnsignedByteType, new Uint8Array([1]), 0.0, 1.0, new THREE.Vector3(1, 1, 1)));
update();