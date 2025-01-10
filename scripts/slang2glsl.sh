SHADER_NAME=$1
ENTRYPOINT_VERT=$2
ENTRYPOINT_FRAG=$3

slangc ${SHADER_NAME}.slang -profile spirv_1_5 -entry ${ENTRYPOINT_VERT} -entry ${ENTRYPOINT_FRAG} -O0 -o ${SHADER_NAME}.spv
spirv-cross ${SHADER_NAME}.spv --es --version 300 --stage vert --output ${SHADER_NAME}.vert.glsl
spirv-cross ${SHADER_NAME}.spv --es --version 300 --stage frag --output ${SHADER_NAME}.frag.glsl

rm ${SHADER_NAME}.spv