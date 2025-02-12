// Compiled from Automatic-Differentation from https://shader-slang.org/slang-playground/
// Modified slightly to take in external x,y values and output differential values 
struct FormattedStruct_std430_0
{
    @align(4) type_0 : u32,
    @align(4) low_0 : u32,
    @align(4) high_0 : u32,
};

@binding(0) @group(0) var<storage, read_write> g_printedBuffer_0 : array<FormattedStruct_std430_0>;
@binding(1) @group(0) var<storage, read_write> data_in : array<f32>;

fn sumOfSquares_0( x_0 : f32,  y_0 : f32) -> f32
{
    return x_0 * x_0 + y_0 * y_0;
}

var<private> g_printBufferIndex_0 : i32;

struct FormattedStruct_0
{
     type_0 : u32,
     low_0 : u32,
     high_0 : u32,
};

fn packStorage_0( _S1 : FormattedStruct_0) -> FormattedStruct_std430_0
{
    var _S2 : FormattedStruct_std430_0 = FormattedStruct_std430_0( _S1.type_0, _S1.low_0, _S1.high_0 );
    return _S2;
}

fn typeFlag_0( this_0 : f32) -> u32
{
    return u32(4);
}

fn writePrintfWords_0( this_1 : f32) -> u32
{
    return bitcast<u32>(this_1);
}

fn handleEach_0( value_0 : f32,  index_0 : i32)
{
    g_printedBuffer_0[index_0].type_0 = typeFlag_0(value_0);
    g_printedBuffer_0[index_0].low_0 = writePrintfWords_0(value_0);
    return;
}

struct DiffPair_float_0
{
     primal_0 : f32,
     differential_0 : f32,
};

fn s_fwd_sumOfSquares_0( dpx_0 : DiffPair_float_0,  dpy_0 : DiffPair_float_0) -> DiffPair_float_0
{
    var _S3 : f32 = dpx_0.primal_0;
    var _S4 : f32 = dpx_0.differential_0 * dpx_0.primal_0;
    var _S5 : f32 = dpy_0.differential_0 * dpy_0.primal_0;
    var _S6 : DiffPair_float_0 = DiffPair_float_0( _S3 * _S3 + dpy_0.primal_0 * dpy_0.primal_0, _S4 + _S4 + (_S5 + _S5) );
    return _S6;
}

fn s_bwd_prop_sumOfSquares_0( dpx_1 : ptr<function, DiffPair_float_0>,  dpy_1 : ptr<function, DiffPair_float_0>,  _s_dOut_0 : f32)
{
    var _S7 : f32 = (*dpy_1).primal_0 * _s_dOut_0;
    var _S8 : f32 = (*dpx_1).primal_0 * _s_dOut_0;
    var _S9 : f32 = _S7 + _S7;
    (*dpy_1).primal_0 = (*dpy_1).primal_0;
    (*dpy_1).differential_0 = _S9;
    var _S10 : f32 = _S8 + _S8;
    (*dpx_1).primal_0 = (*dpx_1).primal_0;
    (*dpx_1).differential_0 = _S10;
    return;
}

fn s_bwd_sumOfSquares_0( _S11 : ptr<function, DiffPair_float_0>,  _S12 : ptr<function, DiffPair_float_0>,  _S13 : f32)
{
    s_bwd_prop_sumOfSquares_0(&((*_S11)), &((*_S12)), _S13);
    return;
}

fn printMain_0()
{
    
    let x = data_in[0]; 
    let y = data_in[1];
    var _S14 : f32 = sumOfSquares_0(x, y);
    g_printedBuffer_0[g_printBufferIndex_0].type_0 = u32(1);
    g_printedBuffer_0[g_printBufferIndex_0].low_0 = u32(i32(312366793));
    var _S15 : i32 = g_printBufferIndex_0 + i32(1);
    g_printBufferIndex_0 = _S15;
    g_printBufferIndex_0 = _S15 + i32(1);
    handleEach_0(_S14, _S15);
    var _S16 : i32 = g_printBufferIndex_0;
    g_printBufferIndex_0 = g_printBufferIndex_0 + i32(1);
    var _S17 : FormattedStruct_0 = FormattedStruct_0( u32(4294967295), u32(0), u32(0) );
    var _S18 : FormattedStruct_std430_0 = packStorage_0(_S17);
    g_printedBuffer_0[_S16] = _S18;
    var _S19 : DiffPair_float_0 = DiffPair_float_0( x, 1.0f );
    var _S20 : DiffPair_float_0 = DiffPair_float_0( y, 0.0f );
    var _S21 : DiffPair_float_0 = s_fwd_sumOfSquares_0(_S19, _S20);
    g_printedBuffer_0[g_printBufferIndex_0].type_0 = u32(1);
    g_printedBuffer_0[g_printBufferIndex_0].low_0 = u32(i32(312366793));
    var _S22 : i32 = g_printBufferIndex_0 + i32(1);
    g_printBufferIndex_0 = _S22;
    g_printBufferIndex_0 = _S22 + i32(1);
    handleEach_0(_S21.differential_0, _S22);
    var _S23 : i32 = g_printBufferIndex_0;
    g_printBufferIndex_0 = g_printBufferIndex_0 + i32(1);
    g_printedBuffer_0[_S23] = _S18;
    var _S24 : DiffPair_float_0 = DiffPair_float_0( y, 1.0f );
    var _S25 : DiffPair_float_0 = s_fwd_sumOfSquares_0(_S19, _S24);
    g_printedBuffer_0[g_printBufferIndex_0].type_0 = u32(1);
    g_printedBuffer_0[g_printBufferIndex_0].low_0 = u32(i32(312366793));
    var _S26 : i32 = g_printBufferIndex_0 + i32(1);
    g_printBufferIndex_0 = _S26;
    g_printBufferIndex_0 = _S26 + i32(1);
    handleEach_0(_S25.differential_0, _S26);
    var _S27 : i32 = g_printBufferIndex_0;
    g_printBufferIndex_0 = g_printBufferIndex_0 + i32(1);
    g_printedBuffer_0[_S27] = _S18;
    var dpX_0 : DiffPair_float_0;
    dpX_0.primal_0 = x;
    dpX_0.differential_0 = 0.0f;
    var dpY_0 : DiffPair_float_0;
    dpY_0.primal_0 = y;
    dpY_0.differential_0 = 0.0f;
    s_bwd_sumOfSquares_0(&(dpX_0), &(dpY_0), 1.0f);
    var _S28 : DiffPair_float_0 = dpX_0;
    g_printedBuffer_0[g_printBufferIndex_0].type_0 = u32(1);
    g_printedBuffer_0[g_printBufferIndex_0].low_0 = u32(i32(312366793));
    var _S29 : i32 = g_printBufferIndex_0 + i32(1);
    g_printBufferIndex_0 = _S29;
    g_printBufferIndex_0 = _S29 + i32(1);
    handleEach_0(_S28.differential_0, _S29);
    var _S30 : i32 = g_printBufferIndex_0;
    g_printBufferIndex_0 = g_printBufferIndex_0 + i32(1);
    g_printedBuffer_0[_S30] = _S18;
    var _S31 : DiffPair_float_0 = dpY_0;
    g_printedBuffer_0[g_printBufferIndex_0].type_0 = u32(1);
    g_printedBuffer_0[g_printBufferIndex_0].low_0 = u32(i32(312366793));
    var _S32 : i32 = g_printBufferIndex_0 + i32(1);
    g_printBufferIndex_0 = _S32;
    g_printBufferIndex_0 = _S32 + i32(1);
    handleEach_0(_S31.differential_0, _S32);
    var _S33 : i32 = g_printBufferIndex_0;
    g_printBufferIndex_0 = g_printBufferIndex_0 + i32(1);
    g_printedBuffer_0[_S33] = _S18;
    return;
}

@compute
@workgroup_size(1, 1, 1)
fn printMain(@builtin(global_invocation_id) dispatchThreadID_0 : vec3<u32>)
{
    g_printBufferIndex_0 = i32(0);
    printMain_0();
    return;
}