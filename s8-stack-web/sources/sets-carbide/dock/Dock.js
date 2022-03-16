
import { S8, S8Orbital } from '/s8/S8';

S8.import_CSS("/carbide/dock/Dock.css");

/**
 * 
 */
export class Dock extends S8Orbital {

    constructor(id) {
        super(id);

        this.isDeployed = false;

        this.node = document.createElement("div");
        this.node.classList.add("dock");

        this.backgroundNode = document.createElement("div");
        this.backgroundNode.classList.add("dock-background");
        this.node.appendChild(this.backgroundNode);


        this.foregroundNode = document.createElement("div");
        this.foregroundNode.classList.add("dock-foreground");
        this.node.appendChild(this.foregroundNode);


        let _this = this;

        this.foregroundNode.addEventListener("mousemove", function (e) {
            let bounds = _this.foregroundNode.getBoundingClientRect();
            let x = e.clientX - bounds.left;
            let y = e.clientY

            let isGenieEffectEnabled = (e.clientY >= bounds.top) && (e.clientY <= bounds.bottom) && x < 72;

            console.log(x, y);
            _this.rescaleItems(isGenieEffectEnabled, x, y);
        });

        this.foregroundNode.addEventListener("mouseleave", function (e) {
            _this.rescaleItems(false, 0, 0);
        });

    }

    S8_set(code, value) {
        switch (code) {
            case 0x02: this.setItems(value); break; // items
            default: throw `Unsupported code for Dock: ${code}`;
        }
    }


    S8_render(){ /* continuous rendering approach... */ }

    setItems(items) {
        this.items = items;
        let n = items.length;
        let height = n * 64 + (n - 1) * 16;
        this.backgroundNode.style = "height: " + height + "px;";

        // update items
        S8.removeChildren(this.foregroundNode);
        let index = 0;
        items.forEach(item => {
            if (item != null) {
                this.foregroundNode.appendChild(item.getEnvelope());
                item.index = index;
            }
            index++;
        });

        this.rescaleItems(false, 0, 0);
    }


    rescaleItems(isGenieEffectEnabled, x, y) {
        this.items.forEach(item => item.rescale(isGenieEffectEnabled, x, y));
    }

    getEnvelope() {
        return this.node;
    }

    S8_dispose(){ /* TODO */ }
}