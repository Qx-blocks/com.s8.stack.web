import { Nb } from "../../nebulae";
import { NbScene } from "../../utilities/demos/NbDemoWindow";
import { NbView } from "./NbView";

import * as V3 from "../../maths/NbVector3d";


/**
 * 
 */
class Control {

	/** @type { StdNbViewController } the view attached to this control */
	ctrl;

	constructor(ctrl) {
		this.ctrl = ctrl;
	}
}


/**
 * 
 */
class Rotate extends Control {

	/** @type {number} mouseTrackballSensitity */
	mouseTrackballSensitity = 0.3;

	/** @type {number} lastMouseX */
	lastMouseX = 0.0;

	/** @type {number} lastMouseY */
	lastMouseY = 0.0;

	/** @type {boolean} isMouseDown */
	isMouseDown = false;


	/**
	 * 
	 * @param {StdNbViewController} ctrl 
	 */
	constructor(ctrl) { super(ctrl); }

	/**
	 * @param {*} event 
	 * @returns {boolean} is taking over
	 */
	onMouseDown(event) {
		this.isMouseDown = true;
		this.lastMouseX = event.clientX;
		this.lastMouseY = event.clientY;
		return true; // taking over
	}

	/**
	 * 
	 * @param {*} event 
	 * @returns {boolean} is taking over
	 */
	onMouseUp() {
		this.isMouseDown = false;
		return false; // not taking over
	}

	/**
	 * 
	 * @param {*} event
	 * @returns {boolean} is taking over
	 */
	onMouseWheel() {
		return false; // not taking over
	}

	/**
	 * 
	 * @param {*} event 
	 * @returns {boolean} is taking over
	 */
	onMouseMove(event) {
		if (this.isMouseDown) {
			// TODO implement throttle her

			this.ctrl.phi -= (event.clientX - this.lastMouseX) * this.mouseTrackballSensitity;
			this.lastMouseX = event.clientX;
			this.ctrl.theta += (event.clientY - this.lastMouseY) * this.mouseTrackballSensitity;
			this.lastMouseY = event.clientY;
			if (this.ctrl.theta > 180.0) {
				this.ctrl.theta = 180.0;
			}
			if (this.ctrl.theta < 1.0) {
				this.ctrl.theta = 1.0;
			}

			//log.nodeValue = "phi="+this.phi.toFixed(2)+" theta="+this.theta.toFixed(2)+" r="+this.r.toFixed(2)+"\n";
			//log.nodeValue+= "x="+event.clientX+" y="+event.clientY+"\n";

			//this.updateView();

			this.ctrl.refresh();
			return true;
		}
		else {
			return false;
		}
	}

	/**
	 * 
	 * @param {*} event 
	 * @returns 
	 */
	onKeyDown(event) {
		return false; // nothing to do 
	}

	/**
	 * 
	 * @param {*} event 
	 * @returns 
	 */
	onKeyUp(event) {
		return false; // nothing to do 
	}
}



/**
 * basic mode for zooming
 */
class Zoom extends Control {

	/** @type {number} mouse wheel sensitivity */
	mouseWheelSensitivity = 0.8 * 1e-3;

	constructor(view) { super(view); }

	onMouseDown() { return false; }
	onMouseUp() { return false; }
	onMouseMove() { return false; /* nothing to do*/ }

	onMouseWheel(event) {
		this.ctrl.r += -this.ctrl.r * event.wheelDelta * this.mouseWheelSensitivity;
		if (this.ctrl.r < this.ctrl.SETTINGS_min_approach_r) {
			this.ctrl.r = this.ctrl.SETTINGS_min_approach_r;
		}
		//this.updateView();
		this.ctrl.refresh();

		return true;
	}

	onKeyDown() { return false; }
	onKeyUp() { return false; }
};



export class Highlight extends Control {

	acquiredHoveredObject = null;

	/** @param {NbView} view */
	constructor(view) { super(view); }

	onMouseDown() {
		this.terminate(); // cleaning-up
		return false;
	}

	onMouseUp() {
		this.terminate(); // cleaning-up
		return false;
	}

	onMouseMove(event) {
		if (event.shiftKey) {
			var currentHoveredObject = scene.picking.pick(event.clientX, event.clientY);
			if (currentHoveredObject != this.acquiredHoveredObject) {
				var isRenderingRequired = false;
				if (this.acquiredHoveredObject != null) {
					this.acquiredHoveredObject.display(0);
					isRenderingRequired = true;
				}
				this.acquiredHoveredObject = currentHoveredObject;
				if (this.acquiredHoveredObject != null) {
					this.acquiredHoveredObject.display(1);
					isRenderingRequired = true;
				}

				if (isRenderingRequired) {
					scene.render();
				}
			}
			logNode.innerHTML = "Now hovering " + this.acquiredHoveredObject;
			return true;
		}
		else {
			this.terminate(); // cleaning-up
			return false;
		}
	}

	onMouseWheel() {
		this.terminate(); // cleaning-up
		return false;
	}

	onKeyDown() {
		this.terminate(); // cleaning-up
		return false;
	}

	onKeyUp() {
		this.terminate(); // cleaning-up
		return false;
	}

	terminate() {
		if (this.acquiredHoveredObject != null) {
			this.acquiredHoveredObject.display(0);
			this.acquiredHoveredObject = null;
			this.ctrl.refresh();
		}
	}
}



/**
 * CONTROLLER general philosophy
 * 
 * the controller is organizing the good orchestration of different sub-controller, each of the sub-controllers
 * being responsible for one specific task (zooming camera, highlighting objects, etc.).
 * The general underlying principle is that sub-controllers are sorted by priority. This notion of priority comes
 * from the feeling of "must be readily available" at any moment. 
 * 
 * It appears that this notion of "readiness" is exactly opposite to the complexity of the operation.
 * 
 * For instance: rotating camera is far less complex (and far more common) than inserting a new object in the scene.
 * From this observation, it follows that, although it seems obvious that rotating camera must be made available while 
 * inserting a new object in the scene, it does not seem appropriate to allow object insertion when a 
 * simple camera rotation has been initiated ("simple" = not in the context of a more complex action).
 * 
 * @param scene
 */



const DEG_to_RAD = Math.PI / 180.0;
/**
 * 
 */
export class StdNbViewController {

	/** @type {NbScene} scene (Bound by scene) */
	scene = null;

	/** @type {NbView} view (Bound by scene) */
	view = null;


	/** @type {number} r distance [m] of view vector */
	r = 20;

	/** @type {number} phi angle [degree] of view vector */
	phi = 135;

	/** @type {number} theta angle [degree] of view vector */
	theta = 135;

	/** @type {number} min radius */
	SETTINGS_min_approach_r = 0.2;



	constructor() {
	}


	/**
	 * 
	 * @param {NbView} view 
	 */
	start() {


		// define modes
		this.controls = [
			new Rotate(this),
			new Zoom(this),
			new Highlight(this)];

		this.view.updateProjectionMatrix();
		this.view.updateViewMatrix();

		// set default mode
		this.mode = this.zoomMode;

		let _this = this;


		this.onMouseDown = function (event) {
			let isCaptured = false, i = 0, n = _this.controls.length;
			while (!isCaptured && i < n) {
				isCaptured = _this.controls[i].onMouseDown(event);
				i++;
			}
		};
		Nb.canvasNode.addEventListener('mousedown', this.onMouseDown, false);


		this.onMouseUp = function (event) {
			var isCaptured = false, i = 0, n = _this.controls.length;
			while (!isCaptured && i < n) {
				isCaptured = _this.controls[i].onMouseUp(event);
				i++;
			}
		};
		document.addEventListener('mouseup', this.onMouseUp, false);


		this.onMouseMove = function (event) {
			var isCaptured = false, i = 0, n = _this.controls.length;
			while (!isCaptured && i < n) {
				isCaptured = _this.controls[i].onMouseMove(event);
				i++;
			}
		};
		document.addEventListener('mousemove', this.onMouseMove, false);


		this.onMouseWheel = function (event) {
			var isCaptured = false, i = 0, n = _this.controls.length;
			while (!isCaptured && i < n) {
				isCaptured = _this.controls[i].onMouseWheel(event);
				i++;
			}
		};
		document.addEventListener('mousewheel', this.onMouseWheel, false);


		this.onKeyUp = function (event) {
			var isCaptured = false, i = 0, n = _this.controls.length;
			while (!isCaptured && i < n) {
				isCaptured = _this.controls[i].onKeyUp(event);
				i++;
			}
		};
		document.addEventListener('keyup', this.onKeyUp, false);


		this.onKeyDown = function (event) {
			var isCaptured = false, i = 0, n = _this.controls.length;
			while (!isCaptured && i < _this.nModes) {
				isCaptured = _this.controls[i].onKeyDown(event);
				i++;
			}
		};
		document.addEventListener('keydown', this.onKeyDown, false);
	}


	refresh(){
		// compute new eye position
		V3.eyeVector(this.r, this.phi * DEG_to_RAD, this.theta * DEG_to_RAD, this.view.eyeVector);
		this.view.updateViewMatrix();

		this.scene.render();
	}

	stop() {
		Nb.canvasNode.removeEventListener('mousedown', this.onMouseDown, false);
		document.removeEventListener('mouseup', this.onMouseUp, false);
		document.removeEventListener('mousemove', this.onMouseMove, false);
		document.removeEventListener('mousewheel', this.onMouseWheel, false);
		document.removeEventListener('keyup', this.onKeyUp, false);
		document.removeEventListener('keydown', this.onKeyDown, false);
	}
};

