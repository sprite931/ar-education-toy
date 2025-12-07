# 3D Models for AR Bear App

Place your `.glb` or `.gltf` files here.

## Recommended Free Sources

1. **Sketchfab** (https://sketchfab.com/search?type=models&features=downloadable&sort_by=-likeCount)
   - Filter by "Downloadable" and choose GLB format
   - Look for: butterflies, ladybugs, bees, flowers, animals

2. **Poly Pizza** (https://poly.pizza)
   - Free low-poly 3D models
   - Perfect for AR (small file sizes)

3. **Kenney Assets** (https://kenney.nl/assets)
   - Free game assets including 3D models

## How to Use

1. Download a `.glb` file
2. Place it in this folder
3. Reference it in index.html like:
   ```html
   <a-entity gltf-model="url(assets/models/butterfly.glb)" scale="0.5 0.5 0.5"></a-entity>
   ```

## File Size Tips

- Keep models under 2MB for fast loading
- Low-poly models work best for mobile AR
- GLB format is preferred (single file, compressed)
