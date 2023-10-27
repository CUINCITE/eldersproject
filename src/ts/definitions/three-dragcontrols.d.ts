/// <reference path="./three.d.ts" />

declare namespace THREE {
	class DragControls {

		constructor( objects: Object3D[], camera: Camera, domElement?: HTMLElement );

		object: Camera;

		// API

		enabled: boolean;
		transformGroup: boolean;

		activate(): void;
		deactivate(): void;
		dispose(): void;
		getObjects(): Object3D[];
	}

}
