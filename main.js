import "./style.css";
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import gsap from 'gsap';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    25,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas'),
    antialias: true,
});
const loader = new RGBELoader();
loader.load("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/evening_road_01_puresky_1k.hdr",function(texture){
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    }
);



renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth,window.innerHeight);

const radius = 1.3;
const segments = 64;
const textures = ["./csilla/color.png","./earth/map.jpg","./venus/map.jpg","./volcanic/color.png"]
const orbitRadius = 4.5;
const spheres = new THREE.Group();

// Create a big sphere for the star background
const starTexture = new THREE.TextureLoader().load('./stars.jpg');
starTexture.colorSpace = THREE.SRGBColorSpace;
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starMaterial = new THREE.MeshStandardMaterial({
    map: starTexture,
    side: THREE.BackSide,
    
    opacity: 0.1
});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);

const sphereMesh = [];



for(let i = 0; i < 4; i++){

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textures[i]);
    texture.colorSpace = THREE.SRGBColorSpace;
    
    
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);
    // material.needsUpdate = true;
    sphereMesh.push(sphere);

  const angle = (i/4) * (Math.PI * 2);
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);
  spheres.add(sphere);
}
spheres.rotation.x = 0.1;
// spheres.position.x = 0.8;
spheres.position.y = -0.8;
scene.add(spheres);




camera.position.z = 9;

let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0

function throttledwhellHandler(event){
    
    const currentTime = Date.now();
    if(currentTime - lastWheelTime >= throttleDelay){

        lastWheelTime = currentTime;
        const direction = event.deltaY > 0 ? "down" : "up";
        scrollCount = (scrollCount + 1) % 4;


        const headings = document.querySelectorAll(".heading");
        gsap.to(headings,{
            duration: 1,
            y:`-=${100}%`,
            ease:"power2.inOut",
        });

        gsap.to(spheres.rotation,{
            duration: 1,
            y:`-=${Math.PI/2}`,
            ease: "power2.inOut"
        })



        if(scrollCount === 0){
            gsap.to(headings,{
                duration: 1,
                y:`0`,
                ease:"power2.inOut",
            });
        }
    }
}

window.addEventListener("wheel",throttledwhellHandler);


// setInterval(() => {
//     gsap.to(spheres.rotation, {
//         y:`+=${Math.PI/2}`,
//         duration: 2,
//         ease : "expo.easeInOut",
        
//     });
// },2000);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  for(let i = 0; i < sphereMesh.length; i++){
    const sphere = sphereMesh[i];
    sphere.rotation.y = clock.getElapsedTime()*0.01;
  }
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
