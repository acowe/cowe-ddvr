// Performs a computation on the GPU

async function loadShader(url) {
    const response = await fetch(url);
    return await response.text();
}

async function main() {
    // Get WebGPU device
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!device) {
      fail('need a browser that supports WebGPU');
      return;
    }

    const shaderCode = await loadShader("./simple-diff-v2.wgsl");

    // Create shader module with compute shader
    const module = device.createShaderModule({
      label: 'simple differentation compute module',
      code: shaderCode
    });
  
    // Create render pipeline with compute module
    const pipeline = device.createComputePipeline({
      label: 'simple differentation compute pipeline',
      layout: 'auto',
      compute: {
        module,
      },
    });

    // Set up buffer sizes

    const printStructUnitSize = 3 * 4;
    const numPrintResults = 15;
    const printBufferSize = printStructUnitSize * numPrintResults;

    // Create buffers on the GPU to hold our computation
    // Every WebGPU buffer we create has to specify a usage

    // Set up data to process
    const input = new Float32Array([2, 2]);

    const inBuffer = device.createBuffer({
      label: 'in buffer',
      size: input.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      // GPUBufferUsage.STORAGE => Make buffer usable as storage; Makes it compatible with var<storage,...> from the shader. 
      // GPUBufferUsage.COPY_SRC => Allows data to be copied data FROM this buffer
      // GPUBufferUsage.COPY_DST => Allows data to be copied TO this buffer  
    });
    device.queue.writeBuffer(inBuffer, 0, input); 

    // The buffer to pass in and do stuff to (i.e. write print results)
    const workBuffer = device.createBuffer({
      label: 'work buffer',
      size: printBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      // GPUBufferUsage.STORAGE => Make buffer usable as storage; Makes it compatible with var<storage,...> from the shader. 
      // GPUBufferUsage.COPY_SRC => Allows data to be copied data FROM this buffer
      // GPUBufferUsage.COPY_DST => Allows data to be copied TO this buffer  
    });

    // The buffer that will used to hold copy of the results
    const resultBuffer = device.createBuffer({
      label: 'result buffer',
      size: printBufferSize,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
      // GPUBufferUsage.MAP_READ => Allows mapping from this buffer for reading data
    });
  
    // Setup a bindGroup to tell the shader which
    // buffer to use for the computation
    const bindGroup = device.createBindGroup({
      label: 'bindGroup for work buffer',
      layout: pipeline.getBindGroupLayout(0), //corresponds to @group(0) in the shader. 
      // The {binding: 0 ... of the entries corresponds to the @group(0) @binding(0) in the shader.
      entries: [ 
        { binding: 0, resource: { buffer: workBuffer } },
        { binding: 1, resource: { buffer: inBuffer }},
      ],
    });
  
    // Encode commands to do the computation
    const encoder = device.createCommandEncoder({
      label: 'doubling encoder',
    });
    const pass = encoder.beginComputePass({
      label: 'doubling compute pass',
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(1); // run compute shader input.length = 3 times
    pass.end();
  
    // Encode a command to copy the results to a mappable buffer after computation.
    encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);
  
    // Finish encoding and submit the commands
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  
    // Read the results
    // We need to await computation results => use mapAsync
    await resultBuffer.mapAsync(GPUMapMode.READ);
    const fresult = new Float32Array(resultBuffer.getMappedRange().slice());
    console.log('fresult', fresult);
    resultBuffer.unmap();

    await resultBuffer.mapAsync(GPUMapMode.READ);
    const iresult = new Uint32Array(resultBuffer.getMappedRange().slice());
    console.log('iresult', iresult);
    const num = iresult[19];
    const bytes = [
        (num >> 0) & 0xFF,  // Least significant byte (LSB)
        (num >> 8) & 0xFF,
        (num >> 16) & 0xFF,
        (num >> 24) & 0xFF   // Most significant byte (MSB)
    ];
    console.log(bytes);
    //const dStr = new TextDecoder("utf-8").decode(bytes.reverse())
    const dStr = String.fromCharCode(...bytes.reverse());
    //const dStr = String.fromCharCode(iresult);


    console.log('str-result', dStr);
    resultBuffer.unmap(); // resultBuffer length is set to 0 and data is no longer accessible
  
    // Output results
    // console.log('input', input);
    
    document.getElementById("special_msg").textContent = 
    "For x = " + input[0] + ", y = " + input[1] + ", f(x,y) = x^2 + y^2: " + fresult[4] + ", Fwd-diff df/dx: " + fresult[13]
    + ", Fwd-diff df/(dxdy): " + fresult[22] 
    + ", Bwd-diff df/dx: " + fresult[31]
    + ", Bwd-diff df/dy: " + fresult[40]
  }
  
  function fail(msg) {
    // eslint-disable-next-line no-alert
    alert(msg);
  }
  
  main();

  
    