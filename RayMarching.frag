#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define HPI 1.57079632679
#define QPI 0.78539816339

#define AA 1
#define FOV 1.0471975512
#define HFOV 0.52359877559
#define MAX_DIST 1000000.0
#define MAX_ITER 1000

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

struct Sphere { vec3 pos; float r; };
struct Plane { vec3 norm; float d; };
struct Box { vec3 pos; vec3 dim; };
struct Torus { vec3 pos; vec2 dim; };

Sphere spheres[2];
Plane planes[2];
Box boxes[2];
Torus toruses[2];

float sdSphere(vec3 pos, Sphere sphere) {
    return length(sphere.pos - pos) - sphere.r;
}

float sdPlane(vec3 pos, Plane plane) {
    return abs(dot(plane.norm, pos) + plane.d);
}

float sdBox(vec3 pos, Box box) {
    vec3 q = abs(box.pos - pos) - box.dim;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - 0.5;
}

float sdTorus(vec3 pos, Torus torus) {
    vec3 p = torus.pos - pos;
    vec2 q = vec2(length(p.xz) - torus.dim.x, p.y);
    return length(q) - torus.dim.y;
}

float sdSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
}

float sdUnion(float d1, float d2) {
    return min(d1, d2);
}

float dist(vec3 pos) {
    float minDist = MAX_DIST;
    for (int i = 0; i < 2; i++) {
        float dist = sdSphere(pos, spheres[i]);
        minDist = min(dist, minDist);
    }
    for (int i = 0; i < 2; i++) {
        float dist = sdPlane(pos, planes[i]);
        minDist = min(dist, minDist);
    }
    for (int i = 0; i < 2; i++) {
        float dist = sdBox(pos, boxes[i]);
        minDist = min(dist, minDist);
    }
    for (int i = 0; i < 2; i++) {
        float dist = sdTorus(pos, toruses[i]);
        minDist = min(dist, minDist);
    }
    return minDist;
}

vec3 calcNormal(vec3 pos) {
    const float h = 0.0001;
    const vec2 k = vec2(1, -1);
    return normalize(
        k.xyy * dist(pos + k.xyy * h) +
        k.yyx * dist(pos + k.yyx * h) +
        k.yxy * dist(pos + k.yxy * h) +
        k.xxx * dist(pos + k.xxx * h)
    );
}

void main() {
    
    spheres[0] = Sphere(vec3(0.0, 0.0, 0.0), 5.0);
    spheres[1] = Sphere(vec3(5.0, -4.0, -12.0), 3.0);
    
    planes[0] = Plane(vec3(0.0, 1.0, 0.0), 100000000.0);
    planes[1] = Plane(vec3(1.0, 0.0, 0.0), -100000000.0);
    
    boxes[0] = Box(vec3(10.0, 4.0, 0.0), vec3(4.0, 4.0, 4.0));
    boxes[1] = Box(vec3(0.0, -12.0, 0.0), vec3(30.0, 4.0, 30.0));
    
    toruses[0] = Torus(vec3(-10.0, -4.0, 0.0), vec2(4.0, 1.0));
    toruses[1] = Torus(vec3(0.0, 0.0, 0.0), vec2(30.0, 4.0));

    vec3 sumColour = vec3(0.0);

    for (int i = 0; i < AA; i++)
    for (int j = 0; j < AA; j++) {
    
        vec2 offset = vec2(float(i), float(j)) / float(AA) - 0.5;
        vec2 pixelCoord = (-u_resolution.xy + 2.0 * (gl_FragCoord.xy + offset)) / u_resolution.y;
        
        vec2 angle = pixelCoord * HFOV;
        angle.x -= u_time * 0.5 + HPI;
        angle.y -= QPI * 0.5;
        vec3 pos = vec3(25.0 * cos(u_time * 0.5), 10.0, 25.0 * sin(u_time * 0.5));
        vec3 dir = vec3(sin(angle.x) * cos(angle.y), sin(angle.y), cos(angle.x) * cos(angle.y));
        
        float totalDist = 0.0;
        vec3 colour = vec3(1.0, 1.0, 1.0);

        for (int n = 0; n < MAX_ITER; n++) {
        
            float dist = dist(pos);
            pos += dist * dir;
            totalDist += dist;
            
            if (abs(dist) < 0.001) {
                dir = reflect(dir, calcNormal(pos));
                pos += dir * 0.01;
                totalDist += 0.01;
                colour -= 0.2 * exp(-totalDist * 0.00001);

                colour += vec3(0.0);
            }
            if (totalDist > MAX_DIST) break;
        }
        sumColour += (vec3(dot(dir, vec3(0.0, 0.0, 1.0))) * 0.5 + 0.5) * vec3(pixelCoord.x + 1.0, pixelCoord.y + 1.0, sin(u_time) * 0.5 + 0.5) * colour;
    }
    gl_FragColor = vec4(sumColour / float(AA*AA), 1.0);
}