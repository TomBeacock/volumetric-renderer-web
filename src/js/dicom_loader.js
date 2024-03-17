import * as THREE from "three";
import * as dicomParser from "dicom-parser";
import {VolumeDataset} from "./volume_dataset.js";

class DICOMLoader {
	load(files, callback) {
        const dimensions = [-1, -1, 0];
        const type = THREE.FloatType;
        let min = Infinity, max = -Infinity;
        const slices = Array(files.length).fill();

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

            if(dimensions[0] == -1) {
                dimensions[0] = cols;
            } else if(cols != dimensions[0]) {
                throw new Error("Slice dimensions are not equal");
            }

            if(dimensions[1] == -1) {
                dimensions[1] = rows;
            } else if(rows != dimensions[1]) {
                throw new Error("Slice dimensions are not equal");
            }

            const bitsAllocated = dicom.uint16("x00280100");
            const bitsStored = dicom.uint16("x00280101");
            const highBit = dicom.uint16("x00280102");

            const n = rows * cols;
            const slice = new Float32Array(n);
            for(let i = 0; i < n; i++) {
                slice[i] = dicom.uint16("x7fe00010", i);
            }
            slices[index] = slice;
            dimensions[2]++;
            recomputeDataRange(slice);

            if(typeof(callback) === "function" && dimensions[2] == files.length) {
                const data = new Float32Array(rows * cols * files.length);
                for(let i = 0; i < slices.length; i++) {
                    data.set(slices[i], i * n);
                }
                callback(new VolumeDataset(dimensions, type, data, min, max));
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