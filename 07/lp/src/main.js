import 'the-new-css-reset/css/reset.css';
import './style.css';
import * as THREE from "three";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
// import GUI from 'lil-gui';
// import Stats from 'stats-js';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

//GSAP
gsap.registerPlugin(ScrollTrigger);

const btn = document.querySelectorAll('.btn');
const h2 = document.querySelectorAll('.h2');
const h3 = document.querySelectorAll('.h3');
//HSVからRGBに変換する関数
function hsvToRgb(h, s, v) {
  let r, g, b;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  switch(i % 6){
    case 0: r=v; g=t; b=p; break;
    case 1: r=q; g=v; b=p; break;
    case 2: r=p; g=v; b=t; break;
    case 3: r=p; g=q; b=v; break;
    case 4: r=t; g=p; b=v; break;
    case 5: r=v; g=p; b=q; break;
  }
  return [r, g, b];
}



//FPSデバッグ
// const stats = new Stats();
// stats.showPanel(0);
// document.body.appendChild(stats.dom);

//シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

//カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 5;
scene.add(camera);

//周囲光
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);


//パーティクル
const texture = new THREE.TextureLoader().load("images/texture.png")

const bufferGeometry = new THREE.BufferGeometry();
const count = 2000;
const vertices = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  vertices[i] = (Math.random() -0.5) * 20;
  colors[i] = Math.random();
}

bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
bufferGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));


const pointsMaterial = new THREE.PointsMaterial({
	size: 0.05,
  sizeAttenuation: true,
  vertexColors:true,
  alphaMap: texture,
  transparent: true,
  depthWrite: false,
  blending:THREE.AdditiveBlending,
})

const particles = new THREE.Points(
	bufferGeometry,
	pointsMaterial
);
scene.add(particles);

const fluffyCount = 300;
const fluffyGeometry = new THREE.BufferGeometry();
const fluffyVertices = new Float32Array(fluffyCount * 3);
const fluffySpeeds = new Float32Array(fluffyCount * 3);

for (let i = 0; i < fluffyCount; i++) {
  const i3 = i * 3;
  fluffyVertices[i3 + 0] = (Math.random() - 0.5) * 10;
  fluffyVertices[i3 + 1] = Math.random() * 12 - 6;
  fluffyVertices[i3 + 2] = (Math.random() - 0.5) * 10;

  fluffySpeeds[i3 + 0] = (Math.random() - 0.5) * 0.01;
  fluffySpeeds[i3 + 1] = Math.random() * 0.01 + 0.005;
  fluffySpeeds[i3 + 2] = (Math.random() - 0.5) * 0.01;
}

fluffyGeometry.setAttribute('position', new THREE.BufferAttribute(fluffyVertices, 3));

const fluffyColors = new Float32Array(fluffyCount * 3);
for (let i = 0; i < fluffyCount * 3; i++) {
  fluffyColors[i] = 1.0; // 最初は白（RGBすべて1.0）
}
fluffyGeometry.setAttribute('color', new THREE.BufferAttribute(fluffyColors, 3));

const fluffyMaterial = new THREE.PointsMaterial({
  size: 0.1,
  vertexColors: true,
  alphaMap: texture,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const fluffyParticles = new THREE.Points(fluffyGeometry, fluffyMaterial);
scene.add(fluffyParticles);



//TRIDENT WEBDESIGN CONFERENCE 2025
let outlineMaterial;
let outlineMeshTri;
let outlineMeshCon;

const fontLoader = new FontLoader();

fontLoader.load('font/Quantico_Regular.json', (font) => {
  console.log(font);

  const textSize = 0.7;
  const textDepth = 0.1;

  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const triGeometry = new TextGeometry("TRIDENT WEBDESIGN", {
	  font: font,
    size: textSize,
    depth: textDepth,
  });
  const conGeometry = new TextGeometry("CONFERENCE 2025", {
	  font: font,
    size: textSize,
    depth: textDepth,
  });

  triGeometry.center();
  conGeometry.center();


  const tri = new THREE.Mesh(triGeometry, material);
  const con = new THREE.Mesh(conGeometry, material);

  outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    opacity: 0.5,
  });
  outlineMeshTri = new THREE.Mesh(triGeometry, outlineMaterial);
  outlineMeshCon = new THREE.Mesh(conGeometry, outlineMaterial);
  outlineMeshCon.position.y = -1;

  const shadowGroup = new THREE.Group();
  shadowGroup.add(outlineMeshTri);
  shadowGroup.add(outlineMeshCon);

  shadowGroup.scale.multiplyScalar(1.05);
  shadowGroup.position.z = -0.1;

  con.position.y = -1

  const textGroup = new THREE.Group();

  textGroup.add(shadowGroup);
  textGroup.add(tri);
  textGroup.add(con);

  textGroup.position.z = 1
  textGroup.position.y = 1

  scene.add(textGroup);


gsap
  .timeline({
    scrollTrigger: {
      trigger: '#concept',
      start: 'top bottom',
      end: 'center bottom',
      toggleActions: "play none none reverse",
      scrub:true,
    },
  })
  .to(textGroup.position, { z: -2, x: 5, y: 0 })
  .to(shadowGroup.position, { z: 0,x: 0.1, y: 0}, '<')
  .to(textGroup.rotation, { y: -(Math.PI/180)*20, ease: 'power2.in' }, '<')


gsap
  .timeline({
    scrollTrigger: {
      trigger: '#session',
      start: 'top bottom',
      end: 'center bottom',
      toggleActions: "play none none reverse",
      scrub:true,
    },
  })
  .to(textGroup.position, { z: 0, x: -4 })
  .to(shadowGroup.position, { z: 0,x: -0.2, y: 0}, '<')
  .to(textGroup.rotation, { y: (Math.PI/180)*10, ease: 'power2.in' },'<')

gsap
  .timeline({
    scrollTrigger: {
      trigger: '#outline',
      start: 'top bottom',
      end: 'center bottom',
      toggleActions: "play none none reverse",
      scrub: true,
    },
  })
  .to(textGroup.position, { z: 2, x: 2 })
  .to(shadowGroup.position, { z: 0,x: 0.1, y: 0}, '<')
    .to(textGroup.rotation, { y: -(Math.PI/180)*10, ease: 'power2.in' },'<')

gsap
  .timeline({
    scrollTrigger: {
      trigger: '#footer',
      start: 'top bottom',
      end: 'bottom bottom',
      toggleActions: "play none none reverse",
      scrub:true,
    },
  })
    .to(textGroup.position, { z: -2,x:-6})
    .to(textGroup.rotation, { y: (Math.PI/180)*300, ease: 'power2.in' },'<')

});










//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

const clock = new THREE.Clock();

//更新
const update = () => {
  // stats.begin();

  const elapsedTime = clock.getElapsedTime() * 0.2;
  const colors = bufferGeometry.attributes.color.array;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // x座標を取得
    const x = bufferGeometry.attributes.position.array[i3];

    // y軸はsin波で動かす
    bufferGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x);

    // 色相を0〜1の範囲で計算（x座標と時間でずらす）
    const hue = (elapsedTime + (x + 20) / 40) % 1;

    // hsv → rgb変換
    const [r, g, b] = hsvToRgb(hue, 1, 1);

    colors[i3] = r;
    colors[i3 + 1] = g;
    colors[i3 + 2] = b;
  }

  // 色と位置の更新をThree.jsに通知
  bufferGeometry.attributes.color.needsUpdate = true;
  bufferGeometry.attributes.position.needsUpdate = true;

  if (outlineMaterial) {
    const elapsed = clock.getElapsedTime();
    const hue = (elapsed * 0.1) % 1;
    const hue2 = (hue + 0.1) % 1;
    const [r, g, b] = hsvToRgb(hue, 1, 1);
    const [r2, g2, b2] = hsvToRgb(hue2, 1, 1);
    outlineMaterial.color.setRGB(r, g, b);

    const r255 = Math.floor(r * 255);
    const g255 = Math.floor(g * 255);
    const b255 = Math.floor(b * 255);

    const r255_2 = Math.floor(r2 * 255);
    const g255_2 = Math.floor(g2 * 255);
    const b255_2 = Math.floor(b2 * 255);

    btn.forEach((el) => {
      el.style.boxShadow = `0px 0px 5px 3px rgb(${r255}, ${g255}, ${b255})`;
    });

    h2.forEach((el) => {
      el.style.textShadow = `0px 0px 5px rgb(${r255}, ${g255}, ${b255}),0px 0px 5px rgb(${r255}, ${g255}, ${b255}),0px 0px 5px rgb(${r255}, ${g255}, ${b255})`;
      el.style.setProperty('--line-color', `rgb(${r255}, ${g255}, ${b255})`);
      el.style.setProperty('--line-color2', `rgb(${r255_2}, ${g255_2}, ${b255_2})`);
    });
    h3.forEach((el) => {
      el.style.textShadow = `0px 0px 5px rgb(${r255}, ${g255}, ${b255}),0px 0px 5px rgb(${r255}, ${g255}, ${b255})`;
    });
  }

  // Fluffyパーティクル更新
  const fPositions = fluffyGeometry.attributes.position.array;
  const fColors = fluffyGeometry.attributes.color.array;

for (let i = 0; i < fluffyCount; i++) {
  const i3 = i * 3;

  fPositions[i3 + 0] += fluffySpeeds[i3 + 0]; // x
  fPositions[i3 + 1] += fluffySpeeds[i3 + 1]; // y
  fPositions[i3 + 2] += fluffySpeeds[i3 + 2]; // z

  const x = fPositions[i3 + 0];
  const hue = (elapsedTime + (x + 20) / 40) % 1;
  const [r, g, b] = hsvToRgb(hue, 1, 1);

  fColors[i3 + 0] = r;
  fColors[i3 + 1] = g;
  fColors[i3 + 2] = b;

  if (fPositions[i3 + 1] > 6) {
    fPositions[i3 + 1] = -6;
  }
}


fluffyGeometry.attributes.position.needsUpdate = true;
fluffyGeometry.attributes.color.needsUpdate = true;


  renderer.render(scene, camera);
  // stats.end();

  window.requestAnimationFrame(update);
};

update();

//ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});