/* V168 arena venue dressing: night sky, floodlight masts, LED perimeter boards,
 * surround turf and stand lighting for Small-sided / Japon Kale.
 * Purely visual and deterministic (video time only). No physics, no outcomes.
 * Original procedural geometry and canvas textures; no external assets. */
(function (r, f) {
  if (typeof module === 'object' && module.exports) module.exports = f(require('./vendor/three.min.js'));
  else r.Next90JaponVenue = f(r.THREE);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (T) {
  'use strict';
  const hasCanvas = typeof document !== 'undefined';
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const css = hex => '#' + new T.Color(hex).getHexString();

  // Intersection of consecutive boundary lines pushed outward by `offset` metres.
  function ring(layout, offset) {
    const e = layout.boundaries, meet = (a, b) => {
      const ad = a.d + offset, bd = b.d + offset, det = a.nx * b.nz - b.nx * a.nz;
      return { x: (ad * b.nz - bd * a.nz) / det, z: (a.nx * bd - b.nx * ad) / det };
    };
    return e.map((edge, i) => meet(e[(i + e.length - 1) % e.length], edge));
  }

  function skyDome(owned) {
    const g = new T.SphereGeometry(190, 32, 20), p = g.attributes.position, colors = new Float32Array(p.count * 3);
    const zenith = new T.Color(0x030814), mid = new T.Color(0x0a1b36), glow = new T.Color(0x1c4a66), low = new T.Color(0x0a1420), c = new T.Color();
    for (let i = 0; i < p.count; i++) {
      const h = p.getY(i) / 190;
      if (h < 0) c.copy(low);
      else if (h < .16) c.copy(glow).lerp(mid, h / .16);
      else c.copy(mid).lerp(zenith, Math.min(1, (h - .16) / .5));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new T.BufferAttribute(colors, 3));
    const m = new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false, toneMapped: false });
    owned.push(g, m);
    const dome = new T.Mesh(g, m); dome.name = 'arena-sky'; dome.renderOrder = -10; dome.frustumCulled = false;
    return dome;
  }

  function stars(owned) {
    let s = 9173; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const n = 520, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, h = .12 + rnd() * .88, rr = Math.sqrt(1 - h * h), b = .35 + rnd() * .65;
      pos.set([Math.cos(a) * rr * 180, h * 180, Math.sin(a) * rr * 180], i * 3);
      col.set([b, b, b * (.9 + rnd() * .2)], i * 3);
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3));
    const m = new T.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false, transparent: true, opacity: .85, toneMapped: false });
    owned.push(g, m);
    const pts = new T.Points(g, m); pts.name = 'arena-stars'; pts.renderOrder = -9; pts.frustumCulled = false;
    return pts;
  }

  function glowTexture(owned) {
    if (!hasCanvas) return null;
    const c = canvas(128, 128), x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.18, 'rgba(235,244,255,.75)'); g.addColorStop(.45, 'rgba(170,205,255,.22)'); g.addColorStop(1, 'rgba(120,170,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; owned.push(t); return t;
  }

  // One LED strip texture per arena: brand handle between the competing sides' colours.
  function ledTexture(sides, brand, owned) {
    if (!hasCanvas) return null;
    const cell = 512, items = [];
    for (const s of sides) { items.push({ kind: 'team', side: s }); items.push({ kind: 'brand' }); }
    const c = canvas(cell * items.length, 64), x = c.getContext('2d');
    items.forEach((it, i) => {
      const x0 = i * cell;
      if (it.kind === 'brand') {
        x.fillStyle = '#05101a'; x.fillRect(x0, 0, cell, 64);
        x.fillStyle = '#f2f6f8'; x.font = '700 38px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(String(brand?.instagram || '@next90sim'), x0 + cell / 2, 34);
        x.fillStyle = '#35d07f'; x.fillRect(x0 + 40, 6, cell - 80, 3); x.fillRect(x0 + 40, 55, cell - 80, 3);
      } else {
        const team = it.side.team || {}, a = css(team.kit?.shirt ?? team.primary ?? 0x224466), b = css(team.kit?.stripe ?? team.secondary ?? 0xffffff);
        x.fillStyle = a; x.fillRect(x0, 0, cell, 64);
        x.fillStyle = b; x.fillRect(x0, 0, cell, 5); x.fillRect(x0, 59, cell, 5);
        const lum = new T.Color(a).getHSL({ h: 0, s: 0, l: 0 }).l;
        x.fillStyle = lum > .55 ? '#0a1016' : '#ffffff'; x.font = '700 34px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle';
        let label = String(it.side.isTeam ? it.side.name : (it.side.label || it.side.name) || '').toUpperCase();
        while (label.length > 3 && x.measureText(label).width > cell - 44) label = label.slice(0, -2);
        x.fillText(label, x0 + cell / 2, 34);
      }
    });
    // LED pixel grid
    x.fillStyle = 'rgba(0,0,0,.20)'; for (let y = 0; y < 64; y += 4) x.fillRect(0, y, c.width, 1);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = T.RepeatWrapping; t.anisotropy = 4; owned.push(t);
    t.userData = { metres: items.length * 6 }; // each cell spans 6 m of board
    return t;
  }

  // Distant supporters: light bodies/heads on dark concrete, tinted per sector by vertex colour.
  function crowdTexture(owned) {
    if (!hasCanvas) return null;
    let s = 4211; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const c = canvas(512, 256), x = c.getContext('2d'); x.fillStyle = '#1b2026'; x.fillRect(0, 0, 512, 256);
    for (let row = 0; row < 8; row++) {
      const y = 256 - (row + 1) * 32; x.fillStyle = '#11151a'; x.fillRect(0, y + 27, 512, 5);
      for (let i = 0; i < 13; i++) {
        if (rnd() < .06) continue;
        const px = i * (512 / 13) + 6 + rnd() * 8, shade = 120 + Math.floor(rnd() * 135), up = rnd() < .18 ? 5 : 0, w = 20 + rnd() * 5;
        x.fillStyle = `rgb(${shade},${shade},${shade})`; x.beginPath(); x.roundRect(px, y + 11 - up, w, 17, 5); x.fill();
        if (up) { x.fillRect(px - 3, y - 2, 4, 15); x.fillRect(px + w - 1, y - 2, 4, 15); }
        x.fillStyle = rnd() < .5 ? '#e3ccb8' : '#a58670'; x.beginPath(); x.arc(px + w / 2, y + 6 - up, 6, 0, Math.PI * 2); x.fill();
      }
    }
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = T.RepeatWrapping; t.anisotropy = 4; owned.push(t); return t;
  }

  function create(root, layout, sides, opt = {}) {
    const owned = [], group = new T.Group(); group.name = 'arena-venue'; root.add(group);
    const mesh = (g, m, x = 0, y = 0, z = 0, parent = group) => { owned.push(g, m); const o = new T.Mesh(g, m); o.position.set(x, y, z); parent.add(o); return o; };
    const std = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: .85, ...extra });

    group.add(skyDome(owned), stars(owned));

    // Surround: a darker turf apron between the boards and the terraces (ring, no overlap with the pitch).
    const outer = ring(layout, 3.5), shape = new T.Shape(), hole = new T.Path();
    outer.forEach((p, i) => i ? shape.lineTo(p.x, -p.z) : shape.moveTo(p.x, -p.z)); shape.closePath();
    layout.vertices.forEach((p, i) => i ? hole.lineTo(p.x, -p.z) : hole.moveTo(p.x, -p.z)); hole.closePath(); shape.holes.push(hole);
    const apronGeo = new T.ShapeGeometry(shape), apronMat = std(0x173c22, { roughness: 1, envMapIntensity: .2 });
    if (opt.turfMap) { apronMat.map = opt.turfMap; const uv = apronGeo.attributes.uv, pos = apronGeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 8, pos.getY(i) / 8); }
    const apron = mesh(apronGeo, apronMat, 0, .004, 0); apron.rotation.x = -Math.PI / 2; apron.receiveShadow = true; apron.name = 'arena-apron';

    // LED faces on the inner side of every perimeter board piece.
    const led = ledTexture(sides, opt.brand, owned), ledFaces = [];
    if (led) {
      for (const edge of layout.boundaries) {
        const gap = layout.goals.find(g => Math.abs(g.nx - edge.nx) < 1e-6 && Math.abs(g.nz - edge.nz) < 1e-6);
        const length = Math.hypot(edge.b.x - edge.a.x, edge.b.z - edge.a.z), tx = (edge.b.x - edge.a.x) / length, tz = (edge.b.z - edge.a.z) / length;
        const pieces = gap ? [[0, (length - gap.width) / 2 - .14], [(length + gap.width) / 2 + .14, length]] : [[0, length]];
        for (const [start, end] of pieces) {
          if (end - start < .6) continue;
          const g = new T.PlaneGeometry(end - start, .36), uv = g.attributes.uv, u0 = start / led.userData.metres, u1 = end / led.userData.metres;
          for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) < .5 ? u0 : u1);
          const m = new T.MeshBasicMaterial({ map: led, toneMapped: false, fog: false });
          const mid = (start + end) / 2, face = mesh(g, m, edge.a.x + tx * mid - edge.nx * .075, .31, edge.a.z + tz * mid - edge.nz * .075);
          face.rotation.y = Math.atan2(-edge.nx, -edge.nz); face.name = 'arena-led-board'; ledFaces.push(face);
        }
      }
    }

    // Upper tier: a sloped bowl of distant supporters behind the modelled terraces.
    // Each straight section can be hidden separately when the camera is behind it.
    const tiers = [], inner = ring(layout, 9.35), outerTop = ring(layout, 16.2), crowdMap = crowdTexture(owned);
    const tierMat = new T.MeshBasicMaterial({ color: crowdMap ? 0x8f979f : 0x1a2630, map: crowdMap, vertexColors: true, toneMapped: false, fog: false });
    const fasciaMat = std(0x121c26, { roughness: .7 }), ribbonMat = new T.MeshBasicMaterial({ color: 0xcfe6ff, toneMapped: false, fog: false });
    owned.push(tierMat);
    const base = layout.count === 2 ? 0 : -Math.PI / 2, sector = Math.PI * 2 / layout.count, tint = new T.Color();
    const teamAt = (x, z) => { let a = Math.atan2(z, x) - base + sector / 2; a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); return Math.min(layout.count - 1, Math.floor(a / sector)); };
    layout.boundaries.forEach((edge, i) => {
      const n = layout.boundaries.length, a0 = inner[i], a1 = inner[(i + 1) % n], b0 = outerTop[i], b1 = outerTop[(i + 1) % n];
      const len = Math.hypot(a1.x - a0.x, a1.z - a0.z), cuts = Math.max(1, Math.ceil(len / 2.2)), pos = [], uv = [], col = [];
      for (let j = 0; j < cuts; j++) {
        const u0 = j / cuts, u1 = (j + 1) / cuts, P = (p, q, u, y) => [p.x + (q.x - p.x) * u, y, p.z + (q.z - p.z) * u];
        const q = [P(a0, a1, u0, 3.95), P(a0, a1, u1, 3.95), P(b0, b1, u1, 9.6), P(b0, b1, u0, 9.6)], t = [[u0 * len / 6, 0], [u1 * len / 6, 0], [u1 * len / 6, 1], [u0 * len / 6, 1]];
        const team = sides[teamAt((q[0][0] + q[1][0]) / 2, (q[0][2] + q[1][2]) / 2)]?.team || {};
        tint.set(team.kit?.shirt ?? team.primary ?? 0x8899aa); const hsl = tint.getHSL({ h: 0, s: 0, l: 0 }); tint.setHSL(hsl.h, hsl.s * .85, Math.min(.72, Math.max(.34, hsl.l)));
        const ux = q[1][0] - q[0][0], uz = q[1][2] - q[0][2], wx = q[3][0] - q[0][0], wz = q[3][2] - q[0][2], order = uz * wx - ux * wz > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2];
        for (const k of order) { pos.push(...q[k]); uv.push(...t[k]); col.push(tint.r, tint.g, tint.b); }
      }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
      const part = new T.Group(); part.name = 'arena-upper-tier'; group.add(part);
      const slope = mesh(g, tierMat, 0, 0, 0, part); 
      const dx = b1.x - b0.x, dz = b1.z - b0.z, top = Math.hypot(dx, dz), yaw = -Math.atan2(dz, dx), mx = (b0.x + b1.x) / 2, mz = (b0.z + b1.z) / 2;
      mesh(new T.BoxGeometry(top + .5, 1.5, .5), fasciaMat, mx, 10.3, mz, part).rotation.y = yaw;
      mesh(new T.BoxGeometry(top + .3, .09, .08), ribbonMat, mx - edge.nx * .3, 9.62, mz - edge.nz * .3, part).rotation.y = yaw;
      part.userData.edge = { nx: edge.nx, nz: edge.nz, d: edge.d + 9.35 }; tiers.push(part);
    });

    // Floodlight masts behind the terraces.
    const masts = [], corners = ring(layout, 17.6), step = layout.count === 2 ? 1 : 2, glow = glowTexture(owned);
    const poleMat = std(0x3b4652, { metalness: .6, roughness: .45 }), headMat = std(0x1a222b, { metalness: .4, roughness: .6 }), lampMat = new T.MeshBasicMaterial({ color: 0xf4f8ff, toneMapped: false, fog: false });
    const lampGeo = new T.CircleGeometry(.17, 10); owned.push(lampGeo, lampMat);
    for (let i = 0; i < corners.length; i += step) {
      const p = corners[i], d = Math.hypot(p.x, p.z) || 1, mast = new T.Group(); mast.position.set(p.x, 0, p.z); mast.name = 'arena-floodlight'; group.add(mast);
      const height = 19 + layout.apothem * .22;
      mesh(new T.CylinderGeometry(.16, .26, height, 10), poleMat, 0, height / 2, 0, mast);
      const head = new T.Group(); head.position.set(0, height + .5, 0); head.rotation.y = Math.atan2(-p.x, -p.z); mast.add(head);
      const tilt = new T.Group(); tilt.rotation.x = .42; head.add(tilt);
      mesh(new T.BoxGeometry(3.4, 2.0, .28), headMat, 0, 0, 0, tilt);
      const lamps = new T.InstancedMesh(lampGeo, lampMat, 28), dummy = new T.Object3D(); lamps.name = 'arena-floodlight-lamps';
      for (let j = 0; j < 28; j++) { dummy.position.set(-1.38 + (j % 7) * .46, .66 - Math.floor(j / 7) * .44, .15); dummy.updateMatrix(); lamps.setMatrixAt(j, dummy.matrix); }
      tilt.add(lamps);
      if (glow) { const sm = new T.SpriteMaterial({ map: glow, blending: T.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false, transparent: true, opacity: .9 }); owned.push(sm); const sprite = new T.Sprite(sm); sprite.scale.set(13, 13, 1); sprite.position.set(0, 0, .5); tilt.add(sprite); mast.userData.glow = sprite; }
      mast.userData.outward = { x: p.x / d, z: p.z / d }; masts.push(mast);
    }

    return {
      group, masts, tiers, ledFaces, hasLed: !!led,
      update(time) { if (led) led.offset.x = (time * .035) % 1; },
      // Hide a mast only while it stands between the camera and the pitch (never block the action).
      cull(camera) {
        const cx = camera.position.x, cz = camera.position.z, cy = camera.position.y, len = Math.hypot(cx, cz) || 1;
        for (const mast of masts) {
          const px = mast.position.x, pz = mast.position.z, u = (px * cx + pz * cz) / (len * len), off = Math.hypot(px - cx * u, pz - cz * u);
          mast.visible = !(u > .15 && u < 1.25 && off < 7);
        }
        // Dolls-house cutaway: a tier section never stands between the lens and the pitch.
        for (const part of tiers) { const e = part.userData.edge; part.visible = cx * e.nx + cz * e.nz < e.d - 8.2; }
      },
      dispose() { group.traverse(o => { if (o.isInstancedMesh) o.dispose(); }); group.removeFromParent(); for (const res of new Set(owned)) res.dispose?.(); }
    };
  }
  return { create, ring };
});
