export interface WebGLContext {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    buffers: {
        position: WebGLBuffer,
        textureCoord: WebGLBuffer
    }
}

const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying highp vec2 vTextureCoord;
    void main(void) {
        gl_Position = aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
`;

const fragmentShaderSource = `
    varying highp vec2 vTextureCoord;
    uniform sampler2D uSampler;
    void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
`;

function createShaderProgram(gl: WebGLRenderingContext): WebGLProgram {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(`ERROR compiling vertex shader: ${gl.getShaderInfoLog(vertexShader)}`);
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(`ERROR compiling fragment shader: ${gl.getShaderInfoLog(vertexShader)}`);
    }

    const program = gl.createProgram()!;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program;
}

function createBuffers(gl: WebGLRenderingContext) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1.0,  1.0,
         1.0,  1.0,
        -1.0, -1.0,
         1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const textureCoordinates = [
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        1.0,  1.0,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    return {
        position: positionBuffer!,
        textureCoord: textureCoordBuffer!,
    };
}

export function createTextureFromBuffer(gl: WebGLRenderingContext, width: number, height: number, data: Uint8Array): WebGLTexture {
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
}


export function setupWebGL(canvas: HTMLCanvasElement, width: number, height: number): WebGLContext {
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;

    if (!gl) {
        throw new Error('WebGL not supported');
    }

    gl.viewport(0, 0, width, height);

    const program = createShaderProgram(gl);
    const buffers = createBuffers(gl);

    return { gl, program, buffers };
}
