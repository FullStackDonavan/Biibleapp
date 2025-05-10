<template>
  <div class="relative w-full h-[80vh] overflow-hidden">
    <GameToolbar
      @update-tool="selectedTool = $event"
      @add-light="addLight"
      @save="saveWorld"
      @load="triggerLoad"
      :point-light="pointLight"
      :light-intensity="lightIntensity"
      :light-color="lightColor"
      @update-intensity="updateLightIntensity"
      @update-color="updateLightColor"
    />
    <!-- hidden file input for loading -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="onFileChange"
    />
    <canvas id="renderCanvas" class="w-full h-full block"></canvas>
    <InspectorPanel
      :objects="placedObjects"
      :light="pointLight"
      @delete="deleteObject"
      @select-object="selectObject"
      @update-object-position="onInspectorMove"
      @update-light-position="onInspectorLightMove"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders'
import GameToolbar from './GameToolbar.vue'
import InspectorPanel from './InspectorPanel.vue'

let gizmoManager;
const selectedTool    = ref('camera')
const placedObjects   = ref([])           // { type,x,y,z, mesh }
const selectedObject  = ref(null)
const pointLight      = ref(null)
const lightIntensity  = ref(1)
const lightColor      = ref('#ffffff')

let scene, engine, canvas, camera

// movement flags
let isMovingLight  = false
let lightBeingMoved = null
const isMovingObject = ref(false)

// file input reference
const fileInput = ref(null)

onMounted(() => {
  canvas = document.getElementById('renderCanvas')
  if (!canvas) return console.error('Canvas not found')

  engine = new BABYLON.Engine(canvas, true)
  scene = createScene()

  gizmoManager = new BABYLON.GizmoManager(scene)
  gizmoManager.positionGizmoEnabled = true
  gizmoManager.rotationGizmoEnabled = true
  gizmoManager.scaleGizmoEnabled = true

  engine.runRenderLoop(() => scene.render())
  window.addEventListener('resize', () => engine.resize())

  // prevent default context menu
  canvas.addEventListener('contextmenu', e => e.preventDefault())

  // drag logic
  canvas.addEventListener('pointermove', () => {
    if (isMovingObject.value && selectedObject.value) {
      const pick = scene.pick(scene.pointerX, scene.pointerY)
      if (pick.hit) {
        selectedObject.value.position.copyFrom(pick.pickedPoint)
        // reflect in inspector
        const idx = placedObjects.value.findIndex(o=>o.mesh===selectedObject.value)
        if (idx !== -1) {
          placedObjects.value[idx].x = pick.pickedPoint.x
          placedObjects.value[idx].y = pick.pickedPoint.y
          placedObjects.value[idx].z = pick.pickedPoint.z
        }
      }
    }
    if (isMovingLight && lightBeingMoved) {
      const pick = scene.pick(scene.pointerX, scene.pointerY)
      if (pick.hit) {
        lightBeingMoved.position.x = pick.pickedPoint.x
        lightBeingMoved.position.z = pick.pickedPoint.z
        // reflect inspector
        pointLight.value.position.copyFrom(lightBeingMoved.position)
      }
    }
  })

  canvas.addEventListener('pointerdown', () => {
    const pick = scene.pick(scene.pointerX, scene.pointerY)
    if (!pick.hit) return

    selectedObject.value = pick.pickedMesh

    if (selectedTool.value === 'move') {
      if (selectedObject.value === pointLight.value) {
        lightBeingMoved = pointLight.value
        isMovingLight = true
        gizmoManager.attachToMesh(null) // optional: detach for lights
      } else {
        isMovingObject.value = true
        gizmoManager.attachToMesh(selectedObject.value)
      }
      return
    }

    if (selectedTool.value === 'light') {
      if (!pointLight.value) return alert('Add a light first.')
      pointLight.value.position.set(pick.pickedPoint.x, 5, pick.pickedPoint.z)
      return
    }

    if (selectedTool.value === 'camera') {
      return // nothing to place
    }

    // create a box
    const box = BABYLON.MeshBuilder.CreateBox('box', {}, scene)
    box.position.copyFrom(pick.pickedPoint)
    const colorMap = {
      grass: '#91cc75',
      wall:  '#6e7074',
      verse: '#fac858',
      enemy:'#ee6666',
      npc:  '#73c0de'
    }

    function bindPositionSync(obj) {
      obj.mesh.onAfterWorldMatrixUpdateObservable.add(() => {
        obj.x = obj.mesh.position.x
        obj.y = obj.mesh.position.y
        obj.z = obj.mesh.position.z
      })
    }

    if (selectedTool.value === 'barrel') {
      BABYLON.SceneLoader.ImportMesh(
        null,
        '/models/',
        'barrel.glb',
        scene,
        (meshes) => {
          const barrel = meshes[0]
          barrel.position.copyFrom(pick.pickedPoint)

          const newBarrelObj = {
            type: 'barrel',
            x: barrel.position.x,
            y: barrel.position.y,
            z: barrel.position.z,
            mesh: barrel
          }
          bindPositionSync(newBarrelObj)
          placedObjects.value.push(newBarrelObj)
        }
      )
      return
    }

    const mat = new BABYLON.StandardMaterial('mat', scene)
    mat.diffuseColor = BABYLON.Color3.FromHexString(colorMap[selectedTool.value] || '#ffffff')
    box.material = mat

    const newBoxObj = {
      type: selectedTool.value,
      x: box.position.x,
      y: box.position.y,
      z: box.position.z,
      mesh: box
    }
    bindPositionSync(newBoxObj)
    placedObjects.value.push(newBoxObj)
  })


  canvas.addEventListener('pointerup', () => {
    isMovingLight = false
    isMovingObject.value = false
  })

})




// when toolbar “Load” clicked:
function triggerLoad() {
  fileInput.value.value = null
  fileInput.value.click()
}

// on file chosen:
function onFileChange(ev) {
  const file = ev.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result)
      loadWorld(data)
    } catch (err) {
      console.error('Invalid JSON', err)
    }
  }
  reader.readAsText(file)
}

// clear & restore everything
function createShadowGenerator(light) {
  // Create a shadow generator
  const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
  shadowGenerator.usePoissonSampling = true; // Optional: smooth shadows

  return shadowGenerator;
}

// scene + camera
function createScene() {
  const s = new BABYLON.Scene(engine)

  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 20, height: 20 }, s)
  ground.receiveShadows = true; // ✅ important!

  camera = new BABYLON.ArcRotateCamera('Camera', Math.PI/2, Math.PI/4, 20, BABYLON.Vector3.Zero(), s)
  camera.attachControl(canvas, true)

  const light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), s)
  light.position = new BABYLON.Vector3(10, 10, 10)
  pointLight.value = light

  // ✅ Global shadow generator
  const shadowGenerator = new BABYLON.ShadowGenerator(1024, light)
  shadowGenerator.usePoissonSampling = true
  shadowGenerator.bias = 0.0001
  shadowGenerator.normalBias = 0.002

  // Store globally for later use (optional)
  s.shadowGenerator = shadowGenerator

  return s
}

// Move updateObjectRecord out of the loadWorld function to make it accessible globally.
function updateObjectRecord(box) {
  box.onAfterWorldMatrixUpdateObservable.add(() => {
    const obj = placedObjects.value.find(o => o.mesh === box);
    if (obj) {
      obj.x = box.position.x;
      obj.y = box.position.y;
      obj.z = box.position.z;
    }
  });
}

function loadWorld(data) {
  // Dispose everything except camera, light, and ground
  scene.meshes.slice().forEach(mesh => {
    if (mesh !== camera && mesh !== pointLight.value && mesh.name !== 'ground') {
      mesh.dispose();
    }
  });
  placedObjects.value.length = 0;

  // Create and initialize shadow generator
  let shadowGenerator = null;

  // Restore camera
  if (data.camera) {
    camera.alpha = data.camera.alpha;
    camera.beta = data.camera.beta;
    camera.radius = data.camera.radius;
    camera.setTarget(new BABYLON.Vector3(data.camera.target.x, data.camera.target.y, data.camera.target.z));

    // Ensure camera settings are applied correctly before the first render
    if (data.camera) {
      camera.alpha = data.camera.alpha;
      camera.beta = data.camera.beta;
      camera.radius = data.camera.radius;
      camera.setTarget(new BABYLON.Vector3(
        data.camera.target.x,
        data.camera.target.y,
        data.camera.target.z
      ));
    }

  }

  // Restore light, if any
  if (data.light) {
    addLight();
    pointLight.value.position.set(data.light.x, data.light.y, data.light.z);
    lightIntensity.value = data.light.intensity;
    lightColor.value = data.light.color;
    pointLight.value.intensity = data.light.intensity;
    pointLight.value.diffuse = BABYLON.Color3.FromHexString(data.light.color);
    pointLight.value.specular = BABYLON.Color3.FromHexString(data.light.color);

    // Create a shadow generator for the light
    shadowGenerator = new BABYLON.ShadowGenerator(1024, pointLight.value);
    shadowGenerator.usePoissonSampling = true;
    shadowGenerator.bias = 0.0001;
    shadowGenerator.normalBias = 0.002;
  }

  // Restore objects
  data.objects?.forEach(o => {
    if (o.type === 'barrel') {
      // Load barrel model
      BABYLON.SceneLoader.ImportMesh(
        null,
        '/models/',
        'barrel.glb',
        scene,
        (meshes) => {
          const barrel = meshes[0];
          barrel.position.set(o.x, o.y, o.z);
          barrel.rotation.set(o.rotation.x, o.rotation.y, o.rotation.z);
          barrel.scaling.set(o.scale.x, o.scale.y, o.scale.z);

          barrel.receiveShadows = true;

          // Add the barrel to placed objects
          placedObjects.value.push({
            type: 'barrel',
            x: barrel.position.x,
            y: barrel.position.y,
            z: barrel.position.z,
            mesh: barrel
          });

          // Add to shadow generator
          if (shadowGenerator) {
            shadowGenerator.addShadowCaster(barrel);
          }

          // Call updateObjectRecord here
          updateObjectRecord(barrel); // This will sync position when the barrel's matrix updates
        }
      );
    } else {
      // Load basic box for other objects
      const box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);
      box.position.set(o.x, o.y, o.z);
      box.rotation.set(o.rotation.x, o.rotation.y, o.rotation.z);
      box.scaling.set(o.scale.x, o.scale.y, o.scale.z);

      const mat = new BABYLON.StandardMaterial("mat", scene);
      const colorMap = {
        grass: "#91cc75",
        wall: "#6e7074",
        verse: "#fac858",
        enemy: "#ee6666",
        npc: "#73c0de"
      };
      mat.diffuseColor = BABYLON.Color3.FromHexString(colorMap[o.type] || "#ffffff");
      box.material = mat;

      box.receiveShadows = true;

      placedObjects.value.push({
        type: o.type,
        x: o.x,
        y: o.y,
        z: o.z,
        mesh: box
      });

      // Add to shadow generator
      if (shadowGenerator) {
        shadowGenerator.addShadowCaster(box);
      }

      // Call updateObjectRecord here
      updateObjectRecord(box); // This will sync position when the box's matrix updates
    }
  });
}





  function saveWorld() {
  console.log("Saving world...");

  // Log the camera data to check if it's correct
  console.log("Camera Alpha:", camera.alpha);
  console.log("Camera Beta:", camera.beta);
  console.log("Camera Radius:", camera.radius);
  console.log("Camera Target:", camera.target);

  // build camera data
  const cameraData = {
    alpha:  camera.alpha,
    beta:   camera.beta,
    radius: camera.radius,
    target: {
      x: camera.target.x,
      y: camera.target.y,
      z: camera.target.z
    }
  };

  // build light data (if any)
  let lightData = null;
  if (pointLight.value) {
    const { r, g, b } = pointLight.value.diffuse;
    const hexColor = `#${[r, g, b]
      .map(v => Math.round(v * 255).toString(16).padStart(2, '0'))
      .join('')}`;

    lightData = {
      x: pointLight.value.position.x,
      y: pointLight.value.position.y,
      z: pointLight.value.position.z,
      intensity: pointLight.value.intensity,
      color: hexColor
    };
  }

  // build objects array with position, rotation, and scale
  const objectsData = placedObjects.value.map(o => ({
    type: o.type,
    x: o.x,
    y: o.y,
    z: o.z,
    rotation: { x: o.mesh.rotation.x, y: o.mesh.rotation.y, z: o.mesh.rotation.z },
    scale: { x: o.mesh.scaling.x, y: o.mesh.scaling.y, z: o.mesh.scaling.z }
  }));

  // Log the objects data to check if it's correct
  console.log("Placed Objects:", objectsData);

  const worldData = {
    camera: cameraData,
    light: lightData,
    objects: objectsData
  };

  // Convert the world data to JSON
  const json = JSON.stringify(worldData);
  console.log("Saving JSON:", json);  // Log the JSON for debugging

  // Create the Blob and download the file
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'world.json';
  link.click();
}




// inspector “move” from fields:
function onInspectorMove({ index, x,y,z }) {
  const o = placedObjects.value[index]
  o.mesh.position.set(x,y,z)
  o.x=x; o.y=y; o.z=z
}
function onInspectorLightMove({ x,y,z }) {
  if (pointLight.value) {
    pointLight.value.position.set(x,y,z)
  }
}

// toolbar handling for light & object delete/select...
function addLight() {
  pointLight.value = new BABYLON.PointLight('light', new BABYLON.Vector3(5,5,5), scene)
  pointLight.value.intensity = lightIntensity.value
  pointLight.value.diffuse   = BABYLON.Color3.FromHexString(lightColor.value)
}
function updateLightIntensity(v) {
  lightIntensity.value = v
  if (pointLight.value) pointLight.value.intensity = +v
}
function updateLightColor(c) {
  lightColor.value = c
  if (pointLight.value) pointLight.value.diffuse = BABYLON.Color3.FromHexString(c)
}
function deleteObject(i) {
  const o = placedObjects.value.splice(i,1)[0]
  o.mesh.dispose()
}
function selectObject(o) {
  selectedObject.value = o.object || o
}

// watch camera tool toggle...
watch(selectedTool, tool => {
  if (tool === 'move' || tool === 'light') {
    camera.detachControl(canvas)
  } else {
    camera.attachControl(canvas,true)
  }
})
</script>
