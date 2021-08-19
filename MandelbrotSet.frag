#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define MAX_ITERS 1000

float hueToRgb(float p, float q, float t) {
    t = fract(t);
    if (t < 0.167) return p + (q - p) * 6.0 * t;
    if (t < 0.500) return q;
    if (t < 0.667) return p + (q - p) * (0.667 - t) * 6.0;
    return p;
}

vec3 hslToRgb(float h, float s, float l) {
    float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
    float p = 2.0 * l - q;
    return vec3(hueToRgb(p, q, h + 0.333), hueToRgb(p, q, h), hueToRgb(p, q, h - 0.333));
}


void main() {
    float time = sin(u_time * 0.4) * 12.5 + 12.5;
    vec2 uv = (((((gl_FragCoord.xy/u_resolution.xy) * vec2(u_resolution.x / u_resolution.y, 1.0)) * 2.0 - 1.0) / (pow(time + 1.0, 1.0 + time * 0.1)) + vec2(-0.7436447860, 0.1318252536)));
    
    float x0 = uv.x;
    float y0 = uv.y;
    float x = 0.0;
    float y = 0.0;
    float x2 = 0.0;
    float y2 = 0.0;
    
    float n = 0.0;
    
    for (int i = 0; i < MAX_ITERS; i++) {
        if (x2 + y2 > 256.0) break;
        y = 2.0 * x * y + y0;
        x = x2 - y2 + x0;
        x2 = x * x;
        y2 = y * y;
        n ++;
    }
    
    float s = n / float(MAX_ITERS);
    float h = s + 0.46;
    
    gl_FragColor = vec4(hslToRgb(h, 1.0, 1.0 - (s * 0.5 + 0.5)), 1.0);
}