var path = require('path'),
    fs = require('fs'),
    logger = require('./logger');

exports.info = function(project_dir) {
    var project = {};
    project.path = project_dir || process.cwd();

    if (!fs.existsSync(path.join(project.path, 'tiapp.xml'))) {
        logger.error("Path is not a Titanium project: " + project.path);
        process.exit();
    }

    project.path_alloy = path.join(project.path, 'app');
    project.alloy = fs.existsSync(project.path_alloy);
    project.path_resources = path.join(project.path, 'Resources');
    project.path_i18n = path.join(project.path, 'i18n');
    project.path_source = project.alloy ? project.path_alloy : project.path_resources;

    return project;
};