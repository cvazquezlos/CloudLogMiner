# CloudLogMiner
CloudLogMiner is a tool under development for analyzing Web Application logs from the very beggining of development. As such, it focuses on easing log review efforts when locating bugs in a distributed Software System.
Built with Angular2 and ag-grid.

The tool fetches logs from an elasticSearch instance. The current configuration for such is pointing at localhost:9200, indices that match <logstash-*>. Please feel free to adapt these settings to your configuration in shared/elastic.service.ts.

https://itsnotafunction.wordpress.com/


## Initialize project

Donwload all the required dependencies
```bash
npm install
```

## Run project

```bash
npm start
```
Go to localhost:3000


## Run tests

```bash
npm test
```
Go to localhost:8080/unit-tests.html
