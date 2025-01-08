class AppState {
    constructor() {
        this.state = {
            currentFile: null, // File object
            jsonData: null,     // Parsed JSON data
            rawFile: null,     // Raw File
            rawData: null      // Parsed raw data (ArrayBuffer)
        };
    }

    // Update the current file and JSON data
    setJsonFile(file, data) {
        this.state.currentFile = file;
        this.state.jsonData = data;
        console.log("AppState updated:", this.state);
    }

    setRawFile(file, data) {
        this.state.rawFile = file;
        this.state.rawData = data;
        console.log("AppState updated:", this.state);
    }

    // Get the current state
    getState() {
        return this.state;
    }

    getDims() {
        return this.state.rawData.dimensions;
    }

    getData() {
        return this.state.rawData.typedArray;
    }

    getFilepath() {
        return this.state.rawFile;
    }

    getDataType(){
        return this.state.jsonData.dataType;
    }

    // Reset the state
    resetState() {
        this.state = {
            currentFile: null,
            jsonData: null,
            rawFile: null,
            rawData: null 
        };
        console.log("AppState reset.");
    }
}

// Export a singleton instance of AppState
export const appState = new AppState();