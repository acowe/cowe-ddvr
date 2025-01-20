#version 300 es

// SOURCE: Will Usher's Volume Rendering Project
// https://www.willusher.io/webgl/2019/01/13/volume-rendering-with-webgl/#2-gpu-implementation-with-webgl2

precision highp int;
precision highp float;

const vec3 light_pos = vec3(1.0, 1.0, 1.0);
uniform highp sampler3D volume;
uniform highp sampler2D colormap;
uniform ivec3 volume_dims;
uniform float dt_scale;
uniform bool dark;
uniform bool shadow;

uniform float x1;
uniform float x2;
uniform float y1;
uniform float y2;

in vec3 vray_dir;
flat in vec3 transformed_eye;
out vec4 color;

vec2 intersect_box(vec3 orig, vec3 dir) {
	const vec3 box_min = vec3(0);
	const vec3 box_max = vec3(1);
	vec3 inv_dir = 1.0 / dir;
	vec3 tmin_tmp = (box_min - orig) * inv_dir;
	vec3 tmax_tmp = (box_max - orig) * inv_dir;
	vec3 tmin = min(tmin_tmp, tmax_tmp);
	vec3 tmax = max(tmin_tmp, tmax_tmp);
	float t0 = max(tmin.x, max(tmin.y, tmin.z));
	float t1 = min(tmax.x, min(tmax.y, tmax.z));
	return vec2(t0, t1);
}

float linear_to_srgb(float x) {
	/*if (x <= 0.0031308f) {
		return 12.92f * x;
	}
	return 1.055f * pow(x, 1.f / 2.4f) - 0.055f;*/
	return x;
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

vec3 computeGradient(in highp sampler3D volumeTexture, vec3 pos, float dt) {
 	float delta = 0.01; // Small offset for finite differences
	//float delta = dt; // Small offset for finite differences
    float gx = texture(volumeTexture, pos + vec3(delta, 0, 0)).r -
               texture(volumeTexture, pos - vec3(delta, 0, 0)).r;
    float gy = texture(volumeTexture, pos + vec3(0, delta, 0)).r -
               texture(volumeTexture, pos - vec3(0, delta, 0)).r;
    float gz = texture(volumeTexture, pos + vec3(0, 0, delta)).r -
               texture(volumeTexture, pos - vec3(0, 0, delta)).r;

    vec3 gradient = vec3(gx, gy, gz);
    return normalize(gradient);
}

vec3 lighting(vec3 normal, vec3 lightDir, vec3 viewDir, float distance, bool shadow) {
	if (shadow){
		vec3 color = vec3(1.0, 1.0, 1.0);
    	vec3 ambient = 0.5 * color;

    	// Diffuse shading
    	float diff = max(dot(normal, lightDir), 0.0);
    	vec3 diffuse = 0.7 * diff * color;

    	// Specular shading
    	vec3 reflectDir = reflect(lightDir, normal);
    	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 8.0); // Shininess = 32
    	vec3 specular = vec3(1.0) * spec;

    	return ambient + diffuse + specular/distance;
	}
	else{
		return vec3(1.0);
	}
	
}

float computeOpacity(float val, float m, float x1, float y1){
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

void main() {
    vec3 ray_dir = normalize(vray_dir);
	vec2 t_hit = intersect_box(transformed_eye, ray_dir);
	float m = (y2 - y1)/(x2 - x1);
	if (t_hit.x > t_hit.y) {
		discard;
	}
	t_hit.x = max(t_hit.x, 0.0);
	vec3 dt_vec = 1.0 / (vec3(volume_dims) * abs(ray_dir));
	float dt = dt_scale * min(dt_vec.x, min(dt_vec.y, dt_vec.z));
	float offset = wang_hash(int(gl_FragCoord.x + 640.0 * gl_FragCoord.y));
	vec3 p = transformed_eye + (t_hit.x + offset * dt) * ray_dir;
	for (float t = t_hit.x; t < t_hit.y; t += dt) {
		float val = texture(volume, p).r;
		vec3 normal = computeGradient(volume, p, dt);
		vec3 lightDir = normalize(ray_dir);
		float dist = length(transformed_eye - p);
		vec3 viewDir = normalize(transformed_eye - p);

		float op = val;
	
		if (val < x1 || val > x2 ){
			op = 0.0;
		}
		else {
			op = computeOpacity(val, m, x1, y1);
		}

		vec4 val_color = vec4(texture(colormap, vec2(val, 0.5)).rgb, op);
		// Opacity correction
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
	
	if(dark){
		color.a = 1.0;
	}
	

}