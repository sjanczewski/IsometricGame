(function (global, factory) {
	'use strict';

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } 
    else {
        global.Class = factory();
    }
}(this, function () {
	'use strict';

	return function () {
		var abstractClass, prop, parent, args = Array.prototype.slice.call(arguments, 0);

		if (args[0] && typeof args[0] === 'boolean') {
			abstractClass = args.shift();
		}

		prop = args.shift();
		parent = args.shift();

		var Class = (function(abstractClass) {
			return function () {
				if (abstractClass) {
					throw Error('Cannot create instance of abstract class.');
				}

				if (typeof this.init === 'function') {
					this.init.apply(this, arguments);
				}
			};
		})(abstractClass);

		if (parent) {
			var SubClass = function () {};
			SubClass.prototype = parent.prototype;
			Class.prototype = new SubClass();
		}

		Class.prototype.parent = Class;
		Class.__super__ = Class.__proto__;

		Class.extend = function (obj) {
			for (var i in obj) {
				Class[i] = obj[i];
			}
		};

		for (var i in prop) {
			Class.prototype[i] = prop[i];
		}

		return Class;
	};
}));
if (!Function.prototype.bind) {
	Function.prototype.bind = function (context) {
		if (typeof this !== 'function') {
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var args = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fn = function () {},
			fBound = function () {
				return fToBind.apply(
					this instanceof fn && context ? this : context,
					args.concat(Array.prototype.slice.call(arguments))
				);
			};

		fn.prototype = this.prototype;
		fBound.prototype = new fn();
		return fBound;
	};
}

if (!Function.prototype.extend) {
	Function.prototype.extend = function (parent) {
		this.prototype = new parent();
		this.prototype.parent = new parent();

		for (var m in this.prototype.parent) {
			if (typeof this.prototype.parent[m] === 'function') {
				this.prototype.parent[m] = this.prototype.parent[m].bind(this);
			}
		}

		return this;
	};
}

if (!Object.toType) {
	Object.toType = (function(obj) {
		if (obj === window) {
			return "window";
		}
		else if (obj === document) {
			return "object";
		}

		return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
	});
}
(function (global, factory) {
	'use strict';

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } 
    else {
        global.PubSub = factory();
    }
}(this, function () {
	'use strict';

	var 
	subscribed = {},
	publish = function(name, params) {
		for (var i in (subscribed[name] || [])) {
			if (subscribed[name].hasOwnProperty(i)) {
				subscribed[name][i].apply(null, params);
			}
		}
	},
	subscribe = function(name, func) {
		(subscribed[name] || (subscribed[name] = [])).push(func);
	},
	unsubscribe = function(name) {
		if (subscribed[name]) {
			delete subscribed[name];
		}
	};

	return {
		publish: publish,
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}));
(function(global) {
	'use strict';

	global.Entities = global.Entities || {};
	global.Entities.Entity = new Class(true, {
		x: 0,
		y: 0,
		width: undefined,
		height: undefined,
		render: function(context) {},
		calculatePosition: function (x, y) {
			x = x || this.x;
			y = y || this.y;

			return [
				parseFloat((x - y) * this.width) + 500,
				parseFloat((x + y) * this.height / 2) + this.height
			];
		}
	});

})(this);
(function(global) {
	'use strict';

	var self = {
		KEYS: { UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39, SPACE: 32 },
		canvas: undefined,
		points: [],
		board: undefined,
		player: undefined,
		keysDown: {},
		now: undefined,
		delta: undefined,
		then: Date.now(),
		init: function () {
			self.canvas = document.getElementById('canvas');
			self.context = canvas.getContext('2d');

			self.board = new global.Entities.Board();
			self.points.push(new global.Entities.Point());
			self.player = new global.Entities.Player();

			document.addEventListener("keydown", function (e) {
				self.keysDown[e.keyCode] = true;
			}, false);

			document.addEventListener("keyup", function (e) {
				delete self.keysDown[e.keyCode];
			}, false);
		},
		update: function (m) {
			if (self.KEYS.UP in self.keysDown) {
				self.player.y -= self.player.speed * m;
			}
			if (self.KEYS.DOWN in self.keysDown) {
				self.player.y += self.player.speed * m;
			}
			if (self.KEYS.LEFT in self.keysDown) {
				self.player.x -= self.player.speed * m;
			}
			if (self.KEYS.RIGHT in self.keysDown) {
				self.player.x += self.player.speed * m;
			}
		},
		render: function () {
			var i = 0, len = 0;

			self.board.render(self.context);

			for (i = 0, len = self.points.length; i < len; i++) {
				self.points[i].renderShadow(self.context);
			}

			if (self.player.x < 5 || self.player.y < 5) {
				self.player.render(self.context);
				for (i = 0, len = self.points.length; i < len; i++) {
					self.points[i].render(self.context);
				}

				self.player.renderShadow(self.context);
			}
			else {
				self.player.renderShadow(self.context);

				for (i = 0, len = self.points.length; i < len; i++) {
					self.points[i].render(self.context);
				}
				self.player.render(self.context);
			}
		},
		start: function () {
			self.render();
			self.update(self.delta / 1000);

			self.requestAnimationFrame(function() {
				if (!self.isGameOver) {
					self.start();
				}
				else {
					// self.showGameOver();
				}
			});


			// setInterval(function() {
			// 	self.update(m);
			// 	self.render();
			// }, 10);	
		},
		requestAnimationFrame: function (func) {
			var requestAnimationFrame;

			self.now = Date.now();
			self.delta = self.now - self.then;
			self.then = self.now;

			requestAnimationFrame = (function () {
				return (
					window.requestAnimationFrame       ||
					window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame    ||
					window.oRequestAnimationFrame      ||
					window.msRequestAnimationFrame	   ||
					function(func) {
						window.setTimeout(func, 1000 / 60);
					}
				);
			}());

			return requestAnimationFrame(func);
		}
	};

	global.PubSub.subscribe('app/init', self.init);
	global.PubSub.subscribe('app/start', self.start);
})(this);
(function(global) {
	'use strict';

	global.Entities.Board = new Class({
		width: 32,
		height: 32,
		images: [ 'assets/images/ground1.png', 'assets/images/ground2.png' ],
		imageObject: undefined,
		horizontalSegments: 15,
		verticalegments: 15,
		init: function() {
			this.imageObject = new Image();
		},
		render: function(context) {
			var i, j, x, y, position;

			this.imageObject.src = this.images[0];

			for(i = 0; i < this.horizontalSegments; i++) {
				for(j = 0; j < this.verticalegments; j++) {
					// var d = Math.pow(Math.sqrt(x - 0) + Math.sqrt(y - 0), 2);

					position = this.calculatePosition(i, j);
					context.drawImage(this.imageObject, position[0], position[1]);
				}
			}
		}
	}, global.Entities.Entity);
})(this);
(function(global) {
	'use strict';

	global.Entities.Player = new Class({
		width: 32,
		height: 32,
		images: [ 'assets/images/player1.png', 'assets/images/player2.png' ],
		image1Object: undefined,
		image2Object: undefined,
		speed: 5,
		init: function() {
			this.image1Object = new Image();
			this.image2Object = new Image();
		},
		render: function(context) {
			var position = this.calculatePosition();

			this.image1Object.src = this.images[0];
			context.drawImage(this.image1Object, position[0], position[1]);
		},
		renderShadow: function(context) {
			var position = this.calculatePosition();

			this.image2Object.src = this.images[1];
			context.drawImage(this.image2Object, position[0], position[1]);
		}
	}, global.Entities.Entity);
})(this);
(function(global) {
	'use strict';

	global.Entities.Point = new Class({
		x: 5,
		y: 5,
		width: 32,
		height: 32,
		images: [ 'assets/images/point.png', 'assets/images/point-shadow.png' ],
		imageObject: undefined,
		imageShadowObject: undefined,
		init: function() {
			this.imageObject = new Image();
			this.imageShadowObject = new Image();
		},
		render: function(context) {
			var position = this.calculatePosition();

			this.imageObject.src = this.images[0];
			context.drawImage(this.imageObject, position[0], position[1]);
		},
		renderShadow: function(context) {
			var position = this.calculatePosition();

			this.imageShadowObject.src = this.images[1];
			context.drawImage(this.imageShadowObject, position[0], position[1]);
		}
	}, global.Entities.Entity);
})(this);
(function (global) {
	'use strict';

	global.PubSub.publish('app/init');
	global.PubSub.publish('app/start');





	// var canvas = document.getElementById('canvas');
	// var context = canvas.getContext('2d');

	// var image = new Image();
	// image.src = 'assets/images/block.png';

	// var image2 = new Image();
	// image2.src = 'assets/images/block2.png';
	
	// var image3 = new Image();
	// image3.src = 'assets/images/ball.png';

	// var image4 = new Image();
	// image4.src = 'assets/images/shadow.png';


	// var image6 = new Image();
	// image6.src = 'assets/images/block2-2.png';


	// var tileWidth = 32;
	// var tileHeight = 32;

	// var keysDown = {},
	// 	_KEYS = { UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39, SPACE: 32 };

	// var x = 0, 
	// 	y = 0, 
	// 	z = 0;

	// document.addEventListener("keydown", function (e) {
	// 	keysDown[e.keyCode] = true;
	// }, false);

	// document.addEventListener("keyup", function (e) {
	// 	delete keysDown[e.keyCode];
	// }, false);



	// setInterval(function() {
	// 	context.clearRect(0, 0, 1000, 600);

	// 	if (_KEYS.UP in keysDown) {
	// 		y -= 1 * 0.05;
	// 	}
	// 	if (_KEYS.DOWN in keysDown) {
	// 		y += 1 * 0.05;
	// 	}
	// 	if (_KEYS.LEFT in keysDown) {
	// 		x -= 1 * 0.05;
	// 	}
	// 	if (_KEYS.RIGHT in keysDown) {
	// 		x += 1 * 0.05;
	// 	}

	//     for(var i = 0; i < 15; i++) {
	//         for(var j = 0; j < 15; j++) {
	//             a(i, j, 0);
	//         }
	//     }

	//     b1(5, 5, 1);

	//     if (x < 5 || y < 5) {
	//     	b(x, y, 1);
	// 		c(5, 5, 1);
	//     }
	//     else {
	//     	c(5, 5, 1);
	//     	b(x, y, 1);
	//     }

		
	//     b(x, y, 1, true);

		

		



	// }, 10);

	// 	function a (x, y, z) {
	// 		// var d = Math.pow(Math.sqrt(x - 0) + Math.sqrt(y - 0), 2);
 //            var a = parseFloat((x - y) * tileWidth);
 //            var b = parseFloat((x + y) * tileHeight / 2) + (z * tileHeight);

	// 		a += 500;

	//     	context.drawImage(image, a, b);
	// 	}


	// 	function b (x, y, z, h) {
	// 		// var d = Math.pow(Math.sqrt(x - 0) + Math.sqrt(y - 0), 2);
 //            var a = parseFloat((x - y) * tileWidth);
 //            var b = parseFloat((x + y) * tileHeight / 2) + (z * tileHeight);

	// 		a += 500;

	// 		if (h) {
	// 			context.drawImage(image6, a, b);
	// 		}
	// 		else {
	//     		context.drawImage(image2, a, b);
	// 		}
	// 	}
	// 	function b1 (x, y, z) {
	// 		// var d = Math.pow(Math.sqrt(x - 0) + Math.sqrt(y - 0), 2);
 //            var a = parseFloat((x - y) * tileWidth);
 //            var b = parseFloat((x + y) * tileHeight / 2) + (z * tileHeight);

	// 		a += 500;

	//     	context.drawImage(image4, a, b);
	// 	}


	// 	function c (x, y, z) {
	// 		// var d = Math.pow(Math.sqrt(x - 0) + Math.sqrt(y - 0), 2);
 //            var a = parseFloat((x - y) * tileWidth);
 //            var b = parseFloat((x + y) * tileHeight / 2) + (z * tileHeight);

	// 		a += 500;

	//     	context.drawImage(image3, a, b);
	// 	}

	



	// var blocks = [];

	// var Block = function(x, y, z) {
	//      this.x = x;
	//     this.y = y;
	//     this.z = z;
	//     this.image = new Image();
	//     this.image.src = 'http://s14.postimage.org/540ysmvhp/block.png';
	// };

	// Block.prototype.draw = function() {
	//     var x = (this.x - this.y) * tileWidth;
	//     var y = (this.x + this.y) * tileHeight / 2 + this.z;
	//     context.drawImage(this.image, x, y);
	// };

	// var drawMap = function() {
	//     // for(var i = 0; i < 2; i++) {
	//     //     for(var j = 0; j < 2; j++) {
	//     //         var x = (i - j) * tileWidth;
	//     //         var y = (i + j) * tileHeight / 2;
	//     //         context.drawImage(image, x, y);
	//     //     }
	//     // }
	    
	//     for(var i = 0; i < blocks.length; i++) {
	//         blocks[i].draw();
	//     }
	// };

	// window.onload = function() {
	    
	//     blocks.push(new Block(0, 0, 0));
	//     // blocks.push(new Block(1, 0, 0));
	//     drawMap();
	// };
})(this);