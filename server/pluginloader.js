'use strict'

var fs = require("fs");
var path = require("path");

module.exports = function(cb) {
    var plugins = {};
    var pluginsDir = path.join(__dirname, "plugins");
    fs.readdir(pluginsDir, function(err, files) {
        if(err) {
           throw "[ERROR]: "+err;
        }
        var filen = 0;       
        files.forEach(function(entry) { // DAMMIT JS!
            var entryPath = path.join(pluginsDir, entry);
            fs.stat(entryPath, function(err, stats) {
                if(err) {
                    throw "[ERROR]: "+err;
                }
                if(stats.isDirectory()) {
                    try{
                        var plugin = require(entryPath);
                        plugins[plugin.name] = plugin;
                        console.log("[INFO]: Plugin "+plugin.name+" loaded!");
                    } catch (err) {
                        console.warn("[WARN]: Plugin at "+entryPath+" cannot be loaded\n"+err);
                    }
                }
                filen++;
                if(filen == files.length) cb(plugins);
            })
        });
    });
}