#version 300 es

// Fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision".
precision mediump float;

out vec4 fragColor; // Output color

void main() {
    fragColor = vec4(1.0, 0.0, 0.0, 1.0); // Output red color
}

