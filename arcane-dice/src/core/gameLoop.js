export function startGameLoop({
  renderer,
  scene,
  camera,
  world,
  updatables = []
}) {
  function animate() {
    requestAnimationFrame(animate)

    world.step(1 / 60)

    updatables.forEach((object) => {
      object.update()
    })

    renderer.render(scene, camera)
  }

  animate()
}