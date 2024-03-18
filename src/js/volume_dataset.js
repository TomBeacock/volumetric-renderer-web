import * as THREE from "three";

class VolumeDataset {
	/**
	 * 
	 * @param {THREE.Vector3} dimensions The dimension of the volume
	 * @param {number} frames The dimension of the volume
	 * @param {number} type The type of the buffer
	 * @param {TypedArray} data The data buffer
	 * @param {number} min The minimum value in the buffer
	 * @param {number} max The maximum value in the buffer
	 */
	constructor(dimensions, frameCount, type, data, min, max, scale) {
		this.dimensions = dimensions;
		this.frameCount = frameCount;
		this.frameSize = dimensions.x * dimensions.y * dimensions.z;
		this.type = type;
		this.data = data;
		this.min = min;
		this.max = max;
		this.scale = scale;
		
		if(scale == undefined) {
			const max = Math.max(dimensions.x, dimensions.y, dimensions.z);
			this.scale = dimensions.clone().divideScalar(max);
		}
	}

	/**
	 * Gets a volume snapshot from a 4D dataset
	 * @param {number} i The index of the snapshot 
	 * @returns {TypedArray} View of the snapshot in the data buffer
	 */
	getFrameData(i) {
		const start = this.frameSize * i, end = start + this.frameSize;
		return this.data.subarray(start, end);
	}
}

export {VolumeDataset}