// Autogenerated
pc.gfx.shaderChunks.defaultPS = "\nvec4 texture2DSRGB(sampler2D tex, vec2 tc)\n{\n    vec4 color = texture2D(tex, tc);\n    color.xyz = pow( color.xyz, vec3(2.2, 2.2, 2.2) );\n    return color;\n}\n\n";
pc.gfx.shaderChunks.fullscreenQuadVS = "attribute vec2 aPosition;\n\nvarying vec2 vUv0;\n\nvoid main(void)\n{\n    gl_Position = vec4(aPosition, 0.5, 1.0);\n    vUv0 = aPosition.xy*0.5+0.5;\n}\n\n";
pc.gfx.shaderChunks.particlePS = "// FRAGMENT SHADER INPUTS: VARYINGS\nvarying vec2 vUv0;\nvarying float vAge;\nvarying vec4 vColor;\n\n// FRAGMENT SHADER INPUTS: UNIFORMS\nuniform sampler2D texture_colorMap;\nuniform sampler2D texture_opacityMap;\nuniform sampler2D texture_rampMap;\n\nvoid main(void)\n{\n    vec4 colorMult = texture2D(texture_rampMap, vec2(vAge, 0.5)) * vColor;\n    vec3 rgb = texture2D(texture_colorMap, vUv0).rgb;\n    float a = texture2D(texture_opacityMap, vUv0).r;\n    gl_FragColor = vec4(rgb, a) * colorMult;\n}\n\n";
pc.gfx.shaderChunks.particleVS = "\n// VERTEX SHADER BODY\nvoid main(void)\n{\n    vec2 uv = particle_uvLifeTimeFrameStart.xy;\n    float lifeTime = particle_uvLifeTimeFrameStart.z;\n    float frameStart = particle_uvLifeTimeFrameStart.w;\n    vec3 position = particle_positionStartTime.xyz;\n    float startTime = particle_positionStartTime.w;\n\n    vec3 velocity = (matrix_model * vec4(particle_velocityStartSize.xyz, 0.0)).xyz + particle_worldVelocity;\n    float startSize = particle_velocityStartSize.w;\n\n    vec3 acceleration = (matrix_model * vec4(particle_accelerationEndSize.xyz, 0.0)).xyz + particle_worldAcceleration;\n    float endSize = particle_accelerationEndSize.w;\n\n    float spinStart = particle_spinStartSpinSpeed.x;\n    float spinSpeed = particle_spinStartSpinSpeed.y;\n\n    float localTime = mod((particle_time - particle_timeOffset - startTime), particle_timeRange);\n    float percentLife = localTime / lifeTime;\n\n    float frame = mod(floor(localTime / particle_frameDuration + frameStart), particle_numFrames);\n    float uOffset = frame / particle_numFrames;\n    float u = uOffset + (uv.x + 0.5) * (1.0 / particle_numFrames);\n\n    vUv0 = vec2(u, uv.y + 0.5);\n    vColor = particle_colorMult;\n\n\n";
pc.gfx.shaderChunks.particle2PS = "varying vec4 TexCoordsAlphaLife;\n\nuniform sampler2D texLifeAndSourcePosOUT, particleTexture, normalTexture, uDepthMap;\nuniform sampler2D internalTex3;\nuniform float graphSampleSize;\nuniform float graphNumSamples;\nuniform vec4 screenSize;\nuniform float camera_far;\nuniform float softening;\nuniform float colorMult;\n\nvec4 tex1Dlod_lerp(sampler2D tex, vec2 tc)\n{\n    return mix( texture2D(tex,tc), texture2D(tex,tc + graphSampleSize), fract(tc.x*graphNumSamples) );\n}\n\nfloat saturate(float x)\n{\n    return clamp(x, 0.0, 1.0);\n}\n\nfloat unpackFloat(vec4 rgbaDepth)\n{\n    const vec4 bitShift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);\n    float depth = dot(rgbaDepth, bitShift);\n    return depth;\n}\n\nvoid main(void)\n{\n    vec4 tex         = texture2D(particleTexture, TexCoordsAlphaLife.xy);\n    float alphaDivergence = TexCoordsAlphaLife.z;\n    vec4 ramp     = tex1Dlod_lerp(internalTex3, vec2(TexCoordsAlphaLife.w + alphaDivergence, 0.0));\n    ramp *= colorMult;\n\n    vec3 rgb =     tex.rgb * ramp.rgb;\n\n    float a =         tex.a * ramp.a;\n\n";
pc.gfx.shaderChunks.particle2VS = "attribute vec4 particle_vertexData; // XYZ = particle position, W = particle ID + random factor\n\nuniform mat4 matrix_viewProjection;\nuniform mat4 matrix_model;\nuniform mat3 matrix_normal;\nuniform mat4 matrix_viewInverse;\nuniform mat4 matrix_view;\n\nuniform float numParticles;\nuniform float lifetime;\nuniform float graphSampleSize;\nuniform float graphNumSamples;\nuniform float stretch;\nuniform vec3 wrapBounds;\nuniform sampler2D texLifeAndSourcePosOUT;\nuniform sampler2D internalTex0;\nuniform sampler2D internalTex1;\nuniform sampler2D internalTex2;\n\n//uniform sampler2D texPos;\n//uniform sampler2D texRot;\n//uniform sampler2D texPosRnd;\n\nvarying vec4 TexCoordsAlphaLife;\n\n\nvec3 unpack3NFloats(float src)\n{\n    float r = fract(src);\n    float g = fract(src * 256.0);\n    float b = fract(src * 65536.0);\n    return vec3(r, g, b);\n}\n\nvec4 tex1Dlod_lerp(sampler2D tex, vec2 tc)\n{\n    return mix( texture2D(tex,tc), texture2D(tex,tc + graphSampleSize), fract(tc.x*graphNumSamples) );\n}\n\nvec4 tex1Dlod_lerp(sampler2D tex, vec2 tc, out vec3 w)\n{\n    vec4 a = texture2D(tex,tc);\n    vec4 b = texture2D(tex,tc + graphSampleSize);\n    float c = fract(tc.x*graphNumSamples);\n\n    vec3 unpackedA = unpack3NFloats(a.w);\n    vec3 unpackedB = unpack3NFloats(b.w);\n    w = mix(unpackedA, unpackedB, c);\n\n    return mix(a, b, c);\n}\n\n\nvec2 rotate(vec2 quadXY, float pRotation, out mat2 rotMatrix)\n{\n    float c = cos(pRotation);\n    float s = sin(pRotation);\n    //vec4 rotationMatrix = vec4(c, -s, s, c);\n\n    mat2 m = mat2(c, -s, s, c);\n    rotMatrix = m;\n\n    return m * quadXY;\n}\n\nvec3 billboard(vec3 InstanceCoords, vec2 quadXY, out mat3 localMat)\n{\n    vec3 viewUp = matrix_viewInverse[1].xyz;\n    vec3 posCam = matrix_viewInverse[3].xyz;\n\n    mat3 billMat;\n    billMat[2] = normalize(InstanceCoords - posCam);\n    billMat[0] = normalize(cross(viewUp, billMat[2]));\n    billMat[1] = -viewUp;\n    vec3 pos = billMat * vec3(quadXY, 0);\n\n    localMat = billMat;\n\n    return pos;\n}\n\n\nvoid main(void)\n{\n    vec2 quadXY = particle_vertexData.xy;\n    float id = floor(particle_vertexData.w);\n    float rndFactor = fract(particle_vertexData.w);\n    vec3 rndFactor3 = vec3(rndFactor, fract(rndFactor*10.0), fract(rndFactor*100.0));\n\n    vec4 lifeAndSourcePos = texture2D(texLifeAndSourcePosOUT, vec2(id/numParticles, 0.0));\n    vec3 sourcePos = lifeAndSourcePos.xyz;\n    float life = max(lifeAndSourcePos.w, 0.0) / lifetime;\n\n    if (lifeAndSourcePos.w < 0.0) quadXY = vec2(0,0);\n\n    vec3 paramDivergence;\n    vec3 localOffset =     tex1Dlod_lerp(internalTex0, vec2(life, 0), paramDivergence).xyz;\n    float scaleRnd = paramDivergence.x;\n    float angleRnd = paramDivergence.y;\n    float alphaRnd = paramDivergence.z;\n\n    vec3 posDivergence;\n    vec3 worldOffset =    tex1Dlod_lerp(internalTex1, vec2(life, 0), posDivergence).xyz;\n\n    vec3 posWorldDivergence;\n    vec4 rot =                 tex1Dlod_lerp(internalTex2, vec2(life, 0), posWorldDivergence);\n    float angle = rot.x;\n    float scale = rot.y;\n\n    vec3 divergentLocalOffset =     mix(localOffset.xyz, -localOffset.xyz, rndFactor3);\n    localOffset.xyz =                     mix(localOffset.xyz, divergentLocalOffset, posDivergence);\n\n    vec3 divergentWorldOffset =     mix(worldOffset.xyz, -worldOffset.xyz, rndFactor3);\n    worldOffset.xyz =                     mix(worldOffset.xyz, divergentWorldOffset, posWorldDivergence);\n\n    angle = mix(angle, angle + 90.0*rndFactor, angleRnd);\n    scale = mix(scale, scale*rndFactor, scaleRnd);\n\n    TexCoordsAlphaLife = vec4(quadXY*0.5+0.5,    alphaRnd * (fract(rndFactor*1000.0) * 2.0 - 1.0),    life);\n\n    vec3 particlePos = sourcePos + matrix_normal * localOffset.xyz   +   worldOffset.xyz;\n    vec3 particlePosMoved = vec3(0.0);\n\n    mat2 rotMatrix;\n    mat3 localMat;\n\n\n";
pc.gfx.shaderChunks.particle2_billboardVS = "\n    quadXY = rotate(quadXY, angle, rotMatrix);\n    vec3 localPos = billboard(particlePos, quadXY, localMat);\n\n";
pc.gfx.shaderChunks.particle2_cpuVS = "attribute vec4 particle_vertexData;     // XYZ = world pos, W = life\nattribute vec4 particle_vertexData2;     // X = angle, Y = scale, Z = alpha, W = unused\nattribute vec4 particle_vertexData3;     // XYZ = particle local pos\n\nuniform mat4 matrix_viewProjection;\nuniform mat4 matrix_model;\nuniform mat3 matrix_normal;\nuniform mat4 matrix_viewInverse;\n\nuniform float numParticles;\nuniform float lifetime;\nuniform float graphSampleSize;\nuniform float graphNumSamples;\nuniform vec3 wrapBounds;\nuniform sampler2D texLifeAndSourcePosOUT;\nuniform sampler2D internalTex0;\nuniform sampler2D internalTex1;\nuniform sampler2D internalTex2;\n\nvarying vec4 TexCoordsAlphaLife;\n\n\nvec2 rotate(vec2 quadXY, float pRotation, out mat2 rotMatrix)\n{\n    float c = cos(pRotation);\n    float s = sin(pRotation);\n    //vec4 rotationMatrix = vec4(c, -s, s, c);\n\n    mat2 m = mat2(c, -s, s, c);\n    rotMatrix = m;\n\n    return m * quadXY;\n}\n\nvec3 billboard(vec3 InstanceCoords, vec2 quadXY, out mat3 localMat)\n{\n    vec3 viewUp = matrix_viewInverse[1].xyz;\n    vec3 posCam = matrix_viewInverse[3].xyz;\n\n    mat3 billMat;\n    billMat[2] = normalize(InstanceCoords - posCam);\n    billMat[0] = normalize(cross(viewUp, billMat[2]));\n    billMat[1] = -viewUp;\n    vec3 pos = billMat * vec3(quadXY, 0);\n\n    localMat = billMat;\n\n    return pos;\n}\n\n\nvoid main(void)\n{\n    vec3 particlePos = particle_vertexData.xyz;\n    vec3 vertPos = particle_vertexData3.xyz;\n\n    //float vfrac = fract(particle_vertexData2.w);\n    vec2 TC = vertPos.xy*0.5+0.5;//vec2(particle_vertexData2.w - vfrac, vfrac*10.0);\n\n    TexCoordsAlphaLife = vec4(TC, particle_vertexData2.z, particle_vertexData.w);\n\n    vec2 quadXY = TC*2.0 - 1.0;\n\n    mat2 rotMatrix;\n    mat3 localMat;\n\n    quadXY = rotate(quadXY, particle_vertexData2.x, rotMatrix);\n    quadXY *= particle_vertexData2.y;\n\n    vec3 localPos = billboard(particlePos, quadXY, localMat);\n    vec3 particlePosMoved = vec3(0.0);\n\n\n\n";
pc.gfx.shaderChunks.particle2_cpu_endVS = "\n    localPos += particlePos;\n    gl_Position = matrix_viewProjection * vec4(localPos, 1.0);\n}\n\n";
pc.gfx.shaderChunks.particle2_cpu_meshVS = "\n    worldPos -= localPos;\n    localPos = particle_vertexData3.xyz;\n    localPos.xy = rotate(localPos.xy, particle_vertexData2.x, rotMatrix);\n    localPos.yz = rotate(localPos.yz, particle_vertexData2.x, rotMatrix);\n    worldPos += localPos;\n\n";
pc.gfx.shaderChunks.particle2_endPS = "\n    if (a < 0.01) discard;\n    gl_FragColor = vec4(rgb*a, a);\n}\n\n";
pc.gfx.shaderChunks.particle2_endVS = "\n    localPos *= scale;\n    localPos += particlePos;\n\n    gl_Position = matrix_viewProjection * vec4(localPos.xyz, 1.0);\n}\n";
pc.gfx.shaderChunks.particle2_end_srgbPS = "\n    if (a < 0.01) discard;\n    gl_FragColor = vec4(pow(rgb,vec3(0.45))*a, a);\n}\n\n";
pc.gfx.shaderChunks.particle2_halflambertPS = "\n    vec3 negNormal = normal*0.5+0.5;\n    vec3 posNormal = -normal*0.5+0.5;\n    negNormal *= negNormal;\n    posNormal *= posNormal;\n\n\n";
pc.gfx.shaderChunks.particle2_lambertPS = "\n    vec3 negNormal = max(normal, vec3(0.0));\n    vec3 posNormal = max(-normal, vec3(0.0));\n\n\n";
pc.gfx.shaderChunks.particle2_lightingPS = "\n    vec3 light = negNormal.x*lightCube[0] + posNormal.x*lightCube[1] +\n                        negNormal.y*lightCube[2] + posNormal.y*lightCube[3] +\n                        negNormal.z*lightCube[4] + posNormal.z*lightCube[5];\n\n\n    rgb *= light;\n\n\n";
pc.gfx.shaderChunks.particle2_meshVS = "\n    vec3 localPos = particle_vertexData.xyz;\n    localPos.xy = rotate(localPos.xy, angle, rotMatrix);\n    localPos.yz = rotate(localPos.yz, angle, rotMatrix);\n\n    billboard(particlePos, quadXY, localMat);\n\n\n";
pc.gfx.shaderChunks.particle2_normalVS = "\n    Normal = normalize(localPos - localMat[2]);\n\n\n";
pc.gfx.shaderChunks.particle2_normalMapPS = "\n    vec3 normalMap         = normalize( texture2D(normalTexture, TexCoordsAlphaLife.xy).xyz * 2.0 - 1.0 );\n    vec3 normal = ParticleMat * normalMap;\n\n\n\n\n";
pc.gfx.shaderChunks.particle2_softPS = "\n    vec2 screenTC = gl_FragCoord.xy / screenSize.xy;\n    float depth = unpackFloat( texture2D(uDepthMap, screenTC) ) * camera_far;\n    float particleDepth = gl_FragCoord.z / gl_FragCoord.w;\n    float depthDiff = saturate(abs(particleDepth - depth) * softening);\n    a *= depthDiff;\n\n";
pc.gfx.shaderChunks.particle2_stretchVS = "\n    life = max(life - graphSampleSize*stretch, 0.0);\n    vec3 localOffsetPast =     tex1Dlod_lerp(internalTex0, vec2(life, 0), paramDivergence).xyz;\n    vec3 worldOffsetPast =    tex1Dlod_lerp(internalTex1, vec2(life, 0), posDivergence).xyz;\n\n    divergentLocalOffset =     mix(localOffsetPast.xyz, -localOffsetPast.xyz, rndFactor3);\n    localOffsetPast.xyz =     mix(localOffsetPast.xyz, divergentLocalOffset, posDivergence);\n\n    divergentWorldOffset =     mix(worldOffsetPast.xyz, -worldOffsetPast.xyz, rndFactor3);\n    worldOffsetPast.xyz =     mix(worldOffsetPast.xyz, divergentWorldOffset, posWorldDivergence);\n\n    vec3 particlePosPast = sourcePos + matrix_normal * localOffsetPast.xyz   +   worldOffsetPast.xyz;\n    particlePosPast += particlePosMoved;\n\n    vec3 moveDir = particlePos - particlePosPast;\n    float sgn = (moveDir.x>0.0? 1.0 : -1.0) * (moveDir.y>0.0? 1.0 : -1.0) * (moveDir.z>0.0? 1.0 : -1.0);\n\n    //localPos *= abs(moveDir * vec3(10.0)) ;//+ vec3(1.0);\n\n    float interpolation =  quadXY.y*0.5+0.5;\n    particlePos = sgn>0.0? mix(particlePosPast, particlePos, interpolation) : mix(particlePos, particlePosPast, interpolation);\n\n    //vec3 pastLocal = billboard(particlePosPast, quadXY, localMat);\n    //localPos = sgn>0.0? mix(pastLocal, localPos, interpolation) : mix(localPos, pastLocal, interpolation);\n\n\n";
pc.gfx.shaderChunks.particle2_TBNVS = "\n    mat3 rot3 = mat3(rotMatrix[0][0], rotMatrix[0][1], 0.0,        rotMatrix[1][0], rotMatrix[1][1], 0.0,        0.0, 0.0, 1.0);\n    localMat[2] *= -1.0;\n    ParticleMat = localMat * rot3;\n\n\n\n\n";
pc.gfx.shaderChunks.particle2_wrapVS = "\n    vec3 origParticlePos = particlePos;\n    particlePos -= matrix_viewInverse[3].xyz;\n    //vec3 volume = vec3(10.0, 5.0, 10.0);\n    particlePos = mod(particlePos, wrapBounds*2.0) - wrapBounds;\n    particlePos += matrix_viewInverse[3].xyz;\n    particlePosMoved = particlePos - origParticlePos;\n\n\n";
pc.gfx.shaderChunks.particleEndVS = "\n    float size = mix(startSize, endSize, percentLife);\n    size = (percentLife < 0.0 || percentLife > 1.0) ? 0.0 : size;\n    float s = sin(spinStart + spinSpeed * localTime);\n    float c = cos(spinStart + spinSpeed * localTime);\n\n    vec4 rotatedPoint = vec4((uv.x * c + uv.y * s) * size, 0.0, (uv.x * s - uv.y * c) * size, 1.0);\n    vec3 center = velocity * localTime + acceleration * localTime * localTime + position;\n\n    vec4 q2 = particle_orientation + particle_orientation;\n    vec4 qx = particle_orientation.xxxw * q2.xyzx;\n    vec4 qy = particle_orientation.xyyw * q2.xyzy;\n    vec4 qz = particle_orientation.xxzw * q2.xxzz;\n\n    mat4 localMatrix =\n         mat4((1.0 - qy.y) - qz.z, qx.y + qz.w, qx.z - qy.w, 0,\n              qx.y - qz.w, (1.0 - qx.x) - qz.z, qy.z + qx.w, 0,\n              qx.z + qy.w, qy.z - qx.w, (1.0 - qx.x) - qy.y, 0,\n              center.x, center.y, center.z, 1);\n    rotatedPoint = localMatrix * rotatedPoint;\n    vAge = percentLife;\n    gl_Position = matrix_viewProjection * vec4(rotatedPoint.xyz + matrix_model[3].xyz, 1.0);\n}\n";
pc.gfx.shaderChunks.particleEndBBRDVS = "\n    vec3 basisX = matrix_viewInverse[0].xyz;\n    vec3 basisZ = matrix_viewInverse[1].xyz;\n    float size = mix(startSize, endSize, percentLife);\n    size = (percentLife < 0.0 || percentLife > 1.0) ? 0.0 : size;\n    float s = sin(spinStart + spinSpeed * localTime);\n    float c = cos(spinStart + spinSpeed * localTime);\n    vec2 rotatedPoint = vec2(uv.x * c + uv.y * s,\n                             -uv.x * s + uv.y * c);\n    vec3 localPosition = vec3(basisX * rotatedPoint.x +\n                              basisZ * rotatedPoint.y) * size +\n                              velocity * localTime +\n                              acceleration * localTime * localTime +\n                              position;\n    vAge = percentLife;\n    gl_Position = matrix_viewProjection * vec4(localPosition + matrix_model[3].xyz, 1.0);\n}\n";
pc.gfx.shaderChunks.particleStartVS = "// VERTEX SHADER INPUTS: ATTRIBUTES\nattribute vec4 particle_uvLifeTimeFrameStart; // uv, lifeTime, frameStart\nattribute vec4 particle_positionStartTime;    // position.xyz, startTime\nattribute vec4 particle_velocityStartSize;    // velocity.xyz, startSize\nattribute vec4 particle_accelerationEndSize;  // acceleration.xyz, endSize\nattribute vec4 particle_spinStartSpinSpeed;   // spinStart.x, spinSpeed.y\nattribute vec4 particle_colorMult;            // multiplies color and ramp textures\n\n// VERTEX SHADER INPUTS: UNIFORMS\nuniform mat4 matrix_viewProjection;\nuniform mat4 matrix_model;\nuniform mat4 matrix_viewInverse;\nuniform vec3 particle_worldVelocity;\nuniform vec3 particle_worldAcceleration;\nuniform float particle_timeRange;\nuniform float particle_time;\nuniform float particle_timeOffset;\nuniform float particle_frameDuration;\nuniform float particle_numFrames;\n\n// VERTEX SHADER OUTPUTS\nvarying vec2 vUv0;\nvarying float vAge;\nvarying vec4 vColor;\n\n";
pc.gfx.shaderChunks.particleStartRotationVS = "\n// VERTEX SHADER INPUTS: ROTATION ATTRIBUTE (not used on billboards)\nattribute vec4 particle_orientation;\n\n";
pc.gfx.shaderChunks.particleUpdaterEndPS = "\n    gl_FragColor = tex;\n}\n";
pc.gfx.shaderChunks.particleUpdaterRespawnPS = "    if (tex.w > lifetime)\n    {\n        tex.w = -rate + (tex.w - lifetime);\n    }\n";
pc.gfx.shaderChunks.particleUpdaterStartPS = "varying vec2 vUv0;\n\nuniform sampler2D texLifeAndSourcePosIN;\nuniform vec3 emitterPos, birthBounds, frameRandom;\nuniform float delta, rate, lifetime, deltaRandomness, deltaRandomnessStatic;\n\nfloat saturate(float x)\n{\n    return clamp(x, 0.0, 1.0);\n}\n\nvoid main(void)\n{\n    vec4 tex = texture2D(texLifeAndSourcePosIN, vec2(vUv0.x, 0));\n\n    float x = vUv0.x * (tex.w+emitterPos.x+emitterPos.y+emitterPos.z+1.0) * 1000.0;\n    x = mod(x, 13.0) * mod(x, 123.0);\n    float dx = mod(x, 0.01);\n    float noize = saturate(0.1 + dx * 100.0);\n\n    x = vUv0.x * (emitterPos.x+emitterPos.y+emitterPos.z+1.0) * 1000.0;\n    x = mod(x, 13.0) * mod(x, 123.0);\n    dx = mod(x, 0.01);\n    float noize2 = saturate(0.1 + dx * 100.0);\n\n\n    if (tex.w<=0.0) tex.xyz = emitterPos + birthBounds * mod( vec3(noize, fract(noize*10.0), fract(noize*100.0))  + frameRandom, vec3(1.0) );\n\n    tex.w += delta * mix(1.0 - deltaRandomness, 1.0, noize) * mix(1.0 - deltaRandomnessStatic, 1.0, noize2);\n\n";