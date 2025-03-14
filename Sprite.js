"use strict";
var JSprite = function jsp (a,b,c) {
  var init = function (x,y){
    this.goto(x,y);
  };
  var update;
  var img = '';
  if (typeof a === 'object'){
    if ('init'   in a) init   = a.init;
    if ('update' in a) update = a.update;
    if ('image'  in a) img    = a.image;
  } else {
    init   = a || init;
    update = b || update;
    img    = c || img;
  }
  function Img (v) {
    if (v[0] === '#'){
      return new fabric.Image(id(v.substring(1,v.length)))
    }
    return new fabric.Image.fromURL(v);
  }
  var math = jsp.math;
  function proto (obj,name,val) {
    obj.prototype[name] = val;
  }
  function prop () {
    Object.defineProperty.apply(this, arguments);
  }
  var id  = ref => document.getElementById(ref);
  var out = function self () { //constructor function for sprite object
    this.id = jsp.sprites.length;
    jsp.sprites[this.id] = this;
    this.update = update;
    this.image = img || '#tinyplatypus';
    self.img = this.img = img;
    this.x = this.y = 0;
    this.angle = 90;
    this.update = update;
    self.init.apply(this, arguments);
    self.clones.push(this);
    jsp.frame.add(this.raw);
  };
  out.type = 'class';
  proto(out,'rawx',0);
  proto(out,'rawy',0);
  proto(out,'rawangle',90);
  proto(out,'type','sprite');
  proto(out,'speed', 1);
  proto(out,'keydown',{});
  proto(out,'keyup',  {});
  proto(out,'last',{
    x: 0,
    y: 0
  });
  proto(out,'turn', function (deg) {
    this.angle += deg;
  });
  proto(out,'updatepos',function () {
    this.goto(this.x,this.y);
    this.angle = this.angle;
  });
  proto(out,'touching',function (){
    for (var i in arguments){
      var objs, s = arguments[i];
      if (s.type === 'sprite') objs = [s];
      else objs = s.clones;
      for (var j in objs){
        var obj = objs[j];
        this.raw.setCoords();
        obj .raw.setCoords();
        if (obj != this && this.raw.intersectsWithObject(obj.raw)){
          return obj;
        }
      }
    }
    return null;
  });
  proto(out, 'rel', function (obj) {
    return {
      x: obj.x - this.x,
      y: obj.y - this.y
    };
  });
  prop(out.prototype,'update',{
    get () {
      return this.rawupdate;
    },
    set (val) {
      this.rawupdate = val;
      jsp.updates[this.id] = val;
    }
  })
  prop(out.prototype,'image',{
    get () {
      return this.img;
    },
    set (val) {
      this.img = val;
      if (typeof this.raw !== 'undefined'){
        jsp.canvas.remove(this.raw);
        jsp.canvas.remove(this.raw);
        this.raw.parent = this;
      }
      this.raw = Img(val);
      this.raw.set({
        originX: 'center',
        originY: 'center',
        left:    this.raw.getLeft(),
        top:     this.raw.getTop(),
        angle:   this.raw.getAngle(),
        selectable: false
      });
      this.add();
      this.updatepos();
      jsp.render;
    }
  });
  prop(out.prototype,'x',{
    get () {
      return this.rawx;
    },
    set (val) {
      this.last.x = this.x;
      this.rawx = val;
      if(typeof this.raw !== 'undefined'){
        this.raw.set('left',jsp.frame.width/2 + val);
      }
      jsp.render;
    }
  });
  prop(out.prototype,'y',{
    get () {
      return this.rawy;
    },
    set (val) {
      this.last.y = this.y;
      this.rawy = val;
      if(typeof this.raw !== 'undefined'){
        this.raw.set('top',jsp.frame.height/2 - this.rawy);
      }
      jsp.render;
    }
  });
  prop(out.prototype,'angle',{
    get () {
      return this.rawangle;
    },
    set (val) {
      this.rawangle = math.mod(val,360);
      this.raw.set('angle',val - 90);
      jsp.render;
    }
  });
  prop(out.prototype,'alpha',{
    get () {
      return this.rawalpha;
    },
    set (val) {
      this.raw.set('opacity', val / 100);
      this.rawalpha = val;
    }
  });
  out.init   = init;
  out.img    = img;
  out.clones = [];
  proto(out,'goto',function (a,b) {
    var x,y;
    if(typeof a === 'object'){
      if ('x' in a) x = a.x;
      if ('y' in a) y = a.y;
    } else {
      x = a, y = b;
    }
    this.x = x;
    this.y = y;
    return this;
  });
  proto(out,'point',function (a,b){
    var newx,newy,x,y;
    if (typeof a === 'object'){
      newx = a.x;
      newy = a.y;
    } else if (typeof b === 'number'){
      newx = a;
      newy = b;
    } else {
      this.angle = a;
      return this;
    }
    x = this.x - newx;
    y = this.y - newy;
    if (x === 0 && y === 0);
    else if (x === 0){
      if (y < 0){
        this.angle = 0;
      } else {
        this.angle = 180;
      }
    } else if (y === 0){
      if (x < 0){
        this.angle = 90;
      } else {
        this.angle = 270;
      }
    } else {
      this.angle = math.atan2(x,y) + 180;
    }
    return this;
  });
  proto(out,'move',function (steps) {
    if (typeof steps === 'undefined') steps = 1;
    this.x += jsp.math.sin(this.angle) * steps;
    this.y += jsp.math.cos(this.angle) * steps;
    return this;
  });
  proto(out,'add',function () {
    jsp.frame.add(this.raw);
  });
  return out;
}
Object.defineProperty(JSprite,'frame',{
  get: _ => JSprite.canvas,
  set: updateCanvas
});
Object.defineProperty(JSprite,'render',{
  get () {
    JSprite.canvas.renderAll();
  }
});
JSprite.sprites = [];
JSprite.updates = [];
JSprite.timer = {
  t: new Date,
  oldt: new Date,
  rawinterval: 0,
  id: undefined,
  scale: 0.01,
  defaultint: 10
};
JSprite.start = function () {
  JSprite.timer.int = JSprite.timer.defaultint;
}
JSprite.stop = function () {
  JSprite.timer.int = 0;
}
Object.defineProperty(JSprite.timer,'int',{
  set (val) {
    if (val === 0) return clearInterval(JSprite.timer.id);
    JSprite.timer.rawinterval = val;
    if (JSprite.timer.id !== undefined) clearInterval(JSprite.timer.id);
    JSprite.timer.oldt = JSprite.timer.t = new Date;
    JSprite.timer.id = setInterval(function (){
      JSprite.timer.oldt = JSprite.timer.t;
      JSprite.timer.t = new Date;
      for(var i = 0; i < JSprite.sprites.length;i++){
        var update = JSprite.updates[i];
        var sprite = JSprite.sprites[i];
        if (update !== undefined){
          var t = (new Date - JSprite.timer.oldt) * JSprite.timer.scale;
          update.call(sprite,t * sprite.speed);
        }
      }
    }, val);
  }
})
JSprite.pending = false;
JSprite.requestRender = function () {
  if(JSprite.pending) clearTimeout(JSprite.pending);
  JSprite.pending = setTimeout(function () {
    JSprite.pending = false;
    JSprite.canvas.renderAll();
    console.log('render');
  },1);
};
JSprite.realcoords = function (obj){
  return {
    x: obj.x - JSprite.canvas.width  / 2,
    y: JSprite.canvas.height / 2 - obj.y
  };
}

JSprite.math = {
  deg:  radians => radians * 180 / Math.PI,
  rad:  degrees => degrees * Math.PI / 180,
  sin:  angle   => Math.sin(JSprite.math.rad(angle)),
  cos:  angle   => Math.cos(JSprite.math.rad(angle)),
  tan:  angle   => Math.tan(JSprite.math.rad(angle)),
  asin: slope   => JSprite.math.deg(Math.asin(slope)),
  acos: slope   => JSprite.math.deg(Math.acos(slope)),
  atan: slope   => JSprite.math.deg(Math.atan(slope)),
  atan2:(x,y)   => JSprite.math.deg(Math.atan2(x,y)),
  mod:  (x,y)   => (x + y) % y
};
JSprite.mouse = {
  x: 0,
  y: 0,
  down: false,
  last: {
    x: 0,
    y: 0
  }
};
JSprite.mouse.update = function (e){
  var coords = JSprite.realcoords(e);
  JSprite.mouse.last.x = JSprite.mouse.x;
  JSprite.mouse.last.y = JSprite.mouse.y;
  JSprite.mouse.x = coords.x - 7;
  JSprite.mouse.y = coords.y + 26;
};
JSprite.forAll = function (proper, action) {
  for(var i in JSprite.sprites){
    var sprite = JSprite.sprites[i];
    if (typeof sprite[proper] !== 'undefined'){
      action(sprite,sprite[proper]);
    }
  }
}
JSprite.key = {
  down (k) {
    k = JSprite.key.get(k.keyCode);
    if (JSprite.key.pressed(k));
    else {
      JSprite.key.rawpressed[k] = true;
      JSprite.forAll('onkeydown',function (sprite,callback) {
        callback.call(sprite,k);
      });
      JSprite.forAll('keydown',function (sprite, callback) {
        if (k in callback) callback[k].call(sprite);
      });
    }
  },
  up (k) {
    k = JSprite.key.get(k.keyCode);
    JSprite.key.rawpressed[k] = false;
    JSprite.forAll('onkeyup', function (sprite,callback) {
      callback.call(sprite,k);
    });
    JSprite.forAll('keyup', function (sprite, callback) {
      if (k in callback) callback[k].call(sprite);
    });
  },
  get (k) {
    if (k in JSprite.key.pairs) return JSprite.key.pairs[k];
    return String.fromCharCode(k).toLowerCase();
  },
  pairs: {
    [9]:  'tab',
    [13]: 'enter',
    [16]: 'shift',
    [17]: 'ctrl',
    [18]: 'alt',
    [37]: 'left',
    [38]: 'up',
    [39]: 'right',
    [40]: 'down',
    [91]: 'meta',
    [192]: "~",
    [189]: "-",
    [187]: "=",
    [219]: "[",
    [221]: "]",
    [220]: "\\",
    [186]: ";",
    [222]: "'",
    [188]: ",",
    [190]: ".",
    [191]: "/",
    [112]: 'f1',
    [113]: 'f2',
    [114]: 'f3',
    [115]: 'f4',
    [116]: 'f5',
    [117]: 'f6',
    [118]: 'f7',
    [119]: 'f8',
    [120]: 'f9',
    [121]: 'f10'
  },
  rawpressed: {},
  pressed (k) {
    if (k in JSprite.key.rawpressed);
    else JSprite.key.rawpressed[k] = false;
    return JSprite.key.rawpressed[k];
  },
};
function updateCanvas(v){
  JSprite.canvas = new fabric.Canvas(v);
  JSprite.canvas.selection = false;
  JSprite.rawcanvas = document.getElementById(v);
  document.onkeydown = JSprite.key.down;
  document.onkeyup   = JSprite.key.up;
  JSprite.canvas.on('mouse:down',function (options) {
    JSprite.mouse.down = true;
    JSprite.forAll('onmousedown',function (sprite, callback) {
      callback.call(sprite,JSprite.mouse);
    });
  });
  JSprite.canvas.on('mouse:up',function (options){
    JSprite.mouse.down = false;
    JSprite.forAll('onmouseup',function (sprite,callback) {
      callback.call(sprite,JSprite.mouse);
    });
  });
  JSprite.canvas.on('mouse:move',function (options) {
    JSprite.mouse.update(options.e);
    JSprite.forAll('onmousemove',function (sprite, callback) {
      callback.call(sprite,JSprite.mouse);
    });
  });
}
JSprite.path = {};
JSprite.path.gravity = function(start, vel, pull, turn) {
  if(typeof turn === 'undefined') turn = false;
  start = {
    x: start.x,
    y: start.y,
  };
  start.t = new Date;
  vel = {
    x: vel.x,
    y: vel.y
  };
  function ret() {
    var t = (new Date - start.t);
    t *= JSprite.timer.scale;
    var out = {
      x: start.x,
      y: start.y
    };
    out.x += vel.x * t;
    out.y += (vel.y * t) - (pull * t) * ((t - 1) / 2)
    this.goto(out);
    if (turn) {
      this.point(this.last);
      this.turn(180);
    }
    return out;
  }
  return ret;
};
