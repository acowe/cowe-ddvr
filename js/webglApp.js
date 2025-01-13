import { loadExternalFile } from './utils.js'
import { box } from "./box.js"
import Input from "./input.js"
import View from './view.js'
import { appState  } from './appState.js';

import { Volume } from './Volume.js';
export class WebGLApp {

    constructor() {
        this.gl = null;
        this.view = null;
        this.vertices = box.vertices;
        this.strip = box.cubestrip;
        this.indices = box.indices;
        this.last_tick = 0
        this.delta_time = (Date.now() / 1000.0)
        this.volume = null;
        this.samplingRate = 0.25;
        this.thresh = 0.0
        this.dark = false;
    }

    setOpacity(xmin, xmax, ymin, ymax){
        this.thresh = xmin
        console.log(xmin, xmax, ymin, ymax, (ymax - ymin)/(xmax - xmin))

        this.gl.useProgram( this.program )
        this.gl.uniform1f( this.gl.getUniformLocation( this.program, 'x1' ), xmin )
        this.gl.uniform1f( this.gl.getUniformLocation( this.program, 'x2' ), xmax )
        this.gl.uniform1f( this.gl.getUniformLocation( this.program, 'y1' ), ymin )
        this.gl.uniform1f( this.gl.getUniformLocation( this.program, 'y2' ), ymax )
        this.gl.useProgram( null )
    }

    setDark(state_in){
        this.dark = state_in
        this.gl.useProgram( this.program )
        this.gl.uniform1f( this.gl.getUniformLocation( this.program, 'dark' ), state_in )
        this.gl.useProgram( null )

    }

    setShadows(state_in){
        this.gl.useProgram( this.program )
        this.gl.uniform1f( this.gl.getUniformLocation( this.program, 'shadow' ), state_in )
        this.gl.useProgram( null )

    }

    setColormap(){

    }

    createVol(){
        let rawMeta = appState.state.rawData
        if(rawMeta){
            let dims = appState.getDims(), data = appState.getData(), file = appState.getFilepath(), type = appState.getDataType()
            this.volume = new Volume(this.gl, this.program, file, dims, data, type);
            this.gl.useProgram( this.program )
            this.gl.uniform1f( this.gl.getUniformLocation( this.program, 'dt_scale' ), this.samplingRate )
            this.gl.useProgram( null )
        }
        console.log(this.volume)
    }
    
    // Create a WebGL program
    createProgram(gl, vertexShaderUrl, fragShaderUrl) {
      let vert = gl.createShader( gl.VERTEX_SHADER )
      let frag = gl.createShader( gl.FRAGMENT_SHADER )
      let program = gl.createProgram();
  
      gl.shaderSource( vert, loadExternalFile( vertexShaderUrl ) )
      gl.shaderSource( frag, loadExternalFile( fragShaderUrl ) )
  
      gl.compileShader( vert )
      if ( !gl.getShaderParameter( vert, gl.COMPILE_STATUS ) )
      {
          alert( `An error occurred compiling the shader: ${gl.getShaderInfoLog(vert)}` )
          gl.deleteShader( vert )
      }
  
      gl.compileShader( frag )
      if ( !gl.getShaderParameter( frag, gl.COMPILE_STATUS ) )
      {
          alert( `An error occurred compiling the shader: ${gl.getShaderInfoLog(frag)}` )
          gl.deleteShader( frag )
      }
  
  
      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);
  
      if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
      {
          alert( `Unable to initialize the shader program: ${gl.getProgramInfoLog(program)}` )
          gl.deleteProgram( program )
      }
  
  
      return program;
    }
  
    runWebglApp(){
      const canvas = document.getElementById("canvas");
      canvas.addEventListener( 'contextmenu', event => event.preventDefault( ) );
  
      // Adjust canvas size to fit the window
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  
      // Get WebGL rendering context
      this.gl = canvas.getContext("webgl2");
      // Create the WebGL program
      this.program = this.createProgram(this.gl, "./shaders/vol.vert.glsl", "./shaders/vol.frag.glsl");

      //this.setSolid(false)
      //this.setOpacity(0.0, 1.0, 0.0, 1.0)
      this.setShadows(false)
      this.setDark(false)
      


      const gl = this.gl, program = this.program
      this.view = new View(gl, program)
      
  
      // Create a buffer and put the vertices data in it
      const vbuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.strip), gl.STATIC_DRAW);
      //gl.bindBuffer(gl.ARRAY_BUFFER, null );
  
      const ibuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.indices), gl.STATIC_DRAW);
      //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null );
  
      // Link vertex data to the shader's attribute
      const positionAttributeLocation = gl.getAttribLocation(program, "position");
      gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionAttributeLocation);

      if(!this.volume){
        gl.bindTexture(gl.TEXTURE_3D, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
     
  
      this.update()
      
    }

    update(){
        let gl = this.gl, program = this.program
        let colorVal = this.dark ? 0.0 : 1.0
        this.delta_time = (Date.now() / 1000.0) - this.last_tick
        this.last_tick = Date.now() / 1000.0
        Input.update( )
        this.view.updateCamera(this.delta_time)
        gl.clearColor(colorVal, colorVal, colorVal, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, this.strip.length / 3 );
        requestAnimationFrame( ( ) =>
        {

            this.update()

        } )

    }
  
  
    
}
