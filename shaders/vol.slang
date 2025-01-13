struct Vertex {
    float3 position;
};

struct VSOut {
    float3 position : SV_Position;
    float3 vray_dir;
    float3 volume_pos;
    float3 transformed_eye;

};

float2 intersect_box(float3 orig, float3 dir) {
	const float3 box_min = float3(0);
	const float3 box_max = float3(1);
	float3 inv_dir = 1.0 / dir;
	float3 tmin_tmp = (box_min - orig) * inv_dir;
	float3 tmax_tmp = (box_max - orig) * inv_dir;
	float3 tmin = min(tmin_tmp, tmax_tmp);
	float3 tmax = max(tmin_tmp, tmax_tmp);
	float t0 = max(tmin.x, max(tmin.y, tmin.z));
	float t1 = min(tmax.x, min(tmax.y, tmax.z));
	return float2(t0, t1);
}

float linear_to_srgb(float x) {
	if (x <= 0.0031308f) {
		return 12.92f * x;
	}
	return 1.055f * pow(x, 1.f / 2.4f) - 0.055f;
}


// Pseudo-random number gen from
// http://www.reedbeta.com/blog/quick-and-easy-gpu-random-numbers-in-d3d11/
// with some tweaks for the range of values
float wang_hash(int seed) {
	seed = (seed ^ 61) ^ (seed >> 16);
	seed *= 9;
	seed = seed ^ (seed >> 4);
	seed *= 0x27d4eb2d;
	seed = seed ^ (seed >> 15);
	return float(seed % 2147483647) / float(2147483647);
}

float3 ComputeGradient(Texture3D volumeTexture, SamplerState samplerState, float3 pos, float dt) {
    float delta = 0.01; // Small offset for finite differences

    // Compute gradients using finite differences
    float gx = volumeTexture.SampleLevel(samplerState, pos + float3(delta, 0, 0), 0).r -
               volumeTexture.SampleLevel(samplerState, pos - float3(delta, 0, 0), 0).r;
    float gy = volumeTexture.SampleLevel(samplerState, pos + float3(0, delta, 0), 0).r -
               volumeTexture.SampleLevel(samplerState, pos - float3(0, delta, 0), 0).r;
    float gz = volumeTexture.SampleLevel(samplerState, pos + float3(0, 0, delta), 0).r -
               volumeTexture.SampleLevel(samplerState, pos - float3(0, 0, delta), 0).r;

    // Combine gradients and normalize
    float3 gradient = float3(gx, gy, gz);
    return normalize(gradient);
}

float3 lighting(float3 normal, float3 lightDir, float3 viewDir, float distance, bool shadow) {
	if (shadow){
		float3 color = float3(1.0, 1.0, 1.0);
    	float3 ambient = 0.5 * color;

    	// Diffuse shading
    	float diff = max(dot(normal, lightDir), 0.0);
    	float3 diffuse = 0.7 * diff * color;

    	// Specular shading
    	float3 reflectDir = reflect(lightDir, normal);
    	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 8.0); // Shininess = 32
    	float3 specular = float3(1.0) * spec;

    	return ambient + diffuse + specular/distance;
	}
	else{
		return float3(1.0);
	}
	
}

float computeOpacity(float val, float m, float x1, float y1, float x2, float y2){
	if (abs(y1 - y2) < 0.001){
		if (abs(val - x1) < 0.001) return 1.0;
		else return 0.0;
	}
	if(abs(m) <= 1.0){
		return (m * (val - x1) +  y1) * val;
	}
	else{
		return ((1.0/m) * (val - x1) +  x1) * val;
	}
}


[shader("vertex")]
VSOut vertexMain(Vertex vertex, uniform float4x4 u_v, uniform float 4x4 u_p, uniform vec3 eye_pos, uniform vec3 volume_scale) {
	// TODO: Implement this
    VSOut out;
    vec3 volume_translation = vec3(0) - volume_scale * 0.5;
    out.position = u_p * u_v * vec4(vertex.position * volume_scale + volume_translation, 1);
    out.volume_pos = (u_v * vec4(vertex.position * volume_scale + volume_translation, 1)).xyz;
    out.transformed_eye = (eye_pos - volume_translation) / volume_scale;
    out.vray_dir = vertex.position - out.transformed_eye ;
    return out;
}

[shader("fragment")]
float4 fragmentMain(VSOut input, 
    Texture3D volume : register(t0), SamplerState volumeSampler : register(s0),
    Texture2D colormap : register(t1), SamplerState colormapSampler : register(s1), 
    uniform int3 volume_dims, 
    uniform float dt_scale, 
    uniform bool dark, uniform bool shadow, 
    uniform float x1, uniform float x2, uniform float y1, uniform float y2) : SV_Target{
	
    // TODO: Implement this
    const vec3 light_pos = vec3(1.0, 1.0, 1.0);

    float3 ray_dir = normalize(input.vray_dir);
    float2 t_hit = IntersectBox(input.transformed_eye, ray_dir);

    float m = (y2 - y1) / (x2 - x1);
    if (t_hit.x > t_hit.y) {
        discard;
    }

    t_hit.x = max(t_hit.x, 0.0);
    float3 dt_vec = 1.0 / (float3(volume_dims) * abs(ray_dir));
    float dt = dt_scale * min(dt_vec.x, min(dt_vec.y, dt_vec.z));
    float offset = wang_hash(int(input.transformed_eye.x + 640.0 * input.transformed_eye.y));

    float3 p = input.transformed_eye + (t_hit.x + offset * dt) * ray_dir;
    float4 color = float4(0.0, 0.0, 0.0, 0.0);

     for (float t = t_hit.x; t < t_hit.y; t += dt) {
        float val = volume.SampleLevel(volumeSampler, p, 0).r;
        float3 normal = ComputeGradient(volume, volumeSampler, p, dt);
        float3 lightDir = normalize(ray_dir);
        float dist = length(input.transformed_eye - p);
        float3 viewDir = normalize(input.transformed_eye - p);

        float op = val;
        if (val < x1 || val > x2) {
            op = 0.0;
        } else {
            op = ComputeOpacity(val, m, x1, y1, x2, y2);
        }

        float4 val_color = float4(colormap.SampleLevel(colormapSampler, float2(val, 0.5), 0).rgb, op);
        val_color.a = 1.0 - pow(1.0 - val_color.a, dt_scale);
        color.rgb += (1.0 - color.a) * val_color.a * val_color.rgb * lighting(normal, lightDir, viewDir, dist, shadow);
        color.a += (1.0 - color.a) * val_color.a;

        if (color.a >= 0.95) {
            break;
        }

        p += ray_dir * dt;
    }

    color.r = linear_to_srgb(color.r);
    color.g = linear_to_srgb(color.g);
    color.b = linear_to_srgb(color.b);
    
    if (dark) {
        color.a = 1.0;
    }

    return color;

}