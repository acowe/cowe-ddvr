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

### Usability Issues
* Other file/data types are currently not supported
* Larger input files have not been tested
* Transfer function ramp is not robust; Crossing left and right endpoints (both opacity and color) will lead to issues in volume visibility. 

### Slang Translation Issues (NEW)
* Many global variables are renamed, though most tend to retain some of the original naming;
    * Example: ```in vec3 vray_dir --> in highp vec3 input_vray_dir;``` in fragment shader
* Many local variables are renamed as numbers and/or are restructured. This can make it hard to track what values are passed to these variables and how they are processed
  * Example of renaming: In the ```main``` function of fragment shader ```vec3 ray_dir``` becomes ```vec3 _171```
  * Example of restructuring: In the ```ComputeGradient``` function of fragment shader, the line where ```float gx``` is defined is changed to define ```highp vec4 _334``` where gx = _334.x ); 
* New structs are created:
    * Creates a struct for ```out``` variables, ```VSOut```:
      ```script
      // EXAMPLE
      struct VSOut
      {
        vec4 position;
        vec3 vray_dir;
        vec3 volume_pos;
        vec3 transformed_eye;
      };
      ```
      That is, you're to reference any out variable, you must use object notation (i.e given ```VSOut _out```, ```transformed_eye``` needs to be referenced as ```_out.transformed_eye```
    * Creates a struct for incoming uniforms ```EntryPointParams_std430_n```, and expects ```in EntryPointParams_std430_n```` struct ```entryPointParams_m``` where n and m are integers:
      ```script
      // EXAMPLE
      struct EntryPointParams_std430_1
      {
        ivec3 volume_dims;
        highp float dt_scale;
        int dark;
        int shadow;
        highp float x1;
        highp float x2;
        highp float y1;
        highp float y2;
      };
      ```
    * Creates a struct for 4x4 matrices, ```_MatrixStorage_float4x4_ColMajorstd430```, as follows
      ```script
      struct _MatrixStorage_float4x4_ColMajorstd430 {
        highp vec4 data[4];
      };
      ```
      along with unpacking function:
      ```script
      mat4 unpackStorage(_MatrixStorage_float4x4_ColMajorstd430 _29)
      {
        return mat4(vec4(_29.data[0].x, _29.data[1].x, _29.data[2].x, _29.data[3].x), vec4(_29.data[0].y, _29.data[1].y, _29.data[2].y, _29.data[3].y), vec4(_29.data[0].z, _29.data[1].z, _29.data[2].z, _29.data[3].z), vec4(_29.data[0].w, _29.data[1].w, _29.data[2].w, _29.data[3].w));
      }
      ```
* For-loops are restructured
  * Example: For-loop for color and opacity accumulation in fragment shader is made into infinite for loop with breaking boolean and conditions:
    ```script
    for (;;)
    {
        highp vec3 p_1;
        bool _149_ladder_break = false;
        switch (0)
        {
            default:
            {
                if (!(t < t_hit.y))
                {
                    _149_ladder_break = true;
                    break;
                }
                /.../
                if (color.w >= 0.949999988079071044921875)
                {
                    _149_ladder_break = true;
                    break;
                }
                p_1 = p + (_171 * dt);
                break;
            }
        }
        if (_149_ladder_break)
        {
            break;
        }
        t += dt;
        p = p_1;
        continue;
    }
    ```

## Programming References
* Will Usher's Volume Rendering with WebGL (raycasting shader code): https://www.willusher.io/webgl/2019/01/13/volume-rendering-with-webgl/
* Peter Collingridge's Draggable SVG Elements (TF control points): https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
