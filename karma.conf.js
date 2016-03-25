/**
 * Created by silvia on 21/3/16.
 */

module.exports = function (config) {
    config.set({

        basePath: '',

        frameworks: ['jasmine'],

        files: [
            // paths loaded by Karma
            { pattern: 'node_modules/angular2/bundles/angular2-polyfills.js', included: true, watched: true },
            { pattern: 'node_modules/systemjs/dist/system.src.js', included: true, watched: true },
            { pattern: 'node_modules/rxjs/bundles/rx.js', included: true, watched: true },
            { pattern: 'node_modules/angular2/bundles/angular2.js', included: true, watched: true },
            { pattern: 'node_modules/angular2/bundles/testing.dev.js', included: true, watched: true },
            { pattern: 'karma-test-shim.js', included: true, watched: true },

            // paths loaded via module imports
            { pattern: 'built/**/*.js', included: false, watched: true },

            // paths loaded via Angular's component compiler
            // (these paths need to be rewritten, see proxies section)
            { pattern: 'component/**/*.html', included: false, watched: true },
            //{ pattern: 'src/**/*.css', included: false, watched: true },

            // paths to support debugging with source maps in dev tools
            { pattern: '**/**/*.ts', included: false, watched: false },
            { pattern: 'built/**/*.js.map', included: false, watched: false },

            //'tests/*.spec.ts'
        ],
/*
        // proxied base paths
        proxies: {
            // required for component assests fetched by Angular's compiler
            "/built/": "/base/built"
        },*/

        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false
    })
}