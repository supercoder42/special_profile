function clamp(x, a, b) {
  return x < a ? a : x > b ? b : x
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

function start(options) {
  var phi = clamp(options.phi || 0.03, 0.01, 0.09)
  var radius = clamp(options.radius || 5, 2, 8)
  var rotation = options.rotation || 180
  var duration = options.duration || 500
  var length = options.length || 600
  var scale = clamp(options.scale || 1, 0.5, 1)
  var x = options.x || 0
  var y = options.y || 0

  var canvas = document.createElement("canvas")

  canvas.className = options.classes

  var animate = true

  if (typeof IntersectionObserver !== "undefined") {
    var observer = new IntersectionObserver(function (entries) {
      animate = entries.some(function (e) {
        return e.isIntersecting
      })
    })

    observer.observe(canvas)
  }

  $(options.root).prepend(canvas)

  var project = new paper.Project(canvas)

  var waves = new paper.Path(options.path)

  var path = waves.clone({ insert: false })

  var object = options.create()

  var group = new paper.Group([waves, object])

  group.clipped = true

  var view = project.view

  function load() {
    var size = object.bounds
    var w = size.width
    var h = size.height

    resize(length, (h / w) * length)

    object.tween({ opacity: 1 }, duration)
    loaded = true
  }

  var loaded = false
  if (object instanceof paper.Raster) {
    object.on("load", load)
  } else {
    load()
  }

  function resize(w, h) {
    view.viewSize.set(w, h)

    var bounds = view.bounds

    path.fitBounds(bounds)
    waves.fitBounds(bounds)
    object.fitBounds(bounds)

    path.scale((w - 2 * radius - 5) / w, (h - 2 * radius - 5) / h)
    path.scale(scale)

    waves.scale(0.2)

    path.translate(x, y)
    path.rotate(rotation)
  }

  var frames = 0

  view.onFrame = function (event) {
    if (!(animate && loaded)) {
      return
    }

    let mix = 0.03

    if (frames < 100) {
      mix = 1
      frames++
    }

    var t = event.time

    waves.segments.forEach(function (segment, i) {
      const { x, y } = path.segments[i].point

      const nX = x + radius * Math.cos(phi * y + t)
      const nY = y + radius * Math.sin(phi * x + t)

      const point = segment.point

      point.x = lerp(point.x, nX, mix)
      point.y = lerp(point.y, nY, mix)
    })

    waves.smooth()
  }

  return canvas
}

function BrandColorFactory(color, width, height) {
  return function () {
    return new paper.Path.Rectangle({
      point: [0, 0],
      size: [width, height],
      fillColor: color,
      opacity: 0,
    })
  }
}

export function initialize(options) {
  $("[data-blob]").each(function () {
    const color = this.dataset.brand || options.color
    const rect = this.getClientRects()[0]
    const width = Math.max(rect.width, 300)
    const height = Math.max(rect.height, 300)
    const path = this.dataset.blob || options.path

    const canvas = start(
      $.extend(
        {
          path: path,
          root: this,
          classes: "",
          scale: 0.97,
          phi: 0.03,
          radius: 5,
          create: BrandColorFactory(color, width, height),
        },
        options
      )
    )

    if (this.children.length > 1) {
      $(this)
        .css({
          position: "relative",
          width: width,
          height: height,
        })
        .children()
        .css({
          position: "absolute",
          top: 0,
          left: 0,
        })

      $(canvas).css({
        pointerEvents: "none",
        top: -245,
        left: -200,
      })
    }
  })
}
