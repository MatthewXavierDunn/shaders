#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

const float PI = 3.14159;
const float HPI = PI / 2.0;
const float QPI = PI / 4.0;
const float TAU = PI * 2.0;
const float FOV = PI / 3.0;
const float HFOV = FOV / 2.0;

const int AA = 1;

vec4 S1 = vec4(0.0, 0.0, 0.0, 5.0);
vec3 light = vec3(20.0 * cos(u_time), 20.0 * sin(u_time), 20.0 * sin(u_time));

// float raySphereIntersect(vec3 ray, vec3 sphere, float radius) {
//     float d = dot(ray, sphere);
//     if (d <= 0.0) return 0.0;
//     float r = length((ray * d) - sphere) - radius;
//     return r;
// }

float raySphereIntersect(vec3 ray, vec3 sphere, float radius) {
    float a = dot(ray, ray);
    float b = 2.0 * dot(sphere, ray);
    float c = dot(sphere, sphere) - radius * radius;
    float disc = b * b - 4.0 * a * c;
    if (disc < 0.0) return 0.0;
    return -(- b - sqrt(disc)) / (2.0 * a);
}

void main() {
    
    vec3 sumColor = vec3(0.0);
    
    for (int j = 0; j < AA; j++) {
    for (int i = 0; i < AA; i++) {
        vec2 offset = vec2(float(i), float(j)) / float(AA) - 0.5;
        
        vec2 pixel = (-u_resolution.xy + 2.0 * (gl_FragCoord.xy + offset)) / u_resolution.y;
        vec2 angle = pixel * HFOV;
        // angle.x -= u_time * 0.5 + HPI;
        // vec3 pos = vec3(25.0 * cos(u_time * 0.5), 0.0, 25.0 * sin(u_time * 0.5));
        vec3 pos = vec3(0.0, 0.0, -25.0);
        vec3 dir = vec3(sin(angle.x) * cos(angle.y), sin(angle.y), cos(angle.x) * cos(angle.y));

        vec3 color;
        float d = raySphereIntersect(dir, S1.xyz - pos, S1.w);

        if (d > 0.0) {
            vec3 ray = pos + dir * d;
            vec3 normal = S1.xyz - ray;
            vec3 lightPos = light - ray;
            float dProd = dot(normal, lightPos);
            if (dProd > 0.0) {
                color = vec3(0.0);
            } else {
                float theta = acos(dProd / (length(lightPos) * length(normal)));
                float uTheta = fract(theta / HPI);
                color = vec3(0.581,0.755,0.985) * sin(uTheta * HPI);
            }
        } else {
            color = vec3(0.642,0.792,0.955) * (pixel.x + pixel.y + 3.904) * 0.242;
        }
        sumColor += color;
    }
    }
    
    
    gl_FragColor = vec4(sumColor / float(AA * AA),1.0);
}