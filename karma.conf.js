// Karma configuration

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
		  'bower_components/angular/angular.js',
		  'bower_components/angular-sanitize/angular-sanitize.js',
		  'bower_components/marked/marked.min.js',
		  'bower_components/jquery/dist/jquery.js',
		  'bower_components/highlight/build/highlight.pack.js',
		  'bower_components/angular-mocks/angular-mocks.js',
		  'src/*.js',
		  'test/spec/*.js'
		],
        exclude: ['karma.conf.js'],
        reporters: ['progress'],
        port: 8088,
        runnerPort: 9100,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['Chrome'],
        captureTimeout: 5000,
        singleRun: false
    });
};
