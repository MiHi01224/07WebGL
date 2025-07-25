import './style.css';
import * as THREE from 'three';
import GUI from 'lil-gui';
import Stats from 'stats-js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';


//UIデバッグ
const gui = new GUI();

//FPSデバッグ
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

//シーン
const scene = new THREE.Scene();

//カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 15;
scene.add(camera);

//周囲光;
const light = new THREE.AmbientLight(0xffffff, 10);
scene.add(light);

//軸ヘルパー
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

//コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* Cannon-es ここから ------------------------------ */

//物理エンジン
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

//材質
const concrete = new CANNON.Material('concrete');
const rubber = new CANNON.Material('rubber');

//材質同士が衝突した際の値を設定
const rubberConcrete = new CANNON.ContactMaterial(rubber, concrete, {
  friction: 0.6, //摩擦力の強さ（1に近いほど滑りにくい）
  restitution: 0.5, //跳ね返りの強さ（1に近いほどよく跳ねる）
});
world.addContactMaterial(rubberConcrete); //設定を物理空間に登録

const rubberRubber = new CANNON.ContactMaterial(rubber, rubber, {
  friction: 0.2, //摩擦力の強さ（1に近いほど滑りにくい）
  restitution: 0.9, //跳ね返りの強さ（1に近いほどよく跳ねる）
});
world.addContactMaterial(rubberRubber); //設定を物理空間に登録

//球体
const spheres = []; //空の配列を宣言

const createSphere = (x = 0, y = 10, z = 0, size = 0.5) => {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffff00,
    })
  );
  scene.add(sphere);

  //物理演算用の球体
  const sphereBody = new CANNON.Body({
    mass: 1,
    material: rubber,
    position: new CANNON.Vec3(x,y,z),
    shape: new CANNON.Sphere(size),
  });
  world.addBody(sphereBody);

  spheres.push({
    mesh: sphere,
    body: sphereBody,
  });
}

for (let i = 0; i < 100; i++) {
  createSphere(
    Math.random() * 10 - 5,
    Math.random() * 10 + 5,
    Math.random() * 10 - 5,
    Math.random() * 0.5 + 0.1
  );
}

const boxes = [];

const createBox = (x = 0, y = 10, z = 0, size = 1) => {

  //箱
const color = new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`);
const box = new THREE.Mesh(
  new THREE.BoxGeometry(size, size, size),
  new THREE.MeshBasicMaterial({ color })
);
  scene.add(box);

  const boxBody = new CANNON.Body({
    mass: 1,
    material: rubber,
    position: new CANNON.Vec3(x, y, z),
    shape: new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2)), //halfExtents（半分の範囲）
  });
  world.addBody(boxBody);

  boxes.push({
    mesh: box,
    body: boxBody,
  });
}

document.addEventListener('click', () => {
  createBox(
    Math.random() * 10 - 5,
    Math.random() * 10 + 5,
    Math.random() * 10 - 5,
    Math.random() * 1 + 0.2
  );
});



//床
const floor = new THREE.Mesh(
	new THREE.BoxGeometry(10, 1, 10),
  new THREE.MeshBasicMaterial({
    color: 0x777777,
  })
);
scene.add(floor);

const floorBody = new CANNON.Body({
  mass: 0, //下に落ちないように質量を0にする
  material: concrete,
  shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 5)),
});
world.addBody(floorBody);

floorBody.position.copy(floor.position);
floorBody.quaternion.copy(floor.quaternion);



/* Cannon-es ここまで ------------------------------ */

//更新
const update = () => {
  stats.begin();

  //物理エンジンの更新
  world.fixedStep();

  //紐付け
  // sphere.position.copy(sphereBody.position);
  // sphere.quaternion.copy(sphereBody.quaternion);
  // box.position.copy(boxBody.position);
  // box.quaternion.copy(boxBody.quaternion);

  spheres.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  boxes.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  renderer.render(scene, camera);
  controls.update();
  stats.end();
  window.requestAnimationFrame(update);
};

update();

//ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});