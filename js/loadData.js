import { appState  } from './appState.js';
/**
 * Reads and parses a JSON file from an input file element.
 * @param {File} file - The file object from the input element.
 * @returns {Promise<Object>} A promise that resolves with the parsed JSON content.
 */
export function loadJson(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const json = JSON.parse(event.target.result); // Parse JSON
                resolve(json);
            } catch (error) {
                reject(new Error("Failed to parse JSON"));
            }
        };
        reader.onerror = function() {
            reject(new Error("Failed to read file"));
        };

        reader.readAsText(file); // Read the file as a text string
    });

}

export async function loadRaw(metadata) {
    try {
        // Assuming the raw file is in the same directory as the JSON file
        const fileUrl = metadata.file; // Or construct a full URL if needed
        const response = await fetch(fileUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch raw file: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer(); // Fetch raw binary data
        const dimensions = metadata.dimensions;
        const dataType = metadata.dataType;

        // Interpret the binary data based on the JSON metadata
        let typedArray;
        switch (dataType) {
            case 'uint8':
                typedArray = new Uint8Array(buffer);
                break;
            case 'int16':
                typedArray = new Int16Array(buffer);
                break;
            case 'float32':
                typedArray = new Float32Array(buffer);
                break;
            default:
                throw new Error(`Unsupported data type: ${dataType}`);
        }

        // Update app state with the raw data
        appState.setRawFile(metadata.file, { typedArray, dimensions });
        console.log("Raw file loaded and processed:", appState.getState());

    } catch (error) {
        console.error("Error loading raw file:", error);
    }
}

