class Box {
    /**
     * Creates a 3D box from 8 vertices and draws it as a line mesh
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Shader} shader The shader to be used to draw the object
     */
    constructor() 
    {

      let vertices = [
        1.000000, 1.000000, -1.000000,
        1.000000, -1.000000, -1.000000,
        1.000000, 1.000000, 1.000000,
        1.000000, -1.000000, 1.000000,
        -1.000000, 1.000000, -1.000000,
        -1.000000, -1.000000, -1.000000,
        -1.000000, 1.000000, 1.000000,
        -1.000000, -1.000000, 1.000000
    ]

    /*for (let i = 0; i < vertices.length; i++) {
        vertices[i] = vertices[i] * box_scale[i%3]
    }*/

        this.cubestrip =[
          1, 1, -1,
          -1, 1, -1,
          1, 1, 1,
          -1, 1, 1,
          -1, -1, 1,
          -1, 1, -1,
          -1, -1, -1,
          1, 1, -1,
          1, -1, -1,
          1, 1, 1,
          1, -1, 1,
          -1, -1, 1,
          1, -1, -1,
          -1, -1, -1
        ];

        /*this.cubestrip = [
          1, 1, 0,
          0, 1, 0,
          1, 1, 1,
          0, 1, 1,
          0, 0, 1,
          0, 1, 0,
          0, 0, 0,
          1, 1, 0,
          1, 0, 0,
          1, 1, 1,
          1, 0, 1,
          0, 0, 1,
          1, 0, 0,
          0, 0, 0
        ];*/
        
          
          // Indices for the lines connecting vertices (12 edges)
          let indices = [
            0, 1,
            1, 3,
            3, 2,
            2, 0,

            0, 4,
            1, 5,
            2, 6,
            3, 7,

            4, 5,
            5, 7,
            7, 6,
            6, 4
        ]
    }
}

export let box = new Box();