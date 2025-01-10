FROM alpine:latest

RUN apk update && \
    apk add tar curl gcompat libstdc++

# Download spirv-cross compiler
RUN curl -L -O https://github.com/KhronosGroup/SPIRV-Cross/releases/download/2020-01-16/spirv-cross-gcc-trusty-64bit-f9818f0804.tar.gz
RUN tar -xzvf spirv-cross-gcc-trusty-64bit-f9818f0804.tar.gz

# Download shader-slang
RUN curl -L -O https://github.com/shader-slang/slang/releases/download/v2025.1/slang-2025.1-linux-x86_64.tar.gz
RUN tar -xzvf slang-2025.1-linux-x86_64.tar.gz

# Create shader build script
COPY ./scripts/slang2glsl.sh /bin/slang2glsl.sh
RUN chmod +x /bin/slang2glsl.sh