import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

(() => {
    const objectParameters = {
        renderer: null,
        scene: null,
        camera: null,
        controls: null,
        car: null,
        canvasId: "household",
        shouldStartTheAnimation: false,
        shouldSubstractFromTheCoordinates: false,
    }

    setupThreeJsGraphics(objectParameters.canvasId);
    loadObject();
    animate();

    setTimeout(changeLoadedObjectState, 2000);

    function changeLoadedObjectState() {
        objectParameters.shouldStartTheAnimation = true;
    }

    function setupThreeJsGraphics(canvasIdSelector) {
        // set renderer
        {
            const canvas = document.getElementById(canvasIdSelector);

            const renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: true,
            });

            renderer.setPixelRatio(window.devicePixelRatio);

            objectParameters.renderer = renderer;
        }

        // set scene
        {
            const scene = new THREE.Scene();
            scene.name = "Explode";

            objectParameters.scene = scene;
        }

        // set camera
        {
            const fov = 50;
            const aspect = window.innerWidth / window.innerHeight;
            const near = 1;
            const far = 1000;

            const explodeWallCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            explodeWallCamera.position.set(-40, 30, 50);
            explodeWallCamera.rotation.set(0, 0, 0);

            explodeWallCamera.lookAt(0, 0, 0);

            let horizontalFov = 40;

            if (window.innerHeight > window.innerWidth) {
                horizontalFov /= window.innerHeight / window.innerWidth
            }

            explodeWallCamera.fov =
                (Math.atan(
                    Math.tan(((horizontalFov / 2) * Math.PI) / 180) /
                    explodeWallCamera.aspect
                ) * 2 * 180) / Math.PI;

            objectParameters.camera = explodeWallCamera;

            objectParameters.scene.add(explodeWallCamera);
        }

        // set controls
        {
            const controls = new OrbitControls(objectParameters.camera, objectParameters.renderer.domElement);
            controls.target.set(0, 0, 0);
            controls.update();

            objectParameters.controls = controls;
        }

        // set lights
        {
            {
                const skyColor = new THREE.Color("rgb(115, 145, 155)");
                const groundColor = new THREE.Color("rgb(80, 115, 130)");
                const intensity = 1;
                const light = new THREE.HemisphereLight(
                    skyColor,
                    groundColor,
                    intensity
                );

                objectParameters.scene.add(light);
            }

            {
                const color = new THREE.Color("rgb(100, 100, 100)");
                const intensity = 2.5;
                const light = new THREE.DirectionalLight(color, intensity);

                light.castShadow = true;
                light.position.set(-30, 80, 60);
                light.target.position.set(0, 0, 0);
                objectParameters.scene.add(light);
                objectParameters.scene.add(light.target);
            }
        }
    }

    function loadObject() {
        const addCarToScene = (rootScene) => {
            var car = rootScene
                .children[0]
                .children[0]
                .children[0]
                .children.filter(mech => mech.name === "Car_31")[0];

            const logoObject = new THREE.Object3D();
            logoObject.add(car);

            logoObject.name = "Car";
            logoObject.position.set(-11, 0, -1);
            objectParameters.scene.add(logoObject);

            objectParameters.car = logoObject;
        }

        addCarToScene.bind(this);

        const objLoader = new GLTFLoader();
        const path = "./assets/objects/autumn_house.glb";

        objLoader.load(path, gltf => {
            const rootScene = gltf.scene;

            addCarToScene(rootScene);
            objectParameters.scene.add(rootScene);
        })
    }

    function resizeRendererToDisplaySize() {
        const canvas = objectParameters.renderer.domElement;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            objectParameters.renderer.setSize(width, height, false);
        }

        return needResize;
    }

    function animate() {
        if (resizeRendererToDisplaySize()) {
            const canvas = objectParameters.renderer.domElement;

            objectParameters.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            objectParameters.camera.updateProjectionMatrix();     
        }

        if (objectParameters.shouldStartTheAnimation && objectParameters.car !== null) {
            let coordinatesToAddToThePositionOfTheObject = 0.1;
            if (objectParameters.shouldSubstractFromTheCoordinates == false) {
               coordinatesToAddToThePositionOfTheObject = -0.1;
            }
            objectParameters.car.position.z += coordinatesToAddToThePositionOfTheObject;

            if (objectParameters.car.position.z < -18) {
                objectParameters.shouldRotate = true;
                objectParameters.shouldSubstractFromTheCoordinates = true;
            } else if (objectParameters.car.position.z > -1) {
                objectParameters.shouldRotate = true;
                objectParameters.shouldSubstractFromTheCoordinates = false;
            }

            if  (objectParameters.shouldRotate) {
                objectParameters.car.children[0].rotateY(Math.PI);
                objectParameters.shouldRotate = false;

                let newPositionX = -11;
                if (objectParameters.shouldSubstractFromTheCoordinates) {
                    newPositionX = -13.5;
                }
                objectParameters.car.position.x = newPositionX; 
            } 
        }

        objectParameters.renderer.render(objectParameters.scene, objectParameters.camera);
        objectParameters.requestID = window.requestAnimationFrame(animate);
    }
})();
