export function create3DTexture(gl, width, height, depth, data, type) {
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, texture);
    let glformat = type === "float32" ? gl.R32F : gl.R8,
    gltype = type === "float32" ? gl.FLOAT : gl.UNSIGNED_BYTE
    gl.texStorage3D(gl.TEXTURE_3D, 1, glformat, width, height, depth);
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    // Upload data to the texture
    gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0,
        width, height, depth,
        gl.RED, gltype, data);

    return texture;
}

export function create2DTexture(gl, grad=null){
    let colormapImage = new Image();
    let colormap = gl.createTexture();
    console.log(grad)

    if (grad){
        grad = document.getElementById(grad);
        let w = grad.getBoundingClientRect().width
        console.log(w)
        
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, colormap);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.SRGB8_ALPHA8, 300, 1);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 300, 1,
        gl.RGBA, gl.UNSIGNED_BYTE, grad);
    }
    /*else{
        colormapImage.onload = function() {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, colormap);
            gl.texStorage2D(gl.TEXTURE_2D, 1, gl.SRGB8_ALPHA8, 180, 1);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 180, 1,
                gl.RGBA, gl.UNSIGNED_BYTE, colormapImage);
        };
    
        colormapImage.src = "../colormap/bony_brown.png";
    }*/

    //gl.bindTexture(gl.TEXTURE_2D, null);
    return colormap
}
