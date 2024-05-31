
function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(80, 2, 0.1, 50000);
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#canvas1"),
  });

  const arjs = new THREEx.LocationBased(scene, camera, { gpsMinAccuracy: 30 });
  const cam = new THREEx.WebcamRenderer(renderer, "#video1");

  const mouseStep = THREE.MathUtils.degToRad(5);

  //const video = document.getElementById("videotexture");
  //const texture = new THREE.VideoTexture(video);
  //texture.colorSpace = THREE.SRGBColorSpace;

  let orientationControls;

  // Orientation controls only work on mobile device
  if (isMobile()) {
    orientationControls = new THREEx.DeviceOrientationControls(camera);
  }

  let fake = null;
  let first = true;

  arjs.on("gpsupdate", (pos) => {
    if (first) {
      setupObjects(pos.coords.longitude, pos.coords.latitude);
      first = false;
    }
  });

  arjs.on("gpserror", (code) => {
    alert(`GPS error: code ${code}`);
  });

  let meshes = [];
  // Uncomment to use a fake GPS location
  // fake = { lat: 51.05, lon: -0.72 };
  if (fake) {
    arjs.fakeGps(fake.lon, fake.lat);
  } else {
    arjs.startGps();
  }

  let mousedown = false,
    lastX = 0;

  // Mouse events for testing on desktop machine
  if (!isMobile()) {
    window.addEventListener("mousedown", (e) => {
      mousedown = true;
    });

    window.addEventListener("mouseup", (e) => {
      mousedown = false;
    });

    window.addEventListener("mousemove", (e) => {
      if (!mousedown) return;
      if (e.clientX < lastX) {
        camera.rotation.y += mouseStep;
        if (camera.rotation.y < 0) {
          camera.rotation.y += 2 * Math.PI;
        }
      } else if (e.clientX > lastX) {
        camera.rotation.y -= mouseStep;
        if (camera.rotation.y > 2 * Math.PI) {
          camera.rotation.y -= 2 * Math.PI;
        }
      }
      lastX = e.clientX;
    });
  }

  function isMobile() {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      // true for mobile device
      return true;
    }
    return false;
  }

  function render(time) {
    resizeUpdate();
    if (orientationControls) orientationControls.update();
    cam.update();
    renderer.render(scene, camera);

    for (const m of meshes) {
      m.lookAt(camera.position);
    }

    requestAnimationFrame(render);
  }

  function resizeUpdate() {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth,
      height = canvas.clientHeight;
    if (width != canvas.width || height != canvas.height) {
      renderer.setSize(width, height, false);
    }
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  function setupObjects(longitude, latitude) {

    console.log('setupObjects')

    const geom = new THREE.PlaneGeometry(80, 60);

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
     // map: texture,
    });
    const material2 = new THREE.MeshBasicMaterial({
      color: 0xffff00,
     // map: texture,
    });
    const material3 = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      //map: texture,
    });
    const material4 = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
     // map: texture,
    });

    const m1 = new THREE.Mesh(geom, material);
    meshes.push(m1);
    arjs.add(m1, longitude, latitude + 0.002); // slightly north
    const m2 = new THREE.Mesh(geom, material2);
    meshes.push(m2);
    arjs.add(m2, longitude, latitude - 0.002); // slightly south
    const m3 = new THREE.Mesh(geom, material3);
    meshes.push(m3);
    arjs.add(m3, longitude - 0.001, latitude); // slightly west
    const m4 = new THREE.Mesh(geom, material4);
    meshes.push(m4);
    arjs.add(m4, longitude + 0.001, latitude); // slightly east
  }

  requestAnimationFrame(render);
}

main();
