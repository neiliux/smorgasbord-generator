var generators = require('yeoman-generator'),
    userAnswers = null,
    bowerFrameworks = [
        {
            name: 'JQuery',
            value: 'jquery',
            src: '/bower_components/jquery/dist/jquery.js'
        },
        {
            name:'Angular',
            value:'angular',
            src: '/bower_components/angular/angular.js'
        },
        {
            name:'Underscore',
            value:'underscore',
            src: '/bower_components/underscore/underscore.js'
        }
    ];

function gatherUserInput() {
    var done = this.async();

    this.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'Project name',
            default: 'untitled'
        },
        {
            type: 'input',
            name: 'projectVersion',
            message: 'Version',
            default: '0.0.1'
        },
        {
            type: 'input',
            name: 'homepageUrl',
            message: 'Homepage URL',
            default: ''
        },
        {
            type: 'input',
            name: 'author',
            message: 'Author',
            default: ''
        },
        {
            type: 'checkbox',
            choices: bowerFrameworks,
            name: 'frameworks',
            message: 'Frameworks'
        }
    ],
    function (answers) {
        userAnswers = answers;
        done();
    }.bind(this));
}

function installBowerDependencies() {
    var self = this;
    userAnswers.frameworks.forEach(function(framework) {
        self.bowerInstall(framework, { 'saveDev': true });
    });

    // Install JQuery even if user did not specify it,
    // we need it for unit tests.
    self.bowerInstall('jquery', { 'saveDev': true});

    self.bowerInstall("jasmine", { 'saveDev': true});
    self.bowerInstall("jquery", { 'saveDev': true});
    self.bowerInstall("chai", { 'saveDev': true});
    self.bowerInstall("chai-jquery", { 'saveDev': true});
}

function getFramework(frameworkVal) {
    var fx = null;
    bowerFrameworks.forEach(function(framework) {
        if (framework.value === frameworkVal) {
            fx = framework;
        }
    });
    return fx;
}

function mapBowerPackagesToUrls() {
    var self = this;
    var mappedUrls = [];
    userAnswers.frameworks.forEach(function(framework) {
        mappedUrls.push(getFramework(framework).src);
    });
    return mappedUrls;
}

function installNpmPackages() {
    this.npmInstall('grunt-devserver', { 'saveDev': true });
    this.npmInstall("grunt-bowercopy", { 'saveDev': true });
    this.npmInstall("grunt-devserver", { 'saveDev': true });
    this.npmInstall("grunt-karma", { 'saveDev': true });
    this.npmInstall("jasmine-core", { 'saveDev': true });
    this.npmInstall("karma", { 'saveDev': true });
    this.npmInstall("karma-cli", { 'saveDev': true });
    this.npmInstall("karma-jasmine", { 'saveDev': true });
    this.npmInstall("karma-phantomjs-launcher", { 'saveDev': true });
    this.npmInstall("karma-requirejs", { 'saveDev': true });
    this.npmInstall("requirejs", { 'saveDev': true });
    this.npmInstall('grunt-contrib-jshint', { 'saveDev': true });
}

function createGruntConfig() {
    /*jshint multistr: true */
    this.gruntfile.insertConfig('devserver', '{ server: {}, \
        options: { \
            port: 8080, \
            base: \'.\', \
            async: true \
        } }');

    this.gruntfile.insertConfig('karma', "{ unit: { configFile: 'karma.conf.js' } }");
    this.gruntfile.insertConfig('jshint', "{ 'options': { jshintrc: '.jshintrc' }, all: ['*.js', 'src/**/*.js', 'test/**/*.js']}");

    this.gruntfile.loadNpmTasks('grunt-devserver');
    this.gruntfile.loadNpmTasks('grunt-karma');
    this.gruntfile.loadNpmTasks('grunt-contrib-jshint');

    this.gruntfile.registerTask('default', ['jshint', 'karma']);
    this.gruntfile.registerTask('dev', ['jshint', 'karma', 'devserver']);
}

function copyStaticFiles() {
    this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
    );

    this.fs.copy(
        this.templatePath('karma.conf.js'),
        this.destinationPath('karma.conf.js')
    );

    this.fs.copy(
        this.templatePath('main-test.js'),
        this.destinationPath('test/main-test.js')
    );

    this.fs.copy(
        this.templatePath('testFixture.js'),
        this.destinationPath('test/testFixtureExampleTests.js')
    );

    this.fs.copy(
        this.templatePath('jshintrc'),
        this.destinationPath('.jshintrc')
    );
}

module.exports = generators.Base.extend({
    constructor: function() {
       generators.Base.apply(this, arguments);
    },
    initializing: {
    },
    end: {
    },
    gatherUserInfo: function() {
        gatherUserInput.bind(this)();
    },
    installBowerDependencies: function() {
       installBowerDependencies.bind(this)();
    },
    installNpmPackages: function() {
        installNpmPackages.bind(this)();
   },
   generateGruntConfig: function() {
       createGruntConfig.bind(this)();
   },
   processTemplates: function() {
       this.fs.copyTpl(
           this.templatePath('index.html'),
           this.destinationPath('src/index.html'),
           {
               projectName: userAnswers.projectName,
               frameworks: mapBowerPackagesToUrls()
           });

       this.fs.copyTpl(
           this.templatePath('bower.json'),
           this.destinationPath('bower.json'),
           {
               projectName: userAnswers.projectName,
               projectVersion: userAnswers.projectVersion,
               homepageUrl: userAnswers.homepageUrl,
               author: userAnswers.author
           }
       );
    },
    copyStaticFiles: function() {
        copyStaticFiles.bind(this)();
    }
});
