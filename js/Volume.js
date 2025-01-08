import { create3DTexture, create2DTexture } from './texture.js'
import * as vec3 from '../lib/glmatrix/vec3.js'

export class Volume{
    constructor(gl, program, filepath="", dimensions=[1,1,1], dataArray=[1], dataType="uint8"){
        this.gl = gl
        this.program = program
        this.file = filepath
        this.dimensions = dimensions
        this.dataArray = dataArray
        this.dataType = dataType
        this.longestAxis = Math.max(dimensions[0],Math.max(dimensions[1], dimensions[2]))
        this.volScale = [dimensions[0]/this.longestAxis, dimensions[1]/this.longestAxis, dimensions[2]/this.longestAxis]
        this.texture = create3DTexture(gl, dimensions[0], dimensions[1], dimensions[2], dataArray, dataType)
        this.colormap = create2DTexture(this.gl,"TFCanvas")
        
        this.gl.useProgram( this.program )
        this.gl.uniform3fv( this.gl.getUniformLocation( this.program, 'volume_scale' ), this.volScale )
        this.gl.uniform3iv( this.gl.getUniformLocation( this.program, 'volume_dims' ), this.dimensions )
        this.gl.uniform1i( this.gl.getUniformLocation( this.program, 'volume'), 0)
	    this.gl.uniform1i( this.gl.getUniformLocation( this.program, 'colormap'), 1)
        this.gl.useProgram( null )



    }

    updateColormap(){
        //gl.deleteTexture(this.colormap);
        console.log(document.getElementById("TFCanvas"))
        this.colormap = create2DTexture(this.gl,"TFCanvas")
        this.gl.useProgram( this.program )
	    this.gl.uniform1i( this.gl.getUniformLocation( this.program, 'colormap'), 1)
        this.gl.useProgram( null )
    }

}

