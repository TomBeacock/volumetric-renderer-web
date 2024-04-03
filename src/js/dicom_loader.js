import * as THREE from "three";
import * as dicomParser from "dicom-parser";
import {VolumeDataset} from "./volume_dataset.js";

class DICOMLoader {
	load(files, onLoad, onProgress) {
        const dimensions = new THREE.Vector3(-1, -1, 0);
        const type = THREE.FloatType;
        let min = Infinity, max = -Infinity;
        const slices = Array(files.length).fill();
        let loadedSlices = 0; 
        let sliceThickness;

        function recomputeDataRange(data) {
			for(let i = 0; i < data.length; i++) {
				min = Math.min(min, data[i]);
				max = Math.max(max, data[i]);
			}
		}

        function parseSlice(index, arrayBuffer) {
            const byteArray = new Uint8Array(arrayBuffer);
            const dicom = dicomParser.parseDicom(byteArray);
            if(dicom.warnings.length > 0) {
                throw new Error("Failed to parse DICOM file");
            }
            const rows = dicom.uint16("x00280010");
            const cols = dicom.uint16("x00280011");

            if(dimensions.x == -1) {
                dimensions.x = cols;
            } else if(cols != dimensions.x) {
                throw new Error("Slice dimensions are not equal");
            }

            if(dimensions.y == -1) {
                dimensions.y = rows;
            } else if(rows != dimensions.y) {
                throw new Error("Slice dimensions are not equal");
            }

            const bitsAllocated = dicom.uint16("x00280100");
            const bitsStored = dicom.uint16("x00280101");
            const highBit = dicom.uint16("x00280102");
            sliceThickness = dicom.floatString("x00180050");

            const n = rows * cols;
            const slice = new Float32Array(n);
            for(let i = 0; i < n; i++) {
                slice[i] = dicom.uint16("x7fe00010", i);
            }
            slices[index] = slice;
            dimensions.z++;
            recomputeDataRange(slice);

            loadedSlices += 1;
            if(typeof(onProgress) === "function") {
                onProgress((loadedSlices / slices.length) * 100);
            }

            if(typeof(onLoad) === "function" && dimensions.z == files.length) {
                const data = new Float32Array(rows * cols * files.length);
                for(let i = 0; i < slices.length; i++) {
                    data.set(slices[i], i * n);
                }
                let scale;
                if(sliceThickness !== undefined) {
                    scale = dimensions.clone();
                    scale.z *= sliceThickness;
                    const max = Math.max(scale.x, scale.y, scale.z);
                    scale = scale.divideScalar(max);
                }
                onLoad(new VolumeDataset(dimensions, 1, type, data, min, max, scale));
            }
        }
        for(let i = 0; i < files.length; i++) {
            const fileReader = new FileReader();
            fileReader.addEventListener("load", (event) => parseSlice(i, event.target.result));
            fileReader.readAsArrayBuffer(files[i]);
        }
	}
};

export {DICOMLoader};