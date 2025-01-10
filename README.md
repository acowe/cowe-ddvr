# WebGL (Differentiable) Direct Volume Renderer

Continuation of final project from here: https://github.com/acowe/cg-final-project

## Currently supported features:
* Loading in uint8 raw binary volume files with small, even dimensions (64^3 - 256^3)
* Raycasting resultant volume with or without Phong Illumination
* Transfer function with linear ramp along with adjustable opacity and color control points

## Building Shaders
The project uses Slang to create a differentiable pipeline. To use the shaders in WebGL they need to be transpiled to GLSL. The project defines a docker image and build scripts to build the shaders.

### Building the Docker Image
This needs to be done only once per machine.
```bash
# Windows
.\scripts\build-docker-image.bat

# Unix/Mac
sh ./scripts/build-docker-image.sh
```

### Building the Shaders
Run this every time shader code is modified.
```bash
# Windows
.\scripts\build-shaders.bat

# Unix/Mac
sh ./scripts/build-shaders.sh
```

## How to use
1. To load volume, click "Choose Files" button, then select a json file from the "Volumes" folder
2. To move camera: left-click volume view and drag for panning, right-click and move mouse up or down for zooming, space button + left-click for translation
3. To set up transfer function ramp, left-click either control point, drag to desired start or end position, then release to update volume

## Outstanding Issues
* Other file/data types are currently not supported
* Larger input files have not been tested
* Transfer function ramp is not robust; Crossing left and right endpoints (both opacity and color) will lead to issues in volume visibility. 

### Programming References
* Will Usher's Volume Rendering with WebGL (raycasting shader code): https://www.willusher.io/webgl/2019/01/13/volume-rendering-with-webgl/
* Peter Collingridge's Draggable SVG Elements (TF control points): https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
