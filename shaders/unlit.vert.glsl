#version 300 es

in vec3 aPosition;

uniform mat4x4 u_v;
uniform mat4x4 u_p;
uniform vec3 eye_pos;
uniform vec3 volume_scale;

void main() {
    gl_Position = u_p * u_v * vec4(aPosition, 1.0);
}