# v73 goal celebration clips

Two real, freely redistributable CC0 source animations are retargeted to the football players' upper bodies. These are not FIFA or EA FC animations. Player appearances, movement paths, foot contacts and match outcomes are engine-owned.

* **Cheer**, Kay Lousberg / KayKit Character Pack Adventurers 1.0, official repository: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 . Extracted from `addons/kaykit_character_pack_adventures/Characters/gltf/Knight.glb`. Source license: `KayKit-LICENSE.txt`.
* **Dance_Loop**, Quaternius Universal Animation Library, free Standard edition: https://quaternius.com/packs/universalanimationlibrary.html . Source glTF conversion: https://github.com/J-Ponzo/gltf-universal-animation-library , `glTF/AnimationLibrary_Godot_Standard.gltf` and `.bin`. Source license: `Quaternius-CC0.txt`.

Downloaded 2026-10-27. `clips.json` contains sampled normalized upper/lower-arm directions at 30 Hz, interpolated at render time (including 60 FPS output). Meshes and fantasy equipment are not imported. Each arm is solved independently in the common torso frame, preserving the engine's leg IK and player scale. The dance uses its matching start/end pose for a continuous native loop; Cheer reaches and holds its final pose. Solo moves blend in/out and complete before the group phase. Group actors use staggered starts and different actions. Existing football-specific procedural celebrations remain in the rotation.

Rebuild with `node tools/celebrations/convert.cjs SOURCE_FOLDER assets/animations/celebrations/clips.json`, with the three source model/buffer files in SOURCE_FOLDER. The source assets are not needed at runtime. Original copyright/license texts accompany the converted tracks.
