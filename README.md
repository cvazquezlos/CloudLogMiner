# CloudLogMiner
CloudLogMiner or CLM is a tool under development for analyzing Web Application logs from the very beggining of development. As such, it focuses on easing log review efforts when locating bugs in a distributed Software System.
Built with Angular2 and ag-grid.

The tool fetches logs from an elasticSearch instance. The current configuration for such is pointing at localhost:9200, indices matching "logstash-*". Please feel free to adapt these settings to your configuration in shared/elastic.service.ts.

https://itsnotafunction.wordpress.com/

## Preview
![Alt text](https://cloud.githubusercontent.com/assets/10989693/15807538/49d60a20-2b61-11e6-9a13-efd04a5235e5.png?raw=true "Captura")

## Compatibility
Cloud Log Miner is capable of processing and displaying logs from any system as long as they have some common parameters and are deployed in an ElasticSearch instance. Field selection will be possible soon.

With respect to browsers, compatibility has been checked for Chrome 50.0.2661, Firefox 40.0.1 and Safari 9.1.1.

## Installation

### Prerequisite: Node.js

Install [Node.js® and npm](https://nodejs.org/en/download/) if they are not already on your machine. Verify that you are running at least node v5.x.x and npm 3.x.x by running node -v and npm -v in a terminal/console window. 

### Download the source

To get the files, either clone or use the download button on top of this page.
```bash
git clone  https://github.com/simo14/CloudLogMiner.git  my-clm
cd my-clm
```

### Use npm to get up and running

To download all CLM required dependencies (described in `package.json`), go to the project folder on a terminal and run the following:
```bash
npm install
```
Allow a few moments for the command to install the packages, and when it finishes check that a "node_modules" folder has appeared in your project root.

## Run Project

To use this project it is necessary to serve the files in a browser. But worry not, this command will do all the process automatically. Run it in the same terminal instance or in the editor of your choice.

```bash
npm start
```
Go to http://localhost:3000 and you will find something very similar to what I have shown you in the preview.

## RELEASE NOTES

v0.5 - With CloudLogMiner, you can:

* Display logs created by a distributed application, mainly but not restricted to SpringBoot based ones.
* Filter the grid through any field of a log
* Resize columns to your will
* Search anything, in any fields with an intuitive search box.
* Mark/Filter your interests without removing the rest for a fast review
* Navigable project folder structure.

In short, you can save precious time in finding errors or following user stories through your application logs.

## Quick Guide

1. Set up your ElasticSearch instance and serve it in "http://127.0.0.1:9200/". If you are using Spring Boot for a chance, you can follow any of these two guides: [1](https://blog.codecentric.de/en/2014/10/log-management-spring-boot-applications-logstash-elastichsearch-kibana/) or [2](http://knes1.github.io/blog/2015/2015-08-16-manage-spring-boot-logs-with-elasticsearch-kibana-and-logstash.html). Skip anything about Kibana, CloudLogMiner is basically substituting it.  </br>
Soon route and index name selection will be available, but until then please note that index names are suppossed to start with "logstash". You can change that setting in shared/elastic.service.ts, second line.

2. Use the 'Run project' commands in a separate terminal window. Your browser will show the initialization.
![Alt text](https://cloud.githubusercontent.com/assets/10989693/15807945/91c93448-2b6a-11e6-9921-c0676d08c50a.png)

3. Start taking advantage of all the functionalities!

![Alt text](https://cloud.githubusercontent.com/assets/10989693/15808013/b23bcb30-2b6c-11e6-8aaf-8b19b6c0e60e.png)

## Run tests

Just in case, here it is the command to run the tests:

```bash
npm test
```
Your default web browser will pop up with results, and debug logs will be written in the terminal.
