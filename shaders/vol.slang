struct Vertex {
    float3 position;
};

struct VSOut {
    float3 position : SV_Position;
};

[shader("vertex")]
VSOut vertexMain(Vertex vertex) {
	// TODO: Implement this
    VSOut out;
    out.position = vertex.position;
    return out;
}

[shader("fragment")]
float4 fragmentMain(VSOut input) {
	// TODO: Implement this
    float4 color = float4(1.f);
    return color;
}