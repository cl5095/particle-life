const canvasSketch = require('canvas-sketch');
const dat = require('dat.gui');
const Universe = require('./Universe');

const gui = new dat.GUI();
gui.autoPlace = true;

const universeFolder = gui.addFolder('Universe');
const renderingFolder = gui.addFolder('Rendering');

const stepsPerFrameNormal = 1;

const settings = {
	animate: true,
	scaleToFit: true,
	scaleToView: true,
	loop: false
};

const presets = {
	Balanced: {
		population: [9, 400],
		seed: [-0.02, 0.06, 0.0, 20.0, 20.0, 70.0, 0.05, false, 1]
	},
	Chaos: {
		population: [6, 4000],
		seed: [0.02, 0.04, 0.0, 30.0, 30.0, 100.0, 0.01, false, 4]
	},
	Diversity: {
		population: [12, 400],
		seed: [-0.01, 0.04, 0.0, 20.0, 10.0, 60.0, 0.05, true, 0.5]
	},
	Frictionless: {
		population: [6, 600],
		seed: [0.01, 0.005, 10.0, 10.0, 10.0, 60.0, 0.0, true, 2]
	},
	Gliders: {
		population: [6, 1200],
		seed: [0.0, 0.06, 0.0, 20.0, 10.0, 50.0, 0.1, true, 0.3]
	},
	Homogeneity: {
		population: [4, 400],
		seed: [0.0, 0.04, 10.0, 10.0, 10.0, 80.0, 0.05, true, 1]
	},
	'Large Clusters': {
		population: [6, 8000],
		seed: [0.025, 0.02, 0.0, 30.0, 30.0, 100.0, 0.2, false, 0.2]
	},
	'Medium Clusters': {
		population: [6, 400],
		seed: [0.02, 0.05, 0.0, 20.0, 20.0, 50.0, 0.05, false, 1]
	},
	Quiescence: {
		population: [6, 300],
		seed: [-0.02, 0.1, 10.0, 20.0, 20.0, 60.0, 0.2, false, 1]
	},
	'Small Clusters': {
		population: [6, 300],
		seed: [-0.005, 0.01, 10.0, 10.0, 20.0, 50.0, 0.01, false, 2]
	}
};

function getSettingsForPreset(preset) {
	const { population, seed } = presets[preset];
	const [numTypes, numParticles] = population;
	const [
		attractMean,
		attractStd,
		minRLower,
		minRUpper,
		maxRLower,
		maxRUpper,
		friction,
		flatForce,
		zoom
	] = seed;

	return {
		numTypes,
		numParticles,
		attractMean,
		attractStd,
		minRLower,
		minRUpper,
		maxRLower,
		maxRUpper,
		friction,
		flatForce,
		zoom
	};
}

const sketch = ({ width, height }) => {
	const defaultPreset = 'Chaos';

	const universeSettings = {
		...getSettingsForPreset(defaultPreset),
		preset: defaultPreset,
		wrap: false
	};

	const renderSettings = {
		stepsPerFrame: stepsPerFrameNormal
	};

	const universe = new Universe(
		universeSettings.numTypes,
		universeSettings.numParticles,
		width,
		height
	);
	universe.wrap = universeSettings.wrap;
	universe.reSeed(
		universeSettings.attractMean,
		universeSettings.attractStd,
		universeSettings.minRLower,
		universeSettings.minRUpper,
		universeSettings.maxRLower,
		universeSettings.maxRUpper,
		universeSettings.friction,
		universeSettings.flatForce,
		universeSettings.zoom
	);

	const onUniverseSettingsChange = () => {
		universe.setPopulation(
			universeSettings.numTypes,
			universeSettings.numParticles
		);
		universe.reSeed(
			universeSettings.attractMean,
			universeSettings.attractStd,
			universeSettings.minRLower,
			universeSettings.minRUpper,
			universeSettings.maxRLower,
			universeSettings.maxRUpper,
			universeSettings.friction,
			universeSettings.flatForce,
			universeSettings.zoom
		);
	};

	const onPresetChange = () => {
		Object.assign(
			universeSettings,
			getSettingsForPreset(universeSettings.preset)
		);
		universeFolder.updateDisplay();
		onUniverseSettingsChange();
	};

	universeFolder
		.add(universeSettings, 'attractMean', -1, 1)
		.onFinishChange(onUniverseSettingsChange);
	universeFolder
		.add(universeSettings, 'attractStd', -1, 1)
		.onFinishChange(onUniverseSettingsChange);
	universeFolder
		.add(universeSettings, 'minRLower', 0, 100)
		.onFinishChange(onUniverseSettingsChange);
	universeFolder
		.add(universeSettings, 'minRUpper', 0, 100)
		.onFinishChange(onUniverseSettingsChange);
	universeFolder
		.add(universeSettings, 'maxRLower', 0, 100)
		.onFinishChange(onUniverseSettingsChange);
	universeFolder
		.add(universeSettings, 'maxRUpper', 0, 100)
		.onFinishChange(onUniverseSettingsChange);
	universeFolder
		.add(universeSettings, 'friction', 0, 1)
		.onFinishChange(onUniverseSettingsChange);
	universeFolder
		.add(universeSettings, 'zoom', 0.1, 50)
		.onFinishChange(onUniverseSettingsChange);
	universeFolder
		.add(universeSettings, 'flatForce')
		.onFinishChange(onUniverseSettingsChange);
	universeFolder.add(universeSettings, 'wrap').onChange(() => {
		universe.wrap = universeSettings.wrap;
	});
	universeFolder
		.add(universeSettings, 'preset', Object.keys(presets))
		.onFinishChange(onPresetChange);
	universeFolder.add(
		{
			randomParticles: () => {
				universe.setRandomParticles();
			}
		},
		'randomParticles'
	);

	renderingFolder.add(renderSettings, 'stepsPerFrame', 1, 10);

	return ({ context, width, height }) => {
		context.fillStyle = 'black';
		context.fillRect(0, 0, width, height);

		for (let i = 0; i < renderSettings.stepsPerFrame; ++i) {
			const opacity = (i + 1) / renderSettings.stepsPerFrame;
			universe.step();
			universe.draw(context, opacity);
		}
	};
};

canvasSketch(sketch, settings);
