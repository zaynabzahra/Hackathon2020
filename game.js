
(function() { "use strict";

  const TILE_SIZE = 16;
  const WORLD_HEIGHT = 144;
  const WORLD_WIDTH = 256;

  var Animation = function(frame_set, delay) {
 
    this.count = 0; //cycles
    this.delay = delay; //wait till frame
    this.frame_value = frame_set[0]; //number of image to display
    this.frame_index = 0;
    this.frame_set = frame_set; //images

  };

  Animation.prototype = {
    change:function(frame_set, delay = 15) {
      if (this.frame_set != frame_set) { //sets the current animcation frame
        this.count = 0;
        this.delay = delay;
        this.frame_index = 0;
        this.frame_set = frame_set;
        this.frame_value = this.frame_set[this.frame_index];
      }
    },

    update:function() { //calls each cycle in the game -decides when to change

      this.count ++;

      if (this.count >= this.delay) {
        this.count = 0;
        this.frame_index = (this.frame_index == this.frame_set.length - 1) ? 0 : this.frame_index + 1;
        this.frame_value = this.frame_set[this.frame_index];
      }

    }

  };

  var Frame = function(x, y, width, height) {

    this.height = height;
    this.width  = width;
    this.x      = x;
    this.y      = y;

  };

  var Pool = function(object) {

    this.object = object;
    this.objects = [];
    this.pool = [];

  };

  Pool.prototype = {

    get:function(parameters) {

      if (this.pool.length != 0) {

        let object = this.pool.pop();
        object.reset(parameters);
        this.objects.push(object);

      } else {this.objects.push(new this.object(parameters.x, parameters.y)); }

    },
    store:function(object) {

      let index = this.objects.indexOf(object);

      if (index != -1) {this.pool.push(this.objects.splice(index, 1)[0]);}

    },

    storeAll:function() {

      for (let index = this.objects.length - 1; index > -1; -- index) {

        this.pool.push(this.objects.pop());

      }
    }

  };

  var virus = function(x, y) {

    this.alive = true;
    this.animation = new Animation(display.tile_sheet.frame_sets[1], 8);
    this.grounded = false;
    this.smoke = false;
    this.smoke_count = 0;
    this.smoke_delay = Math.floor(Math.random() * 10 + 5);
    this.height = Math.floor(Math.random() * 16 + 24); this.width = this.height;
    this.x = x; this.y = y - this.height * 0.5;
    let direction = Math.PI * 1.75 + Math.random() * Math.PI * 0.1;
    this.x_velocity = Math.cos(direction) * 3; this.y_velocity = -Math.sin(direction) * 3;

  };

  virus.prototype = {

    constructor:virus,
    collideObject:function(player) {

      let vector_x = player.x + player.width * 0.5 - this.x - this.width * 0.5;
      let vector_y = player.y + player.height * 0.5 - this.y - this.height * 0.5;
      let combined_radius = player.height * 0.5 + this.width * 0.5;

      if (vector_x * vector_x + vector_y * vector_y < combined_radius * combined_radius) {

        player.alive = false;
        player.animation.change(display.tile_sheet.frame_sets[5], 10);

      }

    },

    collideWorld:function() {

      if (this.x + this.width < 0) {
        this.alive = false;
        return;
    }

      if (this.y + this.height > WORLD_HEIGHT - 6) {
        this.x_velocity = -game.speed;
        this.grounded = true;
        this.y = WORLD_HEIGHT - this.height - 6;
    }

    },

    reset:function(parameters) {

      this.alive = true;
      this.animation.change(display.tile_sheet.frame_sets[1], 8);
      this.grounded = false;
      this.x = parameters.x;
      let direction = Math.PI * 1.75 + Math.random() * Math.PI * 0.1;
      this.x_velocity = Math.cos(direction) * 3;
      this.y = parameters.y;
      this.y_velocity = -Math.sin(direction) * 3;

    },

    update:function() {

      if (!this.grounded) {

        this.animation.update();
        this.y += this.y_velocity;

      } else {

        this.x_velocity = -game.speed;

      }

      this.x += this.x_velocity;

      this.smoke_count ++;
      if (this.smoke_count == this.smoke_delay) {

        this.smoke_count = 0;
        this.smoke = true;

      }

    }

  };

  var Smoke = function(x, y, x_velocity, y_velocity) {

    this.alive = true;
    this.animation = new Animation(display.tile_sheet.frame_sets[2], 8);
    this.life_count = 0;
    this.life_time = Math.random() * 20 + 30;
    this.height = 8 + Math.floor(Math.random() * 8); this.width = this.height;
    this.x = x; this.y = y;
    this.x_velocity = x_velocity; this.y_velocity = y_velocity;

  };

  Smoke.prototype = {

    constructor:Smoke,

    collideWorld:function() {

      if (this.x > WORLD_WIDTH || this.y > WORLD_HEIGHT - 20) {

        this.alive = false;

      }

    },

    reset:function(parameters) {

      this.alive = true;
      this.life_count = 0;
      this.life_time = Math.random() * 20 + 30;
      this.x          = parameters.x;
      this.x_velocity = parameters.x_velocity;
      this.y          = parameters.y;
      this.y_velocity = parameters.y_velocity;

    },

    update:function() {

      this.animation.update();
      this.x += this.x_velocity;
      this.y += this.y_velocity;

      this.life_count ++;

      if (this.life_count > this.life_time) {

        this.alive = false;

      }

    }

  };

  var pit = function(x, y) {

    this.alive = true;
    this.animation = new Animation(display.tile_sheet.frame_sets[0], 8);
    this.height = 30; this.width = Math.floor(Math.random() * 64 + 48);
    this.x = x; this.y = y;

  };

  pit.prototype = {

    constructor:pit,

    collideObject:function(player) {

    },

    collideObject:function(object) {

      if (!object.jumping && object.x + object.width * 0.5 > this.x + this.width * 0.2 && object.x + object.width * 0.5 < this.x + this.width * 0.8) {

        object.alive = false;
        object.animation.change(display.tile_sheet.frame_sets[4], 10);

      }

    },

    collideWorld:function() {

      if (this.x + this.width < 0) this.alive = false;

    },

    reset:function(parameters) {

      this.alive = true;
      this.width = Math.floor(Math.random() * 64 + 48);
      this.x = parameters.x;
      this.y = parameters.y;

    },

    update:function(){

      this.animation.update();
      this.x -= game.speed;

    }

  };

  var controller, display, game;

 
  controller = {

    active:false, state:false,

    onOff:function(event) {

      event.preventDefault();

      let key_state = (event.type == "mousedown" || event.type == "touchstart") ? true : false;

      if (controller.state != key_state) controller.active = key_state;
      controller.state  = key_state;

    }

  };

  display = {

    buffer:document.createElement("canvas").getContext("2d"),
    context:document.querySelector("canvas").getContext("2d"),
    tint:0,

    tile_sheet: {

      columns:undefined,
      frames: [new Frame( 0, 32, 24, 16), new Frame(24, 32, 24, 16),// tar pit
               new Frame(64, 32, 16, 16), new Frame(80, 32, 16, 16),// virus
               new Frame(96, 32,  8,  8), new Frame(104,32,  8,  8), new Frame(96, 40,  8,  8), new Frame(104,40,  8, 8),// smoke
               new Frame( 0, 48, 28, 16), new Frame(28, 48, 28, 16), new Frame(56, 48, 28, 16), new Frame(84, 48, 28, 16), new Frame( 0, 64, 28, 16), new Frame(28, 64, 28, 16), new Frame(56, 64, 28, 16), new Frame(84, 64, 28, 16),
               new Frame( 0, 80, 28, 16), new Frame(28, 80, 28, 16), new Frame(56, 80, 28, 16), new Frame(84, 80, 28, 16), new Frame( 0, 96, 28, 16), new Frame(28, 96, 28, 16),//dino sink
               new Frame(56, 96, 28, 16), new Frame(84, 96, 28, 16), new Frame( 0,112, 28, 16), new Frame(28,112, 28, 16), new Frame(56,112, 28, 16), new Frame(84,112, 28, 16)
              ],

      frame_sets:[[ 0, 1],
                  [ 2, 3],
                  [ 4, 5, 6, 7],
                  [ 8, 9,10,11,12,13,14,15],
                  [16,17,18,19,20,21],
                  [22,23,24,25,26,27]

      ],
      image:new Image()
      
    },

    render:function() {


      for (let index = game.area.map.length - 1; index > -1; -- index) {

        let value = game.area.map[index];

        this.buffer.drawImage(this.tile_sheet.image, (value % this.tile_sheet.columns) * TILE_SIZE, Math.floor(value / this.tile_sheet.columns) * TILE_SIZE, TILE_SIZE, TILE_SIZE, (index % game.area.columns) * TILE_SIZE - game.area.offset, Math.floor(index / game.area.columns) * TILE_SIZE, TILE_SIZE, TILE_SIZE);

      }

  
      this.buffer.font = "20px Arial";
      this.buffer.fillStyle = "#ffffff";
      this.buffer.fillText(String(Math.floor(game.distance/10) + " / " + Math.floor(game.max_distance/10)), 10, 20);

     
      for (let index = game.object_manager.pit_pool.objects.length - 1; index > -1; -- index) {

        let pit = game.object_manager.pit_pool.objects[index];

        let frame = this.tile_sheet.frames[pit.animation.frame_value];

        this.buffer.drawImage(this.tile_sheet.image, frame.x, frame.y, frame.width, frame.height, pit.x, pit.y, pit.width, pit.height);

      }

   
      let frame = this.tile_sheet.frames[game.player.animation.frame_value];
      this.buffer.drawImage(this.tile_sheet.image, frame.x, frame.y, frame.width, frame.height, game.player.x, game.player.y, game.player.width, game.player.height);

 
      for (let index = game.object_manager.virus_pool.objects.length - 1; index > -1; -- index) {

        let virus = game.object_manager.virus_pool.objects[index];

        let frame = this.tile_sheet.frames[virus.animation.frame_value];

        this.buffer.drawImage(this.tile_sheet.image, frame.x, frame.y, frame.width, frame.height, virus.x, virus.y, virus.width, virus.height);

      }


      for (let index = game.object_manager.smoke_pool.objects.length - 1; index > -1; -- index) {

        let smoke = game.object_manager.smoke_pool.objects[index];

        let frame = this.tile_sheet.frames[smoke.animation.frame_value];

        this.buffer.drawImage(this.tile_sheet.image, frame.x, frame.y, frame.width, frame.height, smoke.x, smoke.y, smoke.width, smoke.height);

      }

      if (game.object_manager.virus_pool.objects.length != 0) {

        this.tint =  0;

      }

      if (this.tint != 0) {

        let image_data = this.buffer.getImageData(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        let data = image_data.data;

        for (let index = data.length - 4; index > -1; index -= 4) {

          data[index] += this.tint;

        }

        this.buffer.putImageData(image_data, 0, 0);

      }

      this.context.drawImage(this.buffer.canvas, 0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0, 0, this.context.canvas.width, this.context.canvas.height);

    },

    resize:function(event) {

      display.context.canvas.width = document.documentElement.clientWidth - 16;

      if (display.context.canvas.width > document.documentElement.clientHeight - 16) {

        display.context.canvas.width = document.documentElement.clientHeight - 16;

      }

      display.context.canvas.height = display.context.canvas.width * 0.5625;

      display.buffer.imageSmoothingEnabled = false;
      display.context.imageSmoothingEnabled = false;

      display.render();

    }

  };

  game = {

    distance:0,
    max_distance:0,
    speed:3,

    area: {

      columns:17,
      offset:0,
      map:[ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0,
            0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1,
            1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1,
            1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1,
            0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0,
            1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0,
            2, 2, 2, 3, 2, 2, 3, 2, 4, 6, 7, 7, 6, 9, 2, 3, 2,
           10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],

      scroll:function() {

        game.distance += game.speed;

        if (game.distance > game.max_distance) game.max_distance = game.distance;

        this.offset += game.speed;
        if (this.offset >= TILE_SIZE) {

          this.offset -= TILE_SIZE;

          for (let index = this.map.length - this.columns * 3 ; index > -1; index -= this.columns) {

            this.map.splice(index, 1);
            this.map.splice(index + this.columns - 1, 0, Math.floor(Math.random() * 2));

          }
      
          this.map.splice(this.columns * 7, 1);

          let right_index = this.columns * 8 - 1;
          let value = this.map[right_index - 1];

          switch(value) {

            case 2: case 3: value = [2, 3, 2, 3, 2, 3, 2, 3, 4, 5][Math.floor(Math.random() * 10)]; break;
            case 4: case 5: value = [6, 7][Math.floor(Math.random() * 2)]; break;
            case 6: case 7: value = [6, 7, 8, 9][Math.floor(Math.random() * 4)]; break;
            case 8: case 9: value = [2, 3][Math.floor(Math.random() * 2)]; break;

          }

          this.map.splice(right_index, 0, value);

        }

      }

    },

    engine: {

      afrequest:undefined,
      accumulated_time:window.performance.now(),
      time_step:1000/60,

      loop:function(time_stamp) {

        if (time_stamp >= game.engine.accumulated_time + game.engine.time_step) {

          if (time_stamp - game.engine.accumulated_time >= game.engine.time_step * 4) {

            game.engine.accumulated_time = time_stamp;

          }

          while(game.engine.accumulated_time < time_stamp) {

            game.engine.accumulated_time += game.engine.time_step;

            game.engine.update();

          }

          display.render();

        }

        window.requestAnimationFrame(game.engine.loop);

      },

      start:function() {

        this.afrequest = window.requestAnimationFrame(this.loop);

      },

      update:function() {

        game.speed = (game.speed >= TILE_SIZE * 0.5)? TILE_SIZE * 0.5 : game.speed + 0.001;
        game.player.animation.delay = Math.floor(10 - game.speed);
        game.area.scroll();

        if (game.player.alive) {

          if (controller.active && !game.player.jumping) {

            controller.active = false;
            game.player.jumping = true;
            game.player.y_velocity -= 15;
            game.player.animation.change([10], 15);

          }

          if (game.player.jumping == false) {

            game.player.animation.change(display.tile_sheet.frame_sets[3], Math.floor(TILE_SIZE - game.speed));

          }

          game.player.update();

          if (game.player.y > TILE_SIZE * 6 - TILE_SIZE * 0.25) {

            controller.active = false;
            game.player.y = TILE_SIZE * 6 - TILE_SIZE * 0.25;
            game.player.y_velocity = 0;
            game.player.jumping = false;

          }

        } else {

          game.player.x -= game.speed;
          game.speed *= 0.9;

          if (game.player.animation.frame_index == game.player.animation.frame_set.length - 1) game.reset();

        }

        game.player.animation.update();

        game.object_manager.spawn();
        game.object_manager.update();

      }

    },

    object_manager: {

      count:0,
      delay:100,

      virus_pool:new Pool(virus),
      smoke_pool:new Pool(Smoke),
      pit_pool:new Pool(pit),

      spawn:function() {

        this.count ++;

        if (this.count == this.delay) {

          this.count = 0;
          this.delay = 100;

          if (Math.random() > 0.5) {

            this.pit_pool.get( {x: WORLD_WIDTH, y:WORLD_HEIGHT - 30} );

          } else {

            this.virus_pool.get( {x: WORLD_WIDTH * 0.2, y: -32 } );

          }

        }

      },

      update:function() {

        for (let index = this.virus_pool.objects.length - 1; index > -1; -- index) {

          let virus = this.virus_pool.objects[index];

          virus.update();

          virus.collideObject(game.player);

          virus.collideWorld();

          if (virus.smoke) {

            virus.smoke = false;

            let parameters = { x:virus.x + Math.random() * virus.width, y:undefined, x_velocity:undefined, y_velocity:undefined };

            if (virus.grounded) {

              parameters.y = virus.y + Math.random() * virus.height * 0.5;
              parameters.x_velocity = Math.random() * 2 - 1 - game.speed;
              parameters.y_velocity = Math.random() * -1;

            } else {

              parameters.y = virus.y + Math.random() * virus.height;
              parameters.x_velocity = virus.x_velocity * Math.random();
              parameters.y_velocity = virus.y_velocity * Math.random();

            }

            this.smoke_pool.get(parameters);

          }

          if (!virus.alive) {

            this.virus_pool.store(virus);

          };

        }

        for (let index = this.smoke_pool.objects.length - 1; index > -1; -- index) {

          let smoke = this.smoke_pool.objects[index];

          smoke.update();

          smoke.collideWorld();

          if (!smoke.alive) this.smoke_pool.store(smoke);

        }

        for (let index = this.pit_pool.objects.length - 1; index > -1; -- index) {

          let pit = this.pit_pool.objects[index];

          pit.update();

          pit.collideObject(game.player);

          pit.collideWorld();

          if (!pit.alive) this.pit_pool.store(pit);

        }

      }

    },

    player: {

      alive:true,
      animation:new Animation([15], 10),
      jumping:false,
      height: 32, width: 56,
      x:8, y:TILE_SIZE * 6 - TILE_SIZE * 0.25,
      y_velocity:0,

      reset:function() {
        this.alive = true;
        this.x = 8;
      },

      update:function() {

        game.player.y_velocity += 0.5;
        game.player.y += game.player.y_velocity;
        game.player.y_velocity *= 0.9;

      }

    },

    reset:function() {
      this.distance = 0;
      this.player.reset();
      this.object_manager.virus_pool.storeAll();
      this.object_manager.smoke_pool.storeAll();
      this.object_manager.pit_pool.storeAll();

      this.speed = 3;

    }
  };


  display.buffer.canvas.height = WORLD_HEIGHT;
  display.buffer.canvas.width  = WORLD_WIDTH;
 
  display.tile_sheet.image.src = "game.png";

  display.tile_sheet.image.crossOrigin="Anonymous";
  display.tile_sheet.image.addEventListener("load", function(event) {

    display.tile_sheet.columns = this.width / TILE_SIZE;

    display.resize();

    game.engine.start();

  });

  window.addEventListener("resize", display.resize);
  window.addEventListener("mousedown", controller.onOff);
  window.addEventListener("mouseup", controller.onOff);
  window.addEventListener("touchstart", controller.onOff);
  window.addEventListener("touchend", controller.onOff);

})();