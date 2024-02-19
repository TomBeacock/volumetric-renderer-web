import { Matrix3 } from "three";

class VolumeDataset {
    constructor(xLength, yLength, zLength, type, arrayBuffer) {
        if (xLength !== undefined) {
			/**
			 * @member {number} xLength Width of the volume in the IJK coordinate system
			 */
			this.xLength = Number(xLength) || 1;
			/**
			 * @member {number} yLength Height of the volume in the IJK coordinate system
			 */
			this.yLength = Number(yLength) || 1;
			/**
			 * @member {number} zLength Depth of the volume in the IJK coordinate system
			 */
			this.zLength = Number(zLength) || 1;
			/**
			 * @member {Array<string>} The order of the Axis dictated by the NRRD header
			 */
			this.axisOrder = ['x', 'y', 'z'];
			/**
			 * @member {TypedArray} data Data of the volume
			 */

			switch (type) {
				case 'Uint8' :
				case 'uint8' :
				case 'uchar' :
				case 'unsigned char' :
				case 'uint8_t' :
					this.data = new Uint8Array(arrayBuffer);
					break;
				case 'Int8' :
				case 'int8' :
				case 'signed char' :
				case 'int8_t' :
					this.data = new Int8Array(arrayBuffer);
					break;
				case 'Int16' :
				case 'int16' :
				case 'short' :
				case 'short int' :
				case 'signed short' :
				case 'signed short int' :
				case 'int16_t' :
					this.data = new Int16Array(arrayBuffer);
					break;
				case 'Uint16' :
				case 'uint16' :
				case 'ushort' :
				case 'unsigned short' :
				case 'unsigned short int' :
				case 'uint16_t' :
					this.data = new Uint16Array(arrayBuffer);
					break;
				case 'Int32' :
				case 'int32' :
				case 'int' :
				case 'signed int' :
				case 'int32_t' :
					this.data = new Int32Array(arrayBuffer);
					break;
				case 'Uint32' :
				case 'uint32' :
				case 'uint' :
				case 'unsigned int' :
				case 'uint32_t' :
					this.data = new Uint32Array(arrayBuffer);
					break;
				case 'longlong' :
				case 'long long' :
				case 'long long int' :
				case 'signed long long' :
				case 'signed long long int' :
				case 'int64' :
				case 'int64_t' :
				case 'ulonglong' :
				case 'unsigned long long' :
				case 'unsigned long long int' :
				case 'uint64' :
				case 'uint64_t' :
					throw new Error('Error in Volume constructor : this type is not supported in JavaScript');
				case 'Float32' :
				case 'float32' :
				case 'float' :
					this.data = new Float32Array(arrayBuffer);
					break;
				case 'Float64' :
				case 'float64' :
				case 'double' :
					this.data = new Float64Array(arrayBuffer);
					break;
				default :
					this.data = new Uint8Array(arrayBuffer);
			}

			if (this.data.length !== this.xLength * this.yLength * this.zLength) {
				throw new Error('Error in Volume constructor, lengths are not matching arrayBuffer size');
			}
		}

		/**
		 * @member {Array}  spacing Spacing to apply to the volume from IJK to RAS coordinate system
		 */
		this.spacing = [1, 1, 1];
		/**
		 * @member {Array}  offset Offset of the volume in the RAS coordinate system
		 */
		this.offset = [0, 0, 0];
		/**
		 * @member {Martrix3} matrix The IJK to RAS matrix
		 */
		this.matrix = new Matrix3();
		this.matrix.identity();
		/**
		 * @member {Martrix3} inverseMatrix The RAS to IJK matrix
		 */
		/**
		 * @member {number} min The minimum value in the dataset
		 */
		this.min = -Infinity;
		/**
		 * @member {number} max The maximum value in the dataset
		 */
		this.max = Infinity;
		/**
		 * @member {boolean} segmentation in segmentation mode, it can load 16-bits nrrds correctly
		 */
		this.segmentation = false;
    }
}

export {VolumeDataset}