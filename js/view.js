
import { hex2rgb, deg2rad, loadExternalFile } from './utils.js'
import Input from './input.js'
import * as mat4 from '../lib/glmatrix/mat4.js'
import * as mat3 from '../lib/glmatrix/mat3.js'
import * as vec3 from '../lib/glmatrix/vec3.js'
import * as vec4 from '../lib/glmatrix/vec4.js'
import * as quat from '../lib/glmatrix/quat.js'
import { box } from "./box.js"


/**
 * @Class
 * WebGlApp that will call basic GL functions, manage camera settings, transformations and scenes, and take care of rendering them
 * 
 */
class View
{
    /**
     * Initializes the app with a box, and a scene, view, and projection matrices
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Shader} shader The shader to be used to draw the object
     * @param {AppState} app_state The state of the UI
     */
    constructor( gl, program )
    {
        this.gl = gl
        this.program = program
        // Set GL flags
        this.setGlFlags( this.gl)

        // Create the view matrix
        this.eye     =   [1.0, 0.25, -1.0]
        this.center  =   [0, 0, 0]
       
        
        this.up      =   [0.0, 1.0, 0.0]
        this.forward =   null
        this.right   =   null

        // Forward, Right, and Up are initialized based on Eye and Center
        this.updateViewSpaceVectors();
        // Create a view matrix using glMatrix.lookAt with the values defined above  
        this.view = mat4.lookAt(mat4.create(), this.eye, this.center, this.up); 
        
        // Set up the necessary values the projection matrix
        // The projection should have a vertical field of view of 60 (in radians)
        const fovy = (60/180)* Math.PI

        // The projection should have 16:9 aspect rotation
        const aspRatio = 16/9

        // Define appropriate values for the near and far plane distance so that the whole scene is visible
        const near = 0.001, far = 1000

        // Create a projection matrix using mat4 perspective function
        this.projection = mat4.perspective(mat4.create(), fovy, aspRatio, near, far);
        
        // Use the shader's setUniform4x4f function to pass the matrices
        this.gl.useProgram( this.program )

        this.gl.uniformMatrix4fv( this.gl.getUniformLocation( this.program, 'entryPointParams.u_v' ), false, this.view )
        this.gl.uniformMatrix4fv( this.gl.getUniformLocation( this.program, 'entryPointParams.u_p' ), false, this.projection )
        this.gl.uniform3fv( this.gl.getUniformLocation( this.program, 'entryPointParams.eye_pos' ), this.eye)
        this.gl.useProgram( null )

    }  

    /**
     * Sets up GL flags
     * In this assignment we are drawing 3D data, so we need to enable the flag 
     * for depth testing. This will prevent from geometry that is occluded by other 
     * geometry from 'shining through' (i.e. being wrongly drawn on top of closer geomentry)
     * 
     * Look into gl.enable() and gl.DEPTH_TEST to learn about this topic
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     */
    setGlFlags( gl ) {

        // Enable depth test
        gl.enable(gl.DEPTH_TEST)

    }

    /**
     * Sets the viewport of the canvas to fill the whole available space so we draw to the whole canvas
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Number} width 
     * @param {Number} height 
     */
    setViewport( gl, width, height )
    {
        gl.viewport( 0, 0, width, height )
    }

    /**
     * Clears the canvas color
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     */
    clearCanvas( gl )
    {
        gl.clearColor(...hex2rgb('#000000'), 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }

    /**
     * Update the Forward, Right, and Up vector according to changes in the 
     * camera position (Eye) or the center of focus (Center)
     */
    updateViewSpaceVectors( ) {
        this.forward = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), this.eye, this.center))
        this.right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), [0,1,0], this.forward))
        this.up = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.forward, this.right))
        //console.log(vec3.cross(vec3.create(), this.forward, this.right))
    }

    /**
     * Update the camera view based on user input and the arcball viewing model
     * 
     * Supports the following interactions:
     * 1) Left Mouse Button - Rotate the view's center
     * 2) Middle Mouse Button or Space+Left Mouse Button - Pan the view relative view-space
     * 3) Right Mouse Button - Zoom towards or away from the view's center
     * 
     * @param {Number} delta_time The time in seconds since the last frame (floating point number)
     */
    updateCamera( delta_time ) {
        let view_dirty = false

        // Control - Zoom
        if (Input.isMouseDown(2)) {
            // Scale camera position
            let translation = vec3.scale(vec3.create(), this.forward, -Input.getMouseDy() * delta_time)
            this.eye = vec3.add(vec3.create(), this.eye, translation)

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Control - Rotate
        if (Input.isMouseDown(0) && !Input.isKeyDown(' ')) {
            // Rotate around xz plane around y
            this.eye = vec3.rotateY(vec3.create(), this.eye, this.center, deg2rad(-10 * Input.getMouseDx() * delta_time ))
            
            // Rotate around view-aligned rotation axis
            let rotation = mat4.fromRotation(mat4.create(), deg2rad(-10 * Input.getMouseDy() * delta_time ), this.right)
            this.eye = vec3.transformMat4(vec3.create(), this.eye, rotation)

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Control - Pan
        if (Input.isMouseDown(1) || (Input.isMouseDown(0) && Input.isKeyDown(' '))) {
            // Create translation on two view-aligned axes
            let translation = vec3.add(vec3.create(), 
                vec3.scale(vec3.create(), this.right, -0.75 * Input.getMouseDx() * delta_time),
                vec3.scale(vec3.create(), this.up, 0.75 * Input.getMouseDy() * delta_time)
            )

            // Translate both eye and center in parallel
            this.eye = vec3.add(vec3.create(), this.eye, translation)
            this.center = vec3.add(vec3.create(), this.center, translation)

            view_dirty = true
        }

        // Update view matrix if needed
        if (view_dirty) {
            // Update Forward, Right, and Up vectors
            this.updateViewSpaceVectors()

            this.view = mat4.lookAt(mat4.create(), this.eye, this.center, this.up)

            this.gl.useProgram( this.program )
            this.gl.uniformMatrix4fv( this.gl.getUniformLocation( this.program, 'entryPointParams.u_v' ), false, this.view )
            this.gl.uniform3fv( this.gl.getUniformLocation( this.program, 'entryPointParams.eye_pos' ), this.eye)
            this.gl.useProgram( null )
        }
    }
    

    /**
     * Main render loop which sets up the active viewport (i.e. the area of the canvas we draw to)
     * clears the canvas with a background color and draws the scene
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Number} canvas_width The canvas width. Needed to set the viewport
     * @param {Number} canvas_height The canvas height. Needed to set the viewport
     */
    render( gl, canvas_width, canvas_height )
    {
        // Set viewport and clear canvas
        this.setViewport( gl, canvas_width, canvas_height )
        this.clearCanvas( gl )

        // Render the box
        // This will use the MVP that was passed to the shader
        //this.box.render( gl )

        // Render the scene
        //if (this.scene) this.scene.render( gl )
    }

}

export default View

