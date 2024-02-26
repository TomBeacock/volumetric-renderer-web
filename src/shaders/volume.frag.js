const fragmentShader = /* glsl */ `
precision mediump float;
precision mediump sampler3D;

in vec3 frag_position;
in vec3 frag_tex_coords;

out vec4 frag_color;

uniform vec3 u_camera_position;
uniform float u_density_min;
uniform float u_density_max;
uniform vec3 u_slice_min;
uniform vec3 u_slice_max;
uniform sampler3D u_volume;
uniform sampler2D u_transfer_func;

void main() {
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    vec3 ray_dir = normalize(frag_position - u_camera_position);
    vec3 ray_pos = frag_tex_coords - ray_dir * 1.8;

    float ray_dist = 1.8;
    float step_size = 0.005;
    int steps = int(ray_dist / step_size);

    for (int i = 0; i < steps; i++) {
        if (all(greaterThan(ray_pos, u_slice_min)) &&
            all(lessThan(ray_pos, u_slice_max))) {
            float density = texture(u_volume, ray_pos).r;
            float t = (density - u_density_min) / (u_density_max - u_density_min);
            vec4 sample_color = texture(u_transfer_func, vec2(t, 0.5));
            color.rgb += color.a * (sample_color.a * sample_color.rgb);
            color.a *= (1.0 - sample_color.a);

            if (color.a < 0.001) {
                break;
            }
        }
        ray_pos += ray_dir * step_size;
    }
    color.a = 1.0 - color.a;
    frag_color = color;
}
`
export default fragmentShader;