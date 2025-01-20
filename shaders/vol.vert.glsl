#version 300 es

struct VSOut
{
    vec4 position;
    vec3 vray_dir;
    vec3 volume_pos;
    vec3 transformed_eye;
};

struct _MatrixStorage_float4x4_ColMajorstd430
{
    vec4 data[4];
};

struct EntryPointParams_std430
{
    mat4x4 u_v;
    mat4x4 u_p;
    vec3 eye_pos;
    vec3 volume_scale;
};

uniform EntryPointParams_std430 entryPointParams;

struct EntryPointParams_std430_1
{
    ivec3 volume_dims;
    float dt_scale;
    int dark;
    int shadow;
    float x1;
    float x2;
    float y1;
    float y2;
};

uniform EntryPointParams_std430_1 entryPointParams_1;

in vec3 vertex_position;
out vec3 input_vray_dir;
out vec3 entryPointParam_vertexMain_volume_pos;
out vec3 input_transformed_eye;

mat4 unpackStorage(_MatrixStorage_float4x4_ColMajorstd430 _29)
{
    return mat4(vec4(_29.data[0].x, _29.data[1].x, _29.data[2].x, _29.data[3].x), vec4(_29.data[0].y, _29.data[1].y, _29.data[2].y, _29.data[3].y), vec4(_29.data[0].z, _29.data[1].z, _29.data[2].z, _29.data[3].z), vec4(_29.data[0].w, _29.data[1].w, _29.data[2].w, _29.data[3].w));
}

void main()
{
    mat4 _26 = entryPointParams.u_v;
    mat4 _61 = entryPointParams.u_p;
    vec3 volume_translation = vec3(0.0) - (entryPointParams.volume_scale * 0.5);
    VSOut _out;
    _out.position = _61 * _26 * vec4((vertex_position * entryPointParams.volume_scale) + volume_translation, 1.0);
    _out.volume_pos = (entryPointParams.u_v * vec4((vertex_position * entryPointParams.volume_scale) + volume_translation, 1.0)).xyz;
    vec3 _110 = (entryPointParams.eye_pos - volume_translation) / entryPointParams.volume_scale;
    _out.transformed_eye = _110;
    _out.vray_dir = vertex_position - _110;
    gl_Position = _out.position;
    input_vray_dir = _out.vray_dir;
    entryPointParam_vertexMain_volume_pos = _out.volume_pos;
    input_transformed_eye = _out.transformed_eye;
}