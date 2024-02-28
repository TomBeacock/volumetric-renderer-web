import * as THREE from "three";

class VolumeDataset {
	setData(dimensions, type, data, min, max) {
		this.dimensions = dimensions;
		this.type = type;
		this.data = data;
		this.min = min;
		this.max = max;
	}
}

export {VolumeDataset}