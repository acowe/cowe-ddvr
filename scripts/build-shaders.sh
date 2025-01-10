docker run --rm \
    -v `pwd`:/work \
    -w /work/shaders \
    ddvr \
    /bin/sh -c "slang2glsl.sh vol vertexMain fragmentMain"