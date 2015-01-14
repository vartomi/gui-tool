----------
![Logo](https://raw.githubusercontent.com/vartomi/gui-tool/master/gui_tool_logo.png) **GUI-TOOL**
--
####Create ExtJS prototype applications easier and faster.

----------
Do you need a skeleton application or a prototype written in ExtJS? Just create it with easily understandable specification.

[Getting Started](#getting-started)<br/>
[How to specify?](#specification)<br/>
[Requirements](#requirements)

###**Getting Started**
Before you start it, please check the [requirements](#requirements)!

 1.   Install gui-tool to your computer.
> `npm install gui-tool -g`
 
 
 2. Create a new gui-tool project. If you use the `name` optional variable, the root directory will be also created with the given name. Otherwise you need to create a directory and run the command inside. The tool will download the ExtJS framework (4.2.1 gpl) into the `<project_name>/webui` directory.
 > `gui-tool init [name]`
 
 3. If everything is created successfully, you need to see the following hierarchy
    ```
     <project_name>
     |- specification
        |- gui.yml
     |- test
     |- webui
        |- app
        |- ...
    ```

<a name="specification"></a>
###**How to specify?**
Gui-tool use an own specifcation schema to describe how the application should look like and what kind of models it has. In `specification` directory the `gui.yml` file is an example specification file. It's used by the application without given other specification file.

<a name="requirements"></a>
###**Requirements**

 - unix based commandline tool, e.g. on Windows a [Git Bash](http://git-scm.com/downloads)
 - [node.js with npm](http://nodejs.org/download/) (**> v0.10.28**)
 - [Sencha Cmd](http://www.sencha.com/products/sencha-cmd/download) (**> v5.1.0.26**)
