#version 300 es
precision mediump float;
precision highp int;

struct VSOut
{
    highp vec4 position;
    highp vec3 vray_dir;
    highp vec3 volume_pos;
    highp vec3 transformed_eye;
};

struct _MatrixStorage_float4x4_ColMajorstd430
{
    highp vec4 data[4];
};

struct EntryPointParams_std430
{
    mat4x4 u_v;
    mat4x4 u_p;
    highp vec3 eye_pos;
    highp vec3 volume_scale;
};

uniform EntryPointParams_std430 entryPointParams;

struct EntryPointParams_std430_1
{
    ivec3 volume_dims;
    highp float dt_scale;
    bool dark;
    bool shadow;
    highp float x1;
    highp float x2;
    highp float y1;
    highp float y2;
};

uniform EntryPointParams_std430_1 entryPointParams_1;

uniform highp sampler3D SPIRV_Cross_CombinedentryPointParams_volumeentryPointParams_volumeSampler;
uniform highp sampler2D SPIRV_Cross_CombinedentryPointParams_colormapentryPointParams_colormapSampler;

in highp vec3 input_vray_dir;
in highp vec3 input_transformed_eye;
out vec4 entryPointParam_fragmentMain;

highp vec2 intersect_box(highp vec3 orig, highp vec3 dir)
{
    highp vec3 inv_dir = vec3(1.0) / dir;
    highp vec3 tmin_tmp = (vec3(0.0) - orig) * inv_dir;
    highp vec3 tmax_tmp = (vec3(1.0) - orig) * inv_dir;
    highp vec3 _187 = min(tmin_tmp, tmax_tmp);
    highp vec3 _188 = max(tmin_tmp, tmax_tmp);
    return vec2(max(_187.x, max(_187.y, _187.z)), min(_188.x, min(_188.y, _188.z)));
}

highp float wang_hash(int seed)
{
    int _263 = ((seed ^ 61) ^ (seed >> 16)) * 9;
    int _267 = (_263 ^ (_263 >> 4)) * 668265261;
    int _271 = _267 ^ (_267 >> 15);
    return float(_271 - 2147483647 * (_271 / 2147483647)) / 2147483648.0;
}

highp vec3 ComputeGradient(highp vec3 _325, highp float _326, highp sampler3D SPIRV_Cross_CombinedentryPointParams_volume_324)
{
    highp vec4 _334 = textureLod(SPIRV_Cross_CombinedentryPointParams_volume_324, _325 + vec3(0.00999999977648258209228515625, 0.0, 0.0), 0.0);
    highp vec4 _340 = textureLod(SPIRV_Cross_CombinedentryPointParams_volume_324, _325 - vec3(0.00999999977648258209228515625, 0.0, 0.0), 0.0);
    highp vec4 _348 = textureLod(SPIRV_Cross_CombinedentryPointParams_volume_324, _325 + vec3(0.0, 0.00999999977648258209228515625, 0.0), 0.0);
    highp vec4 _354 = textureLod(SPIRV_Cross_CombinedentryPointParams_volume_324, _325 - vec3(0.0, 0.00999999977648258209228515625, 0.0), 0.0);
    highp vec4 _362 = textureLod(SPIRV_Cross_CombinedentryPointParams_volume_324, _325 + vec3(0.0, 0.0, 0.00999999977648258209228515625), 0.0);
    highp vec4 _368 = textureLod(SPIRV_Cross_CombinedentryPointParams_volume_324, _325 - vec3(0.0, 0.0, 0.00999999977648258209228515625), 0.0);
    return normalize(vec3(_334.x - _340.x, _348.x - _354.x, _362.x - _368.x));
}

highp float computeOpacity(highp float val, highp float m, highp float x1, highp float y1, highp float x2, highp float y2)
{
    if (abs(y1 - y2) < 0.001000000047497451305389404296875)
    {
        if (abs(val - x1) < 0.001000000047497451305389404296875)
        {
            return 1.0;
        }
        else
        {
            return 0.0;
        }
    }
    if (abs(m) <= 1.0)
    {
        return ((m * (val - x1)) + y1) * val;
    }
    else
    {
        return (((1.0 / m) * (val - x1)) + x1) * val;
    }
}

bool unpackStorage(int _480)
{
    return _480 != 0;
}

highp vec3 lighting(highp vec3 normal, highp vec3 lightDir, highp vec3 viewDir, highp float _distance, bool shadow)
{
    if (shadow)
    {
        return (vec3(0.5) + vec3(0.699999988079071044921875 * max(dot(normal, lightDir), 0.0))) + (vec3(pow(max(dot(viewDir, reflect(lightDir, normal)), 0.0), 8.0)) / vec3(_distance));
    }
    else
    {
        return vec3(1.0);
    }
}

highp float linear_to_srgb(highp float x)
{
    if (x <= 0.003130800090730190277099609375)
    {
        return 12.9200000762939453125 * x;
    }
    return (1.05499994754791259765625 * pow(x, 0.4166666567325592041015625)) - 0.054999999701976776123046875;
}

void main()
{
    highp vec3 _171 = normalize(input_vray_dir);
    highp vec2 _173 = intersect_box(input_transformed_eye, _171);
    highp vec2 t_hit = _173;
    if (_173.x > _173.y)
    {
        discard;
    }
    t_hit.x = max(t_hit.x, 0.0);
    highp vec3 dt_vec = vec3(1.0) / (vec3(entryPointParams_1.volume_dims) * abs(_171));
    highp float dt = entryPointParams_1.dt_scale * min(dt_vec.x, min(dt_vec.y, dt_vec.z));
    highp vec4 color = vec4(0.0,0.0,0.0,1.0);
    highp float t = t_hit.x;
    highp vec3 p = input_transformed_eye + (_171 * (t_hit.x + (wang_hash(int(input_transformed_eye.x + (640.0 * input_transformed_eye.y))) * dt)));
    bool _142;
    highp float op;
    for (float t = t_hit.x; t < t_hit.y; t += dt)
    {
        highp vec4 _317 = texture(SPIRV_Cross_CombinedentryPointParams_volumeentryPointParams_volumeSampler, p);
        highp vec3 _375 = input_transformed_eye - p;
        op = _317.x;
        entryPointParam_fragmentMain.w += ((1.0 - entryPointParam_fragmentMain.w) * op);
        p += _171 * dt;
                /*if (_317.x < entryPointParams_1.x1)
                {
                    _142 = true;
                }
                else
                {
                    _142 = _317.x > entryPointParams_1.x2;
                }
                if (_142)
                {
                    op = 0.0;
                }
                else
                {
                    op = computeOpacity(_317.x, (entryPointParams_1.y2 - entryPointParams_1.y1) / (entryPointParams_1.x2 - entryPointParams_1.x1), entryPointParams_1.x1, entryPointParams_1.y1, entryPointParams_1.x2, entryPointParams_1.y2);
                }*/
        entryPointParam_fragmentMain += ((1.0 - entryPointParam_fragmentMain.w) * op);
        /*highp vec4 _453 = texture(SPIRV_Cross_CombinedentryPointParams_colormapentryPointParams_colormapSampler, vec2(_317.x, 0.5));
        highp vec4 _456 = vec4(_453.xyz, op);
        highp vec4 val_color = _456;
        val_color.w = 1.0 - pow(1.0 - _456.w, entryPointParams_1.dt_scale);
        highp vec4 _465 = color;
        highp vec4 _467 = color;
        entryPointParam_fragmentMain.xyz += _465.xyz + ((val_color.xyz * ((1.0 - entryPointParam_fragmentMain.w) * val_color.w)) * lighting(ComputeGradient(p, dt, SPIRV_Cross_CombinedentryPointParams_volumeentryPointParams_volumeSampler), normalize(_171), normalize(_375), length(_375), entryPointParams_1.shadow));
        //color.x = _518.x;
        //color.y = _518.y;
        //color.z = _518.z;
        entryPointParam_fragmentMain.w += ((1.0 - entryPointParam_fragmentMain.w) * val_color.w);
        if (color.w >= 0.949999988079071044921875)
        {
            break;
        }*/
       
    }

    color.x = linear_to_srgb(color.x);
    color.y = linear_to_srgb(color.y);
    color.z = linear_to_srgb(color.z);

    /*if (entryPointParams_1.dark)
    {
        color.w = 1.0;
    }*/

   

    vec4 c = vec4(op,0.0,0.0,op);
    
    //entryPointParam_fragmentMain = color;
}

