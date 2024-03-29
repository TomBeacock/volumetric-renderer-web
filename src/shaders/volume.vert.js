const vertexShader = /* glsl */ `
in vec3 position;
in vec3 tex_coords;

out vec3 frag_position;
out vec3 frag_tex_coords;

uniform mat4 u_projection_matrix;
uniform mat4 u_view_matrix;
uniform mat4 u_transform_matrix;

void main() {
    frag_position = (u_transform_matrix * vec4(position, 1.0)).xyz;
    frag_tex_coords = tex_coords;
    gl_Position = u_projection_matrix * u_view_matrix * u_transform_matrix * vec4(position, 1.0);
}
`
export default vertexShader;