import * as THREE from "three";
import * as fflate from "fflate";
import {VolumeDataset} from "./volume_dataset.js";

class NRRDLoader extends THREE.Loader {
	constructor(manager) {
		super(manager);
	}

	load(url, onLoad, onProgress, onError) {
		const scope = this;

		const loader = new THREE.FileLoader(scope.manager);
		loader.setPath(scope.path);
		loader.setResponseType("arraybuffer");
		loader.setRequestHeader(scope.requestHeader);
		loader.setWithCredentials(scope.withCredentials);
		loader.load(url, function (data) {
			try {
				onLoad(scope.parse(data));
			} catch (e) {
				if (onError) {
					onError(e);
				} else {
					console.error(e);
				}
				scope.manager.itemError(url);
			}
		}, onProgress, onError);
	}

	parse(data) {
        function parseChars(array, start, end) {
            if (start === undefined) {
                start = 0;
            }
            if (end === undefined) {
                end = array.length;
            }
            let output = "";
            for (let i = start; i < end; i++) {
                output += String.fromCharCode(array[i]);
            }
            return output;
        }

		function readBytes(data) {
			let bytes = new Uint8Array(data);

			const nativeLittleEndian = new Int8Array(new Int16Array([1]).buffer)[0] > 0;
			const littleEndian = true;
			if (nativeLittleEndian != littleEndian) {
				bytes = flipEndianness(bytes);
			}
			return bytes;
		}

		function flipEndianness(array) {
			const u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
			for (let i = 0; i < array.byteLength; i++) {
				for (let j = i, k = i; j > k; j--, k++) {
					const tmp = u8[k];
					u8[k] = u8[j];
					u8[j] = tmp;
				}
			}
			return array;
		}

		function parseHeader(rawHeader) {
			const header = {};
			let match;
			const lines = rawHeader.split(/\r?\n/);
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				if (line.match(/NRRD\d+/)) {
					header.isNrrd = true;
				} else if (!line.match(/^#/) && (match = line.match(/(.*):(.*)/))) {
					const field = match[1].trim();
					const data = match[2].trim();
					parseField(header, field, data);
				}
			}

			if (!header.isNrrd) {
				throw new Error("Not an NRRD file");
			}

			if (header.encoding === "bz2" || header.encoding === "bzip2") {
				throw new Error("Bzip is not supported");
			}

			if (!header.vectors) {
				// Default space direction to identity
				header.vectors = [];
				header.vectors.push([1, 0, 0]);
				header.vectors.push([0, 1, 0]);
				header.vectors.push([0, 0, 1]);

				// Apply spacing if defined
				if (header.spacings) {
					for (let i = 0; i <= 2; i++) {
						if (!isNaN(header.spacings[i])) {
							for (let j = 0; j <= 2; j++) {
								header.vectors[i][j] *= header.spacings[i];
							}
						}
					}
				}
			}
			return header;
		}

		function parseField(header, field, data) {
			const parseFieldFunction = parseFieldFunctions[field];
			if(parseFieldFunction) {
				parseFieldFunction.call(header, data);
			} else {
				header[field] = data;
			}
		}

		function parseData(header, data) {
			let parsedData;
			if (header.encoding.substring(0, 2) === "gz") {
				parsedData = parseDataGZip(header, data);
			} else if (header.encoding === "ascii" || header.encoding === "text" || header.encoding === "txt" || header.encoding === "hex") {
				parsedData = parseDataText(header, data);
			} else if (header.encoding === "raw") {
				parsedData = parseDataRaw(header, data);
			}

			const length = header.sizes.reduce((product, n) => product * n, 1);
			if(parsedData.length != length) {
				throw new Error("Number of datapoints does not match dimensions");
			}

			// Three JS doesn't support 64-bit floats, convert to 32-bit.
			if(header.dataStreamType == Float64Array) {
				parsedData = new Float32Array(parsedData);
			}
			return parsedData;
		}

		function parseDataGZip(header, data) {
			const unzipped = fflate.gunzipSync(data);
			return new header.dataStreamType(unzipped.buffer);
		}

		// Parse the data when registred as one of this type : "text", "ascii", "txt"
		function parseDataText(header, data, start, end) {
			let number = "";
			start = start || 0;
			end = end || data.length;
			let value;
			const length = header.sizes.reduce((product, n) => product * n, 1);

			let base = 10;
			if (header.encoding === "hex") {
				base = 16;
			}

			const result = new header.dataStreamType(length);
			let resultIndex = 0;

			let parsingFunction = parseInt;
			if (header.dataStreamType === Float32Array || header.dataStreamType === Float64Array) {
				parsingFunction = parseFloat;
			}

			for (let i = start; i < end; i++) {
				value = data[i];
				if ((value < 9 || value > 13) && value !== 32) {
					number += String.fromCharCode(value);
				} else {
					if (number !== "") {
						result[resultIndex] = parsingFunction(number, base);
						resultIndex ++;
					}
					number = "";
				}
			}
			if (number !== "") {
				result[resultIndex] = parsingFunction(number, base);
				resultIndex ++;
			}
			return result;
		}

		function parseDataRaw(header, data) {
			return new header.dataStreamType(data.buffer);
		}

		function computeDataRange(data) {
			let min = Infinity, max = -Infinity;
			for(let i = 0; i < data.length; i++) {
				min = Math.min(min, data[i]);
				max = Math.max(max, data[i]);
			}
			return {min: min, max: max};
		}

		const rawBytes = readBytes(data);
		let rawHeader = null;
		let dataStart = 0;
		for (let i = 1; i < rawBytes.length; i++) {
            // Check for two line breaks
			if (rawBytes[i - 1] == 10 && rawBytes[i] == 10) {
				rawHeader = parseChars(rawBytes, 0, i - 1);
				dataStart = i + 1;
				break;
			}
		}

		const header = parseHeader(rawHeader);

		const rawData = rawBytes.slice(dataStart);
		const parsedData = parseData(header, rawData);
		const range = computeDataRange(parsedData);

		const volume = new VolumeDataset();
		volume.setData(header.sizes, header.type, parsedData, range.min, range.max);
		return volume;
	}
}

const parseFieldFunctions = {
	"type": function (data) {
		switch (data) {
			case "signed char":
			case "int8":
			case "int8_t":
				this.dataStreamType = Int8Array;
				this.type = THREE.ByteType;
				break;
			case "uchar":
			case "unsigned char":
			case "uint8":
			case "uint8_t":
				this.dataStreamType = Uint8Array;
				this.type = THREE.UnsignedByteType;
				break;
			case "short":
			case "short int":
			case "signed short":
			case "signed short int":
			case "int16":
			case "int16_t":
				this.dataStreamType = Int16Array;
				this.type = THREE.ShortType;
				break;
			case "ushort":
			case "unsigned short":
			case "unsigned short int":
			case "uint16":
			case "uint16_t":
				this.dataStreamType = Uint16Array;
				this.type = THREE.UnsignedShortType;
				break;
			case "int":
			case "signed int":
			case "int32":
			case "int32_t":
				this.dataStreamType = Int32Array;
				this.type = THREE.IntType;
				break;
			case "uint":
			case "unsigned int":
			case "uint32":
			case "uint32_t":
				this.dataStreamType = Uint32Array;
				this.type = THREE.UnsignedIntType;
				break;
			case "float":
				this.dataStreamType = Float32Array;
				this.type = THREE.FloatType;
				break;
			case "double":
				this.dataStreamType = Float64Array;
				this.type = THREE.FloatType;
				break;
			default:
				throw new Error("Unsupported NRRD data type: " + data);
		}
	},

	"endian": function (data) {
		return this.endian = data;
	},

	"encoding": function (data) {
		return this.encoding = data;
	},

	"dimension": function (data) {
		return this.dim = parseInt(data, 10);
	},

	"sizes": function (data) {
		return this.sizes = (function () {
			const ref = data.split(/\s+/);
			const results = [];
			for (let i = 0; i < ref.length; i++) {
				results.push(parseInt(ref[i], 10));
			}
			return results;
		})();
	},

	"space": function (data) {
		return this.space = data;
	},

	"space origin": function (data) {
		return this.spaceOrigin = data.split("(")[1].split(")")[0].split(",");
	},

	"space directions": function (data) {
		const directions = data.match(/\(.*?\)/g);
		return this.spaceDirections = (function () {
			const results = [];
			for (let i = 0; i < directions.length; i ++) {
				results.push((function () {
					const components = directions[i].slice(1, -1).split(/,/);
					const direction = [];
					for (let j = 0; j < components.length; j++) {
						direction.push(parseFloat(components[j]));
					}
					return direction;
				})());
			}
			return results;
		})();
	},

	"spacings": function (data) {
		const parts = data.split(/\s+/);
		return this.spacings = (function () {
			const results = [];
			for (let i = 0; i < parts.length; i++) {
				results.push(parseFloat(parts[i]));
			}
			return results;
		})();
	}
};

export {NRRDLoader};