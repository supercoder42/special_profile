import { initialize as initializeBlob, lerp } from "./blobs.js"

const profile_container = document.querySelector(".profile")
const profile_photo_slot = document.querySelector(".profile .photo")

const ratio = window.devicePixelRatio || 1

const size = {
  width: 500 / ratio,
  height: 500 / ratio,
}

const app = new PIXI.Application({
  transparent: true,
  ...size,
})

Object.assign(app.view, size)

profile_photo_slot.appendChild(app.view)

const filter = createDepthFilter(app.stage, "photo")

const blob =
  "M313.4,566.6c21.8,0,45.7-3.5,70.7-9.9c16.1-4.1," +
  "32.7-9.5,49.5-15.9 c15-5.7,30.2-12.3,45.4-19.6" +
  "c15.2-7.3,30.5-15.4,45.6-24.2c14.3-8.2,28.4-17.1," +
  "42.3-26.4c11.5-7.7,22.8-15.7,33.8-24.1 c7.6-5.7," +
  "15.1-11.6,22.4-17.6c6.7-5.5,13.2-11,19.6-16.6" +
  "c8.2-7.3,16.2-14.7,23.9-22.2c7.7-7.5,15.2-15.2," +
  "22.3-22.9 c10.6-11.6,20.6-23.4,29.7-35.3c7-9.2," +
  "13.5-18.5,19.5-27.8c7.1-11.1,13.4-22.3,18.8-33.5" +
  "c5.4-11.2,9.9-22.4,13.4-33.5 c5.5-17.6,8.4-35," +
  "8.4-51.9c0-14.3-1.9-27.6-5.5-40c-2.9-9.9-6.9-19.3" +
  "-11.8-28.1c-5.2-9.3-11.5-17.9-18.8-26 c-11.3-12.5" +
  "-25-23.6-40.5-33.4c-10.1-6.3-21-12.1-32.6-17.3" +
  "c-14.4-6.5-29.8-12.1-45.9-16.9c-9.2-2.7-18.6" +
  "-5.2-28.3-7.5 c-15-3.5-30.5-6.3-46.3-8.6c-15.8" +
  "-2.3-31.9-4-48-5.1c-34.4-2.5-69.3-2.4-103-0.3" +
  "c-24.9,1.6-49.2,4.3-72,8.1 c-30.2,5-59.3,10.5" +
  "-86.8,16.8c-15.9,3.7-31.4,7.7-46.2,12.1c-16.8," +
  "5-32.8,10.5-47.9,16.7c-10.7,4.4-20.9,9.1-30.7," +
  "14.2 C103.2,75.7,92.8,82,83.1,88.8c-10.8,7.6" +
  "-20.7,15.9-29.6,24.9c-7.9,8-15,16.7-21.3,26" +
  "c-8,11.8-14.6,24.8-19.7,39 c-3.1,8.7-5.7,17.8" +
  "-7.7,27.5C1.7,221.9,0,238.8,0,257.1c0,14.6,1.1," +
  "29,3.1,43.1s5.1,27.9,9.1,41.4 c3.6,12.4,8.1," +
  "24.5,13.2,36.2c6.8,15.5,14.9,30.4,24.1,44.5c7.2," +
  "11.1,15.1,21.7,23.7,31.8c8.8,10.4,18.4,20.3,28.5," +
  "29.5 c12.3,11.3,25.6,21.6,39.6,30.8c10.8,7.1,21.9," +
  "13.6,33.5,19.3c12.1,6,24.6,11.3,37.5,15.8c14.7,5.1," +
  "30,9.1,45.5,12 C275.9,564.9,294.5,566.6,313.4,566.6z"

initializeBlob({
  color: "white",
  path: blob,
})

let halfWindowW = window.innerWidth / 2
let halfWindowH = window.innerHeight / 2

const depth_displacement = 15
const transform_angle = 20
const offset_displacement = halfWindowW > 10 ? 20 : 50

let mouseX = halfWindowW,
  pointerX = mouseX
let mouseY = halfWindowH,
  pointerY = mouseY

window.onmousemove = window.onmouseenter = (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
}

if (window.AbsoluteOrientationSensor) {
  console.log(window.AbsoluteOrientationSensor)
  const options = { frequency: 60, referenceFrame: "device" }
  const sensor = new AbsoluteOrientationSensor(options)
  Promise.all([
    navigator.permissions.query({ name: "accelerometer" }),
    navigator.permissions.query({ name: "magnetometer" }),
    navigator.permissions.query({ name: "gyroscope" }),
  ]).then((results) => {
    if (results.every((result) => result.state === "granted")) {
      console.log(sensor)
      sensor.addEventListener("reading", () => {
        console.log(sensor)
      })
      sensor.addEventListener("error", (e) => {
        if (e.error.name == "NotReadableError") {
          console.log("Sensor is not available.")
        }
      })
      sensor.start()
    } else {
      console.log("No permissions to use AbsoluteOrientationSensor.")
    }
  })
} else {
  window.ondeviceorientation = (e) => {
    mouseX = e.beta
    mouseY = e.gamma
  }
}

window.onmouseout = (e) => {
  mouseX = halfWindowW
  mouseY = halfWindowH
}

!(function frame() {
  pointerX = lerp(pointerX, mouseX, 0.1)
  pointerY = lerp(pointerY, mouseY, 0.1)
  updateDepthFilter(pointerX, pointerY)
  requestAnimationFrame(frame)
})()

function updateDepthFilter(x, y) {
  const dX = (halfWindowW - x) / halfWindowW
  const dY = (halfWindowH - y) / halfWindowH

  const offset = `translateX(${dX * offset_displacement}px) translateY(${
    dY * offset_displacement
  }px)`

  const rotX = `rotateX(${dY * transform_angle}deg)`
  const rotY = `rotateY(${dX * -transform_angle}deg)`

  profile_container.style.transform = `${offset} ${rotX} ${rotY}`

  filter.scale.x = dX * depth_displacement
  filter.scale.y = dY * depth_displacement
}

function createDepthFilter(stage, source) {
  const color = new PIXI.Sprite.from(`${source}.png`)
  const depth = new PIXI.Sprite.from(`${source}_depth.png`)

  Object.assign(color, size)
  Object.assign(depth, size)

  stage.addChild(color)
  stage.addChild(depth)

  const filter = new PIXI.filters.DisplacementFilter(depth)

  stage.filters = [filter]

  filter.scale.x = filter.scale.y = 0

  return filter
}
