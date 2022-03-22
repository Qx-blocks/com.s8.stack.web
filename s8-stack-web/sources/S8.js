import { BOHR_PROTOTYPE_PATHNAME } from "./io-bohr/neon/NeOrbitalTypeHandler";



class S8Context {


	/**
	 * @type {string} retrieve origin
	 */
	origin;

	/**
	 * @type {Map<string, *>}
	 * // build stylesheets map
	 */
	map_CSS_stylesheets = new Map();

	/**
	 * @type {Map<string, *> }
	 */
	map_SVG_sources = new Map();


	constructor() {
		this.origin = window.location.origin;
	}


	/**
	 * 
	 * @param {*} name 
	 */
	import_CSS(name) {
		if (!this.map_CSS_stylesheets.has(name)) {
			document.head.innerHTML += `<link type="text/css" rel="stylesheet" href=${name}>`;
			this.map_CSS_stylesheets.set(name, true);
		}
	}


	/**
	 * 
	 * @param {*} target 
	 * @param {string} name 
	 * @param {number} width 
	 * @param {number} height 
	 */
	insert_SVG(target, name, width, height) {
		let svgSource0 = this.map_SVG_sources.get(name);

		let injector = function (source) {
			target.innerHTML = source;
			let svgNode = target.getElementsByTagName("svg")[0];
			svgNode.setAttribute("width", width);
			svgNode.setAttribute("height", height);
		}

		if (svgSource0 != undefined) {
			injector(svgSource0);
		}
		else {
			let _this = this;
			this.sendRequest_GET(`/air/icon/${name}.svg`, "text", function (svgSource1) {
				_this.map_SVG_sources.set(name, svgSource1);
				injector(svgSource1);
			});
		}
	}



	/**
	 * 
	 * @param {*} method 
	 * @param {*} capacity 
	 * @returns a { S8Request }
	 */
	createRequest_POST(method, capacity) {
		throw "Import for " + method + ", " + capacity + ", " + callback + " failed. Must provide implementation.";
	}


	/**
	 * 
	 * @param {string} requestPath 
	 * @param {string} responseType 
	 * @param {Function} responseCallback 
	 */
	sendRequest_HTTP2_GET(requestPath, responseType, responseCallback) {

		/**
				* Relies on browser cache for speeding things up
				*/
		let xhr = new XMLHttpRequest();

		// first line
		xhr.open("GET", this.origin + requestPath, true);
		xhr.responseType = responseType;

		// headers
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.setRequestHeader('Access-Control-Allow-Origin', "*");
		xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		xhr.setRequestHeader('Access-Control-Allow-Headers', 'Cookie, Content-Type, Authorization, Content-Length, X-Requested-With');
		xhr.setRequestHeader('Access-Control-Expose-Headers', 'Set-Cookie, X-Powered-By');

		let _this = this;
		// Hook the event that gets called as the request progresses
		xhr.onreadystatechange = function () {
			// If the request is "DONE" (completed or failed)
			if (xhr.readyState == 4) {
				// If we got HTTP status 200 (OK)
				if (xhr.status == 200) {
					responseCallback(xhr.responseText);
				}
			}
		};

		// fire request
		xhr.send(null);
	}


	/**
	 * 
	 * @param {*} requestArrayBuffer 
	 * @param {*} responseCallback 
	 */
	sendRequest_HTTP2_POST(requestArrayBuffer, responseCallback) {
		// create request
		let request = new XMLHttpRequest();

		// setup XMLHttpRequest.open(method, url, async)
		request.open("POST", this.origin, true);

		// ask for array buffer type reponse
		request.responseType = "arraybuffer";

		// callback
		request.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let responseArrayBuffer = request.response; // Note: not oReq.responseText
				if (responseArrayBuffer) {
					responseCallback(responseArrayBuffer);
				}
				else {
					console.log("[Helium/system] No response array buffer");
				}
			}
		};

		// fire
		request.send(requestArrayBuffer);
	}



	removeChildren(node) {
		/* An earlier edit to this answer used firstChild, 
		but this is updated to use lastChild as in computer-science, 
		in general, it's significantly faster to remove the last 
		element of a collection than it is to remove the first element 
		(depending on how the collection is implemented). */
		while (node.firstChild) {
			node.removeChild(node.lastChild);
		}
	}


	setRoot(node) {
		/* An earlier edit to this answer used firstChild, 
		but this is updated to use lastChild as in computer-science, 
		in general, it's significantly faster to remove the last 
		element of a collection than it is to remove the first element 
		(depending on how the collection is implemented). */
		while (this.screenNode.firstChild) {
			this.screenNode.removeChild(this.screenNode.lastChild);
		}

		this.screenNode.appendChild(node);
	}



	boot_DEBUG() {
		let request = new NeRequest(this);

		request.setFork("debug-boot");

		let _this = this;
		let callback = function (reponseArrayBuffer) {
			if (_this.isVerbose) {
				console("[NeContext] debug-boot request has been responded!");
			}
			new NeResponse(_this, new NeInflow(reponseArrayBuffer)).parse();
		};

		request.send(1024, callback);
	}

	/**
	 * Efficiently remove children nodes of a node
	 * @param {*} node 
	 */
	removeChildren(node) {
		/* An earlier edit to this answer used firstChild, 
		but this is updated to use lastChild as in computer-science, 
		in general, it's significantly faster to remove the last 
		element of a collection than it is to remove the first element 
		(depending on how the collection is implemented). */
		while (node.firstChild) {
			node.removeChild(node.lastChild);
		}
	}
}







/**
 * 
 */
export const S8 = new S8Context();