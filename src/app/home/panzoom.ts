// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  let xform = svg.createSVGMatrix();
  ctx.getTransform = () => xform;

  const savedTransforms: any[] = [];
  const save = ctx.save;
  ctx.save = (): any => {
    savedTransforms.push(xform.translate(0, 0));
    return save.call(ctx);
  };

  const restore = ctx.restore;
  ctx.restore = () => {
    xform = savedTransforms.pop();
    return restore.call(ctx);
  };

  const scale = ctx.scale;
  ctx.scale = (sx, sy): any => {
    xform = xform.scaleNonUniform(sx, sy);
    return scale.call(ctx, sx, sy);
  };

  const rotate = ctx.rotate;
  ctx.rotate = radians => {
    xform = xform.rotate(radians * 180 / Math.PI);
    return rotate.call(ctx, radians);
  };

  const translate = ctx.translate;
  ctx.translate = (dx, dy) => {
    xform = xform.translate(dx, dy);
    return translate.call(ctx, dx, dy);
  };

  const transform = ctx.transform;
  ctx.transform = (a, b, c, d, e, f) => {
    const m2 = svg.createSVGMatrix();
    m2.a = a;
    m2.b = b;
    m2.c = c;
    m2.d = d;
    m2.e = e;
    m2.f = f;
    xform = xform.multiply(m2);
    return transform.call(ctx, a, b, c, d, e, f);
  };

  const setTransform = ctx.setTransform;
  ctx.setTransform = (a, b, c, d, e, f) => {
    xform.a = a;
    xform.b = b;
    xform.c = c;
    xform.d = d;
    xform.e = e;
    xform.f = f;
    return setTransform.call(ctx, a, b, c, d, e, f);
  };

  const pt = svg.createSVGPoint();
  ctx.transformedPoint = (x, y) => {
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(xform.inverse());
  };
}

export function enablePanzoom(canvas, image) {
  const ctx = canvas.getContext('2d');
  trackTransforms(ctx);
  redraw(ctx, canvas, image);

  let lastX = canvas.width / 2;
  let lastY = canvas.height / 2;

  let dragStart;
  let dragged;

  canvas.addEventListener('mousedown', (evt): void => {
    //   document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragStart = ctx.transformedPoint(lastX, lastY);
    dragged = false;
  }, false);

  canvas.addEventListener('mousemove', evt => {
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragged = true;
    if (dragStart) {
      const pt = ctx.transformedPoint(lastX, lastY);
      ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
      redraw(ctx, canvas, image);
    }
  }, false);

  canvas.addEventListener('mouseup', evt => {
    dragStart = null;
    if (!dragged) {
      zoom(ctx, evt.shiftKey ? -1 : 1, scaleFactor, lastX, lastY, image);
    }
  }, false);

  const scaleFactor = 1.1;

  canvas.addEventListener('DOMMouseScroll', (evt) => {
    handleScroll(evt, ctx, scaleFactor, lastX, lastY, image);
  }, false);
  canvas.addEventListener('mousewheel', (evt) => {
    handleScroll(evt, ctx, scaleFactor, lastX, lastY, image);
  }, false);
}

function redraw(ctx, canvas, image) {
  // Clear the entire canvas
  const p1 = ctx.transformedPoint(0, 0);
  const p2 = ctx.transformedPoint(canvas.width, canvas.height);
  ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  drawImage(ctx, image, canvas);
}

function drawImage(ctx, img, canvas) {
  const hRatio = canvas.width / img.width;
  const vRatio = canvas.height / img.height;
  const ratio = Math.min(hRatio, vRatio);
  const xPos =
    img.width > img.height ? 0 : canvas.width / 2 - (img.width * ratio) / 2;
  const yPos =
    img.height > img.width ? 0 : canvas.height / 2 - (img.height * ratio) / 2;
  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    xPos,
    yPos,
    img.width * ratio,
    img.height * ratio
  );
}


function handleScroll(evt, ctx, scaleFactor, lastX, lastY, image) {
  const delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
  if (delta) {
    zoom(ctx, delta, scaleFactor, lastX, lastY, image);
  }
  return evt.preventDefault() && false;
}

function zoom(ctx, clicks, scaleFactor, lastX, lastY, image) {
  const pt = ctx.transformedPoint(lastX, lastY);
  ctx.translate(pt.x, pt.y);
  const factor = Math.pow(scaleFactor, clicks);
  ctx.scale(factor, factor);
  ctx.translate(-pt.x, -pt.y);
  redraw(ctx, ctx.canvas, image);
}
