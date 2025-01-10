docker run --rm ^
    -v %cd%:/work ^
    -w /work/shaders ^
    ddvr ^
    /bin/sh -c "slang2glsl.sh vol vertexMain fragmentMain"