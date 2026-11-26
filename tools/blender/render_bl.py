#!/usr/bin/env python3
"""Render an exported episode scene in Blender (bpy module, pip install bpy) — media 2026-11-27.
  render_bl.py EXPDIR OUTDIR [--engine cycles] [--samples 64] [--scale 1.0] [--frames 0-0] [--exposure 0]
Reads EXPDIR/scene.glb + frames.json (+ overlay/ov_XXXX.png), lights it with a physical sky + sun from our sun direction,
renders frames, composites our overlay (captions, tags, badge) on top → OUTDIR/bl_XXXX.jpg. Prints seconds per frame."""
import sys, os, json, time, math, argparse
import bpy, mathutils
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('exp'); ap.add_argument('out'); ap.add_argument('--engine', default='cycles'); ap.add_argument('--samples', type=int, default=64)
ap.add_argument('--scale', type=float, default=1.0); ap.add_argument('--frames', default='0-0'); ap.add_argument('--exposure', type=float, default=0.0); ap.add_argument('--sun', type=float, default=3.0)
o = ap.parse_args(); os.makedirs(o.out, exist_ok=True)
J = json.load(open(os.path.join(o.exp, 'frames.json'))); F = J['frames']
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(o.exp, 'scene.glb'))
sc = bpy.context.scene
# drop sky domes / huge backdrops from the three.js look (Blender lights the world itself)
for ob in list(bpy.data.objects):
    if ob.type == 'MESH' and max(ob.dimensions) > 1000: bpy.data.objects.remove(ob, do_unlink=True)
CV = mathutils.Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))    # three (y-up) world → Blender (z-up) world
v3 = lambda a: mathutils.Vector((a[0], -a[2], a[1]))
# camera
cd = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cd); sc.collection.objects.link(cam); sc.camera = cam; cd.sensor_fit = 'VERTICAL'
# world: physical sky + sun lamp along our sun direction
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; bg = nt.nodes['Background']
sky = nt.nodes.new('ShaderNodeTexSky'); nt.links.new(sky.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = .35
sd = v3(F[0]['sun']['dir']).normalized(); el = math.asin(max(-1, min(1, sd.z))); az = math.atan2(sd.y, sd.x)
for attr, val in (('sun_elevation', el), ('sun_rotation', az - math.pi / 2)):
    try: setattr(sky, attr, val)
    except Exception: pass
ld = bpy.data.lights.new('sun', 'SUN'); ld.energy = o.sun; ld.angle = math.radians(2.5); ld.color = (1, .96, .9)
sun = bpy.data.objects.new('sun', ld); sc.collection.objects.link(sun); sun.rotation_euler = sd.to_track_quat('Z', 'Y').to_euler()
# render settings
r = sc.render; r.resolution_x, r.resolution_y = int(1080 * o.scale), int(1920 * o.scale); r.resolution_percentage = 100; r.image_settings.file_format = 'PNG'
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast' if 'AgX - Medium High Contrast' in [i.identifier for i in sc.view_settings.bl_rna.properties['look'].enum_items] else 'None'
sc.view_settings.exposure = o.exposure
if o.engine == 'cycles':
    r.engine = 'CYCLES'; c = sc.cycles; c.device = 'CPU'; c.samples = o.samples; c.use_adaptive_sampling = True; c.use_denoising = True
    try: c.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    c.max_bounces = 6; c.diffuse_bounces = 3; c.glossy_bounces = 3; c.transparent_max_bounces = 8
else:
    r.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in [e.identifier for e in r.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE_NEXT'
objs = {ob.name: ob for ob in bpy.data.objects}
a, b = map(int, o.frames.split('-'))
for i in range(a, b + 1):
    fr = F[i]
    M = mathutils.Matrix.LocRotScale(mathutils.Vector(fr['cam']['pos']), mathutils.Quaternion((fr['cam']['quat'][3], *fr['cam']['quat'][:3])), mathutils.Vector((1, 1, 1)))
    cam.matrix_world = CV @ M; cd.angle_y = math.radians(fr['cam']['fov'])
    # per frame: visibility (effective, from three.js) + local TRS of every object node, converted y-up → z-up the way the glTF importer does
    #   (skinned bones keep the exported pose for now — bone animation is the next step of the bridge)
    for n, v in fr['nodes'].items():
        ob = objs.get(n)
        if not ob: continue
        ob.hide_render = not v[10]
        if ob.parent is None or ob.parent.type != 'ARMATURE':
            ob.location = (v[0], -v[2], v[1]); ob.rotation_mode = 'QUATERNION'; ob.rotation_quaternion = (v[6], v[3], -v[5], v[4]); ob.scale = (v[7], v[9], v[8])
    fn = os.path.join(o.out, f'bl_{i:04d}.png'); r.filepath = fn; t0 = time.time(); bpy.ops.render.render(write_still=True); dt = time.time() - t0
    im = Image.open(fn).convert('RGBA').resize((1080, 1920), Image.LANCZOS); ov = os.path.join(o.exp, 'overlay', f'ov_{i:04d}.png')
    if os.path.exists(ov): im.alpha_composite(Image.open(ov).convert('RGBA'))
    im.convert('RGB').save(fn.replace('.png', '.jpg'), quality=90); print(f'frame {i}: {dt:.1f}s', flush=True)
