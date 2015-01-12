#!/usr/bin/env node
/*jshint node: true */
'use strict';

/**
 * JSON schema validator for the restapi tool
 */

var fs = require('fs');

// Load the YAML parser module
var jsyaml = require( 'js-yaml' );

// Load the JSON schema validator module and create a validator object
var JaySchema = require('jayschema');
var js = new JaySchema();

/**
 * Load the named JSON schema
 * @param  {String} schemaFileName The name of the schema file
 * @return {Object}                The loaded schema
 */
var loadSchema = function(fullSchemaFileName) {
    var scfPath = fullSchemaFileName.split('/');
    var schemaFileName = scfPath[scfPath.length-1];
    var mainSchema = null;

    // First, register() the main schemas you plan to use.
    try {
        mainSchema = jsyaml.load(fs.readFileSync(fullSchemaFileName,'utf-8'));
        var missingSchemas = js.register(mainSchema);

        // Next, load the missing sub-schemas recursively
        missingSchemas.forEach(function(missingSchema) {
            loadSchema(missingSchema);
        });

    } catch (err) {
        console.log(err);
    }

    return mainSchema;
};

/**
 * Validate the 'content' object with the JSON schema from 'schemaFileName' file
 * @param  {Object} content        The object to validate
 * @param  {String} schemaFileName The name of the schema file
 * @return {Array}                 The list of errors ([] in case there was no error)
 */
exports.validate = function(content, schemaFileName) {
   //console.log('validate', schemaFileName, content);
    var schema = loadSchema(schemaFileName);

    if (schema === null) {
        return [{
            Error: "Schema could not be loaded."
        }];
    } else {
        var err = js.validate(content, schema);

        if (err.length > 0 ) {
            //console.log('\nValidation error:');
            err.forEach(function(error) {
                //console.log(error.desc);
            });
            return err;
        }
    }
    return [];
};
