<html>
<head>
<!-- you can include other scripts here -->
<script src="http://cdnjs.cloudflare.com/ajax/libs/three.js/r69/three.js"></script>
<script src="http://threejs.org/examples/js/controls/TrackballControls.js"></script>
<script src="papertowel.json"></script>
</head>
<body>
<script>

// Globals
var radius = 2;
var camera, scene, renderer, controls;
var geometry, material, mesh;

init();

function init() {
    var contentWidth = window.innerWidth - 20;
    var contentHeight = window.innerHeight - 20;

	// Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(contentWidth, contentHeight);
    document.body.appendChild(renderer.domElement);

	// Camera 
    camera = new THREE.PerspectiveCamera(75, contentWidth / contentHeight, 1, 1000);
    moveCameraToStartPosition();
 
 	// Controls
	controls = new THREE.TrackballControls(camera, renderer.domElement);

	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.2;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = false;
	controls.dynamicDampingFactor = 0.3;

	controls.minDistance = radius * 1.1;
	controls.maxDistance = radius * 100;

	controls.keys = [ 65, 83, 68 ]; // [ rotateKey, zoomKey, panKey ]

	// Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0009);

	// Point Cloud
	createPointCloud();

	window.addEventListener('resize', onWindowResize, false);
    animate();
}

function moveCameraToStartPosition() {
    // Translation
    var translationData = dataObj['poseAtTime']['translation'];
    camera.position.set(translationData[0], translationData[1], translationData[2]);
        
    // Rotation
    console.log(dataObj['poseAtTime']['rotation']);
    var rotationData = dataObj['poseAtTime']['rotation'];
    var qm = new THREE.Quaternion();
    var destination = new THREE.Quaternion().set(rotationData[0], rotationData[1], rotationData[2], rotationData[3]);
    THREE.Quaternion.slerp(camera.quaternion, destination, qm, 0.07);
    camera.quaternion = qm;
    camera.quaternion.normalize();
}

function createPointCloud() {
    var colors = [];
    var pointSize = 0.05;
    geometry = new THREE.Geometry({dynamic:true});
    material = new THREE.PointCloudMaterial({size:pointSize, vertexColors:true});

    // Create Dataview to deal with the byte buffer
    var arrayBuffer = new ArrayBuffer(dataObj['buffer'].length);
    var vertices = new DataView(arrayBuffer);
    for(var i=0; i < dataObj['buffer'].length; i++)
         vertices.setUint8(i, dataObj['buffer'][i]);

    for(var i=0; i < vertices.byteLength/Float32Array.BYTES_PER_ELEMENT; i+=3) {
        var x = vertices.getFloat32(i * Float32Array.BYTES_PER_ELEMENT, true);
        var y = vertices.getFloat32((i + 1) * Float32Array.BYTES_PER_ELEMENT , true)
        var z = vertices.getFloat32((i + 2) * Float32Array.BYTES_PER_ELEMENT, true)
        geometry.vertices.push(new THREE.Vector3(x, y, z));
        colors.push(new THREE.Color(x, y, z));
    }

    geometry.colors = colors;

    var pointcloud = new THREE.PointCloud(geometry, material);
    scene.add(pointcloud);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

	controls.screen.width = width;
	controls.screen.height = height;

    renderer.setSize( window.innerWidth, window.innerHeight );
	animate();
}

function animate() {
    requestAnimationFrame(animate);
	controls.update();
    renderer.render(scene, camera);
}

</script>
</body>
</html>
