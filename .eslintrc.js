module.exports = {
	'rules': {
		'indent': [
			2,
			'tab'
		],
		'quotes': [
			2,
			'single'
		],
		'linebreak-style': [
			2,
			'unix'
		],
		'semi': [
			2,
			'always'
		]
	},
	'env': {
		'es6': true,
		'node': true,
		'browser': true
	},
	'ecmaFeatures': {
		'modules': false // Disabled until Node natively supports it
	},
	'extends': 'eslint:recommended'
};