import * as THREE from "three";

class VolumeDataset {
	/**
	 * 
	 * @param {Array<number>} dimensions The dimension of the volume
	 * @param {number} type The type of the buffer
	 * @param {TypedArray} data The data buffer
	 * @param {number} min The minimum value in the buffer
	 * @param {number} max The maximum value in the buffer
	 */
	constructor(dimensions, type, data, min, max) {
		this.type = type;
		this.data = data;
		this.min = min;
		this.max = max;

		if(dimensions.length == 3) {
			this.dimensions = dimensions;
			this.frameCount = 1;
			this.frameSize = dimensions[0] * dimensions[1] * dimensions[2];
		} else if(dimensions.length == 4) {
			this.dimensions = dimensions.slice(0, 3);
			this.frameCount = dimensions[3];
			this.frameSize = dimensions[0] * dimensions[1] * dimensions[2];
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