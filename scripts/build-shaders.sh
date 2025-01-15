docker run --rm \
    --platform linux/amd64 \
    -v `pwd`:/work \
    -w /work/shaders \
    ddvr \
    /bin/sh -c "slang2glsl.sh vol vertexMain fragmentMain"
