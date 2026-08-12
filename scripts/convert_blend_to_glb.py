import os
import sys

"""
Blender Background Batch Export Script (.blend -> .glb)
Usage:
  blender --background --python scripts/convert_blend_to_glb.py -- <input_folder_or_file> <output_folder>
"""

def export_blend_to_glb(blend_path, output_glb_path):
    import bpy

    # Reset Blender Scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Open Blend file
    bpy.ops.wm.open_mainfile(filepath=blend_path)
    
    print(f"📦 Exporting {blend_path} -> {output_glb_path}")

    # Export to GLB with Draco compression
    bpy.ops.export_scene.gltf(
        filepath=output_glb_path,
        export_format='GLB',
        export_apply=True,
        export_yup=True
    )
    print(f" Exported successfully: {output_glb_path}")

if __name__ == '__main__':
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    
    input_dir = args[0] if len(args) > 0 else "assets"
    output_dir = args[1] if len(args) > 1 else "client/public/assets/campus"

    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    if os.path.isfile(input_dir) and input_dir.endswith('.blend'):
        filename = os.path.basename(input_dir).replace('.blend', '.glb')
        export_blend_to_glb(input_dir, os.path.join(output_dir, filename))
    elif os.path.isdir(input_dir):
        for root, _, files in os.walk(input_dir):
            for file in files:
                if file.endswith('.blend'):
                    blend_path = os.path.join(root, file)
                    filename = file.replace('.blend', '.glb')
                    export_blend_to_glb(blend_path, os.path.join(output_dir, filename))
